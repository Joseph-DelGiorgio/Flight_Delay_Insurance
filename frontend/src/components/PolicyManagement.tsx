import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import {
    FlightTakeoff,
    FlightLand,
    AccessTime,
    AttachMoney,
    Cancel,
    CheckCircle,
    Error,
    Info
} from '@mui/icons-material';
import { useWallet } from '@suiet/wallet-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import { formatDistanceToNow } from 'date-fns';

interface Policy {
    id: string;
    flightNumber: string;
    scheduledDeparture: number;
    scheduledArrival: number;
    delayThreshold: number;
    premium: number;
    payout: number;
    status: number;
    createdAt: number;
    lastUpdated: number;
}

const PolicyManagement: React.FC = () => {
    const wallet = useWallet();
    const suiClient = useSuiClient();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (wallet.connected) {
            fetchPolicies();
        }
    }, [wallet.connected]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            setError(null);
            // TODO: Implement actual policy fetching from Sui blockchain
            // This is mock data for now
            const mockPolicies: Policy[] = [
                {
                    id: '1',
                    flightNumber: 'AA123',
                    scheduledDeparture: Date.now() + 3600000,
                    scheduledArrival: Date.now() + 7200000,
                    delayThreshold: 60,
                    premium: 0.1,
                    payout: 1.0,
                    status: 0,
                    createdAt: Date.now() - 3600000,
                    lastUpdated: Date.now() - 3600000
                }
            ];
            setPolicies(mockPolicies);
        } catch (err) {
            setError('Failed to fetch policies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPolicy = async () => {
        if (!selectedPolicy) return;

        try {
            setCancelLoading(true);
            // TODO: Implement actual policy cancellation on Sui blockchain
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            setPolicies(policies.filter(p => p.id !== selectedPolicy.id));
            setCancelDialogOpen(false);
            setSelectedPolicy(null);
        } catch (err) {
            setError('Failed to cancel policy');
            console.error(err);
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0:
                return { label: 'Active', color: 'success', icon: <CheckCircle /> };
            case 1:
                return { label: 'Paid Out', color: 'info', icon: <AttachMoney /> };
            case 2:
                return { label: 'Expired', color: 'error', icon: <Error /> };
            case 3:
                return { label: 'Cancelled', color: 'default', icon: <Cancel /> };
            default:
                return { label: 'Unknown', color: 'default', icon: <Info /> };
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatTimeAgo = (timestamp: number) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (!wallet.connected) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Please connect your wallet to view your policies
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Your Flight Insurance Policies
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {policies.map((policy) => {
                    const statusInfo = getStatusInfo(policy.status);
                    return (
                        <Grid item xs={12} key={policy.id}>
                            <Paper sx={{ p: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                            Flight {policy.flightNumber}
                                        </Typography>
                                        <Timeline>
                                            <TimelineItem>
                                                <TimelineSeparator>
                                                    <TimelineDot color="primary">
                                                        <FlightTakeoff />
                                                    </TimelineDot>
                                                    <TimelineConnector />
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Departure: {formatTime(policy.scheduledDeparture)}
                                                    </Typography>
                                                </TimelineContent>
                                            </TimelineItem>
                                            <TimelineItem>
                                                <TimelineSeparator>
                                                    <TimelineDot color="primary">
                                                        <FlightLand />
                                                    </TimelineDot>
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Arrival: {formatTime(policy.scheduledArrival)}
                                                    </Typography>
                                                </TimelineContent>
                                            </TimelineItem>
                                        </Timeline>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTime />
                                                <Typography>
                                                    Delay Threshold: {policy.delayThreshold} minutes
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AttachMoney />
                                                <Typography>
                                                    Premium: {policy.premium} SUI
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AttachMoney />
                                                <Typography>
                                                    Payout: {policy.payout} SUI
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {statusInfo.icon}
                                                <Chip
                                                    label={statusInfo.label}
                                                    color={statusInfo.color as any}
                                                    size="small"
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Created {formatTimeAgo(policy.createdAt)}
                                            </Typography>
                                            {policy.status === 0 && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Cancel />}
                                                    onClick={() => {
                                                        setSelectedPolicy(policy);
                                                        setCancelDialogOpen(true);
                                                    }}
                                                >
                                                    Cancel Policy
                                                </Button>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Cancel Policy</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to cancel this policy? You will receive a partial refund of 80% of the premium.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Policy</Button>
                    <Button
                        onClick={handleCancelPolicy}
                        color="error"
                        disabled={cancelLoading}
                    >
                        {cancelLoading ? <CircularProgress size={24} /> : 'Yes, Cancel Policy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PolicyManagement; 