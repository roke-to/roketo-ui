import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

type FormFieldProps = {
  children: React.ReactNode;

  label?: React.ReactNode;
  description?: React.ReactNode,

  isRequired?: boolean,
  error?: any;

  className?: string;
};

export const FormField = ({
  children, isRequired = false, label, description, error, className, ...rest
}: FormFieldProps) => (
    <div className={cn(styles.root, className)} {...rest}>
      {label &&
        <label className={cn(styles.label, {[styles.required]: isRequired})}>{label}</label>
      }

      {children}

      {description &&
        <div className={styles.description}>{description}</div>
      }

      {error &&
        <div className={styles.error}>{error}</div>
      }
    </div>
  )
