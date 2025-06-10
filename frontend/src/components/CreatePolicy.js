import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createPolicy } from '../utils/blockchain';

const CreatePolicy = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    departureTime: new Date(),
    coverageAmount: '',
    airline: '',
    flightNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const now = new Date();

    if (!formData.departureAirport.trim()) {
      errors.departureAirport = 'Departure airport is required';
    }
    if (!formData.arrivalAirport.trim()) {
      errors.arrivalAirport = 'Arrival airport is required';
    }
    if (formData.departureAirport === formData.arrivalAirport) {
      errors.arrivalAirport = 'Departure and arrival airports must be different';
    }
    if (!formData.airline.trim()) {
      errors.airline = 'Airline is required';
    }
    if (!formData.flightNumber.trim()) {
      errors.flightNumber = 'Flight number is required';
    }
    if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) {
      errors.coverageAmount = 'Coverage amount must be greater than 0';
    }
    if (formData.departureTime <= now) {
      errors.departureTime = 'Departure time must be in the future';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      departureTime: newValue
    }));
    // Clear error when user changes date
    if (formErrors.departureTime) {
      setFormErrors(prev => ({
        ...prev,
        departureTime: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createPolicy(
        currentAccount.address,
        signAndExecuteTransaction,
        formData
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please connect your wallet to create a new policy
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Insurance Policy
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Departure Airport"
                name="departureAirport"
                value={formData.departureAirport}
                onChange={handleInputChange}
                placeholder="e.g., JFK"
                error={!!formErrors.departureAirport}
                helperText={formErrors.departureAirport}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Arrival Airport"
                name="arrivalAirport"
                value={formData.arrivalAirport}
                onChange={handleInputChange}
                placeholder="e.g., LAX"
                error={!!formErrors.arrivalAirport}
                helperText={formErrors.arrivalAirport}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Airline"
                name="airline"
                value={formData.airline}
                onChange={handleInputChange}
                placeholder="e.g., Delta"
                error={!!formErrors.airline}
                helperText={formErrors.airline}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Flight Number"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleInputChange}
                placeholder="e.g., DL123"
                error={!!formErrors.flightNumber}
                helperText={formErrors.flightNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Departure Time"
                  value={formData.departureTime}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!formErrors.departureTime}
                      helperText={formErrors.departureTime}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Coverage Amount (SUI)"
                name="coverageAmount"
                type="number"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
                error={!!formErrors.coverageAmount}
                helperText={formErrors.coverageAmount}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Create Policy
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePolicy; 