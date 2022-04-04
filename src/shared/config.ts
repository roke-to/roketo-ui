type EnvType = {
  ACCOUNT_SUFFIX: string;
  NEAR_NETWORK_ID: string;
  NEAR_NODE_URL: string;
  ROKETO_CONTRACT_NAME: string;
  WALLET_URL: string;
  PUBLIC_URL: string;
}

export const env = {
  ACCOUNT_SUFFIX: process.env.REACT_APP_NEAR_ACCOUNT_SUFFIX,
  NEAR_NETWORK_ID: process.env.REACT_APP_NEAR_NETWORK_ID,
  NEAR_NODE_URL: process.env.REACT_APP_NEAR_NODE_URL,
  ROKETO_CONTRACT_NAME: process.env.REACT_APP_ROKETO_CONTRACT_NAME,
  WALLET_URL: process.env.REACT_APP_WALLET_URL,
  PUBLIC_URL: process.env.PUBLIC_URL,
} as EnvType;

export const GAS_SIZE = "200000000000000";
