const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// FlightAware API configuration
const FLIGHTAWARE_API_KEY = process.env.FLIGHTAWARE_API_KEY;
const FLIGHTAWARE_BASE_URL = 'https://aeroapi.flightaware.com/aeroapi';

// FlightStats API configuration
const FLIGHTSTATS_APP_ID = process.env.FLIGHTSTATS_APP_ID;
const FLIGHTSTATS_APP_KEY = process.env.FLIGHTSTATS_APP_KEY;
const FLIGHTSTATS_BASE_URL = 'https://api.flightstats.com/flex';

// Helper function to convert time to Unix timestamp
const convertToUnixTimestamp = (dateTimeStr) => {
    return Math.floor(new Date(dateTimeStr).getTime() / 1000);
};

// Fetch flight data from FlightAware
async function fetchFlightAwareData(flightNumber, airline) {
    try {
        const response = await axios.get(
            `${FLIGHTAWARE_BASE_URL}/flights/${airline}${flightNumber}`,
            {
                headers: {
                    'x-apikey': FLIGHTAWARE_API_KEY
                }
            }
        );
        
        const flight = response.data.flights[0];
        return {
            actualArrival: convertToUnixTimestamp(flight.actual_arrival_time),
            status: flight.status,
            lastUpdated: convertToUnixTimestamp(flight.last_position)
        };
    } catch (error) {
        console.error('FlightAware API error:', error);
        throw error;
    }
}

// Fetch flight data from FlightStats as backup
async function fetchFlightStatsData(flightNumber, airline) {
    try {
        const response = await axios.get(
            `${FLIGHTSTATS_BASE_URL}/flightstatus/rest/v2/json/flight/status/${airline}/${flightNumber}`,
            {
                params: {
                    appId: FLIGHTSTATS_APP_ID,
                    appKey: FLIGHTSTATS_APP_KEY,
                    utc: true
                }
            }
        );
        
        const flight = response.data.flightStatuses[0];
        return {
            actualArrival: convertToUnixTimestamp(flight.arrivalDate.dateLocal),
            status: flight.status,
            lastUpdated: convertToUnixTimestamp(flight.lastUpdated)
        };
    } catch (error) {
        console.error('FlightStats API error:', error);
        throw error;
    }
}

// Main endpoint for flight data
app.post('/flight-data', async (req, res) => {
    try {
        const { flightNumber, airline } = req.body;
        
        if (!flightNumber || !airline) {
            return res.status(400).json({
                error: 'Missing required parameters: flightNumber and airline'
            });
        }

        // Try FlightAware first, fall back to FlightStats
        let flightData;
        try {
            flightData = await fetchFlightAwareData(flightNumber, airline);
        } catch (error) {
            console.log('Falling back to FlightStats...');
            flightData = await fetchFlightStatsData(flightNumber, airline);
        }

        // Return the data in the format expected by the Chainlink node
        res.json({
            jobRunID: req.body.id,
            data: {
                flightNumber,
                airline,
                actualArrival: flightData.actualArrival,
                status: flightData.status,
                lastUpdated: flightData.lastUpdated
            },
            statusCode: 200
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            jobRunID: req.body.id,
            status: 'errored',
            error: error.message,
            statusCode: 500
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Flight data adapter listening on port ${PORT}`);
}); 