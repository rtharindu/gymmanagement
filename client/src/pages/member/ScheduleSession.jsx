import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, TextField, Grid, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const ScheduleSession = () => {
  const { user } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ trainerId: '', startTime: '', title: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!user?.id || !localStorage.getItem('token')) {
      console.error('No user ID or token found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Token:', localStorage.getItem('token')); // Debug token
    try {
      const [sessionsRes, trainersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/schedule/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get(`http://localhost:5000/api/trainers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      setSessions(sessionsRes.data);
      setTrainers(trainersRes.data);
    } catch (err) {
      console.error('Axios error:', err.message, err.config?.url, err.response?.status);
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        showSnackbar(err.response?.data?.message || 'Failed to load data', 'error');
      }
    }
  };

  useEffect(() => { fetchData(); }, [user?.id, navigate]);

  const handleOpen = () => {
    setForm({ trainerId: '', startTime: '', title: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/schedule', {
        memberId: user.id,
        trainerId: form.trainerId,
        startTime: new Date(`${form.date}T${form.time}:00`).toISOString(),
        endTime: new Date(new Date(`${form.date}T${form.time}:00`).getTime() + 60 * 60 * 1000).toISOString(),
        title: form.title || 'Training Session',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      showSnackbar('Session booked', 'success');
      setOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        showSnackbar(err.response?.data?.message || 'Booking failed', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      showSnackbar('Session cancelled', 'success');
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        showSnackbar(err.response?.data?.message || 'Cancel failed', 'error');
      }
    }
  };

  const columns = [
    { field: 'trainer', headerName: 'Trainer', flex: 1, valueGetter: p => p.row.trainerId?.userId?.name },
    { field: 'date', headerName: 'Date', flex: 1, valueGetter: p => dayjs(p.row.startTime).format('YYYY-MM-DD') },
    { field: 'time', headerName: 'Time', flex: 1, valueGetter: p => dayjs(p.row.startTime).format('HH:mm') },
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false, renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Cancel"><IconButton onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Schedule Session</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6} display="flex" alignItems="center">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Book Session</Button>
        </Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={sessions.map(s => ({ ...s, id: s._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Book Session</DialogTitle>
        <DialogContent>
          <TextField select label="Trainer" value={form.trainerId} onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))} fullWidth margin="normal">
            <MenuItem value="">Select</MenuItem>
            {trainers.map(t => <MenuItem key={t._id} value={t._id}>{t.userId?.name}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Time (e.g. 10:00)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Book</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleSession;