import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Grid, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';

const Members = () => {
  const { showSnackbar } = useSnackbar();
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const [bmiMin, setBmiMin] = useState('');
  const [bmiMax, setBmiMax] = useState('');
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', assignedTrainer: '', workoutPlan: '' });
  const [assignDialog, setAssignDialog] = useState({ open: false, member: null, type: '' });
  const [assignValue, setAssignValue] = useState('');

  const fetchData = async () => {
    const [membersRes, trainersRes, plansRes] = await Promise.all([
      axios.get('/api/members'),
      axios.get('/api/trainers'),
      axios.get('/api/workout-plans'),
    ]);
    setMembers(membersRes.data);
    setTrainers(trainersRes.data);
    setPlans(plansRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  // Filtered members
  const filtered = members.filter(m => {
    const nameMatch = m.user?.name?.toLowerCase().includes(search.toLowerCase());
    const trainerMatch = trainerFilter ? m.assignedTrainer?._id === trainerFilter : true;
    const bmiMatch = (
      (!bmiMin || (m.bmi || 0) >= Number(bmiMin)) &&
      (!bmiMax || (m.bmi || 0) <= Number(bmiMax))
    );
    return nameMatch && trainerMatch && bmiMatch;
  });

  // Handlers
  const handleOpen = (member = null) => {
    setEditMember(member);
    setForm(member ? {
      name: member.user?.name || '',
      email: member.user?.email || '',
      password: '',
      assignedTrainer: member.assignedTrainer?._id || '',
      workoutPlan: member.workoutPlan?._id || '',
    } : { name: '', email: '', password: '', assignedTrainer: '', workoutPlan: '' });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditMember(null); };

  const handleSave = async () => {
    try {
      if (editMember) {
        await axios.put(`/api/members/${editMember._id}`, {
          assignedTrainer: form.assignedTrainer,
          workoutPlan: form.workoutPlan,
        });
        showSnackbar('Member updated', 'success');
      } else {
        await axios.post('/api/members', form);
        showSnackbar('Member added', 'success');
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await axios.delete(`/api/members/${id}`);
      showSnackbar('Member deleted', 'success');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleAssign = async () => {
    try {
      if (assignDialog.type === 'trainer') {
        await axios.post(`/api/members/${assignDialog.member._id}/assign-trainer`, { trainerId: assignValue });
        showSnackbar('Trainer assigned', 'success');
      } else if (assignDialog.type === 'plan') {
        await axios.post(`/api/members/${assignDialog.member._id}/assign-plan`, { planId: assignValue });
        showSnackbar('Plan assigned', 'success');
      }
      setAssignDialog({ open: false, member: null, type: '' });
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Assign failed', 'error');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: p => p.row.user?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: p => p.row.user?.email },
    { field: 'trainer', headerName: 'Trainer', flex: 1, valueGetter: p => p.row.assignedTrainer?.user?.name || '' },
    { field: 'bmi', headerName: 'BMI', flex: 0.5 },
    { field: 'bmiCategory', headerName: 'BMI Category', flex: 0.7 },
    { field: 'plan', headerName: 'Plan', flex: 1, valueGetter: p => p.row.workoutPlan?.name || '' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false, renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit"><IconButton onClick={() => handleOpen(params.row)}><EditIcon /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton></Tooltip>
          <Tooltip title="Assign Trainer"><IconButton onClick={() => { setAssignDialog({ open: true, member: params.row, type: 'trainer' }); setAssignValue(params.row.assignedTrainer?._id || ''); }}><AssignmentIndIcon /></IconButton></Tooltip>
          <Tooltip title="Assign Plan"><IconButton onClick={() => { setAssignDialog({ open: true, member: params.row, type: 'plan' }); setAssignValue(params.row.workoutPlan?._id || ''); }}><AssignmentIndIcon color="secondary" /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Members Management</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}><TextField label="Search Name" value={search} onChange={e => setSearch(e.target.value)} fullWidth /></Grid>
        <Grid item xs={12} md={3}>
          <TextField select label="Trainer" value={trainerFilter} onChange={e => setTrainerFilter(e.target.value)} fullWidth>
            <MenuItem value="">All</MenuItem>
            {trainers.map(t => <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} md={2}><TextField label="BMI Min" value={bmiMin} onChange={e => setBmiMin(e.target.value)} fullWidth /></Grid>
        <Grid item xs={6} md={2}><TextField label="BMI Max" value={bmiMax} onChange={e => setBmiMax(e.target.value)} fullWidth /></Grid>
        <Grid item xs={12} md={2} display="flex" alignItems="center"><Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Member</Button></Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={filtered.map(m => ({ ...m, id: m._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" disabled={!!editMember} />
          <TextField label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth margin="normal" disabled={!!editMember} />
          {!editMember && <TextField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} fullWidth margin="normal" />}
          <TextField select label="Trainer" value={form.assignedTrainer} onChange={e => setForm(f => ({ ...f, assignedTrainer: e.target.value }))} fullWidth margin="normal">
            <MenuItem value="">None</MenuItem>
            {trainers.map(t => <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>)}
          </TextField>
          <TextField select label="Workout Plan" value={form.workoutPlan} onChange={e => setForm(f => ({ ...f, workoutPlan: e.target.value }))} fullWidth margin="normal">
            <MenuItem value="">None</MenuItem>
            {plans.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Assign Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, member: null, type: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Assign {assignDialog.type === 'trainer' ? 'Trainer' : 'Workout Plan'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label={assignDialog.type === 'trainer' ? 'Trainer' : 'Workout Plan'}
            value={assignValue}
            onChange={e => setAssignValue(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">None</MenuItem>
            {(assignDialog.type === 'trainer' ? trainers : plans).map(item => (
              <MenuItem key={item._id} value={item._id}>{assignDialog.type === 'trainer' ? item.user?.name : item.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, member: null, type: '' })}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members; 