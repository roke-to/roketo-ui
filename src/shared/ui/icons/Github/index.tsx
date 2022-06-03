import React from 'react';

import {ReactComponent as Github} from './logo-git.svg';

type Props = {
  className?: string;
};

export const GithubLogo = (props: Props) => {
  const {className} = props;

  return (
    <div className={className}>
      <Github />
    </div>
  );
};
