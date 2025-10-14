
import React, { useState } from 'react';
import { TripPlan, RestaurantSuggestion } from '../../../types.ts';
import { getMoreRestaurants } from '../../../services/geminiService.ts';
import { generateGoogleMapsSearchUrl } from '../../../services/bookingService.ts';
import { ShareIcon } from '../../icons/ShareIcon.tsx';

interface TipsTabProps {
    trip: TripPlan;
    formatter: Intl.NumberFormat;
}

export const TipsTab: React.FC<TipsTabProps> = ({ trip, formatter }) => {
    const [restaurantList, setRestaurantList] = useState<RestaurantSuggestion[]>(trip.restaurantSuggestions);
    const [isLoadingMoreRestaurants, setIsLoadingMoreRestaurants] = useState(false);

    const handleLoadMoreRestaurants = async () => {
        setIsLoadingMoreRestaurants(true);
        try {
            const moreRestaurants = await getMoreRestaurants(trip.destinationName, trip.travelers);
            setRestaurantList(prev => [...prev, ...moreRestaurants]);
        } catch (error) {
            console.error(error);
            alert("Não foi possível carregar mais restaurantes.");
        } finally {
            setIsLoadingMoreRestaurants(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold text-lg text-orange-700">Sugestões de Restaurantes</h4>
                <div className="space-y-3 mt-2">
                  {restaurantList.map((resto, i) => (
                    <div key={i} className="pl-2 border-l-2 border-orange-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{resto.name} <span className="text-sm font-normal text-gray-600">- {resto.cuisine}</span></p>
                          <p className="text-sm text-gray-600">{resto.description} - <span className="font-medium text-orange-800">Custo médio p/ grupo: {formatter.format(resto.averageGroupCost)}</span></p>
                        </div>
                         <a href={generateGoogleMapsSearchUrl(`${resto.name}, ${trip.destinationName}`)} target="_blank" rel="noopener noreferrer" className="no-print flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline">
                            <ShareIcon className="w-3 h-3" />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                    <button onClick={handleLoadMoreRestaurants} disabled={isLoadingMoreRestaurants} className="no-print px-4 py-2 bg-orange-200 text-orange-800 font-semibold rounded-lg hover:bg-orange-300 disabled:opacity-50 transition-colors text-sm">
                        {isLoadingMoreRestaurants ? 'Buscando...' : 'Buscar mais restaurantes'}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-lg text-blue-700">Dicas do Destino</h4>
              <ul className="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                {trip.destinationTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>

             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-lg text-green-700">Dicas de Compras</h4>
              <ul className="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                {trip.shoppingTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
        </div>
    );
};