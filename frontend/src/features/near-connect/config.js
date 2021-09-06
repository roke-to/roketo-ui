import {env} from '../../lib/environment';

export const NEAR_CONFIG = {
  accountSuffix: env.NEAR_ACCOUNT_SUFFIX,
  networkId: env.NEAR_NETWORK_ID,
  nodeUrl: env.NEAR_NODE_URL,
  contractName: env.CONTRACT_NAME,
  walletUrl: env.WALLET_URL,
  ft: env.FT_CONTRACT_NAME,
};
