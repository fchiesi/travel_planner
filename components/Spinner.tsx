
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">Buscando as melhores viagens para você...</p>
    </div>
  );
};

export default Spinner;
