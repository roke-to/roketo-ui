import classNames from 'classnames';
import React from 'react';

import {TokenIcon} from '~/shared/ui/icons/Tokens';

import styles from './styles.module.scss';

type TokenImageProps = {
  tokenAccountId: string;
  size?: number;
  className?: string;
};

export function TokenImage({tokenAccountId, size = 8, className}: TokenImageProps) {
  return (
    <div
      className={classNames(
        'p-1 flex-shrink-0 rounded-full bg-black inline-flex items-center justify-center',
        `w-${size} h-${size}`,
        className,
      )}
    >
      <TokenIcon
        className={classNames('rounded-full', styles.tokenImage)}
        tokenAccountId={tokenAccountId}
      />
    </div>
  );
}
