import cn from 'classnames';
import React from 'react';

import styles from './styles.module.scss';

type FormFieldProps = {
  children: React.ReactNode;

  label?: React.ReactNode;
  rightLabel?: React.ReactNode;
  description?: React.ReactNode;

  isRequired?: boolean;
  error?: any;

  className?: string;
};

export const FormField = ({
  children,
  isRequired = false,
  label,
  rightLabel,
  description,
  error,
  className,
  ...rest
}: FormFieldProps) => (
  <div className={cn(styles.root, className)} {...rest}>
    {(label || rightLabel) && (
      <div className={styles.labelContainer}>
        {label && (
          <label className={cn(styles.label, {[styles.required]: isRequired})}>{label}</label>
        )}
        <div className={styles.divider} />
        {rightLabel && <label className={styles.label}>{rightLabel}</label>}
      </div>
    )}

    {children}

    {description && <div className={styles.description}>{description}</div>}

    {error && <div className={styles.error}>{error}</div>}
  </div>
);
