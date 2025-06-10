import React from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { 
  Container, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';

function MyPolicies() {
  const { currentAccount } = useWalletKit();

  if (!currentAccount) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Policies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please connect your wallet to view your policies.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Policies
        </Typography>
        <Paper elevation={3}>
          <List>
            <ListItem>
              <ListItemText 
                primary="No policies found"
                secondary="Purchase your first policy to get started."
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default MyPolicies; 