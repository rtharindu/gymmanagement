import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Grid, IconButton, Tooltip, Chip, List, ListItem, ListItemText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';

const Trainers = () => {
  const { showSnackbar } = useSnackbar();
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [assignDialog, setAssignDialog] = useState({ open: false, trainer: null });
  const [assignValue, setAssignValue] = useState('');
  const [availabilityDialog, setAvailabilityDialog] = useState({ open: false, trainer: null });
  const [availability, setAvailability] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  const fetchData = async () => {
    const [trainersRes, membersRes] = await Promise.all([
      axios.get('/api/trainers'),
      axios.get('/api/members'),
    ]);
    setTrainers(trainersRes.data);
    setMembers(membersRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = trainers.filter(t => t.user?.name?.toLowerCase().includes(search.toLowerCase()));

  // Handlers
  const handleOpen = (trainer = null) => {
    setEditTrainer(trainer);
    setForm(trainer ? {
      name: trainer.user?.name || '',
      email: trainer.user?.email || '',
      password: '',
    } : { name: '', email: '', password: '' });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditTrainer(null); };

  const handleSave = async () => {
    try {
      if (editTrainer) {
        // Only availability can be updated here
        showSnackbar('Edit trainer info not supported. Use availability dialog.', 'info');
      } else {
        await axios.post('/api/trainers', form);
        showSnackbar('Trainer added', 'success');
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trainer?')) return;
    try {
      await axios.delete(`/api/trainers/${id}`);
      showSnackbar('Trainer deleted', 'success');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleAssign = async () => {
    try {
      await axios.post(`/api/trainers/${assignDialog.trainer._id}/assign-member`, { memberId: assignValue });
      showSnackbar('Member assigned', 'success');
      setAssignDialog({ open: false, trainer: null });
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Assign failed', 'error');
    }
  };

  // Availability handlers
  const handleOpenAvailability = (trainer) => {
    setAvailabilityDialog({ open: true, trainer });
    setAvailability(trainer.availability || []);
    setNewDate('');
    setNewSlot('');
  };
  const handleAddSlot = () => {
    if (!newDate || !newSlot) return;
    const idx = availability.findIndex(a => a.date === newDate);
    if (idx >= 0) {
      availability[idx].slots.push(newSlot);
      setAvailability([...availability]);
    } else {
      setAvailability([...availability, { date: newDate, slots: [newSlot] }]);
    }
    setNewSlot('');
  };
  const handleSaveAvailability = async () => {
    try {
      await axios.put(`/api/trainers/${availabilityDialog.trainer._id}`, { availability });
      showSnackbar('Availability updated', 'success');
      setAvailabilityDialog({ open: false, trainer: null });
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: p => p.row.user?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: p => p.row.user?.email },
    { field: 'members', headerName: 'Members', flex: 1, renderCell: p => (
      <Box>{p.row.members?.map(m => <Chip key={m._id} label={m.user?.name} size="small" sx={{ mr: 0.5 }} />)}</Box>
    ) },
    { field: 'availability', headerName: 'Availability', flex: 1, renderCell: p => (
      <Button size="small" startIcon={<CalendarMonthIcon />} onClick={() => handleOpenAvailability(p.row)}>View</Button>
    ) },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false, renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Assign Member"><IconButton onClick={() => { setAssignDialog({ open: true, trainer: params.row }); setAssignValue(''); }}><PeopleIcon /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Trainers Management</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}><TextField label="Search Name" value={search} onChange={e => setSearch(e.target.value)} fullWidth /></Grid>
        <Grid item xs={12} md={8} display="flex" alignItems="center" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Trainer</Button>
        </Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={filtered.map(t => ({ ...t, id: t._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
      {/* Add Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editTrainer ? 'Edit Trainer' : 'Add Trainer'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" disabled={!!editTrainer} />
          <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth margin="normal" disabled={!!editTrainer} />
          {!editTrainer && <TextField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} fullWidth margin="normal" />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Assign Member Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, trainer: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Member</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Member"
            value={assignValue}
            onChange={e => setAssignValue(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">None</MenuItem>
            {members.map(m => <MenuItem key={m._id} value={m._id}>{m.user?.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, trainer: null })}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
      {/* Availability Dialog */}
      <Dialog open={availabilityDialog.open} onClose={() => setAvailabilityDialog({ open: false, trainer: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Availability</DialogTitle>
        <DialogContent>
          <List>
            {availability.map((a, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={a.date}
                  secondary={a.slots.join(', ')}
                />
              </ListItem>
            ))}
          </List>
          <Box display="flex" gap={2} mt={2}>
            <TextField label="Date (YYYY-MM-DD)" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <TextField label="Time Slot (e.g. 10:00)" value={newSlot} onChange={e => setNewSlot(e.target.value)} />
            <Button onClick={handleAddSlot} variant="outlined">Add Slot</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityDialog({ open: false, trainer: null })}>Cancel</Button>
          <Button onClick={handleSaveAvailability} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Trainers; 