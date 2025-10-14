import React, { memo } from 'react';
import { AccommodationSuggestion, TripPlan } from '../types.ts';
import { LocationIcon } from './icons/LocationIcon.tsx';
import { BreakfastIcon } from './icons/BreakfastIcon.tsx';
import { PoolIcon } from './icons/PoolIcon.tsx';
import { KitchenIcon } from './icons/KitchenIcon.tsx';
import { ShareIcon } from './icons/ShareIcon.tsx';
import { BookingIcon } from './icons/BookingIcon.tsx';
import { generateHotelBookingUrl, generateGoogleMapsSearchUrl } from '../services/bookingService.ts';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';

interface AccommodationOptionCardProps {
    option: AccommodationSuggestion;
    isSelected: boolean;
    onSelect: () => void;
    trip: TripPlan;
    isCheckingAvailability: boolean;
    isAvailable: boolean;
}

const AmenityIcon: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
        {icon}
        <span>{text}</span>
    </div>
);

const AccommodationOptionCardComponent: React.FC<AccommodationOptionCardProps> = ({ option, isSelected, onSelect, trip, isCheckingAvailability, isAvailable }) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const getTypeStyles = (type: 'Hotel' | 'Airbnb' | 'Hostel'): string => {
        switch (type) {
            case 'Hotel':
                return 'bg-blue-100 text-blue-800';
            case 'Airbnb':
                return 'bg-pink-100 text-pink-800';
            case 'Hostel':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isEffectivelyAvailable = isCheckingAvailability || isAvailable;

    const handleSelectCard = () => {
        if (isEffectivelyAvailable) {
            onSelect();
        }
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card from being selected when clicking the share button
        const url = generateGoogleMapsSearchUrl(`${option.name}, ${option.city}`);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    const handleBookingClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card from being selected when clicking the book button
        if (isEffectivelyAvailable) {
            const url = generateHotelBookingUrl(option, trip);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
    
    const renderAvailabilityStatus = () => {
        if (isCheckingAvailability) {
            return <div className="h-6 bg-gray-200 rounded animate-pulse w-28"></div>;
        }
        if (isAvailable) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Disponível</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                <XCircleIcon className="w-4 h-4" />
                <span>Indisponível</span>
            </div>
        );
    };

    return (
        <div
            onClick={handleSelectCard}
            className={`
                bg-white rounded-xl shadow-md transform transition-all duration-200 group border-4 
                ${isSelected && isEffectivelyAvailable ? 'border-teal-500' : 'border-gray-200'}
                ${isEffectivelyAvailable ? 'cursor-pointer hover:-translate-y-1 hover:border-teal-300' : 'opacity-60 cursor-not-allowed'}
            `}
        >
            <div className="p-4 space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getTypeStyles(option.type)} no-print`}>{option.type}</span>
                    <p className="text-gray-800 font-bold text-lg">{formatter.format(option.totalStayPrice)}</p>
                </div>

                <div className="flex-grow">
                    <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-gray-800 leading-tight flex-1">{option.name}</p>
                        <button onClick={handleShareClick} className="no-print text-gray-400 hover:text-blue-600 p-1 -mt-1 -mr-1">
                            <ShareIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <LocationIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{option.location}, {option.city}</span>
                    </div>
                </div>

                <div className="pt-3 border-t">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {option.amenities.hasBreakfast && <AmenityIcon icon={<BreakfastIcon className="w-4 h-4 text-teal-600" />} text="Café da Manhã" />}
                        {option.amenities.hasPool && <AmenityIcon icon={<PoolIcon className="w-4 h-4 text-teal-600" />} text="Piscina" />}
                        {option.amenities.hasKitchen && <AmenityIcon icon={<KitchenIcon className="w-4 h-4 text-teal-600" />} text="Cozinha" />}
                    </div>
                </div>

                <div className="border-t pt-3 space-y-2 mt-auto">
                    <div className="no-print flex justify-center">{renderAvailabilityStatus()}</div>
                    <button 
                        onClick={handleBookingClick} 
                        disabled={!isEffectivelyAvailable}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors no-print disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <BookingIcon className="w-5 h-5" />
                        <span>Reservar no {option.bookingSite || 'Site Parceiro'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AccommodationOptionCard = memo(AccommodationOptionCardComponent);
