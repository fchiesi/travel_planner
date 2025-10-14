import React from 'react';
import { TripPlan } from '../types.ts';
import TripCard from './TripCard.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';

interface FavoritesSectionProps {
  onSelectTrip: (trip: TripPlan) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectTrip }) => {
  const { favoriteTrips } = useFavorites();

  if (favoriteTrips.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-gray-800 font-poppins mb-8">Seus Roteiros Favoritos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {favoriteTrips.map((plan) => (
          <TripCard
            key={plan.id}
            trip={plan}
            onSelect={() => onSelectTrip(plan)}
          />
        ))}
      </div>
    </div>
  );
};
