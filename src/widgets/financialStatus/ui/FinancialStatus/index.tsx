import cn from 'classnames';
import {useStore} from 'effector-react';

import {STREAM_DIRECTION} from '~/shared/api/roketo/constants';
import {testIds} from '~/shared/constants';

import {FinancialInfo} from '../FinancialInfo';
import {$financialStatus} from './model';
import styles from './styles.module.scss';

export const FinancialStatus = ({className}: {className?: string}) => {
  const {outcomeAmountInfo, incomeAmountInfo, availableForWithdrawal} = useStore($financialStatus);

  return (
    <section className={cn(styles.root, className)}>
      <FinancialInfo
        title="Sending"
        total={outcomeAmountInfo.total}
        streamed={outcomeAmountInfo.streamed}
        withdrawn={outcomeAmountInfo.withdrawn}
        direction={STREAM_DIRECTION.OUT}
      />

      <FinancialInfo
        title="Receiving"
        total={incomeAmountInfo.total}
        streamed={incomeAmountInfo.streamed}
        withdrawn={incomeAmountInfo.withdrawn}
        direction={STREAM_DIRECTION.IN}
      />

      <FinancialInfo
        title="Available for withdrawal"
        total={availableForWithdrawal}
        withProgressBar={false}
        testId={testIds.availableForWithdrawalCaption}
      />
    </section>
  );
};
