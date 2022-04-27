import React from 'react';
import cn from 'classnames';

import {useRoketoContext} from 'app/roketo-context';
import {useStreams} from 'features/roketo-resource';
import {isActiveStream} from 'shared/api/roketo/helpers';

import {FinancialInfo} from '../FinancialInfo';

import {collectTotalFinancialAmountInfo, countTotalUSDWithdrawal} from '../../lib';
import styles from './styles.module.scss';

type FinancialStatusProps = {
  className?: string,
}
export const FinancialStatus = ({className}: FinancialStatusProps) => {
  const {tokens, priceOracle} = useRoketoContext();
  const {data: streams} = useStreams();

  const {inputs = [], outputs = []} = streams || {};

  const activeInputStreams = inputs.filter(isActiveStream);
  const activeOutputStreams = outputs.filter(isActiveStream);

  const outcomeAmountInfo = collectTotalFinancialAmountInfo(
    activeOutputStreams,
    tokens,
    priceOracle
  );

  const incomeAmountInfo = collectTotalFinancialAmountInfo(
    activeInputStreams,
    tokens,
    priceOracle
  );

  const availableForWithdrawal = countTotalUSDWithdrawal(
    activeInputStreams,
    tokens,
    priceOracle
  );

  return (
    <section className={cn(styles.root, className)}>
      <FinancialInfo
        title="Sending"
        total={outcomeAmountInfo.total}
        streamed={outcomeAmountInfo.streamed}
        withdrawn={outcomeAmountInfo.withdrawn}
      />

      <FinancialInfo
        title="Receiving"
        total={incomeAmountInfo.total}
        streamed={incomeAmountInfo.streamed}
        withdrawn={incomeAmountInfo.withdrawn}
      />

      <FinancialInfo
        title="Available for withdrawal"
        total={availableForWithdrawal}
        withProgressBar={false}
      />
    </section>
  );
};
