

export interface Travelers {
  adults: number;
  children: number[]; // Array of children's ages
}

export interface SearchCriteria {
  startLocation: string;
  startLocationCoords?: { lat: number; lon: number };
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  travelers: Travelers;
  // Advanced options
  multipleDestinations?: string;
  destinationsOrder?: string[]; // Added for multi-destination ordering
  preferredTransport?: string;
  preferredCuisine?: string;
  userProfile?: string; // Added for personalization
  // New fields for the "Build a Trip" wizard
  accommodationPreferences?: string[];
  activityPreferences?: string[];
  selectedAttractions?: string[];
}

export interface CostBreakdown {
  transportation: number;
  // accommodation cost is now dynamic
  food: number;
  activities: number;
  shopping: number;
}

export interface ItineraryActivity {
    description: string;
    estimatedCost: number;
}


export interface OvernightStop {
    name: string;
    description: string;
    accommodationOptions: AccommodationOptions;
    activities: ItineraryActivity[]; // Activities for the stopover day
}

export interface TransportationDetails {
  mode: string;
  totalCost: number;
  details: string;
  suggestedDepartureTime: string; // e.g., "08:00"
  breakdown?: {
    label: string;
    value: string;
  }[];
  strategicStops?: {
      name: string;
      description: string;
  }[];
  potentialOutboundStops?: OvernightStop[];
  potentialReturnStops?: OvernightStop[];
  originIataCode?: string; // IATA code for origin airport (e.g., GRU)
  destinationIataCode?: string; // IATA code for destination airport (e.g., SDU)
  priceSource?: string; // ex: 'Skyscanner', 'Kayak'. Site where the price was found.
  bookingUrl?: string; // The exact URL from the flight search page (e.g., Skyscanner, Kayak).
  totalDistanceKm?: number; // Total round-trip distance in km for car trips
  tollPlazaBreakdown?: { // Detailed breakdown of each toll plaza for car trips
    name: string;
    cost: number;
  }[];
}

export interface AccommodationSuggestion {
  name: string;
  type: 'Hotel' | 'Airbnb' | 'Hostel';
  city: string; // To support multi-city trips
  location: string; // e.g., 'Centro', 'Perto da praia'
  totalStayPrice: number;
  amenities: {
    hasBreakfast: boolean;
    hasPool: boolean;
    hasKitchen: boolean;
  };
  bookingSite?: string; // Ex: "Booking.com", "Airbnb.com", "Hostelworld"
}


export interface AccommodationOptions {
    suggestions: AccommodationSuggestion[];
}

export interface RestaurantSuggestion {
  name: string;
  averageGroupCost: number; // Replaced priceRange with a concrete number
  cuisine: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  location?: string; // To support multi-city trips
  estimatedDayCost: number;
  activities: ItineraryActivity[];
  foodSuggestions: string[];
}

export interface TripPlan {
  id: string; // Added for unique identification
  destinationName: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  baseCost: number; // Custo SEM hospedagem.
  travelers: Travelers;
  transportationDetails: TransportationDetails;
  costBreakdown: CostBreakdown; // Note: accommodation cost is NOT in here
  accommodationOptions: AccommodationOptions;
  restaurantSuggestions: RestaurantSuggestion[];
  itinerary: ItineraryDay[];
  shoppingTips: string[];
  destinationTips: string[];
  startLocation: string; // Added for map links
  startLocationCoords?: { lat: number; lon: number };
  favoritedAt?: any; // For sorting favorites in Firestore
}