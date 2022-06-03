import cn from 'classnames';
import React, {FC, InputHTMLAttributes} from 'react';

import styles from './styles.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  className?: string;
}

export const Input: FC<InputProps> = ({className, hasError = false, ...rest}) => (
  <input className={cn(styles.input, {[styles.error]: hasError}, className)} {...rest} />
);
