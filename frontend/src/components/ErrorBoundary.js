import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                maxWidth: 600,
                textAlign: 'center',
                bgcolor: 'background.paper'
              }}
            >
              <ErrorOutlineIcon
                color="error"
                sx={{ fontSize: 60, mb: 2 }}
              />
              <Typography variant="h4" component="h1" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{ mr: 2 }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </Box>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mt: 4, textAlign: 'left' }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Error Details (Development Only):
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 