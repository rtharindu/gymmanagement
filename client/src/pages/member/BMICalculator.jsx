import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const BMICalculator = () => {
  const { user } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  const handleCalculate = async () => {
    if (!height || !weight) return;
    try {
      const res = await axios.post('http://localhost:5000/api/BMI/calculate', {
        memberId: user.id,
        height: Number(height),
        weight: Number(weight),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBmi(res.data.bmi);
      setCategory(res.data.category);
      showSnackbar('BMI calculated and saved', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Calculation failed', 'error');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>BMI Calculator</Typography>
        <TextField
          label="Height (cm)"
          value={height}
          onChange={e => setHeight(e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <TextField
          label="Weight (kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <Button variant="contained" onClick={handleCalculate} sx={{ mt: 2 }} fullWidth>Calculate BMI</Button>
        {bmi && (
          <Box mt={3}>
            <Typography variant="h6">BMI: {bmi.toFixed(1)}</Typography>
            <Typography color="text.secondary">Category: {category}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BMICalculator;