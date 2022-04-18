import React from 'react';

type DropdownArrowDownProps = {
  className?: string;
};

export function DropdownArrowDown(props: DropdownArrowDownProps) {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.37378 0.739731L6.11885 5.4848L10.8639 0.739731"
        fill="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}
