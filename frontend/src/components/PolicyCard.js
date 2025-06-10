import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const PolicyCard = ({ policy }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'claimed':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            Policy #{policy.id}
          </Typography>
          <Chip
            label={policy.status}
            color={getStatusColor(policy.status)}
            size="small"
          />
        </Box>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightTakeoffIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              From: {policy.departureAirport}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightLandIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              To: {policy.arrivalAirport}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Departure: {new Date(policy.departureTime).toLocaleString()}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Coverage: {policy.coverageAmount} SUI
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Premium: {policy.premium} SUI
          </Typography>
        </Stack>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate(`/policy/${policy.id}`)}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default PolicyCard; 