import React from 'react';

export const BreakfastIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17 8H7a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3Z" />
    <path d="M6 8V7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
    <path d="M17 19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8" />
  </svg>
);