import React from 'react';
import { Box, Button, TextField, Typography, Paper, Link, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const Login = () => {
  const { setUser } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await axios.post('/api/auth/login', values);
        setUser({ ...res.data.user, token: res.data.token });
        localStorage.setItem('user', JSON.stringify({ ...res.data.user, token: res.data.token }));
        showSnackbar('Login successful', 'success');
        navigate(`/${res.data.user.role}/dashboard`);
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Login failed', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h5" mb={2} align="center">Login</Typography>
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
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            autoComplete="current-password"
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
            Login
          </Button>
        </form>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Link component={RouterLink} to="/register" variant="body2">Register</Link>
          <Link component={RouterLink} to="/reset-password" variant="body2">Forgot password?</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 