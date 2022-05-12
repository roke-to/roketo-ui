import React from 'react';

import {ReactComponent as Twitter} from './logo-twitter.svg';

type Props = {
  className?: string,
}

export const TwitterLogo = (props: Props) => {
  const {
    className,
  } = props;

  return (
    <div className={className}>
      <Twitter />
    </div>
  );
}
