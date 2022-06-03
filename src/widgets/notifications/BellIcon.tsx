import React from 'react';

type BellIconProps = {
  className?: string;
  withBadge: boolean;
};

export function BellIcon({className, withBadge}: BellIconProps) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M15.375 17.5556H8.625M15.375 17.5556H21L19.4194 15.9944C19.2071 15.7848 19.0387 15.5358 18.9239 15.2619C18.809 14.9879 18.75 14.6943 18.75 14.3978V10.8889C18.7502 9.50993 18.3175 8.16482 17.5116 7.03876C16.7057 5.91271 15.5662 5.06107 14.25 4.60111V4.22222C14.25 3.63285 14.0129 3.06762 13.591 2.65087C13.169 2.23413 12.5967 2 12 2C11.4033 2 10.831 2.23413 10.409 2.65087C9.98705 3.06762 9.75 3.63285 9.75 4.22222V4.60111C7.12875 5.51667 5.25 7.98667 5.25 10.8889V14.3989C5.25 14.9967 5.00925 15.5711 4.58063 15.9944L3 17.5556H8.625H15.375ZM15.375 17.5556V18.6667C15.375 19.5507 15.0194 20.3986 14.3865 21.0237C13.7536 21.6488 12.8951 22 12 22C11.1049 22 10.2464 21.6488 9.61351 21.0237C8.98058 20.3986 8.625 19.5507 8.625 18.6667V17.5556H15.375Z"
        stroke={withBadge ? '#3E65F2' : '#2B313B'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {withBadge && <circle cx="19" cy="5" r="5" fill="#D80A1F" stroke="white" strokeWidth="2" />}
    </svg>
  );
}
