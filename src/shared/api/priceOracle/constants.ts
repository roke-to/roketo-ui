export const DECIMAL = 10;

const NEAR_MULTIPLIER = DECIMAL ** 24;
const DAI_MULTIPLIER = DECIMAL ** 18;

export const TOKEN_MULTIPLIER_MAP = {
  // TestNet
  'wrap.testnet': NEAR_MULTIPLIER,
  'dai.fakes.testnet': DAI_MULTIPLIER,

  // MainNet
  'wrap.near': NEAR_MULTIPLIER,
  'dai.bridge.near': DAI_MULTIPLIER,
};

export const CONTRACT_VIEW_METHODS_LIST = [
  'get_assets',
  'get_asset',
  'get_price_data',
];
export const CONTRACT_CHANGE_METHODS_LIST = [];
