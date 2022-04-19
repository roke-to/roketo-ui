import React from 'react';

type Props = {
  width?: number,
  height?: number,
  className?: string,
}

const DEFAULT_WIDTH = 17;
const DEFAULT_HEIGHT = 16;

export const OutcomeIcon = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
  <div className={className}>
    <svg width={width} height={height} viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.1667 12.1666L16.3333 7.99998L12.1667 3.83331L10.9917 5.00831L13.1417 7.16665H5.5V8.83331H13.1417L10.9917 10.9916L12.1667 12.1666Z" fill="#626F84"/>
      <path d="M13.8333 13.8333H2.16667V2.16667H13.8333V3.83333H15.5V2.16667C15.5 1.25 14.7583 0.5 13.8333 0.5H2.16667C1.25 0.5 0.5 1.25 0.5 2.16667V13.8333C0.5 14.75 1.25 15.5 2.16667 15.5H13.8333C14.7583 15.5 15.5 14.75 15.5 13.8333V12.1667H13.8333V13.8333Z" fill="#626F84"/>
    </svg>
  </div>
);
