
import React from 'react';
import { TripPlan, OvernightStop, AccommodationSuggestion } from '../../../types.ts';
import {
    generateBusBookingUrl,
    generateCarRentalBookingUrl,
    generateGoogleMapsRouteUrl,
    generateFlightBookingUrl,
} from '../../../services/bookingService.ts';
import { BookingIcon } from '../../icons/BookingIcon.tsx';
import { ShareIcon } from '../../icons/ShareIcon.tsx';
import { StopoverCitySelector } from './StopoverCitySelector.tsx';
import { AccommodationOptionCard } from '../../AccommodationOptionCard.tsx';

interface TransportTabProps {
    trip: TripPlan;
    formatter: Intl.NumberFormat;
    selectedOutboundStop: OvernightStop | null;
    onSelectOutboundStop: (stop: OvernightStop | null) => void;
    selectedOutboundAccommodation: AccommodationSuggestion | null;
    onSelectOutboundAccommodation: (accommodation: AccommodationSuggestion) => void;
    selectedReturnStop: OvernightStop | null;
    onSelectReturnStop: (stop: OvernightStop | null) => void;
    selectedReturnAccommodation: AccommodationSuggestion | null;
    onSelectReturnAccommodation: (accommodation: AccommodationSuggestion) => void;
}

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const TransportTab: React.FC<TransportTabProps> = ({
    trip,
    formatter,
    selectedOutboundStop,
    onSelectOutboundStop,
    selectedOutboundAccommodation,
    onSelectOutboundAccommodation,
    selectedReturnStop,
    onSelectReturnStop,
    selectedReturnAccommodation,
    onSelectReturnAccommodation
}) => {
    const { mode, priceSource, totalDistanceKm, breakdown, tollPlazaBreakdown } = trip.transportationDetails;
    const routeWaypoints = [selectedOutboundStop?.name, selectedReturnStop?.name].filter(Boolean) as string[];
    const routeUrl = generateGoogleMapsRouteUrl({ name: trip.startLocation, coords: trip.startLocationCoords }, trip.destinationName, routeWaypoints);
    
    const flightUrl = mode.includes('Avião') ? generateFlightBookingUrl(trip) : null;
    const busUrl = mode.includes('Ônibus') ? generateBusBookingUrl(trip) : null;
    const carRentalUrl = mode.includes('Alugado') ? generateCarRentalBookingUrl(trip) : null;

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-lg text-teal-700">Meio de Transporte: {trip.transportationDetails.mode}</h4>
                            {trip.transportationDetails.suggestedDepartureTime && <p className="text-sm text-gray-600">Horário de saída sugerido: <span className="font-semibold">{trip.transportationDetails.suggestedDepartureTime}</span></p>}
                             {totalDistanceKm && <p className="text-sm text-gray-600">Distância estimada (ida e volta): <span className="font-semibold">{totalDistanceKm.toFixed(0)} km</span></p>}
                        </div>
                        <a href={routeUrl} target="_blank" rel="noopener noreferrer" className="no-print flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full hover:bg-blue-200 transition-colors">
                            <ShareIcon className="w-4 h-4" />
                            <span>Ver Rota</span>
                        </a>
                    </div>
                    <p className="font-semibold text-gray-800 mt-2">Custo Total: {formatter.format(trip.transportationDetails.totalCost)}</p>
                    
                    {breakdown && breakdown.length > 0 ? (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                            {breakdown.map((item, index) => (
                                <p key={index}><span className="font-medium">{item.label}:</span> {item.value}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 mt-1">{trip.transportationDetails.details}</p>
                    )}


                    {trip.transportationDetails.mode.includes('Avião') && trip.startDate && trip.endDate && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                            *Valor referente ao período de <span className="font-medium">{formatDate(trip.startDate)}</span> a <span className="font-medium">{formatDate(trip.endDate)}</span>.
                        </p>
                    )}
                    {trip.transportationDetails.priceSource && (
                        <p className="text-sm text-gray-500 mt-1">Fonte do preço: <span className="font-semibold text-gray-700">{trip.transportationDetails.priceSource}</span></p>
                    )}
                </div>

                 {tollPlazaBreakdown && tollPlazaBreakdown.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-800 mb-2">Detalhamento dos Pedágios:</h5>
                        <div className="max-h-40 overflow-y-auto bg-gray-100 p-3 rounded-md border">
                            <ul className="space-y-1 text-sm text-gray-700">
                                {tollPlazaBreakdown.map((toll, index) => (
                                    <li key={index} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                        <span>{toll.name}</span>
                                        <span className="font-medium">{formatter.format(toll.cost)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}


                <div className="pt-4 border-t border-gray-200">
                     {mode.includes('Avião') && flightUrl && priceSource && (
                        <div className="flex flex-wrap items-center gap-4">
                            <a href={flightUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors no-print">
                                <BookingIcon className="w-5 h-5" />
                                Ver oferta no {priceSource}
                            </a>
                        </div>
                    )}
                    {busUrl && (
                         <a href={busUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors no-print">
                            <BookingIcon className="w-5 h-5" />
                            <span>Reservar no Buson</span>
                        </a>
                    )}
                     {carRentalUrl && (
                         <a href={carRentalUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors no-print">
                            <BookingIcon className="w-5 h-5" />
                            <span>Alugar na Rentcars</span>
                        </a>
                    )}
                </div>
            </div>

            {trip.transportationDetails.potentialOutboundStops && trip.transportationDetails.potentialOutboundStops.length > 0 && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
                    <StopoverCitySelector 
                        stops={trip.transportationDetails.potentialOutboundStops}
                        selectedStop={selectedOutboundStop}
                        onSelect={onSelectOutboundStop}
                        title="Escolha uma cidade para parada (IDA)"
                        colorClass="text-indigo-700"
                    />
                     {selectedOutboundStop && (
                         <div className="pt-4 border-t border-indigo-200">
                            <h5 className="font-semibold text-lg text-indigo-700 mb-4">Escolha sua hospedagem em {selectedOutboundStop.name}:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(selectedOutboundStop.accommodationOptions.suggestions || []).map((option, i) => (
                                  <AccommodationOptionCard
                                      key={i}
                                      option={option}
                                      isSelected={selectedOutboundAccommodation?.name === option.name}
                                      onSelect={() => onSelectOutboundAccommodation(option)}
                                      trip={trip}
                                      // FIX: Pass availability props. Assuming stopover accommodations are always available as there's no check logic for them.
                                      isCheckingAvailability={false}
                                      isAvailable={true}
                                  />
                              ))}
                            </div>
                        </div>
                     )}
                </div>
            )}
            
            {trip.transportationDetails.potentialReturnStops && trip.transportationDetails.potentialReturnStops.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
                     <StopoverCitySelector 
                        stops={trip.transportationDetails.potentialReturnStops}
                        selectedStop={selectedReturnStop}
                        onSelect={onSelectReturnStop}
                        title="Escolha uma cidade para parada (VOLTA)"
                        colorClass="text-purple-700"
                    />
                     {selectedReturnStop && (
                         <div className="pt-4 border-t border-purple-200">
                            <h5 className="font-semibold text-lg text-purple-700 mb-4">Escolha sua hospedagem em {selectedReturnStop.name}:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {(selectedReturnStop.accommodationOptions.suggestions || []).map((option, i) => (
                                   <AccommodationOptionCard
                                       key={i}
                                       option={option}
                                       isSelected={selectedReturnAccommodation?.name === option.name}
                                       onSelect={() => onSelectReturnAccommodation(option)}
                                       trip={trip}
                                       // FIX: Pass availability props. Assuming stopover accommodations are always available as there's no check logic for them.
                                       isCheckingAvailability={false}
                                       isAvailable={true}
                                   />
                               ))}
                            </div>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};
