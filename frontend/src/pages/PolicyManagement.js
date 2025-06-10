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
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function PolicyManagement() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual policy fetching from the blockchain
    // For now, using mock data
    const mockPolicies = [
      {
        id: 1,
        flightNumber: 'AA123',
        airline: 'American Airlines',
        departure: '2024-03-20T10:00:00',
        arrival: '2024-03-20T12:00:00',
        delayThreshold: 30,
        premium: 0.1,
        payout: 0.2,
        status: 'active',
      },
      {
        id: 2,
        flightNumber: 'DL456',
        airline: 'Delta Airlines',
        departure: '2024-03-21T15:00:00',
        arrival: '2024-03-21T17:00:00',
        delayThreshold: 60,
        premium: 0.2,
        payout: 0.4,
        status: 'paid',
      },
    ];
    setPolicies(mockPolicies);
    setLoading(false);
  }, []);

  const columns = [
    { field: 'flightNumber', headerName: 'Flight', width: 130 },
    { field: 'airline', headerName: 'Airline', width: 150 },
    {
      field: 'departure',
      headerName: 'Departure',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'arrival',
      headerName: 'Arrival',
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'delayThreshold',
      headerName: 'Delay Threshold',
      width: 130,
      valueFormatter: (params) => `${params.value} min`,
    },
    {
      field: 'premium',
      headerName: 'Premium',
      width: 100,
      valueFormatter: (params) => `${params.value} SUI`,
    },
    {
      field: 'payout',
      headerName: 'Payout',
      width: 100,
      valueFormatter: (params) => `${params.value} SUI`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'active'
              ? 'success'
              : params.value === 'paid'
              ? 'primary'
              : 'default'
          }
        />
      ),
    },
  ];

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
        My Insurance Policies
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={policies}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
          disableSelectionOnClick
        />
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Policy Summary
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total Policies</TableCell>
                <TableCell>Active Policies</TableCell>
                <TableCell>Total Premiums</TableCell>
                <TableCell>Total Payouts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{policies.length}</TableCell>
                <TableCell>
                  {policies.filter((p) => p.status === 'active').length}
                </TableCell>
                <TableCell>
                  {policies.reduce((sum, p) => sum + p.premium, 0).toFixed(2)} SUI
                </TableCell>
                <TableCell>
                  {policies
                    .filter((p) => p.status === 'paid')
                    .reduce((sum, p) => sum + p.payout, 0)
                    .toFixed(2)}{' '}
                  SUI
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default PolicyManagement; 