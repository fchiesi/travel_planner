import React, { useState } from 'react';
import { SearchCriteria } from '../types.ts';
import { getGeoSuggestions, getAttractionSuggestions } from '../services/geminiService.ts';
import RoadTripWallpaper from './wallpapers/RoadTripWallpaper.tsx';
import BusTripWallpaper from './wallpapers/BusTripWallpaper.tsx';
import AeroTripWallpaper from './wallpapers/AeroTripWallpaper.tsx';
import { GripVerticalIcon } from './icons/GripVerticalIcon.tsx';

interface BuildTripWizardProps {
  onSearch: (criteria: Omit<SearchCriteria, 'travelers'>) => void;
  onClose: () => void;
  startLocation: string;
}

type TransportMode = 'Road Trip' | 'Bus Trip' | 'Aero Trip';
type Step = 
    | 'transport'
    // Road/Bus
    | 'region' 
    | 'cities'
    // Aero
    | 'continent'
    | 'country'
    | 'countryRegion'
    | 'finalCities'
    // Finalization
    | 'attractions';

const brazilianRegions = ['Sul', 'Sudeste', 'Centro-Oeste', 'Norte', 'Nordeste'];

const BuildTripWizard: React.FC<BuildTripWizardProps> = ({ onSearch, onClose, startLocation }) => {
  const [step, setStep] = useState<Step>('transport');
  const [transport, setTransport] = useState<TransportMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for selections
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryRegion, setSelectedCountryRegion] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityCount, setCityCount] = useState(10);
  const [attractionSuggestions, setAttractionSuggestions] = useState<string[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [draggedCity, setDraggedCity] = useState<string | null>(null);
  
  const resetSelections = () => {
    setSuggestions([]);
    setSelectedRegion('');
    setSelectedContinent('');
    setSelectedCountry('');
    setSelectedCountryRegion('');
    setSelectedCities([]);
    setAttractionSuggestions([]);
    setSelectedAttractions([]);
  };

  const handleSelectTransport = (mode: TransportMode) => {
    setTransport(mode);
    if (mode === 'Aero Trip') {
      setStep('continent');
      fetchGeoData({ type: 'CONTINENTS' });
    } else {
      setStep('region');
    }
  };
  
  const fetchGeoData = async (request: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getGeoSuggestions(request);
      setSuggestions(results);
      if (request.type === 'CITIES_IN_BRAZIL_REGION' || request.type === 'CITIES_IN_COUNTRY_REGION') {
          setCityCount(results.length < 10 ? results.length : 10);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    setStep('cities');
    fetchGeoData({ type: 'CITIES_IN_BRAZIL_REGION', region });
  };
  
  const handleSelectContinent = (continent: string) => {
    setSelectedContinent(continent);
    setStep('country');
    fetchGeoData({ type: 'COUNTRIES_IN_CONTINENT', continent });
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setStep('countryRegion');
    fetchGeoData({ type: 'REGIONS_IN_COUNTRY', country });
  };
  
  const handleSelectCountryRegion = (region: string) => {
    setSelectedCountryRegion(region);
    setStep('finalCities');
    fetchGeoData({ type: 'CITIES_IN_COUNTRY_REGION', country: selectedCountry, region });
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };
  
  const handleAttractionToggle = (attraction: string) => {
    setSelectedAttractions(prev =>
      prev.includes(attraction) ? prev.filter(a => a !== attraction) : [...prev, attraction]
    );
  };
  
  const handleNextToAttractions = async () => {
    if (selectedCities.length === 0) {
        setError("Por favor, selecione pelo menos uma cidade de destino.");
        return;
    }
    setStep('attractions');
    setIsLoading(true);
    setError(null);
    try {
        const results = await getAttractionSuggestions(selectedCities);
        setAttractionSuggestions(results);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido ao buscar atrações.');
        setAttractionSuggestions([]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateTrips = () => {
    const criteria: Omit<SearchCriteria, 'travelers'> = {
      startLocation,
      destination: selectedCities.length === 1 ? selectedCities[0] : '',
      multipleDestinations: selectedCities.join(', '),
      destinationsOrder: selectedCities,
      budget: '',
      startDate: '',
      endDate: '',
      preferredTransport: transport as string,
      selectedAttractions: selectedAttractions,
    };
    onSearch(criteria);
    onClose();
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, city: string) => {
    setDraggedCity(city);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetCity: string) => {
      e.preventDefault();
      if (!draggedCity || draggedCity === targetCity) return;

      const currentIndex = selectedCities.indexOf(draggedCity);
      const targetIndex = selectedCities.indexOf(targetCity);

      const newSelectedCities = [...selectedCities];
      const [removed] = newSelectedCities.splice(currentIndex, 1);
      newSelectedCities.splice(targetIndex, 0, removed);
      
      setSelectedCities(newSelectedCities);
      setDraggedCity(null);
  };

  const handleDragEnd = () => {
      setDraggedCity(null);
  };

  const goBack = () => {
    setError(null);
    switch(step) {
        case 'region':
        case 'continent':
            setStep('transport');
            resetSelections();
            break;
        case 'cities':
            setStep('region');
            setSelectedCities([]);
            break;
        case 'country':
            setStep('continent');
            setSelectedContinent('');
            break;
        case 'countryRegion':
            setStep('country');
            setSelectedCountry('');
            break;
        case 'finalCities':
            setStep('countryRegion');
            setSelectedCountryRegion('');
            setSelectedCities([]);
            break;
        case 'attractions':
            if(transport === 'Aero Trip') setStep('finalCities');
            else setStep('cities');
            setSelectedAttractions([]);
            setAttractionSuggestions([]);
            break;
    }
  };

  const getStepTitle = () => {
      switch(step) {
          case 'transport': return '1. Escolha o modo da viagem';
          case 'region': return '2. Para qual região do Brasil?';
          case 'cities': return `3. Cidades em ${selectedRegion}`;
          case 'continent': return '2. Escolha o continente';
          case 'country': return `3. Países em ${selectedContinent}`;
          case 'countryRegion': return `4. Regiões em ${selectedCountry}`;
          case 'finalCities': return `5. Cidades em ${selectedCountryRegion}`;
          case 'attractions': return `6. Selecione as atrações`;
          default: return 'Construa sua Viagem';
      }
  }

  const renderContent = () => {
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Buscando sugestões...</p>
            </div>
        );
    }
    
    if (step === 'transport') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <button onClick={() => handleSelectTransport('Road Trip')} className="relative overflow-hidden rounded-lg group text-white font-bold text-2xl h-64 md:h-full flex items-end p-4 bg-black">
              <RoadTripWallpaper />
          </button>
           <button onClick={() => handleSelectTransport('Bus Trip')} className="relative overflow-hidden rounded-lg group text-white font-bold text-2xl h-64 md:h-full flex items-end p-4 bg-black">
              <BusTripWallpaper />
          </button>
           <button onClick={() => handleSelectTransport('Aero Trip')} className="relative overflow-hidden rounded-lg group text-white font-bold text-2xl h-64 md:h-full flex items-end p-4 bg-black">
              <AeroTripWallpaper />
          </button>
        </div>
      );
    }
    
    const isCityStep = step === 'cities' || step === 'finalCities';

    if (isCityStep) {
        return (
             <div className="flex flex-col md:flex-row gap-8 h-full">
                {/* Left side: City selection */}
                <div className="md:w-3/5 flex flex-col h-full">
                     <p className="text-gray-600 mb-4">Selecione uma ou mais cidades para o seu roteiro.</p>
                     {suggestions.length > 5 && (
                        <div className="mb-4">
                            <label htmlFor="city-count-slider" className="block text-sm font-medium text-gray-700">
                                Mostrar <span className="font-bold text-indigo-600">{cityCount}</span> de {suggestions.length} cidades
                            </label>
                            <input id="city-count-slider" type="range" min="5" max={suggestions.length} step="1" value={cityCount} onChange={e => setCityCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 flex-grow">
                        {(suggestions.slice(0, cityCount)).map(item => (
                            <label key={item} className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-colors flex items-center justify-center ${selectedCities.includes(item) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-gray-300 hover:border-indigo-400'}`}>
                                <input type="checkbox" checked={selectedCities.includes(item)} onChange={() => handleCityToggle(item)} className="sr-only" />
                                <span className="text-sm font-semibold">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Right side: Selected cities & ordering */}
                <div className="md:w-2/5 bg-gray-50 p-4 rounded-lg border flex flex-col min-h-[200px] md:min-h-0">
                    <h4 className="font-bold text-lg text-gray-800 mb-3 flex justify-between items-center">
                        <span>Sua Rota</span>
                        <span className="text-sm font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{selectedCities.length} {selectedCities.length === 1 ? 'cidade' : 'cidades'}</span>
                    </h4>
                    {selectedCities.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                            <p>Selecione as cidades à esquerda para montar seu roteiro.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500 mb-2">Arraste para reordenar as paradas.</p>
                            <ul className="space-y-2 overflow-y-auto pr-1">
                                {selectedCities.map((city, index) => (
                                    <li
                                        key={city}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, city)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, city)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-move transition-all group ${draggedCity === city ? 'bg-indigo-200 opacity-50' : 'bg-white shadow-sm'}`}
                                    >
                                        <div className="flex items-center">
                                            <GripVerticalIcon className="w-5 h-5 text-gray-400 mr-2 group-hover:text-indigo-500" />
                                            <span className="font-medium text-gray-700">{index + 1}. {city}</span>
                                        </div>
                                        <button onClick={() => handleCityToggle(city)} className="text-gray-400 hover:text-red-600 font-bold text-lg leading-none p-1">&times;</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        )
    }

    if (step === 'attractions') {
        return (
             <div className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">Selecione as atrações que mais lhe interessam para personalizar seu roteiro. (Opcional)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-2 flex-grow">
                    {attractionSuggestions.map(item => (
                        <label key={item} className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-colors flex items-center justify-center ${selectedAttractions.includes(item) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-gray-300 hover:border-indigo-400'}`}>
                            <input type="checkbox" checked={selectedAttractions.includes(item)} onChange={() => handleAttractionToggle(item)} className="sr-only" />
                            <span className="text-sm font-semibold">{item}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }
    
    // Default for region, continent, country, countryRegion
    const itemsToShow = step === 'region' ? brazilianRegions : suggestions;
    const clickHandler = (item: string) => {
        if (step === 'region') handleSelectRegion(item);
        else if (step === 'continent') handleSelectContinent(item);
        else if (step === 'country') handleSelectCountry(item);
        else if (step === 'countryRegion') handleSelectCountryRegion(item);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-2 flex-grow">
            {itemsToShow.map(item => (
                <button 
                    key={item} 
                    onClick={() => clickHandler(item)} 
                    className="p-3 border-2 rounded-lg cursor-pointer text-center transition-colors flex items-center justify-center bg-white border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                     <span className="w-full h-full text-sm font-semibold flex items-center justify-center">{item}</span>
                </button>
            ))}
        </div>
    );
  };

  const renderFooter = () => {
    if (step === 'transport' || isLoading) return null;

    const isCityStep = step === 'cities' || step === 'finalCities';
    const isAttractionsStep = step === 'attractions';

    return (
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-between items-center gap-4 flex-shrink-0">
            <button onClick={goBack} disabled={isLoading} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Voltar
            </button>
            {isCityStep && (
                <button onClick={handleNextToAttractions} disabled={isLoading || selectedCities.length === 0} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continuar
                </button>
            )}
            {isAttractionsStep && (
                <button onClick={handleGenerateTrips} disabled={isLoading} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Gerar Roteiros
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold font-poppins text-gray-800">{getStepTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow min-h-0">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
          {renderContent()}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
};

export default BuildTripWizard;