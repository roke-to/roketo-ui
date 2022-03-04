import React from 'react';

export const PlusGradientIcon = (props) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="14.5566" cy="14.7314" r="14.5" fill="url(#paint0_linear)" />
    <path
      d="M14.7506 10.7635L14.7506 14.7314M14.7506 18.6993L14.7506 14.7314M14.7506 14.7314L18.7185 14.7314M14.7506 14.7314L10.7827 14.7314"
      stroke="#1F1D37"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="-2.34261"
        y1="7.84647"
        x2="34.6054"
        y2="32.139"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#FF856A" />
        <stop offset="1" stop-color="#FFCD6A" />
      </linearGradient>
    </defs>
  </svg>
);
