import React from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';

type RadioButtonProps<T> = {
  active: boolean;
  label: React.ReactNode;
  value: T;
  onChange: (value: T) => void;
};

export function RadioButton<T>({
  active, label, value, onChange,
}: RadioButtonProps<T>) {
  return (
    <label className={styles.root}>
      <input
        type="radio"
        className="invisible w-0 h-0 absolute"
        checked={active}
        onChange={() => onChange(value)}
      />
      <div
        className={classNames(styles.radio, {[styles.radioActive]: active})}
      />

      <div className={styles.text}>
        {label}
      </div>
    </label>
  );
}
