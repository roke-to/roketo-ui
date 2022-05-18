import React from 'react';
import cn from 'classnames';

import {Button} from '@ui/components/Button';

import styles from './styles.module.scss';

type Props = {
  directions: string[],
  activeDirection: string,
  isInactive: boolean
  onDirectionClick: (direction: string) => void,
};

export const DirectionSorts = ({directions, activeDirection, onDirectionClick, isInactive}: Props) => (
  <div className={styles.root}>
    {directions.map(direction => (
      <Button
        key={direction}
        className={cn(styles.sort, {[styles.active]: direction === activeDirection})}
        onClick={() => onDirectionClick(direction)}
        disabled={isInactive}
      >
        {direction}
      </Button>
    ))}
  </div>
);
