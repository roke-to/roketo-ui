export const ROKETO_CONTRACT_NAME = process.env.REACT_APP_ROKETO_LEGACY_CONTRACT_NAME;
export const GAS_SIZE = "200000000000000";
export const STORAGE_DEPOSIT = 1e22;

// Multiply your stream speed by one of this constants, to receive amount transferred over period
export const TICK_TO_MS = 1e6;
export const TICK_TO_S = 1e9;
export const TICK_TO_MINUTE = TICK_TO_S * 60;
export const TICK_TO_HOUR = TICK_TO_MINUTE * 60;
export const TICK_TO_DAY = TICK_TO_HOUR * 24;
export const TICK_TO_WEEK = TICK_TO_DAY * 7;
export const TICK_TO_MONTH = TICK_TO_WEEK * 4;
export const TICK_TO_YEAR = TICK_TO_MONTH * 12;
