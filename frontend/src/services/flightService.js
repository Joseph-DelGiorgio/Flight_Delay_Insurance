const AVIATION_STACK_API_KEY = process.env.REACT_APP_AVIATION_STACK_API_KEY;
const AVIATION_STACK_BASE_URL = 'http://api.aviationstack.com/v1';

export const flightService = {
  async getFlightStatus(flightNumber, airline) {
    try {
      const response = await fetch(
        `${AVIATION_STACK_BASE_URL}/flights?access_key=${AVIATION_STACK_API_KEY}&flight_iata=${flightNumber}&airline_iata=${airline}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flight status');
      }

      const data = await response.json();
      return this.processFlightData(data);
    } catch (error) {
      console.error('Error fetching flight status:', error);
      throw new Error('Unable to fetch flight status. Please try again.');
    }
  },

  processFlightData(data) {
    if (!data.data || data.data.length === 0) {
      throw new Error('Flight not found');
    }

    const flight = data.data[0];
    const departure = flight.departure;
    const arrival = flight.arrival;

    return {
      flightNumber: flight.flight.iata,
      airline: flight.airline.name,
      status: flight.flight_status,
      isDelayed: departure.delay > 0,
      departure: {
        airport: departure.airport,
        scheduled: departure.scheduled,
        estimated: departure.estimated,
        actual: departure.actual,
        delay: departure.delay || 0
      },
      arrival: {
        airport: arrival.airport,
        scheduled: arrival.scheduled,
        estimated: arrival.estimated,
        actual: arrival.actual,
        delay: arrival.delay || 0
      }
    };
  },

  async validateFlightDetails(flightNumber, airline, departureDate) {
    try {
      const flightStatus = await this.getFlightStatus(flightNumber, airline);
      
      // Check if the flight exists and matches the provided date
      const scheduledDate = new Date(flightStatus.departure.scheduled);
      const providedDate = new Date(departureDate);
      
      if (scheduledDate.toDateString() !== providedDate.toDateString()) {
        throw new Error('Flight date does not match the provided date');
      }

      return {
        isValid: true,
        flightDetails: flightStatus
      };
    } catch (error) {
      console.error('Error validating flight details:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  },

  async searchFlights(query) {
    try {
      const response = await fetch(
        `${AVIATION_STACK_BASE_URL}/flights?access_key=${AVIATION_STACK_API_KEY}&search=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search flights');
      }

      const data = await response.json();
      return data.data.map(flight => ({
        flightNumber: flight.flight.iata,
        airline: flight.airline.name,
        departure: {
          airport: flight.departure.airport,
          scheduled: flight.departure.scheduled
        },
        arrival: {
          airport: flight.arrival.airport,
          scheduled: flight.arrival.scheduled
        },
        status: flight.flight_status
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      throw new Error('Unable to search flights. Please try again.');
    }
  }
}; 