import React, { useState } from 'react';
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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useWalletKit } from '@mysten/wallet-kit';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { contractService } from '../services/contractService';
import { flightService } from '../services/flightService';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CheckIcon from '@mui/icons-material/Check';

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
  const { currentAccount } = useWalletKit();

  if (!currentAccount) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1">
          Please connect your Sui wallet to purchase flight insurance.
        </Typography>
      </Container>
    );
  }

  return <FlightInsuranceFlow currentAccount={currentAccount} />;
}

function FlightInsuranceFlow({ currentAccount }) {
  const navigate = useNavigate();
  const { mutate: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction({
    onSuccess: () => {
      setSuccess('Insurance purchased successfully!');
      setTimeout(() => {
        navigate('/policies');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
    }
  });
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    departureDate: '',
    departureAirport: '',
    arrivalAirport: '',
    coverageAmount: '0.5',
    selectedFlight: null,
    insurancePackage: '',
    premium: 0
  });

  const [validationErrors, setValidationErrors] = useState({});

  const calculatePremium = (coverage, pkg) => {
    const rate = pkg === 'basic' ? 0.01 : 0.02;
    return parseFloat(coverage) * rate;
  };

  const handlePackageSelect = (pkg) => {
    const premium = calculatePremium(formData.coverageAmount, pkg);
    setFormData({ ...formData, insurancePackage: pkg, premium });
  };

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
        break;

      case 1:
        if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) {
          errors.coverageAmount = 'Valid coverage amount is required';
        } else if (parseFloat(formData.coverageAmount) > 100) {
          errors.coverageAmount = 'Coverage cannot exceed 100 SUI';
        }
        if (!formData.insurancePackage) {
          errors.insurancePackage = 'Please select an insurance package';
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

      const departureTimestamp = new Date(formData.departureDate).getTime();

      const txb = contractService.createPolicyTransaction(
        { ...formData, departureDate: departureTimestamp },
        parseFloat(formData.coverageAmount),
        formData.premium
      );

      signAndExecuteTransaction({
        transactionBlock: txb,
      });
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
                <Typography variant="h6" gutterBottom>Find Your Flight</Typography>
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
                    <List>
                      {searchResults.map((flight, index) => (
                        <ListItem 
                          button 
                          key={index} 
                          onClick={() => handleFlightSelect(flight)}
                          divider={index < searchResults.length - 1}
                        >
                          <ListItemIcon>
                            <FlightTakeoffIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${flight.airline} ${flight.flightNumber}`}
                            secondary={`${flight.departure.airport} to ${flight.arrival.airport}`}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(flight.departure.scheduled).toLocaleDateString()}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Or Enter Manually" />
                </Divider>
              </Grid>

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
                <Typography variant="h6" gutterBottom>1. Set Your Coverage Amount</Typography>
                <TextField
                  label="Coverage Amount"
                  type="number"
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                  error={!!validationErrors.coverageAmount}
                  helperText={validationErrors.coverageAmount}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">SUI</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>2. Choose Your Package</Typography>
                {!!validationErrors.insurancePackage && <Alert severity="error" sx={{ mb: 2 }}>{validationErrors.insurancePackage}</Alert>}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  onClick={() => handlePackageSelect('basic')}
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.insurancePackage === 'basic' ? '2px solid' : '1px solid',
                    borderColor: formData.insurancePackage === 'basic' ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      Basic Protection
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {calculatePremium(formData.coverageAmount, 'basic')} SUI Premium
                    </Typography>
                    <List dense>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="Flight Cancellation" /></ListItem>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="Missed Connections" /></ListItem>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="Baggage Delay" /></ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  onClick={() => handlePackageSelect('comprehensive')}
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.insurancePackage === 'comprehensive' ? '2px solid' : '1px solid',
                    borderColor: formData.insurancePackage === 'comprehensive' ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      Comprehensive Protection
                    </Typography>
                     <Typography variant="h6" color="primary" gutterBottom>
                      {calculatePremium(formData.coverageAmount, 'comprehensive')} SUI Premium
                    </Typography>
                    <List dense>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="All Basic Coverage" /></ListItem>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="Medical Emergencies" /></ListItem>
                      <ListItem><ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon><ListItemText primary="Trip Interruption" /></ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Review Your Insurance
              </Typography>
              <Divider sx={{ my: 2 }} />
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
                    Policy
                  </Typography>
                  <Typography variant="body1" component="div">
                    Package: <Chip label={formData.insurancePackage} size="small" sx={{ textTransform: 'capitalize' }} />
                  </Typography>
                  <Typography variant="body1">
                    Coverage: {formData.coverageAmount} SUI
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Premium: {formData.premium} SUI
                  </Typography>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isPending}
                sx={{ mt: 2, width: '100%' }}
              >
                {isPending ? <CircularProgress size={24} color="inherit" /> : `Purchase for ${formData.premium} SUI`}
              </Button>
            </Paper>
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