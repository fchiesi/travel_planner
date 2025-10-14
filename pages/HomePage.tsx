import React from 'react';
import { FavoritesSection } from '../components/FavoritesSection.tsx';
import SearchForm from '../components/SearchForm.tsx';
import { TripPlan } from '../types.ts';
import { useAuth } from '../hooks/useAuth.ts';

interface HomePageProps {
    onSelectTrip: (trip: TripPlan) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTrip }) => {
    const { user } = useAuth();
    
    return (
        <>
            {user && (
                <FavoritesSection onSelectTrip={onSelectTrip} />
            )}
            <SearchForm />
        </>
    );
};
