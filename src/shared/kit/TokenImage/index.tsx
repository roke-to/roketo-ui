import React from 'react';
import classNames from 'classnames';
import { TokenIcon } from '~/shared/icons/Tokens';

type TokenImageProps = {
  tokenAccountId: string;
  size?: number;
  className?: string;
};

export function TokenImage({
  tokenAccountId,
  size = 8,
  className,
}: TokenImageProps) {
  return (
    <div
      className={classNames(
        'p-1 flex-shrink-0 rounded-full bg-black inline-flex items-center justify-center',
        `w-${size} h-${size}`,
        className,
      )}
    >
      <TokenIcon className="w-full h-full rounded-full" tokenAccountId={tokenAccountId} />
    </div>
  );
}
