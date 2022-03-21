import { env } from 'shared/config';

export const NEAR_CONFIG = {
  accountSuffix: env.ACCOUNT_SUFFIX,
  networkId: env.NEAR_NETWORK_ID,
  nodeUrl: env.NEAR_NODE_URL,
  contractName: env.CONTRACT_NAME,
  walletUrl: env.WALLET_URL,
};
