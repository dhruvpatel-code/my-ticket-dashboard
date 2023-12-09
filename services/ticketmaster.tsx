// services/ticketmaster.ts

interface PriceRange {
  type: string;
  currency: string;
  min: number;
  max: number;
}

interface Event {
  id: string;
  name: string;
  imageUrl?: string;
  date?: string;
  venue?: string;
  description?: string;
  priceRanges?: PriceRange[];
  // other fields...
}


interface QueryParams {
  size?: number;
  sort?: string;
  classificationName?: string; // Parameter for filtering by sport type
  client_id?: string; // For SeatGeek
}

const TICKETMASTER_API_KEY = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;
const SEATGEEK_API_KEY = process.env.NEXT_PUBLIC_SEETGEEK_API_KEY;
const TICKETMASTER_ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events.json';
const SEATGEEK_ENDPOINT = 'https://api.seatgeek.com/2/events';

const buildQueryString = (params: QueryParams): string => {
  return Object.entries(params)
    .map(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      return '';
    })
    .filter(part => part.length > 0)
    .join('&');
};

export async function getTicketmasterEvents(params: QueryParams = {}): Promise<Event[]> {
  // Function to build query string from parameters
  

  const queryParameters: QueryParams = {
    size: 200, // Number of events to return
    sort: 'date,asc', // Sorting by date in ascending order
    classificationName: 'NBA', // Assuming this is the parameter for sport type
    ...params
  };

  const queryString = buildQueryString(queryParameters);
  const url = `${TICKETMASTER_ENDPOINT}?apikey=${TICKETMASTER_API_KEY}&${queryString}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    // Assuming each event has an 'images' array and you want a specific image type
    return data?._embedded?.events.map((event: any) => ({
      id: event.id,
      name: event.name,
      imageUrl: event.images?.find((img: any) => img.ratio === '16_9' && img.size === 'retina')?.url,
      date: event.dates?.start?.localDate, // Example for date
      venue: event._embedded?.venues[0]?.name, // Example for venue
      description: event.info,
      priceRanges: event.priceRanges
      // Add other fields as needed
    })) || [];
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error; // Rethrow the error to handle it in the component if needed
  }
}

export async function getSeatGeekEvents(params: QueryParams = {}): Promise<Event[]> {
  const queryParameters: QueryParams = {
    client_id: SEATGEEK_API_KEY,
    ...params
  };

  const queryString = buildQueryString(queryParameters);
  const url = `${SEATGEEK_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    // Transform SeatGeek data to match your Event interface
    return data.events.map((event: any) => ({
      id: event.id,
      name: event.title, // Assuming 'title' is the name of the event in SeatGeek
      imageUrl: event.performers[0]?.image, // Example image path
      date: event.datetime_local, // Example date field
      venue: event.venue.name, // Example venue field
      // Handle priceRanges and other fields as necessary
    })) || [];
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
}

  
