import cn from 'classnames';
import React, {FC, InputHTMLAttributes} from 'react';

import styles from './styles.module.scss';

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: React.ReactNode;
  hint?: React.ReactNode;
  hasError?: boolean;
  className?: string;
  disabled?: boolean;
  checked: boolean;
  testId: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toggle: FC<ToggleProps> = ({
  description,
  hint,
  onChange,
  className,
  testId,
  checked,
  hasError = false,
  disabled = false,
}) => (
  <>
    <label className={cn(styles.root, disabled && styles.disabled, className)} data-testid={testId}>
      {description && <div>{description}</div>}
      <input
        className={cn({[styles.error]: hasError})}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={onChange}
      />
      <span className={cn(styles.toggle)} />
    </label>
    {hint && <div className={styles.hint}>{hint}</div>}
  </>
);
