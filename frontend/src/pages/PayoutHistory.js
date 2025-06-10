import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';

function PayoutHistory() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPayouts: 0,
    totalDelays: 0,
    averageDelay: 0,
  });

  useEffect(() => {
    // TODO: Implement actual payout history fetching from the blockchain
    // For now, using mock data
    const mockPayouts = [
      {
        id: 1,
        flightNumber: 'AA123',
        airline: 'American Airlines',
        scheduledArrival: '2024-03-20T12:00:00',
        actualArrival: '2024-03-20T12:45:00',
        delay: 45,
        payout: 0.2,
        status: 'completed',
        timestamp: '2024-03-20T12:46:00',
      },
      {
        id: 2,
        flightNumber: 'DL456',
        airline: 'Delta Airlines',
        scheduledArrival: '2024-03-21T17:00:00',
        actualArrival: '2024-03-21T18:30:00',
        delay: 90,
        payout: 0.4,
        status: 'completed',
        timestamp: '2024-03-21T18:31:00',
      },
    ];

    setPayouts(mockPayouts);

    // Calculate summary statistics
    const totalPayouts = mockPayouts.reduce((sum, p) => sum + p.payout, 0);
    const totalDelays = mockPayouts.length;
    const averageDelay =
      mockPayouts.reduce((sum, p) => sum + p.delay, 0) / totalDelays;

    setSummary({
      totalPayouts,
      totalDelays,
      averageDelay,
    });

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Payout History
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total Payouts</TableCell>
                <TableCell>Total Delayed Flights</TableCell>
                <TableCell>Average Delay</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{summary.totalPayouts.toFixed(2)} SUI</TableCell>
                <TableCell>{summary.totalDelays}</TableCell>
                <TableCell>{summary.averageDelay.toFixed(0)} minutes</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="h6" gutterBottom>
        Payout Details
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Flight</TableCell>
              <TableCell>Airline</TableCell>
              <TableCell>Scheduled Arrival</TableCell>
              <TableCell>Actual Arrival</TableCell>
              <TableCell>Delay</TableCell>
              <TableCell>Payout</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>{payout.flightNumber}</TableCell>
                <TableCell>{payout.airline}</TableCell>
                <TableCell>
                  {new Date(payout.scheduledArrival).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(payout.actualArrival).toLocaleString()}
                </TableCell>
                <TableCell>{payout.delay} minutes</TableCell>
                <TableCell>{payout.payout} SUI</TableCell>
                <TableCell>
                  <Chip
                    label={payout.status}
                    color={payout.status === 'completed' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(payout.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PayoutHistory; 