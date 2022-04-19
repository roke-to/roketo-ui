import React from 'react';

type Props = {
  width?: number,
  height?: number,
  className?: string,
}

const DEFAULT_WIDTH = 18;
const DEFAULT_HEIGHT = 18;

export const LogoutIcon = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
    <div className={className}>
      <svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.09 12.59L8.5 14L13.5 9L8.5 4L7.09 5.41L9.67 8H0V10H9.67L7.09 12.59ZM16 0H2C0.89 0 0 0.9 0 2V6H2V2H16V16H2V12H0V16C0 17.1 0.89 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z" fill="#2B313B"/>
      </svg>
    </div>
  );
