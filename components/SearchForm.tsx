import React, { useState, useEffect } from 'react';
import { SearchCriteria, Travelers } from '../types.ts';
import BuildTripWizard from './BuildTripWizard.tsx';
import { TravelersStep } from './search/TravelersStep.tsx';
import { ChoiceStep } from './search/ChoiceStep.tsx';
import { ItineraryFormStep } from './search/ItineraryFormStep.tsx';
import { useTrips } from '../hooks/useTrips.ts';

type WizardStep = 'travelers' | 'choice' | 'form';

const SearchForm: React.FC = () => {
  const { handleSearch, handleSurpriseMe, isLoading } = useTrips();
  const [step, setStep] = useState<WizardStep>('travelers');
  const [showBuildWizard, setShowBuildWizard] = useState(false);

  // Form State that is shared across steps
  const [travelers, setTravelers] = useState<Travelers>({ adults: 1, children: [] });
  const [startLocation, setStartLocation] = useState<string>('São Paulo, Brasil');
  const [startLocationCoords, setStartLocationCoords] = useState<{lat: number, lon: number} | null>(null);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocationStatusMessage('Buscando sua localização...');
    if (!navigator.geolocation) {
        setLocationStatusMessage('Geolocalização não é suportada neste navegador.');
        return;
    }

    const successCallback = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setStartLocationCoords({ lat: latitude, lon: longitude });
        setLocationStatusMessage('Identificando cidade...');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            if (!response.ok) throw new Error(`Nominatim API failed`);
            const data = await response.json();
            const address = data.address;
            const city = address.city || address.town || address.village;
            const country = address.country;
            if (city && country) {
                const locationName = `${city}, ${country}`;
                setStartLocation(locationName);
                setLocationStatusMessage(`Localização encontrada: ${locationName}`);
            } else {
                setStartLocation(`${latitude}, ${longitude}`);
                setLocationStatusMessage('Não foi possível identificar a cidade. Usando coordenadas.');
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            setStartLocation(`${latitude}, ${longitude}`);
            setLocationStatusMessage('Erro ao buscar nome da cidade. Usando coordenadas.');
        } finally {
            setTimeout(() => setLocationStatusMessage(null), 4000);
        }
    };

    const errorCallback = (error: GeolocationPositionError) => {
        console.error("Geolocation error:", error.message);
        setLocationStatusMessage('Não foi possível obter sua localização. Por favor, digite manualmente.');
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }, []);

  const handleStartLocationChange = (newLocation: string) => {
    setStartLocation(newLocation);
    // Optionally clear coordinates if user types manually
    if (newLocation !== `${startLocationCoords?.lat}, ${startLocationCoords?.lon}`) {
      setStartLocationCoords(null);
    }
  }

  const renderContent = () => {
    switch (step) {
      case 'travelers':
        return (
          <TravelersStep
            travelers={travelers}
            onTravelersChange={setTravelers}
            onNext={() => setStep('choice')}
          />
        );
      case 'choice':
        return (
          <ChoiceStep
            startLocation={startLocation}
            onStartLocationChange={handleStartLocationChange}
            locationStatusMessage={locationStatusMessage}
            onBack={() => setStep('travelers')}
            onSurpriseMe={() => handleSurpriseMe(travelers, startLocation, startLocationCoords ?? undefined)}
            onBuildWizard={() => setShowBuildWizard(true)}
            onDefineItinerary={() => setStep('form')}
          />
        );
      case 'form':
        return (
          <ItineraryFormStep
            startLocation={startLocation}
            onStartLocationChange={handleStartLocationChange}
            onBack={() => setStep('choice')}
            onSearch={(criteria) => handleSearch({ ...criteria, travelers, startLocationCoords: startLocationCoords ?? undefined })}
            isLoading={isLoading}
          />
        );
      default:
        return <TravelersStep travelers={travelers} onTravelersChange={setTravelers} onNext={() => setStep('choice')} />;
    }
  }

  return (
    <>
      {renderContent()}
      {showBuildWizard && (
        <BuildTripWizard
          onSearch={(criteria) => handleSearch({ ...criteria, travelers })}
          onClose={() => setShowBuildWizard(false)}
          startLocation={startLocation}
        />
      )}
    </>
  );
};

export default SearchForm;
