export const PRICE_ORACLE_CONTRACT_NAME = 'priceoracle.testnet' as const;

// TODO: научиться определять dev и prod окружение
// export const PRICE_ORACLE_CONTRACT_NAME = 'priceoracle.near' as const;
// export const ORACLE_SOURCE_ID = 'pythia.near' as const;

export const ORACLE_SOURCE_ID = 'oracle-1.testnet' as const;

export const CONTRACT_VIEW_METHODS_LIST = [
  'get_assets',
  'get_asset',
  'get_price_data',
];
export const CONTRACT_CHANGE_METHODS_LIST = [];
