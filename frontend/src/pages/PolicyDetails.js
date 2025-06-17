import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { motion } from 'framer-motion';
import { useWalletKit } from '@mysten/wallet-kit';
import { contractService } from '../services/contractService';
import { flightService } from '../services/flightService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import DownloadIcon from '@mui/icons-material/Download';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

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

function PolicyDetails() {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { currentAccount, signAndExecuteTransaction } = useWalletKit();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightStatus, setFlightStatus] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPolicyDetails = async () => {
    try {
      const result = await contractService.getPolicyDetails(policyId);
      // Parse the returned data into a more usable format
      const parsedPolicy = {
        id: result[0],
        flightNumber: result[1],
        airline: result[2],
        departureDate: new Date(parseInt(result[3])).toLocaleString(),
        coverageAmount: result[4],
        status: result[5],
        premium: result[6],
        claimAmount: result[7]
      };
      setPolicy(parsedPolicy);
      // Fetch current flight status
      // TODO: Use contractService.checkFlightStatus if needed
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      fetchPolicyDetails();
    } else {
      setError('Please connect your wallet to view policy details');
      setLoading(false);
    }
  }, [currentAccount, policyId]);

  const handleClaim = async () => {
    try {
      setClaimLoading(true);
      await contractService.claimCompensation(signAndExecuteTransaction, policyId);
      await fetchPolicyDetails(); // Refresh policy details
    } catch (err) {
      setError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

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

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  if (!currentAccount) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">Please connect your wallet to view policy details</Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!policy) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">Policy not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Policy Details
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Flight Number
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.flightNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Airline
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.airline}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Departure Date
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.departureDate}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Coverage Amount
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.coverageAmount} SUI
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Premium
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.premium} SUI
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" gutterBottom>
                {policy.status}
              </Typography>
            </Grid>
            {policy.status === 'claimed' && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">
                  Claim Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {policy.claimAmount} SUI
                </Typography>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/policies')}
            >
              Back to Policies
            </Button>
            {policy.status === 'active' && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleClaim}
                disabled={claimLoading}
              >
                {claimLoading ? 'Processing...' : 'Claim Compensation'}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default PolicyDetails; 