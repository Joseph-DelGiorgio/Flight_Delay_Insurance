import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container
} from '@mui/material';
import { ConnectButton } from '@mysten/wallet-kit';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Flight Delay Insurance
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/flight-insurance"
            >
              Buy Insurance
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/policies"
            >
              My Policies
            </Button>
            <ConnectButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 