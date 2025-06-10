import axios from 'axios';

// Configuration
const FLIGHTAWARE_API_KEY = process.env.REACT_APP_FLIGHTAWARE_API_KEY;
const FLIGHTSTATS_APP_ID = process.env.REACT_APP_FLIGHTSTATS_APP_ID;
const FLIGHTSTATS_APP_KEY = process.env.REACT_APP_FLIGHTSTATS_APP_KEY;

// API endpoints
const FLIGHTAWARE_BASE_URL = 'https://aeroapi.flightaware.com/aeroapi';
const FLIGHTSTATS_BASE_URL = 'https://api.flightstats.com/flex';

// Fetch flight data from FlightAware
export const fetchFlightAwareData = async (airline, flightNumber, date) => {
  try {
    const response = await axios.get(
      `${FLIGHTAWARE_BASE_URL}/flights/${airline}${flightNumber}`,
      {
        headers: {
          'x-apikey': FLIGHTAWARE_API_KEY,
        },
        params: {
          date: date.toISOString().split('T')[0],
        },
      }
    );

    return response.data.flights.map((flight) => ({
      id: flight.fa_flight_id,
      airline: flight.operator,
      flightNumber: flight.flight_number,
      departure: {
        airport: flight.origin.code,
        scheduled: flight.scheduled_out,
        actual: flight.actual_out,
      },
      arrival: {
        airport: flight.destination.code,
        scheduled: flight.scheduled_in,
        actual: flight.actual_in,
      },
      status: flight.status,
    }));
  } catch (error) {
    console.error('FlightAware API error:', error);
    throw error;
  }
};

// Fetch flight data from FlightStats as backup
export const fetchFlightStatsData = async (airline, flightNumber, date) => {
  try {
    const response = await axios.get(
      `${FLIGHTSTATS_BASE_URL}/flightstatus/rest/v2/json/flight/status/${airline}/${flightNumber}`,
      {
        params: {
          appId: FLIGHTSTATS_APP_ID,
          appKey: FLIGHTSTATS_APP_KEY,
          date: date.toISOString().split('T')[0],
          utc: true,
        },
      }
    );

    return response.data.flightStatuses.map((flight) => ({
      id: flight.flightId,
      airline: flight.carrierFsCode,
      flightNumber: flight.flightNumber,
      departure: {
        airport: flight.departureAirportFsCode,
        scheduled: flight.departureDate.dateLocal,
        actual: flight.operationalTimes.actualGateDeparture?.dateLocal,
      },
      arrival: {
        airport: flight.arrivalAirportFsCode,
        scheduled: flight.arrivalDate.dateLocal,
        actual: flight.operationalTimes.actualGateArrival?.dateLocal,
      },
      status: flight.status,
    }));
  } catch (error) {
    console.error('FlightStats API error:', error);
    throw error;
  }
};

// Search flights using both APIs
export const searchFlights = async (airline, flightNumber, date) => {
  try {
    // Try FlightAware first
    const flightAwareData = await fetchFlightAwareData(airline, flightNumber, date);
    if (flightAwareData.length > 0) {
      return flightAwareData;
    }

    // Fall back to FlightStats
    const flightStatsData = await fetchFlightStatsData(airline, flightNumber, date);
    return flightStatsData;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};

// Calculate delay in minutes
export const calculateDelay = (scheduled, actual) => {
  if (!scheduled || !actual) return 0;
  const scheduledTime = new Date(scheduled).getTime();
  const actualTime = new Date(actual).getTime();
  return Math.max(0, Math.floor((actualTime - scheduledTime) / (1000 * 60)));
};

// Format flight status
export const formatFlightStatus = (status) => {
  const statusMap = {
    A: 'Active',
    C: 'Cancelled',
    D: 'Diverted',
    DN: 'Data Not Available',
    L: 'Landed',
    NO: 'Not Operational',
    R: 'Redirected',
    S: 'Scheduled',
    U: 'Unknown',
  };
  return statusMap[status] || status;
}; 