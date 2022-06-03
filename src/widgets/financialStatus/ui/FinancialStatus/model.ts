import {createStore, sample} from 'effector';
import {$tokens, $accountStreams, $priceOracle} from 'services/wallet';
import {isActiveStream} from 'shared/api/roketo/helpers';

import {
  collectTotalFinancialAmountInfo,
  countTotalUSDWithdrawal,
} from '../../lib';

export const $financialStatus = createStore({
  outcomeAmountInfo: {
    total: 0,
    streamed: 0,
    withdrawn: 0,
  },
  incomeAmountInfo: {
    total: 0,
    streamed: 0,
    withdrawn: 0,
  },
  availableForWithdrawal: 0,
});

sample({
  source: {
    tokens: $tokens,
    streams: $accountStreams,
    priceOracle: $priceOracle,
  },
  fn({tokens, streams: {inputs, outputs}, priceOracle}) {
    const activeInputStreams = inputs.filter(isActiveStream);
    const activeOutputStreams = outputs.filter(isActiveStream);
    return {
      outcomeAmountInfo: collectTotalFinancialAmountInfo(
        activeOutputStreams,
        tokens,
        priceOracle,
      ),
      incomeAmountInfo: collectTotalFinancialAmountInfo(
        activeInputStreams,
        tokens,
        priceOracle,
      ),
      availableForWithdrawal: countTotalUSDWithdrawal(
        activeInputStreams,
        tokens,
        priceOracle,
      ),
    };
  },
  target: $financialStatus,
});
