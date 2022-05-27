import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

type Props = {
  wrapperClassName?: string,
  spinnerClassName?: string,
  testId?: string;
};

export const Spinner = ({wrapperClassName, spinnerClassName, testId}: Props) => (
  <div className={cn(styles.wrapper, wrapperClassName)} data-testid={testId}>
    <div className={cn(styles.spinner, spinnerClassName)}/>
  </div>
);
