import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { fetchPolicies, claimPolicy } from '../utils/blockchain';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      loadPolicy();
    }
  }, [currentAccount, id]);

  const loadPolicy = async () => {
    try {
      const policies = await fetchPolicies(currentAccount.address);
      const foundPolicy = policies.find(p => p.id === id);
      if (foundPolicy) {
        setPolicy(foundPolicy);
      } else {
        setError('Policy not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    setClaimLoading(true);
    setError('');

    try {
      await claimPolicy(currentAccount.address, signAndExecuteTransaction, id);
      await loadPolicy(); // Reload policy to update status
    } catch (err) {
      setError(err.message || 'Failed to claim policy');
    } finally {
      setClaimLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please connect your wallet to view policy details
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!policy) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Policy not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Policy Details
          </Typography>
          <Chip
            label={policy.status}
            color={
              policy.status === 'ACTIVE'
                ? 'success'
                : policy.status === 'CLAIMED'
                ? 'warning'
                : 'error'
            }
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FlightTakeoffIcon color="action" />
              <Typography variant="body1">
                From: {policy.departureAirport}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FlightLandIcon color="action" />
              <Typography variant="body1">
                To: {policy.arrivalAirport}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon color="action" />
              <Typography variant="body1">
                Departure: {policy.departureTime.toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AttachMoneyIcon color="action" />
              <Typography variant="body1">
                Coverage: {policy.coverageAmount} SUI
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Flight Information
            </Typography>
            <Typography variant="body1">
              Airline: {policy.airline}
            </Typography>
            <Typography variant="body1">
              Flight Number: {policy.flightNumber}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              {policy.status === 'ACTIVE' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClaim}
                  disabled={claimLoading}
                  startIcon={claimLoading && <CircularProgress size={20} />}
                >
                  Claim Policy
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PolicyDetails; 