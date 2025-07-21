import React from 'react';
import { Box, Button, TextField, Typography, Paper, Link, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.post('/api/auth/reset-password', values);
        showSnackbar('Password reset successful', 'success');
        navigate('/login');
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Reset failed', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h5" mb={2} align="center">Reset Password</Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            autoComplete="email"
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1 }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} />}
          >
            Reset Password
          </Button>
        </form>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2">Back to Login</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword; 