import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box
} from '@mui/material';

function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Flight Delay Insurance
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Protect your travel plans with our blockchain-powered flight delay insurance.
        </Typography>
        <Button
          component={RouterLink}
          to="/flight-insurance"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}

export default Home; 