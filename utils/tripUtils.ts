
import { Travelers, AccommodationOptions, AccommodationSuggestion } from '../types.ts';

export const getTotalTravelers = (travelers: Travelers): number => {
    return travelers.adults + travelers.children.length;
};

export const findCheapestAccommodation = (options?: AccommodationOptions): AccommodationSuggestion | null => {
    if (!options || !options.suggestions || options.suggestions.length === 0) return null;

    return options.suggestions.reduce((prev, current) =>
      (prev.totalStayPrice < current.totalStayPrice) ? prev : current
    );
};