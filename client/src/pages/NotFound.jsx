import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../utils/AuthContext';

const NotFound = () => {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const handleHome = () => {
    if (user) navigate(`/${user.role}/dashboard`);
    else navigate('/login');
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h2" color="primary" gutterBottom>404</Typography>
      <Typography variant="h5" mb={2}>Page Not Found</Typography>
      <Button variant="contained" color="primary" onClick={handleHome}>Go Home</Button>
    </Box>
  );
};

export default NotFound; 