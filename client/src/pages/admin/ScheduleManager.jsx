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
import dayjs from 'dayjs';

const ScheduleManager = () => {
  const { showSnackbar } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ member: '', trainer: '', date: '', time: '' });
  const [filters, setFilters] = useState({ member: '', trainer: '', date: '' });

  const fetchData = async () => {
    const [sessionsRes, membersRes, trainersRes] = await Promise.all([
      axios.get('/api/schedules'),
      axios.get('/api/members'),
      axios.get('/api/trainers'),
    ]);
    setSessions(sessionsRes.data);
    setMembers(membersRes.data);
    setTrainers(trainersRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  // Filtered sessions
  const filtered = sessions.filter(s => {
    const memberMatch = filters.member ? s.member?._id === filters.member : true;
    const trainerMatch = filters.trainer ? s.trainer?._id === filters.trainer : true;
    const dateMatch = filters.date ? dayjs(s.date).format('YYYY-MM-DD') === filters.date : true;
    return memberMatch && trainerMatch && dateMatch;
  });

  // Handlers
  const handleOpen = () => {
    setForm({ member: '', trainer: '', date: '', time: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      await axios.post('/api/schedules', form);
      showSnackbar('Session booked', 'success');
      setOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Booking failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await axios.delete(`/api/schedules/${id}`);
      showSnackbar('Session cancelled', 'success');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Cancel failed', 'error');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'member', headerName: 'Member', flex: 1, valueGetter: p => p.row.member?.user?.name },
    { field: 'trainer', headerName: 'Trainer', flex: 1, valueGetter: p => p.row.trainer?.user?.name },
    { field: 'date', headerName: 'Date', flex: 1, valueGetter: p => dayjs(p.row.date).format('YYYY-MM-DD') },
    { field: 'time', headerName: 'Time', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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
      <Typography variant="h4" mb={3}>Schedule Manager</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}>
          <TextField select label="Member" value={filters.member} onChange={e => setFilters(f => ({ ...f, member: e.target.value }))} fullWidth>
            <MenuItem value="">All</MenuItem>
            {members.map(m => <MenuItem key={m._id} value={m._id}>{m.user?.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField select label="Trainer" value={filters.trainer} onChange={e => setFilters(f => ({ ...f, trainer: e.target.value }))} fullWidth>
            <MenuItem value="">All</MenuItem>
            {trainers.map(t => <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField type="date" label="Date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} md={3} display="flex" alignItems="center" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Book Session</Button>
        </Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={filtered.map(s => ({ ...s, id: s._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
      {/* Book Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Book Session</DialogTitle>
        <DialogContent>
          <TextField select label="Member" value={form.member} onChange={e => setForm(f => ({ ...f, member: e.target.value }))} fullWidth margin="normal">
            <MenuItem value="">Select</MenuItem>
            {members.map(m => <MenuItem key={m._id} value={m._id}>{m.user?.name}</MenuItem>)}
          </TextField>
          <TextField select label="Trainer" value={form.trainer} onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))} fullWidth margin="normal">
            <MenuItem value="">Select</MenuItem>
            {trainers.map(t => <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Time (e.g. 10:00)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Book</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleManager; 