import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { SearchCriteria, TripPlan, Travelers } from '../types.ts';
import { getTripSuggestionsFromBackend } from '../services/apiService.ts';
import * as userProfileService from '../services/userProfileService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { sendTripToWebhook } from '../services/webhookService.ts';

interface TripContextType {
  tripPlans: TripPlan[];
  isLoading: boolean;
  error: string | null;
  showResults: boolean;
  handleSearch: (criteria: SearchCriteria) => Promise<void>;
  handleSurpriseMe: (travelers: Travelers, startLocation: string, startLocationCoords?: { lat: number, lon: number }) => Promise<void>;
  resetSearch: () => void;
  saveTripChoiceAndUpdateProfile: (trip: TripPlan) => void;
}

export const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const performSearch = useCallback(async (searchFunction: () => Promise<TripPlan[]>) => {
    setIsLoading(true);
    setError(null);
    setTripPlans([]);
    setShowResults(true);
    try {
      const plans = await searchFunction();
      setTripPlans(plans);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Desculpe, não foi possível gerar sugestões. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    await performSearch(async () => {
      // A lógica do perfil do usuário pode ser passada para o backend também
      const userProfile = user ? await userProfileService.getUserProfile(user.uid) : '';
      // A chamada agora vai para o nosso backend!
      return getTripSuggestionsFromBackend({ ...criteria, userProfile }); 
    }); 
      }, [user, performSearch]);

  const handleSurpriseMe = useCallback(async (travelers: Travelers, startLocation: string, startLocationCoords?: { lat: number; lon: number }) => {
    await performSearch(async () => {
      const userProfile = user ? await userProfileService.getUserProfile(user.uid) : '';
      const criteria: SearchCriteria = {
        travelers,
        startLocation,
        startLocationCoords,
        destination: 'SURPRISE_ME',
        budget: '',
        startDate: '',
        endDate: '',
        userProfile,
      };
      // FIX: Use the new backend service function instead of the old direct Gemini call.
      return getTripSuggestionsFromBackend(criteria);
    });
  }, [user, performSearch]);
  
  const resetSearch = () => {
      setShowResults(false);
      setTripPlans([]);
      setError(null);
  };

  const saveTripChoiceAndUpdateProfile = (trip: TripPlan) => {
    if (user) {
      userProfileService.saveTripChoice(user.uid, trip);
    }
    sendTripToWebhook(trip);
  };


  return (
    <TripContext.Provider value={{ tripPlans, isLoading, error, showResults, handleSearch, handleSurpriseMe, resetSearch, saveTripChoiceAndUpdateProfile }}>
      {children}
    </TripContext.Provider>
  );
};
