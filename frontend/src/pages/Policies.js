import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletKit } from '@mysten/wallet-kit';
import { contractService } from '../services/contractService';
import { flightService } from '../services/flightService';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

function PolicyCard({ policy, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [flightStatus, setFlightStatus] = useState(null);
  const [error, setError] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'claimed':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const refreshFlightStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const status = await flightService.getFlightStatus(
        policy.flightNumber,
        policy.airline
      );
      setFlightStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFlightStatus();
  }, [policy]);

  return (
    <motion.div variants={itemVariants}>
      <Card sx={{ height: '100%', position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3">
              {policy.airline} {policy.flightNumber}
            </Typography>
            <Chip 
              label={policy.status} 
              color={getStatusColor(policy.status)}
              size="small"
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FlightTakeoffIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {policy.departureAirport} → {policy.arrivalAirport}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(policy.departureDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Coverage: ₽{policy.coverageAmount}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {flightStatus && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current Status: {flightStatus.status}
              </Typography>
              {flightStatus.isDelayed && (
                <Typography variant="body2" color="error">
                  Delay: {flightStatus.departure.delay} minutes
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={refreshFlightStatus}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              Refresh Status
            </Button>
            {flightStatus?.isDelayed && policy.status === 'active' && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onRefresh(policy.id)}
              >
                Claim Compensation
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const Policies = () => {
  const navigate = useNavigate();
  const { currentAccount, signAndExecuteTransaction } = useWalletKit();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentAccount) {
      fetchPolicies();
    }
  }, [currentAccount]);

  const fetchPolicies = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet to view your policies');
      setLoading(false);
      return;
    }

    try {
      const result = await contractService.getPolicies(currentAccount.address);
      // Parse the returned data into a more usable format
      const parsedPolicies = result.map(policy => ({
        id: policy[0], // Assuming the first element is the policy ID
        flightNumber: policy[1],
        airline: policy[2],
        departureDate: new Date(parseInt(policy[3])).toLocaleString(),
        coverageAmount: policy[4],
        status: policy[5]
      }));
      setPolicies(parsedPolicies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (policyId) => {
    try {
      setLoading(true);
      await contractService.claimCompensation(signAndExecuteTransaction, policyId);
      await fetchPolicies(); // Refresh the policies list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (policyId) => {
    navigate(`/policy/${policyId}`);
  };

  if (!currentAccount) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">Please connect your wallet to view your policies</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Insurance Policies
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : policies.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No policies found. Purchase your first policy!
          </Typography>
        ) : (
          <List>
            {policies.map((policy) => (
              <ListItem
                key={policy.id}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  mb: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ListItemText
                  primary={`Flight ${policy.flightNumber} - ${policy.airline}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Departure: {policy.departureDate}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Coverage: {policy.coverageAmount} SUI
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Status: {policy.status}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleViewDetails(policy.id)}
                  >
                    View Details
                  </Button>
                  {policy.status === 'ACTIVE' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleClaim(policy.id)}
                      disabled={loading}
                    >
                      Claim
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default Policies; 