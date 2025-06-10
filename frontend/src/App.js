import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FlightInsurance from './pages/FlightInsurance';
import MyPolicies from './pages/MyPolicies';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletKitProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/flight-insurance" element={<FlightInsurance />} />
                <Route path="/my-policies" element={<MyPolicies />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WalletKitProvider>
    </ThemeProvider>
  );
}

export default App; 