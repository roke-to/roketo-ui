import * as nearAPI from 'near-api-js';

import {TokenPriceCollection, TokenPriceRaw} from './interfaces/entites';
import {PriceOracleContract} from './interfaces/contract';

import {
  CONTRACT_CHANGE_METHODS_LIST,
  CONTRACT_VIEW_METHODS_LIST,
  ORACLE_SOURCE_ID,
  PRICE_ORACLE_CONTRACT_NAME,
} from './constants';

export interface PriceOracle {
  tokenMap: TokenPriceCollection,
}

const convertRawPriceToTokenMap = (
  tokenPrices: TokenPriceRaw[], relyingSourceOracleId: string
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

export const initPriceOracle = async (
  {walletConnection}: {walletConnection: nearAPI.WalletConnection}
): Promise<PriceOracle> => {
  const account = await walletConnection.account();

  const priceOracleContract = new nearAPI.Contract(account, PRICE_ORACLE_CONTRACT_NAME, {
    viewMethods: CONTRACT_VIEW_METHODS_LIST,
    changeMethods: CONTRACT_CHANGE_METHODS_LIST,
  }) as PriceOracleContract;

  const rawAssets = await priceOracleContract.get_assets({});
  const tokenMap = convertRawPriceToTokenMap(rawAssets, ORACLE_SOURCE_ID);

  return {
    tokenMap,
  };
};
