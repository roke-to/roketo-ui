import React from 'react';
import classNames from 'classnames';

import {Authorization} from 'features/authorization';

import styles from './styles.module.scss';

export function AuthorizePage() {
  return (
    <div className="flex h-screen mx-3">
      <div
        className={classNames('lg:m-auto mx-auto my-auto lg:w-2/5 bg-gray-90 rounded-3xl p-5', styles.block)}
      >
        <div className={classNames('my-24', styles.content)}>
          <h1 className="text-3xl mb-4 font-semibold">
            {' '}
            Login via NEAR Network
            {' '}
          </h1>
          <p className={classNames('mb-4', styles.hint)}>
            Click button below to login or create new account
          </p>
          <Authorization />
        </div>
      </div>
    </div>
  );
}
