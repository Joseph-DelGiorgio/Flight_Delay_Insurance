import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Paper
} from '@mui/material';

function FlightInsurance() {
  const { currentAccount } = useWalletKit();
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('100');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }
    // TODO: Implement insurance purchase logic
    console.log('Submitting insurance request:', { flightNumber, departureDate, coverageAmount });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Purchase Flight Insurance
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Flight Number"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Departure Date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Coverage Amount (SUI)"
            type="number"
            value={coverageAmount}
            onChange={(e) => setCoverageAmount(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 1 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={!currentAccount}
            sx={{ mt: 3 }}
          >
            {currentAccount ? 'Purchase Insurance' : 'Connect Wallet to Continue'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default FlightInsurance; 