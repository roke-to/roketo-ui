import React from 'react';

import styles from './styles.module.scss';

export const Name = ({name, label}: {name: string; label?: string | undefined}) => (
  <div className={styles.flexCenter}>
    <span className={styles.name}>{name}</span>

    {label && <span className={styles.nameLabel}>{label}</span>}
  </div>
);
