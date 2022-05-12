import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

type Props = {
  wrapperClassName?: string,
  spinnerClassName?: string,
};

export const Spinner = ({wrapperClassName, spinnerClassName}: Props) => (
  <div className={cn(styles.wrapper, wrapperClassName)}>
    <div className={cn(styles.spinner, spinnerClassName)}/>
  </div>
);
