import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function FlightSearch() {
  const [searchParams, setSearchParams] = useState({
    airline: '',
    flightNumber: '',
    date: null,
  });

  const [searchResults, setSearchResults] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [insuranceParams, setInsuranceParams] = useState({
    delayThreshold: 30,
    premium: 0,
    payout: 0,
  });

  const handleSearch = async () => {
    // TODO: Implement actual flight search API call
    // For now, using mock data
    setSearchResults([
      {
        id: 1,
        airline: 'AA',
        flightNumber: '123',
        departure: '2024-03-20T10:00:00',
        arrival: '2024-03-20T12:00:00',
        status: 'Scheduled',
      },
      // Add more mock flights as needed
    ]);
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    // Calculate premium based on flight details
    const basePremium = 0.1; // 0.1 SUI
    const calculatedPremium = basePremium * (insuranceParams.delayThreshold / 30);
    setInsuranceParams({
      ...insuranceParams,
      premium: calculatedPremium,
      payout: calculatedPremium * 2, // 2x payout
    });
  };

  const handlePurchaseInsurance = async () => {
    // TODO: Implement actual insurance purchase
    console.log('Purchasing insurance for flight:', selectedFlight);
    console.log('Insurance parameters:', insuranceParams);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Search Flights
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Airline</InputLabel>
              <Select
                value={searchParams.airline}
                label="Airline"
                onChange={(e) => setSearchParams({ ...searchParams, airline: e.target.value })}
              >
                <MenuItem value="AA">American Airlines</MenuItem>
                <MenuItem value="DL">Delta Airlines</MenuItem>
                <MenuItem value="UA">United Airlines</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Flight Number"
              value={searchParams.flightNumber}
              onChange={(e) => setSearchParams({ ...searchParams, flightNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Flight Date"
                value={searchParams.date}
                onChange={(newValue) => setSearchParams({ ...searchParams, date: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Paper>

      {searchResults.length > 0 && (
        <Grid container spacing={3}>
          {searchResults.map((flight) => (
            <Grid item xs={12} md={6} key={flight.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {flight.airline} {flight.flightNumber}
                  </Typography>
                  <Typography color="textSecondary">
                    Departure: {new Date(flight.departure).toLocaleString()}
                  </Typography>
                  <Typography color="textSecondary">
                    Arrival: {new Date(flight.arrival).toLocaleString()}
                  </Typography>
                  <Typography color="textSecondary">
                    Status: {flight.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleFlightSelect(flight)}
                  >
                    Select for Insurance
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedFlight && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Purchase Insurance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Delay Threshold</InputLabel>
                <Select
                  value={insuranceParams.delayThreshold}
                  label="Delay Threshold"
                  onChange={(e) => {
                    const newThreshold = e.target.value;
                    const newPremium = 0.1 * (newThreshold / 30);
                    setInsuranceParams({
                      ...insuranceParams,
                      delayThreshold: newThreshold,
                      premium: newPremium,
                      payout: newPremium * 2,
                    });
                  }}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">
                Premium: {insuranceParams.premium} SUI
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">
                Payout: {insuranceParams.payout} SUI
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePurchaseInsurance}
            >
              Purchase Insurance
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default FlightSearch; 