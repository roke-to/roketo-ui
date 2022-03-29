import numbro from 'numbro';
import * as nearAPI from 'near-api-js';

import {env} from 'shared/config';

import {TokenPriceCollection, TokenMultiplierMap, TokenPriceRaw, TokenId} from './interfaces/entites';
import {PriceOracleContract} from './interfaces/contract';
import {
  CONTRACT_CHANGE_METHODS_LIST,
  CONTRACT_VIEW_METHODS_LIST,
  TOKEN_MULTIPLIER_MAP,
  DECIMAL,
} from './constants';

export interface PriceOracle {
  tokenMap: TokenPriceCollection,
  getPriceInUsd: (tokenId: TokenId, amount: number | string) => number,
}

const convertRawPriceToTokenMap = (
  tokenPrices: TokenPriceRaw[], relyingSourceOracleId: string
): TokenPriceCollection => {
  const priceTokenMap = tokenPrices.reduce((accumulatorMap, priceToken) => {
    const [tokenId, {reports}] = priceToken;

    const desiredSourceOracle = reports.find(
      ({oracle_id}) => oracle_id === relyingSourceOracleId
    );
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
const convertTokenToUsd = (
  priceTokenMap: TokenPriceCollection, tokenToMultiplierMap: TokenMultiplierMap
) => (tokenId: TokenId, amount: number | string): number => {
  const tokenPrice = priceTokenMap[tokenId];
  const tokenMultiplier = tokenToMultiplierMap[tokenId];

  if (!tokenPrice || !tokenMultiplier) {
    return 0;
  }

  const {multiplier, decimals} = tokenPrice;

  return numbro(amount)
    .multiply(tokenMultiplier)
    .multiply(Number(multiplier))
    .divide(DECIMAL ** decimals)
    .value();
};

export const initPriceOracle = async (
  {account}: {account: nearAPI.ConnectedWalletAccount}
): Promise<PriceOracle> => {
  const priceOracleContract = new nearAPI.Contract(account, env.PRICE_ORACLE_CONTRACT_NAME, {
    viewMethods: CONTRACT_VIEW_METHODS_LIST,
    changeMethods: CONTRACT_CHANGE_METHODS_LIST,
  }) as PriceOracleContract;

  const rawAssets = await priceOracleContract.get_assets({});
  const tokenMap = convertRawPriceToTokenMap(rawAssets, env.PRICE_ORACLE_SOURCE_ID);

  const getPriceInUsd = convertTokenToUsd(tokenMap, TOKEN_MULTIPLIER_MAP);

  return {
    tokenMap,
    getPriceInUsd,
  };
};
