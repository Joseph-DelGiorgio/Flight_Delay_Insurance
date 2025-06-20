import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { useWalletKit } from '@mysten/wallet-kit';
import { contractService } from '../services/contractService';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';

function PolicyDetails() {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { currentAccount, signAndExecuteTransaction } = useWalletKit();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPolicyDetails = useCallback(async () => {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    if (currentAccount) {
      fetchPolicyDetails();
    } else {
      setError('Please connect your wallet to view policy details');
      setLoading(false);
    }
  }, [currentAccount, policyId, fetchPolicyDetails]);

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
          
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Policy History
          </Typography>
          <Timeline position="alternate">
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <EventIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6" component="span">
                  Policy Created
                </Typography>
                <Typography>{new Date(policy.departureDate).toLocaleDateString()}</Typography>
              </TimelineContent>
            </TimelineItem>

            {policy.status.toLowerCase() !== 'active' && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color={
                    policy.status.toLowerCase() === 'claimed' ? 'success' : 
                    policy.status.toLowerCase() === 'rejected' ? 'error' : 
                    'grey'
                  }>
                    {policy.status.toLowerCase() === 'claimed' ? <PaidIcon /> : 
                     policy.status.toLowerCase() === 'rejected' ? <CancelIcon /> : 
                     <CheckCircleIcon />}
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    Policy Resolved
                  </Typography>
                  <Typography>Status: {policy.status}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}

            {policy.status.toLowerCase() === 'active' && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="grey">
                    <HourglassEmptyIcon />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    Pending Resolution
                  </Typography>
                  <Typography>Awaiting flight completion</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>

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