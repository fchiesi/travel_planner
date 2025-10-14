import React, { useState } from 'react';
import { SearchCriteria } from '../../types.ts';
import { MapPinIcon } from '../icons/MapPinIcon.tsx';
import { CalendarIcon } from '../icons/CalendarIcon.tsx';
import { DollarSignIcon } from '../icons/DollarSignIcon.tsx';

interface ItineraryFormStepProps {
  startLocation: string;
  onStartLocationChange: (value: string) => void;
  onBack: () => void;
  onSearch: (criteria: Omit<SearchCriteria, 'travelers'>) => void;
  isLoading: boolean;
}

export const ItineraryFormStep: React.FC<ItineraryFormStepProps> = ({
  startLocation,
  onStartLocationChange,
  onBack,
  onSearch,
  isLoading
}) => {
  const [destination, setDestination] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [preferredTransport, setPreferredTransport] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (startLocation.trim() === '') {
        alert("Por favor, informe o local de partida.");
        return;
    }
    onSearch({
      startLocation,
      destination,
      budget,
      startDate,
      endDate,
      preferredTransport
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
       <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 mb-4">&larr; Voltar</button>
       <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-poppins">Defina os detalhes da sua viagem</h2>
       <p className="text-gray-600 mb-6">Preencha os campos que desejar. Quanto mais detalhes, mais personalizado será o seu roteiro.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startLocationForm" className="flex items-center text-sm font-medium text-gray-700"><MapPinIcon className="w-4 h-4 mr-2" /> Local de Partida</label>
              <input type="text" id="startLocationForm" value={startLocation} onChange={(e) => onStartLocationChange(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
              <label htmlFor="destination" className="flex items-center text-sm font-medium text-gray-700"><MapPinIcon className="w-4 h-4 mr-2" /> Destino (Opcional)</label>
              <input type="text" id="destination" placeholder="Ex: Paris, França" value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="budget" className="flex items-center text-sm font-medium text-gray-700"><DollarSignIcon className="w-4 h-4 mr-2" /> Orçamento Total (Opcional)</label>
              <input type="text" id="budget" placeholder="Ex: R$ 5000" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
              <label htmlFor="startDate" className="flex items-center text-sm font-medium text-gray-700"><CalendarIcon className="w-4 h-4 mr-2" /> Data de Início (Opcional)</label>
              <input type="date" id="startDate" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
              <label htmlFor="endDate" className="flex items-center text-sm font-medium text-gray-700"><CalendarIcon className="w-4 h-4 mr-2" /> Data de Fim (Opcional)</label>
              <input type="date" id="endDate" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
        </div>
         <div>
            <label htmlFor="preferredTransport" className="block text-base font-medium text-gray-700">Meio de Transporte Preferido (Opcional)</label>
            <select id="preferredTransport" value={preferredTransport} onChange={(e) => setPreferredTransport(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-lg border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 rounded-md">
                <option value="">Qualquer Tipo / O mais recomendado</option>
                <option value="Avião">Avião</option>
                <option value="Carro próprio">Carro próprio</option>
                <option value="Ônibus">Ônibus</option>
                <option value="Carro Alugado">Carro Alugado</option>
                <option value="Transporte Público">Transporte Público</option>
            </select>
        </div>
        <div className="flex items-center justify-end gap-4 pt-4">
            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Buscando...' : 'Buscar Viagens'}
            </button>
        </div>
      </form>
    </div>
  );
};
