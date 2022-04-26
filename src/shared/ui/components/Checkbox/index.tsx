import React, {FC, InputHTMLAttributes} from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: string,
  hasError?: boolean,
  className?: string,
}

export const Checkbox: FC<CheckboxProps> = ({
  description,
  className,
  hasError = false,
  ...rest
}) => (
  <div className={cn(styles.root, className)}>
    <input
      type="checkbox"
      className={cn(styles.checkbox, {[styles.error]: hasError})}
      {...rest}
    />
    {description &&
      <span className={styles.description}>{description}</span>
    }
  </div>
);
