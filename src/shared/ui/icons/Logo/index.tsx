import React from 'react';

import {BlackLogo} from './BlackLogo';
import {ColoredLogo} from './ColoredLogo';

export enum DisplayType {
  COLORED = 'colored',
  CURRENT_COLOR = 'current-color',
}

const DISPLAY_TYPE_TO_LOGO_MAP = {
  [DisplayType.COLORED]: ColoredLogo,
  [DisplayType.CURRENT_COLOR]: BlackLogo,
};

type Props = {
  type?: DisplayType;
  className?: string;
};

export const Logo = (props: Props) => {
  const {type = DisplayType.COLORED, className} = props;

  const ChosenLogo = DISPLAY_TYPE_TO_LOGO_MAP[type];

  return <ChosenLogo className={className} />;
};
