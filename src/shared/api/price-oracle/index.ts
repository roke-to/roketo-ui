import * as nearAPI from 'near-api-js';
import numbro from 'numbro';

import {env} from '~/shared/config';

import {
  CONTRACT_CHANGE_METHODS_LIST,
  CONTRACT_VIEW_METHODS_LIST,
  TOKEN_MULTIPLIER_MAP,
} from './constants';
import {PriceOracleContract} from './interfaces/contract';
import {
  TokenAccountId,
  TokenMultiplierMap,
  TokenPriceCollection,
  TokenPriceRaw,
} from './interfaces/entites';

export interface PriceOracle {
  getPriceInUsd: (
    tokenId: TokenAccountId,
    amount: number | string,
    shownDecimals?: number,
  ) => string;
}

const convertRawPriceToTokenMap = (
  tokenPrices: TokenPriceRaw[],
  relyingSourceOracleId: string,
): TokenPriceCollection => {
  const priceTokenMap = tokenPrices.reduce((accumulatorMap, priceToken) => {
    const [tokenId, {reports}] = priceToken;

    const desiredSourceOracle = reports.find(({oracle_id}) => oracle_id === relyingSourceOracleId);
    if (!desiredSourceOracle) {
      return accumulatorMap;
    }

    return {
      ...accumulatorMap,
      [tokenId]: desiredSourceOracle.price,
    };
  }, {});

  return priceTokenMap;
};

/**
 * 5 NEAR = 5 * 10**24 "wrap.near"
 * 50 DAI = 50 * 10**18 "dai.bridge.near"
 *
 * Price NEAR { multiplier: 1000, decimals: 26 }
 * 5 NEAR in USD = 5 * 10**24 * 1000 / 10**(26 - 18) = 50 * 10**18
 * Price DAI { multiplier: 101, decimals: 20 }
 * 50 DAI in USD = 50 * 10**18 * 101 / 10**(20 - 18) = 505 * 10**17
 *
 * more: https://github.com/NearDeFi/price-oracle/blob/c2a10765a629dd013eeaa0f49d5631cbc0470b76/src/utils.rs#L18
 */
const convertTokenToUsdFactory =
  (priceTokenMap: TokenPriceCollection, tokenToMultiplierMap: TokenMultiplierMap) =>
  (tokenAccountId: TokenAccountId, amount: number | string, shownDecimals: number = 3) => {
    const tokenPrice = priceTokenMap[tokenAccountId];
    const tokenMultiplier = tokenToMultiplierMap[tokenAccountId];

    if (!tokenPrice || !tokenMultiplier) {
      return '0';
    }

    const {multiplier, decimals} = tokenPrice;

    return numbro(amount)
      .multiply(tokenMultiplier)
      .multiply(Number(multiplier))
      .divide(10 ** decimals)
      .format({
        mantissa: shownDecimals,
        trimMantissa: true,
      });
  };

export const initPriceOracle = async ({
  account,
}: {
  account: nearAPI.ConnectedWalletAccount;
}): Promise<PriceOracle> => {
  const priceOracleContract = new nearAPI.Contract(account, env.PRICE_ORACLE_CONTRACT_NAME, {
    viewMethods: CONTRACT_VIEW_METHODS_LIST,
    changeMethods: CONTRACT_CHANGE_METHODS_LIST,
  }) as PriceOracleContract;

  const rawAssets = await priceOracleContract.get_assets({});
  const tokenMap = convertRawPriceToTokenMap(rawAssets, env.PRICE_ORACLE_SOURCE_ID);

  const getPriceInUsd = convertTokenToUsdFactory(tokenMap, TOKEN_MULTIPLIER_MAP);

  return {
    getPriceInUsd,
  };
};
