
import React from 'react';
import { OvernightStop } from '../../../types.ts';

export const StopoverCitySelector: React.FC<{
    stops: OvernightStop[];
    selectedStop: OvernightStop | null;
    onSelect: (stop: OvernightStop | null) => void;
    title: string;
    colorClass: string;
}> = ({ stops, selectedStop, onSelect, title, colorClass }) => (
     <div>
        <h4 className={`font-bold text-xl ${colorClass} mb-4`}>{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stops.map((stop, i) => (
                <button key={i} onClick={() => onSelect(stop)} className={`p-4 rounded-lg text-left border-4 transition-all ${selectedStop?.name === stop.name ? 'border-teal-500 shadow-lg' : 'border-transparent bg-white hover:border-teal-300'}`}>
                    <p className="font-bold text-lg text-gray-800">{stop.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{stop.description}</p>
                </button>
            ))}
             <button onClick={() => onSelect(null)} className={`p-4 rounded-lg text-left border-4 transition-all ${!selectedStop ? 'border-teal-500 shadow-lg' : 'border-transparent bg-gray-100 hover:border-gray-300'}`}>
                <p className="font-bold text-lg text-gray-800">Não fazer parada</p>
                <p className="text-sm text-gray-600 mt-1">Seguir viagem direto.</p>
            </button>
        </div>
    </div>
);