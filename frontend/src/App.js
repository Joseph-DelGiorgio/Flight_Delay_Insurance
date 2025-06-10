import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { WalletKitProvider } from '@mysten/wallet-kit';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import { lazy } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Deep blue for trust and professionalism
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#00897b', // Teal for a modern, tech feel
      light: '#4db6ac',
      dark: '#00796b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const Navbar = lazy(() => import('./components/Navbar'));
const Home = lazy(() => import('./pages/Home'));
const FlightInsurance = lazy(() => import('./pages/FlightInsurance'));
const Policies = lazy(() => import('./pages/Policies'));
const PolicyDetails = lazy(() => import('./pages/PolicyDetails'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WalletKitProvider>
          <Router>
            <React.Suspense fallback={<LoadingScreen />}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/flight-insurance" element={<FlightInsurance />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/policies/:id" element={<PolicyDetails />} />
              </Routes>
            </React.Suspense>
          </Router>
        </WalletKitProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 