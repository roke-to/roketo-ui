import cn from 'classnames';
import React from 'react';

import './Palette.scss';

type Props = {
  color: string;
};

export const Palette = ({color}: Props) => {
  const classNames = cn({
    color: true,
    [color]: true,
  });

  return <div className={classNames}>{`цвет: ${color}`}</div>;
};

export default Palette;
