import React from 'react';

import {Authorization} from '~/features/authorization';

import styles from './styles.module.scss';

export function AuthorizePage() {
  return (
    <div className="flex h-screen mx-3">
      <div className={styles.root}>
        <div className={styles.content}>
          <div>
            <h1 className={styles.title}> Login via NEAR Network </h1>
            <p className={styles.hint}>Click button below to login or create new account</p>
          </div>
          <Authorization />
        </div>
      </div>
    </div>
  );
}
