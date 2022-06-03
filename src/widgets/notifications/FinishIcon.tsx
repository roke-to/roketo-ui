import React from 'react';

export function FinishIcon({className}: {className: string}) {
  return (
    <svg className={className} width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="22" fill="#F1F6FE" />
      <path
        d="M22 14.9167V19.5M14.5 29.5V26.1667V29.5ZM14.5 26.1667V16.1667C14.5 15.7246 14.6756 15.3007 14.9882 14.9882C15.3007 14.6756 15.7246 14.5 16.1667 14.5H21.5833L22.4167 15.3333H29.5L27 20.3333L29.5 25.3333H22.4167L21.5833 24.5H16.1667C15.7246 24.5 15.3007 24.6756 14.9882 24.9882C14.6756 25.3007 14.5 25.7246 14.5 26.1667V26.1667Z"
        stroke="#3E65F2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
