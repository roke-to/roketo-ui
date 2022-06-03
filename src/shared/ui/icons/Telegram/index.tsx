import React from 'react';

import {ReactComponent as Telegram} from './logo-telegram.svg';

type Props = {
  className?: string;
};

export const TelegramLogo = (props: Props) => {
  const {className} = props;

  return (
    <div className={className}>
      <Telegram />
    </div>
  );
};
