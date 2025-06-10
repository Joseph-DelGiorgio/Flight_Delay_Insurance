import React, { useState, useEffect } from 'react';
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
  Tooltip
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

function Policies() {
  const { currentAccount } = useWalletKit();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPolicies = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet to view your policies');
      setLoading(false);
      return;
    }

    try {
      const result = await contractService.getPolicies(currentAccount);
      setPolicies(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (policyId) => {
    try {
      setLoading(true);
      await contractService.claimCompensation(currentAccount, policyId);
      await fetchPolicies(); // Refresh the policies list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [currentAccount]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Insurance Policies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your flight insurance policies
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : policies.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Policies Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't purchased any flight insurance policies yet.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {policies.map((policy) => (
              <Grid item xs={12} sm={6} md={4} key={policy.id}>
                <PolicyCard 
                  policy={policy} 
                  onRefresh={handleClaim}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
}

export default Policies; 