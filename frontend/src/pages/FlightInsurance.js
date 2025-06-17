import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { useWalletKit } from '@mysten/wallet-kit';
import { contractService } from '../services/contractService';
import { flightService } from '../services/flightService';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const steps = ['Flight Details', 'Insurance Options', 'Review & Purchase'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

function FlightInsurance() {
  const navigate = useNavigate();
  const { currentAccount, signAndExecuteTransaction } = useWalletKit();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    departureDate: '',
    departureAirport: '',
    arrivalAirport: '',
    coverageAmount: '',
    selectedFlight: null
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateStep = async (step) => {
    const errors = {};
    
    switch (step) {
      case 0:
        if (!formData.flightNumber) {
          errors.flightNumber = 'Flight number is required';
        }
        if (!formData.airline) {
          errors.airline = 'Airline is required';
        }
        if (!formData.departureDate) {
          errors.departureDate = 'Departure date is required';
        } else {
          const selectedDate = new Date(formData.departureDate);
          const today = new Date();
          if (selectedDate < today) {
            errors.departureDate = 'Departure date must be in the future';
          }
        }
        if (!formData.departureAirport) {
          errors.departureAirport = 'Departure airport is required';
        }
        if (!formData.arrivalAirport) {
          errors.arrivalAirport = 'Arrival airport is required';
        }
        if (Object.keys(errors).length === 0 && formData.selectedFlight) {
          try {
            setLoading(true);
            const validation = await flightService.validateFlightDetails(
              formData.flightNumber,
              formData.airline,
              formData.departureDate
            );
            if (!validation.isValid) {
              errors.flightDetails = validation.error;
            }
          } catch (err) {
            errors.flightDetails = err.message;
          } finally {
            setLoading(false);
          }
        }
        break;

      case 1:
        if (!formData.coverageAmount) {
          errors.coverageAmount = 'Coverage amount is required';
        } else {
          const amount = parseFloat(formData.coverageAmount);
          if (isNaN(amount) || amount <= 0) {
            errors.coverageAmount = 'Coverage amount must be greater than 0';
          }
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Convert departureDate to timestamp (u64)
      const departureTimestamp = new Date(formData.departureDate).getTime();

      // Calculate premium (for now, using a simple 5% of coverage amount)
      const premium = parseFloat(formData.coverageAmount) * 0.05;

      // Create transaction
      const txb = await contractService.purchaseInsurance(
        { signAndExecuteTransaction },
        { ...formData, departureDate: departureTimestamp },
        parseFloat(formData.coverageAmount)
      );

      setSuccess('Insurance purchased successfully!');
      setTimeout(() => {
        navigate('/policies');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSearch = async () => {
    if (!formData.flightNumber || !formData.airline) {
      setValidationErrors({
        ...validationErrors,
        flightSearch: 'Please enter both flight number and airline'
      });
      return;
    }

    try {
      setSearchLoading(true);
      setValidationErrors({});
      const results = await flightService.searchFlights(
        `${formData.airline} ${formData.flightNumber}`
      );
      setSearchResults(results);
    } catch (err) {
      setValidationErrors({
        ...validationErrors,
        flightSearch: err.message
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFlightSelect = (flight) => {
    setFormData({
      ...formData,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departureAirport: flight.departure.airport,
      arrivalAirport: flight.arrival.airport,
      departureDate: new Date(flight.departure.scheduled).toISOString().split('T')[0],
      selectedFlight: flight
    });
    setSearchResults([]);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div variants={itemVariants}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Flight Number"
                    value={formData.flightNumber}
                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                    error={!!validationErrors.flightNumber}
                    helperText={validationErrors.flightNumber}
                    fullWidth
                  />
                  <TextField
                    label="Airline"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    error={!!validationErrors.airline}
                    helperText={validationErrors.airline}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleFlightSearch}
                    disabled={searchLoading}
                    startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                  >
                    Search
                  </Button>
                </Box>
              </Grid>

              {searchResults.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Search Results
                    </Typography>
                    {searchResults.map((flight, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 1, justifyContent: 'flex-start' }}
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <FlightTakeoffIcon sx={{ mr: 1 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">
                              {flight.airline} {flight.flightNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {flight.departure.airport} → {flight.arrival.airport}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(flight.departure.scheduled).toLocaleString()}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Date"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  error={!!validationErrors.departureDate}
                  helperText={validationErrors.departureDate}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Airport"
                  value={formData.departureAirport}
                  onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
                  error={!!validationErrors.departureAirport}
                  helperText={validationErrors.departureAirport}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  value={formData.arrivalAirport}
                  onChange={(e) => setFormData({ ...formData, arrivalAirport: e.target.value })}
                  error={!!validationErrors.arrivalAirport}
                  helperText={validationErrors.arrivalAirport}
                  fullWidth
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div variants={itemVariants}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Coverage Amount"
                  type="number"
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                  error={!!validationErrors.coverageAmount}
                  helperText={validationErrors.coverageAmount}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Coverage Details
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Coverage for delays over 2 hours
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Automatic payout for eligible delays
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • No claim forms required
                  </Typography>
                  <Typography variant="body2">
                    • Coverage valid for 24 hours from scheduled departure
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div variants={itemVariants}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Review Your Insurance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Flight Details
                      </Typography>
                      <Typography variant="body1">
                        {formData.airline} {formData.flightNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.departureAirport} → {formData.arrivalAirport}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(formData.departureDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Coverage
                      </Typography>
                      <Typography variant="body1">
                        ₽{formData.coverageAmount}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Flight Insurance
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              'Purchase Insurance'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}

export default FlightInsurance; 