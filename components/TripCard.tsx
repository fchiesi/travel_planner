import React, { useMemo } from 'react';
import { TripPlan } from '../types.ts';
import { StarIcon } from './icons/StarIcon.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';

interface TripCardProps {
  trip: TripPlan;
  onSelect: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isTripFavorite = isFavorite(trip.id);

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  const initialTotalCost = useMemo(() => {
    const allAccommodations = trip.accommodationOptions?.suggestions || [];
    if (allAccommodations.length === 0) {
      return trip.baseCost;
    }
    const cheapestAccommodation = allAccommodations.reduce((prev, current) => 
      (prev.totalStayPrice < current.totalStayPrice) ? prev : current
    );
    return trip.baseCost + cheapestAccommodation.totalStayPrice;
  }, [trip]);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isTripFavorite) {
          removeFavorite(trip.id);
      } else {
          addFavorite(trip);
      }
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer group flex flex-col justify-between p-6 border border-gray-100 hover:shadow-cyan-100/50 relative"
    >
        <button 
            onClick={handleFavoriteClick}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${isTripFavorite ? 'text-yellow-400 bg-yellow-100/50 hover:text-yellow-500' : 'text-gray-400 bg-gray-100/50 hover:text-yellow-500'}`}
            aria-label={isTripFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
            <StarIcon filled={isTripFavorite} className="w-6 h-6" />
        </button>
      <div>
        <div className="flex justify-between items-start gap-3">
            <h3 className="text-2xl font-bold font-poppins text-teal-700">{trip.destinationName}</h3>
             {trip.startDate && trip.endDate && (
                <div className="text-right ml-2 flex-shrink-0">
                    <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                </div>
            )}
        </div>
         <p className="text-sm text-gray-500 mt-1">{trip.durationDays} dias de viagem</p>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-600">Custo inicial a partir de</p>
        <p className="text-3xl font-bold text-gray-800">{formatter.format(initialTotalCost)}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
           <span className="capitalize bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">{trip.transportationDetails.mode}</span>
           <span className="text-sm font-semibold text-teal-600 group-hover:underline">Ver Roteiro &rarr;</span>
      </div>
    </div>
  );
};

export default TripCard;
