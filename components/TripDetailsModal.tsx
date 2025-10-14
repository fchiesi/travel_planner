import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TripPlan, ItineraryDay, AccommodationSuggestion, RestaurantSuggestion, OvernightStop } from '../types.ts';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableView } from './PrintableView.tsx';
import { TabButton } from './modal/TabButton.tsx';
import { findCheapestAccommodation, getTotalTravelers } from '../utils/tripUtils.ts';
import { ItineraryTab } from './modal/tabs/ItineraryTab.tsx';
import { AccommodationTab } from './modal/tabs/AccommodationTab.tsx';
import { TransportTab } from './modal/tabs/TransportTab.tsx';
import { TipsTab } from './modal/tabs/TipsTab.tsx';
import { StarIcon } from './icons/StarIcon.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { checkHotelAvailability } from '../services/availabilityService.ts';


interface TripDetailsModalProps {
  trip: TripPlan;
  onClose: () => void;
  onEdit: (trip: TripPlan) => void;
}

type Tab = 'itinerary' | 'accommodation' | 'transport' | 'tips';

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ trip, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isTripFavorite = isFavorite(trip.id);

  // State for selections
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationSuggestion | null>(() => findCheapestAccommodation(trip.accommodationOptions));
  const [selectedOutboundStop, setSelectedOutboundStop] = useState<OvernightStop | null>(trip.transportationDetails.potentialOutboundStops?.[0] || null);
  const [selectedOutboundAccommodation, setSelectedOutboundAccommodation] = useState<AccommodationSuggestion | null>(null);
  const [selectedReturnStop, setSelectedReturnStop] = useState<OvernightStop | null>(trip.transportationDetails.potentialReturnStops?.[0] || null);
  const [selectedReturnAccommodation, setSelectedReturnAccommodation] = useState<AccommodationSuggestion | null>(null);

  // State for availability check
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [availableHotels, setAvailableHotels] = useState<Set<string>>(new Set());

  // Set initial cheapest accommodation for stops
  useEffect(() => {
    setSelectedOutboundAccommodation(findCheapestAccommodation(selectedOutboundStop?.accommodationOptions));
  }, [selectedOutboundStop]);

  useEffect(() => {
    setSelectedReturnAccommodation(findCheapestAccommodation(selectedReturnStop?.accommodationOptions));
  }, [selectedReturnStop]);

  // useEffect for availability check
  useEffect(() => {
    // Run check when the modal is opened for a new trip
    if (trip && trip.accommodationOptions.suggestions.length > 0) {
      const checkAvailability = async () => {
        setIsCheckingAvailability(true);
        setAvailableHotels(new Set()); // Reset on new trip
        try {
          const availableNames = await checkHotelAvailability(trip.accommodationOptions.suggestions, trip);
          setAvailableHotels(new Set(availableNames));
        } catch (error) {
          console.error("Failed to check hotel availability:", error);
          const allNames = trip.accommodationOptions.suggestions.map(h => h.name);
          setAvailableHotels(new Set(allNames)); // Fallback
        } finally {
          setIsCheckingAvailability(false);
        }
      };
      checkAvailability();
    } else {
       setIsCheckingAvailability(false);
    }
  }, [trip]);

  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const totalTravelers = getTotalTravelers(trip.travelers);

  const totalCost = useMemo(() => {
    const mainAccommodationCost = selectedAccommodation?.totalStayPrice || 0;
    const stopoverAccommodationCost = selectedOutboundAccommodation?.totalStayPrice || 0;
    const returnStopoverAccommodationCost = selectedReturnAccommodation?.totalStayPrice || 0;
    return trip.baseCost + mainAccommodationCost + stopoverAccommodationCost + returnStopoverAccommodationCost;
  }, [trip.baseCost, selectedAccommodation, selectedOutboundAccommodation, selectedReturnAccommodation]);

  const displayItinerary = useMemo((): ItineraryDay[] => {
    const newItinerary: ItineraryDay[] = [];
    let dayCounter = 1;

    // Outbound stopover
    if (selectedOutboundStop) {
        newItinerary.push({
            day: dayCounter++,
            title: `Chegada e pernoite em ${selectedOutboundStop.name}`,
            location: selectedOutboundStop.name,
            estimatedDayCost: selectedOutboundStop.activities.reduce((acc, act) => acc + act.estimatedCost, 0) + (selectedOutboundAccommodation?.totalStayPrice || 0),
            activities: selectedOutboundStop.activities,
            foodSuggestions: [],
        });
    }

    // Main itinerary
    trip.itinerary.forEach(day => {
        newItinerary.push({ ...day, day: dayCounter++ });
    });
    
    // Return stopover
    if (selectedReturnStop) {
        newItinerary.push({
            day: dayCounter++,
            title: `Retorno com pernoite em ${selectedReturnStop.name}`,
            location: selectedReturnStop.name,
            estimatedDayCost: selectedReturnStop.activities.reduce((acc, act) => acc + act.estimatedCost, 0) + (selectedReturnAccommodation?.totalStayPrice || 0),
            activities: selectedReturnStop.activities,
            foodSuggestions: [],
        });
    }

    return newItinerary;
  }, [trip.itinerary, selectedOutboundStop, selectedReturnStop, selectedOutboundAccommodation, selectedReturnAccommodation]);


  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    setIsDownloadingPdf(true);

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const imgHeight = pdfWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(data, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(data, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`roteiro-${trip.destinationName.replace(/\s/g, '_')}.pdf`);
    setIsDownloadingPdf(false);
  };
  
    const handleFavoriteClick = () => {
      if (isTripFavorite) {
          removeFavorite(trip.id);
      } else {
          addFavorite(trip);
      }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return <ItineraryTab itinerary={displayItinerary} formatter={formatter} />;
      case 'accommodation':
        return <AccommodationTab 
          trip={trip} 
          selectedAccommodation={selectedAccommodation} 
          onSelectAccommodation={setSelectedAccommodation} 
          isCheckingAvailability={isCheckingAvailability}
          availableHotels={availableHotels}
        />;
      case 'transport':
        return <TransportTab 
            trip={trip} 
            formatter={formatter}
            selectedOutboundStop={selectedOutboundStop}
            onSelectOutboundStop={setSelectedOutboundStop}
            selectedOutboundAccommodation={selectedOutboundAccommodation}
            onSelectOutboundAccommodation={setSelectedOutboundAccommodation}
            selectedReturnStop={selectedReturnStop}
            onSelectReturnStop={setSelectedReturnStop}
            selectedReturnAccommodation={selectedReturnAccommodation}
            onSelectReturnAccommodation={setSelectedReturnAccommodation}
        />;
      case 'tips':
        return <TipsTab trip={trip} formatter={formatter} />;
      default:
        return null;
    }
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start rounded-t-2xl">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 font-poppins">{trip.destinationName}</h2>
                    <p className="text-gray-600">{trip.destinationCountry}</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button onClick={handleFavoriteClick} className={`rounded-full p-2 transition ${isTripFavorite ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} title={isTripFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}>
                        <StarIcon filled={isTripFavorite} className="w-6 h-6" />
                    </button>
                    <button onClick={() => onEdit(trip)} className="bg-gray-100 text-gray-700 rounded-full p-2 hover:bg-gray-200 transition" title="Editar Roteiro">
                        <CogIcon className="w-6 h-6" />
                    </button>
                    <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="bg-gray-100 text-gray-700 rounded-full p-2 hover:bg-gray-200 transition disabled:opacity-50" title="Baixar PDF">
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                    <button onClick={onClose} className="bg-gray-100 text-gray-700 rounded-full p-2 hover:bg-gray-200 transition" title="Fechar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
          
          <div className="p-6 border-b border-gray-200">
              <div>
                  <p className="text-sm text-gray-600">Custo Total da Viagem 
                      <span className="font-semibold"> (para {totalTravelers} pessoa{totalTravelers > 1 ? 's' : ''})</span>
                  </p>
                  <p className="text-3xl font-bold text-teal-600">{formatter.format(totalCost)}</p>
              </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
              <TabButton label="Itinerário" isActive={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} />
              <TabButton label="Hospedagem" isActive={activeTab === 'accommodation'} onClick={() => setActiveTab('accommodation')} />
              <TabButton label="Transporte" isActive={activeTab === 'transport'} onClick={() => setActiveTab('transport')} />
              <TabButton label="Dicas" isActive={activeTab === 'tips'} onClick={() => setActiveTab('tips')} />
            </div>
          </div>

          <div className="px-6 pb-6 overflow-y-auto flex-grow">
            {renderContent()}
          </div>
        </div>
      </div>
       {/* Hidden printable view */}
      <div className="absolute left-[-9999px] top-0">
          <div ref={printRef}>
              <PrintableView 
                trip={trip}
                selectedAccommodation={selectedAccommodation}
                selectedOutboundStop={selectedOutboundStop}
                selectedOutboundAccommodation={selectedOutboundAccommodation}
                selectedReturnStop={selectedReturnStop}
                selectedReturnAccommodation={selectedReturnAccommodation}
              />
          </div>
      </div>
    </>
  );
};

export default TripDetailsModal;
