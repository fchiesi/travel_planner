import React from 'react';

export const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap no-print ${
      isActive
        ? 'bg-teal-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);
