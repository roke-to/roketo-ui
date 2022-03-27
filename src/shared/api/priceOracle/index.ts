import * as nearAPI from 'near-api-js';

import {PriceOracleContract} from './interfaces/contract';

import {
  PRICE_ORACLE_CONTRACT_NAME,
  CONTRACT_CHANGE_METHODS_LIST,
  CONTRACT_VIEW_METHODS_LIST,
} from './constants';

export interface PriceOracle {
  // [TOKEN_NAME]: {value},
}

export const initPriceOracle = async (
  {walletConnection}: {walletConnection: nearAPI.WalletConnection}
): Promise<PriceOracle> => {
  const account = await walletConnection.account();

  const priceOracleContract = new nearAPI.Contract(account, PRICE_ORACLE_CONTRACT_NAME, {
    viewMethods: CONTRACT_VIEW_METHODS_LIST,
    changeMethods: CONTRACT_CHANGE_METHODS_LIST,
  }) as PriceOracleContract;

  const data = await priceOracleContract.get_assets({});

  return {
    data,
  };
};
