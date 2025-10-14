import { useContext } from 'react';
import { TripContext } from '../contexts/TripContext.tsx';

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
