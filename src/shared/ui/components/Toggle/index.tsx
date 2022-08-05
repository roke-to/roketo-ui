import cn from 'classnames';
import React, {FC, InputHTMLAttributes} from 'react';

import styles from './styles.module.scss';

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: React.ReactNode;
  hint?: React.ReactNode;
  hasError?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Toggle: FC<ToggleProps> = ({
  description,
  hint,
  className,
  hasError = false,
  disabled = false,
  ...rest
}) => (
  <>
    <label className={cn(styles.root, disabled && styles.disabled, className)}>
      {description && <div>{description}</div>}
      <input
        className={cn({[styles.error]: hasError})}
        type="checkbox"
        disabled={disabled}
        {...rest}
      />
      <span className={cn(styles.toggle)} />
    </label>
    {hint && <div className={styles.hint}>{hint}</div>}
  </>
);
