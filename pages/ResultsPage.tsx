import React, { useState, useMemo } from 'react';
import { TripPlan } from '../types.ts';
import { useTrips } from '../hooks/useTrips.ts';
import { TripFilters } from '../components/TripFilters.tsx';
import TripCard from '../components/TripCard.tsx';
import { FilterIcon } from '../components/icons/FilterIcon.tsx';
import Spinner from '../components/Spinner.tsx';

interface ResultsPageProps {
    onSelectTrip: (trip: TripPlan) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onSelectTrip }) => {
    const { tripPlans, isLoading, resetSearch } = useTrips();
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filters, setFilters] = useState({
        transport: '',
        destination: '',
        date: '',
    });

    const filteredTripPlans = useMemo(() => {
        return tripPlans.filter(trip => {
            const transportMatch = !filters.transport || trip.transportationDetails.mode === filters.transport;
            const destinationMatch = !filters.destination || trip.destinationName === filters.destination;
            const dateMatch = !filters.date || (trip.startDate && trip.endDate && filters.date >= trip.startDate && filters.date <= trip.endDate);
            return transportMatch && destinationMatch && dateMatch;
        });
    }, [tripPlans, filters]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 font-poppins">Suas sugestões de viagem</h2>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowFilters(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FilterIcon className="w-5 h-5" />
                        {showFilters ? 'Ocultar Filtros' : 'Filtrar Resultados'}
                    </button>
                    <button onClick={resetSearch} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                        Planejar Outra Viagem
                    </button>
                </div>
            </div>

            {showFilters && (
                <TripFilters 
                    tripPlans={tripPlans}
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={() => setFilters({ transport: '', destination: '', date: '' })}
                />
            )}

            {filteredTripPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTripPlans.map((plan) => (
                  <TripCard 
                    key={plan.id} 
                    trip={plan} 
                    onSelect={() => onSelectTrip(plan)}
                  />
                ))}
              </div>
            ) : (
                !isLoading && (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">Nenhuma viagem encontrada</h3>
                        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou planejar uma nova viagem.</p>
                    </div>
                )
            )}
            {isLoading && tripPlans.length > 0 && <Spinner />}
        </div>
    );
};
