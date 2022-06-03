import React from 'react';

import { Badge } from '~/shared/components/Badge';

import styles from './styles.module.scss';

type NameProps = {
  name: string;
  isOutgoing: boolean;
  isLocked: boolean;
};

export const Name = ({ name, isOutgoing, isLocked }: NameProps) => (
  <div className={styles.flexCenter}>
    <span className={styles.name}>{name}</span>

    {isOutgoing &&
      <Badge>Sending</Badge>
    }

    {isLocked &&
      <Badge isOrange>Locked</Badge>
    }
  </div>
);
