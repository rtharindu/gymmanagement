import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Grid, IconButton, Tooltip, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';

const WorkoutPlans = () => {
  const { showSnackbar } = useSnackbar();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', duration: '', exercises: [] });
  const [exercise, setExercise] = useState({ name: '', sets: '', reps: '', notes: '' });
  const [assignDialog, setAssignDialog] = useState({ open: false, plan: null });
  const [assignValue, setAssignValue] = useState('');

  const fetchData = async () => {
    const [plansRes, membersRes] = await Promise.all([
      axios.get('/api/workout-plans'),
      axios.get('/api/members'),
    ]);
    setPlans(plansRes.data);
    setMembers(membersRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = plans.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  // Handlers
  const handleOpen = (plan = null) => {
    setEditPlan(plan);
    setForm(plan ? {
      name: plan.name || '',
      description: plan.description || '',
      duration: plan.duration || '',
      exercises: plan.exercises || [],
    } : { name: '', description: '', duration: '', exercises: [] });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditPlan(null); setExercise({ name: '', sets: '', reps: '', notes: '' }); };

  const handleSave = async () => {
    try {
      if (editPlan) {
        await axios.put(`/api/workout-plans/${editPlan._id}`, form);
        showSnackbar('Plan updated', 'success');
      } else {
        await axios.post('/api/workout-plans', form);
        showSnackbar('Plan added', 'success');
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await axios.delete(`/api/workout-plans/${id}`);
      showSnackbar('Plan deleted', 'success');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleAssign = async () => {
    try {
      await axios.post(`/api/workout-plans/${assignDialog.plan._id}/assign-member`, { memberId: assignValue });
      showSnackbar('Member assigned', 'success');
      setAssignDialog({ open: false, plan: null });
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Assign failed', 'error');
    }
  };

  // Exercise handlers
  const handleAddExercise = () => {
    if (!exercise.name) return;
    setForm(f => ({ ...f, exercises: [...f.exercises, exercise] }));
    setExercise({ name: '', sets: '', reps: '', notes: '' });
  };
  const handleRemoveExercise = (idx) => {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));
  };

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'duration', headerName: 'Duration (weeks)', flex: 0.7 },
    { field: 'exercises', headerName: 'Exercises', flex: 1, renderCell: p => (
      <Box>{p.row.exercises?.map((e, i) => <Chip key={i} label={e.name} size="small" sx={{ mr: 0.5 }} />)}</Box>
    ) },
    { field: 'assignedMembers', headerName: 'Assigned Members', flex: 1, renderCell: p => (
      <Box>{p.row.assignedMembers?.map(m => <Chip key={m._id} label={m.user?.name} size="small" sx={{ mr: 0.5 }} />)}</Box>
    ) },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false, renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit"><IconButton onClick={() => handleOpen(params.row)}><EditIcon /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton></Tooltip>
          <Tooltip title="Assign Member"><IconButton onClick={() => { setAssignDialog({ open: true, plan: params.row }); setAssignValue(''); }}><AssignmentIndIcon /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Workout Plans Management</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}><TextField label="Search Name" value={search} onChange={e => setSearch(e.target.value)} fullWidth /></Grid>
        <Grid item xs={12} md={6} display="flex" alignItems="center" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Plan</Button>
        </Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={filtered.map(p => ({ ...p, id: p._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editPlan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Duration (weeks)" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} fullWidth margin="normal" />
          <Typography variant="subtitle1" mt={2}>Exercises</Typography>
          {form.exercises.map((ex, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField value={ex.name} label="Name" size="small" disabled sx={{ width: 120 }} />
              <TextField value={ex.sets} label="Sets" size="small" disabled sx={{ width: 60 }} />
              <TextField value={ex.reps} label="Reps" size="small" disabled sx={{ width: 60 }} />
              <TextField value={ex.notes} label="Notes" size="small" disabled sx={{ width: 120 }} />
              <Button color="error" onClick={() => handleRemoveExercise(idx)}>Remove</Button>
            </Box>
          ))}
          <Box display="flex" gap={1} mt={1}>
            <TextField label="Name" value={exercise.name} onChange={e => setExercise(ex => ({ ...ex, name: e.target.value }))} size="small" />
            <TextField label="Sets" value={exercise.sets} onChange={e => setExercise(ex => ({ ...ex, sets: e.target.value }))} size="small" />
            <TextField label="Reps" value={exercise.reps} onChange={e => setExercise(ex => ({ ...ex, reps: e.target.value }))} size="small" />
            <TextField label="Notes" value={exercise.notes} onChange={e => setExercise(ex => ({ ...ex, notes: e.target.value }))} size="small" />
            <Button onClick={handleAddExercise} variant="outlined">Add</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Assign Member Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, plan: null })} maxWidth="xs" fullWidth>
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
          <Button onClick={() => setAssignDialog({ open: false, plan: null })}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutPlans; 