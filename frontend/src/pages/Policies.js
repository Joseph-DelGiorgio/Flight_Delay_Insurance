import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Chip,
  CardActions,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useWalletKit } from '@mysten/wallet-kit';
import { contractService } from '../services/contractService';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

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

function PolicyCard({ policy, onClaim, onViewDetails, loading }) {
  const getStatusChip = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'claimed':
        return <Chip label="Claimed" color="info" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="warning" size="small" />;
      case 'expired':
        return <Chip label="Expired" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div variants={itemVariants} style={{ height: '100%' }}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                {policy.airline} {policy.flightNumber}
              </Typography>
              {getStatusChip(policy.status)}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
              <FlightTakeoffIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {policy.departureDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
              <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Coverage: {policy.coverageAmount} SUI
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => onViewDetails(policy.id)}>View Details</Button>
            {policy.status.toLowerCase() === 'active' && (
              <Button size="small" onClick={() => onClaim(policy.id)} disabled={loading}>
                Claim
              </Button>
            )}
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  );
}

const Policies = () => {
  const navigate = useNavigate();
  const { currentAccount, signAndExecuteTransaction } = useWalletKit();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPolicies = useCallback(async () => {
    if (!currentAccount) {
      setError('Please connect your wallet to view your policies');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await contractService.getPolicies(currentAccount.address);
      const parsedPolicies = result.map(policy => ({
        id: policy[0],
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
  }, [currentAccount]);

  useEffect(() => {
    if (currentAccount) {
      fetchPolicies();
    }
  }, [currentAccount, fetchPolicies]);

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
          <Grid container spacing={3}>
            {policies.map((policy) => (
              <PolicyCard 
                key={policy.id} 
                policy={policy} 
                onClaim={handleClaim}
                onViewDetails={handleViewDetails}
                loading={loading}
              />
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Policies; 