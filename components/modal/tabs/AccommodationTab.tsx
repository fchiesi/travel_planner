import React from 'react';
import { AccommodationSuggestion, TripPlan } from '../../../types.ts';
import { AccommodationOptionCard } from '../../AccommodationOptionCard.tsx';

interface AccommodationTabProps {
    trip: TripPlan;
    selectedAccommodation: AccommodationSuggestion | null;
    onSelectAccommodation: (accommodation: AccommodationSuggestion) => void;
    isCheckingAvailability: boolean;
    availableHotels: Set<string>;
}

export const AccommodationTab: React.FC<AccommodationTabProps> = ({ trip, selectedAccommodation, onSelectAccommodation, isCheckingAvailability, availableHotels }) => {
    const { suggestions } = trip.accommodationOptions;
    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 my-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-800 font-poppins">Nenhuma Sugestão de Hospedagem</h3>
                <p className="mt-2 text-gray-500">
                    Não encontramos opções de acomodação para este roteiro. <br/>
                    Tente editar o plano para obter novas sugestões.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 font-poppins">Opções de Hospedagem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((option, i) => (
                    <AccommodationOptionCard
                        key={i}
                        option={option}
                        isSelected={selectedAccommodation?.name === option.name}
                        onSelect={() => onSelectAccommodation(option)}
                        trip={trip}
                        isCheckingAvailability={isCheckingAvailability}
                        isAvailable={availableHotels.has(option.name)}
                    />
                ))}
            </div>
        </div>
    );
};
