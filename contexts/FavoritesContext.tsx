import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TripPlan } from '../types.ts';
import * as favoritesService from '../services/favoritesService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import * as authService from '../services/authService.ts';

interface FavoritesContextType {
  favoriteTrips: TripPlan[];
  isFavorite: (tripId: string) => boolean;
  addFavorite: (trip: TripPlan) => Promise<void>;
  removeFavorite: (tripId: string) => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteTrips, setFavoriteTrips] = useState<TripPlan[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      favoritesService.getFavoriteTrips(user.uid).then(favs => {
        setFavoriteTrips(favs);
        setFavoriteIds(new Set(favs.map(f => f.id)));
      });
    } else {
      setFavoriteTrips([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const isFavorite = useCallback((tripId: string): boolean => {
    return favoriteIds.has(tripId);
  }, [favoriteIds]);

  const addFavorite = async (trip: TripPlan) => {
    if (!user) {
      alert("Faça login para salvar seus roteiros favoritos!");
      await authService.signInWithGoogle();
      return;
    }
    try {
      await favoritesService.addFavoriteTrip(user.uid, trip);
      setFavoriteTrips(prev => [trip, ...prev.filter(p => p.id !== trip.id)].sort((a, b) => (b.favoritedAt || 0) - (a.favoritedAt || 0)));
      setFavoriteIds(prev => new Set(prev).add(trip.id));
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  const removeFavorite = async (tripId: string) => {
    if (!user) return;
    try {
      await favoritesService.removeFavoriteTrip(user.uid, tripId);
      setFavoriteTrips(prev => prev.filter(p => p.id !== tripId));
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tripId);
        return newSet;
      });
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteTrips, isFavorite, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
