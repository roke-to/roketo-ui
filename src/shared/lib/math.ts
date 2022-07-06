import {BigNumber} from 'bignumber.js';

const PERCENTAGE_MULTIPLIER = 100;

/** Retrieves a percentage ratio from A/B */
const getExactPercentageRatio = (
  a: string | number | BigNumber,
  b: string | number | BigNumber,
): BigNumber => {
  const aBN = new BigNumber(a);
  const bBN = new BigNumber(b);

  if (aBN.isEqualTo(0) || bBN.isEqualTo(0)) {
    return new BigNumber(0);
  }

  const ratio = aBN.dividedBy(bBN);

  return ratio.multipliedBy(PERCENTAGE_MULTIPLIER);
};

/** Retrieves a percentage ratio from A/B rounded to an integer */
export const getRoundedPercentageRatio = (
  a: string | number | BigNumber,
  b: string | number | BigNumber,
  roundRatio: number = 0,
): BigNumber => getExactPercentageRatio(a, b).dp(roundRatio);
