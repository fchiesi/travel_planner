import React from 'react';

export const KitchenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 20h12" />
    <path d="M2 10h20" />
    <path d="M4 10v10h16V10" />
    <path d="m18 4-1.33 4" />
    <path d="m6 4 1.33 4" />
    <path d="M12 4v4" />
    <path d="M12 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  </svg>
);