import React from 'react';
import { Travelers } from '../../types.ts';

interface TravelerInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const TravelerInput: React.FC<TravelerInputProps> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center">
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300">-</button>
            <span className="w-12 text-center border-t border-b border-gray-300 py-1">{value}</span>
            <button type="button" onClick={() => onChange(value + 1)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300">+</button>
        </div>
    </div>
);

interface TravelersStepProps {
  travelers: Travelers;
  onTravelersChange: (travelers: Travelers) => void;
  onNext: () => void;
}

export const TravelersStep: React.FC<TravelersStepProps> = ({ travelers, onTravelersChange, onNext }) => {
  const handleAdultsChange = (value: number) => {
    onTravelersChange({ ...travelers, adults: Math.max(1, value) });
  };
  
  const handleNumChildrenChange = (num: number) => {
      const newNum = Math.max(0, num);
      const currentAges = travelers.children;
      let newAges: number[];
  
      if (newNum > currentAges.length) {
          newAges = [...currentAges, ...Array(newNum - currentAges.length).fill(1)];
      } else {
          newAges = currentAges.slice(0, newNum);
      }
      onTravelersChange({ ...travelers, children: newAges });
  };
  
  const handleChildAgeChange = (index: number, age: number) => {
      const newAges = [...travelers.children];
      newAges[index] = age;
      onTravelersChange({ ...travelers, children: newAges });
  };

  const handleNextClick = () => {
    if (travelers.adults + travelers.children.length > 0) {
      onNext();
    } else {
      alert("Por favor, adicione pelo menos um viajante.");
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-poppins">Vamos planejar sua viagem!</h2>
        <p className="text-gray-600 mb-6">Comece nos dizendo quem vai viajar.</p>
        <div className="max-w-lg mx-auto">
             <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border mb-8 text-left">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quem vai viajar?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TravelerInput label="Adultos" value={travelers.adults} onChange={handleAdultsChange} />
                        <TravelerInput label="Menores" value={travelers.children.length} onChange={handleNumChildrenChange} />
                        {travelers.children.length > 0 && (
                            <div className="sm:col-span-2 bg-white p-4 rounded-md border">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 text-left">Idade de cada menor (0-17 anos)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                                    {travelers.children.map((age, index) => (
                                        <div key={index}>
                                            <label htmlFor={`child-age-${index}`} className="block text-xs text-gray-600 mb-1">Menor {index + 1}</label>
                                            <select
                                                id={`child-age-${index}`}
                                                value={age}
                                                onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value, 10))}
                                                className="w-full text-center bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 py-1"
                                            >
                                                {Array.from({ length: 18 }, (_, i) => i).map(a => <option key={a} value={a}>{a === 0 ? 'Menos de 1 ano' : `${a} ano${a > 1 ? 's' : ''}`}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <button onClick={handleNextClick} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
                Continuar
            </button>
        </div>
    </div>
  );
};
