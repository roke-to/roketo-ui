import React from 'react';

import darkLogoSvg from '@app/shared/images/dark-logo-stream.svg';

type Props = {
  className?: string,
}

export const DarkLogo = (props: Props) => {
  const {className} = props;

  return (
    <div className={className}>
      <img src={darkLogoSvg} alt="Roketo logo"/>
    </div>
  );
};
