import React from 'react';
import cn from 'classnames';

import {Button} from '@ui/components/Button';

import styles from './styles.module.scss';

type Props = {
  directions: string[],
  activeDirection: string,

  onDirectionClick: (direction: string) => void,
};

export const DirectionSorts = ({directions, activeDirection, onDirectionClick}: Props) => (
  <div className={styles.root}>
    {directions.map(direction => (
      <Button
        className={cn(styles.sort, {[styles.active]: direction === activeDirection})}
        onClick={() => onDirectionClick(direction)}
      >
        {direction}
      </Button>
    ))}
  </div>
);
