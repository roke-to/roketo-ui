import React from 'react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;

export const ArrowLinkIcon = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className,
}: Props) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 8.35362V0H1.64744L1.63462 1.85778H6.78846L0 8.6483L1.35256 10L8.14103 3.20948L8.1282 8.35362H10Z"
      fill="currentColor"
    />
  </svg>
);
