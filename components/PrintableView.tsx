
import React from 'react';
import { TripPlan, AccommodationSuggestion, OvernightStop, ItineraryDay, ItineraryActivity, RestaurantSuggestion } from '../types.ts';
import { QRCodeCanvas } from 'qrcode.react';
import { generateGoogleMapsRouteUrl, generateGoogleMapsSearchUrl } from '../services/bookingService.ts';

interface PrintableViewProps {
    trip: TripPlan;
    selectedAccommodation: AccommodationSuggestion | null;
    selectedOutboundStop: OvernightStop | null;
    selectedOutboundAccommodation: AccommodationSuggestion | null;
    selectedReturnStop: OvernightStop | null;
    selectedReturnAccommodation: AccommodationSuggestion | null;
}

const QRSection: React.FC<{ title: string; url: string }> = ({ title, url }) => (
    <div className="text-center">
        <QRCodeCanvas value={url} size={100} />
        <p className="text-xs font-semibold mt-2">{title}</p>
    </div>
);

export const PrintableView: React.FC<PrintableViewProps> = ({ 
    trip, 
    selectedAccommodation,
    selectedOutboundStop,
    selectedOutboundAccommodation,
    selectedReturnStop,
    selectedReturnAccommodation
}) => {
    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    
    let travelersSummary = `${trip.travelers.adults} adulto(s)`;
    if (trip.travelers.children.length > 0) {
        travelersSummary += `, ${trip.travelers.children.length} menor(es) (idades: ${trip.travelers.children.join(', ')})`;
    }

    const displayItinerary = React.useMemo((): ItineraryDay[] => {
        const newItinerary: ItineraryDay[] = [];
        let dayCounter = 1;
        if (selectedOutboundStop) {
            newItinerary.push({
                day: dayCounter++,
                title: `Chegada e pernoite em ${selectedOutboundStop.name}`,
                location: selectedOutboundStop.name,
                estimatedDayCost: selectedOutboundStop.activities.reduce((acc, act) => acc + act.estimatedCost, 0),
                activities: selectedOutboundStop.activities,
                foodSuggestions: [],
            });
        }
        trip.itinerary.forEach(day => newItinerary.push({ ...day, day: dayCounter++ }));
        if (selectedReturnStop) {
             newItinerary.push({
                day: dayCounter++,
                title: `Retorno com pernoite em ${selectedReturnStop.name}`,
                location: selectedReturnStop.name,
                estimatedDayCost: selectedReturnStop.activities.reduce((acc, act) => acc + act.estimatedCost, 0),
                activities: selectedReturnStop.activities,
                foodSuggestions: [],
            });
        }
        return newItinerary;
    }, [trip.itinerary, selectedOutboundStop, selectedReturnStop]);

    const routeWaypoints = [selectedOutboundStop?.name, selectedReturnStop?.name].filter(Boolean) as string[];
    const routeUrl = generateGoogleMapsRouteUrl({ name: trip.startLocation, coords: trip.startLocationCoords }, trip.destinationName, routeWaypoints);

    return (
        <div className="p-8 bg-white text-black font-sans w-[800px]">
            <header className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-4xl font-bold font-poppins text-teal-700">{trip.destinationName}</h1>
                <p className="text-lg">{trip.startDate} a {trip.endDate} ({travelersSummary})</p>
            </header>

            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-3">Resumo da Viagem</h2>
                <div className="flex justify-around items-center bg-gray-100 p-4 rounded-lg">
                    <QRSection title={`Rota para ${trip.destinationName}`} url={routeUrl} />
                    {selectedAccommodation && <QRSection title={`Hospedagem: ${selectedAccommodation.name}`} url={generateGoogleMapsSearchUrl(`${selectedAccommodation.name}, ${selectedAccommodation.city}`)} />}
                    {selectedOutboundAccommodation && <QRSection title={`Pernoite Ida: ${selectedOutboundAccommodation.name}`} url={generateGoogleMapsSearchUrl(`${selectedOutboundAccommodation.name}, ${selectedOutboundAccommodation.city}`)} />}
                    {selectedReturnAccommodation && <QRSection title={`Pernoite Volta: ${selectedReturnAccommodation.name}`} url={generateGoogleMapsSearchUrl(`${selectedReturnAccommodation.name}, ${selectedReturnAccommodation.city}`)} />}
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-3">Itinerário Detalhado</h2>
                <div className="space-y-4">
                    {displayItinerary.map(day => (
                        <div key={day.day} className="p-3 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-lg text-teal-700">{`Dia ${day.day}: ${day.title}`}</h3>
                            <ul className="list-disc list-inside text-sm mt-1">
                                {day.activities.map((activity, i) => <li key={i}>{activity.description}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-3">Sugestões de Restaurantes</h2>
                 <div className="space-y-3">
                  {trip.restaurantSuggestions.map((resto, i) => (
                    <div key={i} className="pl-3 border-l-2 border-orange-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold">{resto.name} ({resto.cuisine})</p>
                                <p className="text-sm">{resto.description} - Custo médio: {formatter.format(resto.averageGroupCost)}</p>
                            </div>
                            <div className="ml-4">
                                <QRCodeCanvas value={generateGoogleMapsSearchUrl(`${resto.name}, ${trip.destinationName}`)} size={40} />
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
            </section>
        </div>
    );
};