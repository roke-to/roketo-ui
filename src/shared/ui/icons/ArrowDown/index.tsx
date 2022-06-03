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
    <svg width={width} height={height} viewBox="0 0 8 6" fill="none">
      <path
        d="M7.06 0.726562L4 3.7799L0.94 0.726562L0 1.66656L4 5.66656L8 1.66656L7.06 0.726562Z"
        fill="currentColor"
      />
    </svg>
  </div>
);
