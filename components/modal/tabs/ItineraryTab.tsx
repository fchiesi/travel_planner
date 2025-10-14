
import React from 'react';
import { ItineraryDay, ItineraryActivity } from '../../../types.ts';

interface ItineraryTabProps {
    itinerary: ItineraryDay[];
    formatter: Intl.NumberFormat;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ itinerary, formatter }) => (
    <div className="space-y-4">
        {itinerary.map((day: ItineraryDay) => (
            <div key={day.day} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg text-teal-700">{`Dia ${day.day}: ${day.title}`}
                        {day.location && <span className="text-sm font-normal text-gray-500 ml-2">({day.location})</span>}
                    </h4>
                    <span className="text-xs sm:text-sm font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-full whitespace-nowrap">
                        {formatter.format(day.estimatedDayCost)}
                    </span>
                </div>
                <div className="mt-2">
                    <h5 className="font-semibold text-gray-700">Atividades:</h5>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                        {day.activities.map((activity: ItineraryActivity, i) => <li key={i}>{activity.description}</li>)}
                    </ul>
                </div>
            </div>
        ))}
    </div>
);