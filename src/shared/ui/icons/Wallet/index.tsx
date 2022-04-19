import React from 'react';

type Props = {
  width?: number,
  height?: number,
  className?: string,
}

const DEFAULT_WIDTH = 17;
const DEFAULT_HEIGHT = 16;

export const WalletIcon = ({width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, className}: Props) => (
    <div className={className}>
      <svg width={width} height={height} viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 4.06667V2.16667C15.5 1.25 14.75 0.5 13.8333 0.5H2.16667C1.24167 0.5 0.5 1.25 0.5 2.16667V13.8333C0.5 14.75 1.24167 15.5 2.16667 15.5H13.8333C14.75 15.5 15.5 14.75 15.5 13.8333V11.9333C15.9917 11.6417 16.3333 11.1167 16.3333 10.5V5.5C16.3333 4.88333 15.9917 4.35833 15.5 4.06667ZM14.6667 5.5V10.5H8.83333V5.5H14.6667ZM2.16667 13.8333V2.16667H13.8333V3.83333H8.83333C7.91667 3.83333 7.16667 4.58333 7.16667 5.5V10.5C7.16667 11.4167 7.91667 12.1667 8.83333 12.1667H13.8333V13.8333H2.16667Z" fill="#626F84"/>
      </svg>
    </div>
  );
