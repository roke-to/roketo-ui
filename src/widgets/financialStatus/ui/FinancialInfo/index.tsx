import React from 'react';

import {ProgressBar} from 'shared/ui/components/ProgressBar';

import styles from './styles.module.scss';

type FinancialInfoProps = {
  title: string,
  total: number,
  streamed?: number,
  withdrawn?: number,
  withProgressBar?: boolean,
  testId?: string;
};

export const FinancialInfo = ({title, total, streamed , withdrawn, withProgressBar = true, testId}: FinancialInfoProps) => {
  const financialContent = streamed ? `$ ${streamed} of ${total}` : `$ ${total}`;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>

      <span className={styles.finance} data-testid={testId}>{financialContent}</span>

      {withProgressBar &&
        <ProgressBar total={total} streamed={streamed || 0} withdrawn={withdrawn || 0} />
      }
    </div>
  );
};
