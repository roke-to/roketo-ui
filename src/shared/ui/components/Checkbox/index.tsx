import React, {FC, InputHTMLAttributes} from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: React.ReactNode,
  hasError?: boolean,
  className?: string,
}

export const Checkbox: FC<CheckboxProps> = ({
  description,
  className,
  hasError = false,
  ...rest
}) => (
  <label className={cn(styles.root, className)}>
    <input
      type="checkbox"
      className={cn(styles.checkbox, {[styles.error]: hasError})}
      {...rest}
    />
    {description &&
      <div className={styles.description}>{description}</div>
    }
  </label>
);
