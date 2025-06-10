import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          ease: "easeOut"
        }}
      >
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </motion.div>
    </Box>
  );
}

export default LoadingScreen; 