import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
  Paper,
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportIcon from '@mui/icons-material/Support';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const hoverVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

function FeatureCard({ icon, title, description, delay, onInfoClick }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover="hover"
    >
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible'
        }}
        component={motion.div}
        variants={hoverVariants}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
        <Tooltip title="Learn more">
          <IconButton 
            onClick={() => onInfoClick(title)}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8
            }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Card>
    </motion.div>
  );
}

function InfoDialog({ open, title, onClose }) {
  const infoContent = {
    'Automated Claims': 'Our smart contracts automatically verify flight delays and process claims without any manual intervention. Once a delay is confirmed, you receive your payout instantly.',
    'Transparent': 'Every policy and claim is recorded on the blockchain, providing complete transparency and immutability. You can verify all transactions at any time.',
    'Instant Payouts': 'No waiting periods or paperwork. Get compensated within minutes of a confirmed delay through our automated system.',
    'Easy to Use': 'Simple three-step process to purchase insurance. Just enter your flight details, choose coverage, and confirm payment.',
    'Competitive Rates': 'Our blockchain-based system reduces overhead costs, allowing us to offer better rates than traditional insurance providers.',
    '24/7 Support': 'Our dedicated support team is available around the clock to assist you with any questions or concerns about your policy.'
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px' },
              maxHeight: '80vh',
              overflow: 'auto',
              zIndex: 1000,
              p: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{title}</Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {infoContent[title]}
            </Typography>
          </Paper>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
            onClick={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedInfo, setSelectedInfo] = useState(null);

  const handleInfoClick = (title) => {
    setSelectedInfo(title);
  };

  const handleCloseInfo = () => {
    setSelectedInfo(null);
  };

  return (
    <Box>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            py: { xs: 6, md: 8 },
            mb: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />
          <Container maxWidth="md">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                align="center"
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Flight Delay Insurance
              </Typography>
              <Typography 
                variant="h5" 
                align="center" 
                paragraph 
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Protect your travel plans with blockchain-powered insurance that pays out automatically
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/flight-insurance"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom 
            sx={{ mb: 6 }}
          >
            Why Choose Our Insurance?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<FlightTakeoffIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="Automated Claims"
                description="No paperwork needed. Get paid automatically when your flight is delayed."
                delay={0}
                onInfoClick={handleInfoClick}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="Transparent"
                description="All policies and payouts are recorded on the blockchain for complete transparency."
                delay={0.2}
                onInfoClick={handleInfoClick}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="Instant Payouts"
                description="Receive compensation within minutes of a confirmed delay."
                delay={0.4}
                onInfoClick={handleInfoClick}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="Easy to Use"
                description="Simple process to purchase insurance and manage your policies."
                delay={0.6}
                onInfoClick={handleInfoClick}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="Competitive Rates"
                description="Get the best coverage at competitive prices with our blockchain-powered platform."
                delay={0.8}
                onInfoClick={handleInfoClick}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                title="24/7 Support"
                description="Our team is always available to help you with any questions or concerns."
                delay={1}
                onInfoClick={handleInfoClick}
              />
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Stack spacing={4} alignItems="center">
              <Typography 
                variant="h4" 
                component="h2" 
                align="center"
                sx={{ 
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}
              >
                Ready to protect your next flight?
              </Typography>
              <Button
                component={RouterLink}
                to="/flight-insurance"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Get Insurance Now
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <InfoDialog 
        open={!!selectedInfo} 
        title={selectedInfo} 
        onClose={handleCloseInfo} 
      />
    </Box>
  );
}

export default Home; 