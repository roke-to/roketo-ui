import React from 'react';

import type {StreamDirection} from '~/shared/api/roketo/constants';
import {ProgressBar} from '~/shared/ui/components/ProgressBar';

import styles from './styles.module.scss';

type FinancialInfoProps = {
  title: string;
  total: number;
  streamed?: number;
  withdrawn?: number;
  withProgressBar?: boolean;
  testId?: string;
  direction?: StreamDirection | null;
};

export const FinancialInfo = ({
  title,
  total,
  streamed = 0,
  withdrawn = 0,
  withProgressBar = true,
  testId,
  direction = null,
}: FinancialInfoProps) => {
  const financialContent = streamed ? `$ ${streamed} of ${total}` : `$ ${total}`;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>

      <span className={styles.finance} data-testid={testId}>
        {financialContent}
      </span>

      {withProgressBar && (
        <ProgressBar
          total={String(total)}
          streamed={String(streamed)}
          withdrawn={String(withdrawn)}
          direction={direction}
        />
      )}
    </div>
  );
};
