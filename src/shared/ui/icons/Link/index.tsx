import React from 'react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 20;

export const LinkIcon = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 10 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 15L10 11L8 11L8 15C8 16.65 6.65 18 5 18C3.35 18 2 16.65 2 15L2 11L-4.80825e-07 11L-6.55671e-07 15C-7.76314e-07 17.76 2.24 20 5 20C7.76 20 10 17.76 10 15ZM2 9L2 5C2 3.35 3.35 2 5 2C6.65 2 8 3.35 8 5L8 9L10 9L10 5C10 2.24 7.76 -9.79135e-08 5 -2.18557e-07C2.24 -3.392e-07 -9.79135e-08 2.24 -2.18557e-07 5L-3.93402e-07 9L2 9ZM6 6L6 14L4 14L4 6L6 6Z"
      fill="currentColor"
    />
  </svg>
);
