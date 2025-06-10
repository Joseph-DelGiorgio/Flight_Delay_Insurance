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
  const { currentAccount } = useWalletKit();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flightStatus, setFlightStatus] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPolicyDetails = async () => {
    try {
      const details = await contractService.getPolicyDetails(policyId);
      setPolicy(details);
      
      // Fetch current flight status
      const status = await flightService.getFlightStatus(
        details.flightNumber,
        details.airline
      );
      setFlightStatus(status);
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
      setLoading(true);
      await contractService.claimCompensation(currentAccount, policyId);
      await fetchPolicyDetails(); // Refresh policy details
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/policies')}
        >
          Back to Policies
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/policies')}
            sx={{ mb: 2 }}
          >
            Back to Policies
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Policy Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Typography variant="h5" component="h2">
                    {policy.airline} {policy.flightNumber}
                  </Typography>
                  <Chip 
                    label={policy.status} 
                    color={getStatusColor(policy.status)}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FlightTakeoffIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {policy.departureAirport} → {policy.arrivalAirport}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {new Date(policy.departureDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalanceWalletIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        Coverage: ₽{policy.coverageAmount}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {flightStatus && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Current Flight Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status: {flightStatus.status}
                        </Typography>
                        {flightStatus.isDelayed && (
                          <Typography variant="body2" color="error">
                            Delay: {flightStatus.departure.delay} minutes
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Scheduled: {new Date(flightStatus.departure.scheduled).toLocaleString()}
                        </Typography>
                        {flightStatus.departure.estimated && (
                          <Typography variant="body2" color="text.secondary">
                            Estimated: {new Date(flightStatus.departure.estimated).toLocaleString()}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Claim History
                </Typography>
                <Timeline>
                  {policy.claimHistory.map((claim, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={claim.status === 'success' ? 'success' : 'error'}>
                          {getTimelineIcon(claim.status)}
                        </TimelineDot>
                        {index < policy.claimHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          {claim.status === 'success' ? 'Claim Approved' : 'Claim Rejected'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(claim.timestamp).toLocaleString()}
                        </Typography>
                        {claim.amount && (
                          <Typography variant="body2">
                            Amount: ₽{claim.amount}
                          </Typography>
                        )}
                        {claim.reason && (
                          <Typography variant="body2" color="error">
                            Reason: {claim.reason}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Policy Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {flightStatus?.isDelayed && policy.status === 'active' && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleClaim}
                      disabled={loading}
                    >
                      Claim Compensation
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.print()}
                  >
                    Download Policy
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}

export default PolicyDetails; 