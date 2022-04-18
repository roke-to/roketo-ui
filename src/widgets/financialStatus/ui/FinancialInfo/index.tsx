import React from 'react';

import {ProgressBar} from '@app/shared/ui/components/ProgressBar';

import styles from './styles.module.scss';

type FinancialInfoProps = {
  title: string,
  total: number,
  streamed?: number,
  withdrawn?: number,
  withProgressBar?: boolean,
};

export const FinancialInfo = ({title, total, streamed , withdrawn, withProgressBar = true}: FinancialInfoProps) => {
  const financialContent = streamed ? `$ ${streamed} of ${total}` : `${total} $`;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>

      <span className={styles.finance}>{financialContent}</span>

      {withProgressBar &&
        <ProgressBar total={total} streamed={streamed || 0} withdrawn={withdrawn || 0} />
      }
    </div>
  );
};
