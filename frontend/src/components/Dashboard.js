import * as React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Current account:', currentAccount);
  }, [currentAccount]);

  if (!currentAccount) {
    console.log('No current account, showing welcome message');
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to Flight Delay Insurance
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please connect your wallet to view your policies and create new ones.
        </Typography>
      </Box>
    );
  }

  console.log('Rendering dashboard with account:', currentAccount.address);
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Flight Insurance Policies
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-policy')}
          sx={{ mt: 2 }}
        >
          Create New Policy
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Policies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No active policies found. Create your first policy to get started!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 