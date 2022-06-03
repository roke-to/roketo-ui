import React from 'react';

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

export const ErrorSign = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
  <div className={className}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
        fill="#D80A1F"
      />
    </svg>
  </div>
);
