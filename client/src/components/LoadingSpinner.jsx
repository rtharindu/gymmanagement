import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message }) => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, background: 'rgba(255,255,255,0.6)' }}>
    <CircularProgress size={60} thickness={5} color="primary" />
    {message && <Typography mt={2}>{message}</Typography>}
  </Box>
);

export default LoadingSpinner; 