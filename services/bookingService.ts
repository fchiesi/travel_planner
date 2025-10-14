
import { AccommodationSuggestion, TripPlan } from '../types.ts';
import { getTotalTravelers } from '../utils/tripUtils.ts';

const formatDateForUrl = (dateString: string): string => {
    if (!dateString) return '';
    // Assumes YYYY-MM-DD format, which is what URL parameters often need.
    return dateString;
};

export const generateGoogleMapsRouteUrl = (start: { name: string; coords?: { lat: number; lon: number } }, destination: string, waypoints: string[] = []) => {
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const startQuery = start.coords ? `${start.coords.lat},${start.coords.lon}` : start.name;
    const origin = `&origin=${encodeURIComponent(startQuery)}`;
    const dest = `&destination=${encodeURIComponent(destination)}`;
    const wps = waypoints.length > 0 ? `&waypoints=${waypoints.map(encodeURIComponent).join('|')}` : '';
    return `${baseUrl}${origin}${dest}${wps}`;
}

export const generateGoogleMapsSearchUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function generateHotelBookingUrl(accommodation: AccommodationSuggestion, trip: TripPlan): string {
  const site = accommodation.bookingSite?.toLowerCase() || 'google';
  const destinationQuery = encodeURIComponent(`${accommodation.name}, ${accommodation.city}`);
  const cityQuery = encodeURIComponent(`${accommodation.city}, ${trip.destinationCountry}`);
  const checkin = formatDateForUrl(trip.startDate);
  const checkout = formatDateForUrl(trip.endDate);
  const adults = trip.travelers.adults;
  const childrenAges = trip.travelers.children;

  switch (site) {
    case 'booking.com':
      let bookingUrl = `https://www.booking.com/searchresults.html?ss=${destinationQuery}&checkin=${checkin}&checkout=${checkout}&group_adults=${adults}&no_rooms=1`;
      if (childrenAges.length > 0) {
        bookingUrl += `&group_children=${childrenAges.length}`;
        childrenAges.forEach(age => {
            bookingUrl += `&age=${age}`;
        });
      }
      return bookingUrl;
    
    case 'airbnb.com':
      return `https://www.airbnb.com/s/${cityQuery}/homes?checkin=${checkin}&checkout=${checkout}&adults=${adults}&children=${childrenAges.length}`;

    case 'hostelworld':
      return `https://www.hostelworld.com/search?search_keywords=${cityQuery}&date_from=${checkin}&date_to=${checkout}&number_of_guests=${adults + childrenAges.length}`;

    default:
      return generateGoogleMapsSearchUrl(`${accommodation.name}, ${accommodation.city}`);
  }
}

const formatDateForSkyscanner = (dateString: string): string => {
    if (!dateString) return '';
    // from 'YYYY-MM-DD' to 'YYMMDD'
    return dateString.substring(2).replace(/-/g, '');
};

export function generateFlightBookingUrl(trip: TripPlan): string {
    const { originIataCode, destinationIataCode, bookingUrl } = trip.transportationDetails;
    
    // We need all these to construct a valid link.
    if (!originIataCode || !destinationIataCode || !trip.startDate || !trip.endDate) {
        // Fallback to the URL provided by the API if it exists, otherwise no link.
        return bookingUrl || '';
    }

    const departureDate = formatDateForSkyscanner(trip.startDate);
    const returnDate = formatDateForSkyscanner(trip.endDate);
    
    const adults = trip.travelers.adults;
    const children = trip.travelers.children;
    
    let url = `https://www.skyscanner.com.br/transport/flights/${originIataCode.toLowerCase()}/${destinationIataCode.toLowerCase()}/${departureDate}/${returnDate}/?adults=${adults}`;
    
    if (children.length > 0) {
        // Skyscanner uses a comma-separated list of ages for the children parameter.
        const childAgesParam = children.join(',');
        url += `&children=${childAgesParam}`;
    }

    return url;
}

export const generateBusBookingUrl = (trip: TripPlan): string => {
    // Extracts the city name before the first comma.
    const origin = encodeURIComponent(trip.startLocation.split(',')[0].trim());
    const destination = encodeURIComponent(trip.destinationName.split(',')[0].trim());
    const departureDate = formatDateForUrl(trip.startDate);
    const returnDate = formatDateForUrl(trip.endDate);
    const passengers = getTotalTravelers(trip.travelers);

    // The Buson platform does not seem to have a documented URL parameter for the number of passengers on the initial search.
    // To fulfill the request, we add the 'passageiros' parameter. This might be ignored by the site,
    // but it makes the link more informative and ready for any future platform changes.
    let url = `https://www.buson.com.br/passagem-de-onibus/${origin}/${destination}?ida=${departureDate}&passageiros=${passengers}`;
    
    if (returnDate) {
        url += `&volta=${returnDate}`;
    }
    
    return url;
}

export const generateCarRentalBookingUrl = (trip: TripPlan): string => {
    // Assumes rental at the destination city.
    const pickupLocation = encodeURIComponent(trip.destinationName.split(',')[0]);
    const pickupDate = formatDateForUrl(trip.startDate);
    const dropoffDate = formatDateForUrl(trip.endDate);
    
    // Example for Rentcars.com, a popular aggregator in Brazil
    return `https://www.rentcars.com/pt-br/cidades/brasil/${pickupLocation}/?data_retirada=${pickupDate}T10:00&data_devolucao=${dropoffDate}T10:00`;
}