
import React, { useMemo } from 'react';
import { TripPlan } from '../types.ts';

interface TripFiltersProps {
  tripPlans: TripPlan[];
  filters: {
    transport: string;
    destination: string;
    date: string;
  };
  onFilterChange: (filters: { transport: string; destination: string; date: string }) => void;
  onReset: () => void;
}

export const TripFilters: React.FC<TripFiltersProps> = ({ tripPlans, filters, onFilterChange, onReset }) => {
  const transportOptions = useMemo(() => {
    const modes = new Set(tripPlans.map(trip => trip.transportationDetails.mode));
    return Array.from(modes);
  }, [tripPlans]);

  const destinationOptions = useMemo(() => {
    const destinations = new Set(tripPlans.map(trip => trip.destinationName));
    return Array.from(destinations);
  }, [tripPlans]);

  const handleTransportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, transport: e.target.value });
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, destination: e.target.value });
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, date: e.target.value });
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg shadow-gray-200/50 mb-8 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="transport-filter" className="block text-sm font-medium text-gray-600 px-1">Transporte</label>
          <select
            id="transport-filter"
            value={filters.transport}
            onChange={handleTransportChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg shadow-inner shadow-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          >
            <option value="">Todos</option>
            {transportOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="destination-filter" className="block text-sm font-medium text-gray-600 px-1">Destino</label>
          <select
            id="destination-filter"
            value={filters.destination}
            onChange={handleDestinationChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg shadow-inner shadow-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          >
            <option value="">Todos</option>
            {destinationOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-600 px-1">Contém a data</label>
          <input
            type="date"
            id="date-filter"
            value={filters.date}
            onChange={handleDateChange}
            min={today}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg shadow-inner shadow-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>
        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors h-[42px]"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};