import React from 'react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_WIDTH = 8;
const DEFAULT_HEIGHT = 6;

export const ArrowDown = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
  <div className={className}>
    <svg width={width} height={height} viewBox="0 0 10 5" fill="none">
      <path d="M0 0L5 5L10 0H0Z" fill="black" />
    </svg>
  </div>
);
