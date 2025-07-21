import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Avatar, MenuItem, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const avatars = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
];

const ProfileSettings = () => {
  const { user, setUser } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      avatar: user?.avatar || avatars[0],
      password: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      avatar: Yup.string().required('Required'),
      password: Yup.string(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = { name: values.name, avatar: values.avatar };
        if (values.password) payload.password = values.password;
        const res = await axios.put('/api/user/profile', payload);
        setUser(u => ({ ...u, name: res.data.user.name, avatar: res.data.user.avatar }));
        localStorage.setItem('user', JSON.stringify({ ...user, name: res.data.user.name, avatar: res.data.user.avatar }));
        showSnackbar('Profile updated', 'success');
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Update failed', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h5" mb={2} align="center">Profile Settings</Typography>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar src={formik.values.avatar} sx={{ width: 64, height: 64 }} />
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Avatar"
            name="avatar"
            value={formik.values.avatar}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.avatar && Boolean(formik.errors.avatar)}
            helperText={formik.touched.avatar && formik.errors.avatar}
          >
            {avatars.map(a => (
              <MenuItem key={a} value={a}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={a} sx={{ width: 32, height: 32 }} />
                  {a.split('/').pop()}
                </Box>
              </MenuItem>
            ))}
          </TextField>
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
            Save Changes
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileSettings; 