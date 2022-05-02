import React from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

export enum OrderType {
  asc = 'ascending',
  desc = 'descending',
}

type Props = {
  type?: OrderType,
  width?: number,
  height?: number,
  className?: string,
}

const DEFAULT_WIDTH = 24;
const DEFAULT_HEIGHT = 24;

export const SortIcon = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  type = OrderType.desc,
  className,
}: Props) => (
  <div className={cn({[styles.rotate]: type === OrderType.asc}, className)}>
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 18H9V16H3V18ZM3 6V8H21V6H3ZM3 13H15V11H3V13Z" fill="#2B313B"/>
    </svg>
  </div>
);
