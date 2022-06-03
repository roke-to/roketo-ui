type EnvType = {
  ACCOUNT_SUFFIX: string;
  NEAR_NETWORK_ID: string;
  NEAR_NODE_URL: string;
  ROKETO_CONTRACT_NAME: string;
  WALLET_URL: string;
  PUBLIC_URL: string;
  PRICE_ORACLE_CONTRACT_NAME: string,
  PRICE_ORACLE_SOURCE_ID: string,
  WNEAR_ID: string;
  WEB_API_URL: string;
  COMMIT_HASH: string
  BUILD_TIME: string | null
}

export const env = {
  ACCOUNT_SUFFIX: import.meta.env.VITE_NEAR_ACCOUNT_SUFFIX,
  NEAR_NETWORK_ID: import.meta.env.VITE_NEAR_NETWORK_ID,
  NEAR_NODE_URL: import.meta.env.VITE_NEAR_NODE_URL,
  ROKETO_CONTRACT_NAME: import.meta.env.VITE_ROKETO_CONTRACT_NAME,
  WALLET_URL: import.meta.env.VITE_WALLET_URL,
  PUBLIC_URL: import.meta.env.BASE_URL,
  PRICE_ORACLE_CONTRACT_NAME: import.meta.env.VITE_PRICE_ORACLE_CONTRACT_NAME,
  PRICE_ORACLE_SOURCE_ID: import.meta.env.VITE_PRICE_ORACLE_SOURCE_ID,
  WNEAR_ID: import.meta.env.VITE_WNEAR_ID,
  WEB_API_URL: import.meta.env.VITE_WEB_API_URL,
  COMMIT_HASH: import.meta.env.COMMIT_HASH ?? 'development',
  BUILD_TIME: import.meta.env.BUILD_TIME ?? null,
} as EnvType;

export const GAS_SIZE = "200000000000000";
