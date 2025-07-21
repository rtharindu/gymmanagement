import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, TextField, Grid, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';

const Assignments = () => {
  const { showSnackbar } = useSnackbar();
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selection, setSelection] = useState([]);
  const [assignDialog, setAssignDialog] = useState({ open: false, type: '', value: '' });

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

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: p => p.row.user?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: p => p.row.user?.email },
    { field: 'trainer', headerName: 'Trainer', flex: 1, valueGetter: p => p.row.assignedTrainer?.user?.name || '' },
    { field: 'plan', headerName: 'Plan', flex: 1, valueGetter: p => p.row.workoutPlan?.name || '' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, sortable: false, renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Assign Trainer"><IconButton onClick={() => setAssignDialog({ open: true, type: 'trainer', value: '', member: params.row })}><AssignmentIndIcon /></IconButton></Tooltip>
          <Tooltip title="Assign Plan"><IconButton onClick={() => setAssignDialog({ open: true, type: 'plan', value: '', member: params.row })}><AssignmentIndIcon color="secondary" /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  // Bulk assign
  const handleBulkAssign = async () => {
    if (!assignDialog.value || selection.length === 0) return;
    try {
      for (const id of selection) {
        if (assignDialog.type === 'trainer') {
          await axios.post(`/api/members/${id}/assign-trainer`, { trainerId: assignDialog.value });
        } else if (assignDialog.type === 'plan') {
          await axios.post(`/api/members/${id}/assign-plan`, { planId: assignDialog.value });
        }
      }
      showSnackbar('Bulk assignment successful', 'success');
      setAssignDialog({ open: false, type: '', value: '' });
      setSelection([]);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Bulk assign failed', 'error');
    }
  };

  // Single assign
  const handleSingleAssign = async () => {
    const member = assignDialog.member;
    if (!assignDialog.value || !member) return;
    try {
      if (assignDialog.type === 'trainer') {
        await axios.post(`/api/members/${member._id}/assign-trainer`, { trainerId: assignDialog.value });
      } else if (assignDialog.type === 'plan') {
        await axios.post(`/api/members/${member._id}/assign-plan`, { planId: assignDialog.value });
      }
      showSnackbar('Assignment successful', 'success');
      setAssignDialog({ open: false, type: '', value: '', member: null });
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Assign failed', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Assignments</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            disabled={selection.length === 0}
            onClick={() => setAssignDialog({ open: true, type: 'trainer', value: '' })}
            sx={{ mr: 2 }}
          >
            Bulk Assign Trainer
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={selection.length === 0}
            onClick={() => setAssignDialog({ open: true, type: 'plan', value: '' })}
          >
            Bulk Assign Plan
          </Button>
        </Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={members.map(m => ({ ...m, id: m._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        checkboxSelection
        onSelectionModelChange={setSelection}
        selectionModel={selection}
        disableSelectionOnClick
      />
      {/* Assign Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, type: '', value: '', member: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Assign {assignDialog.type === 'trainer' ? 'Trainer' : 'Plan'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label={assignDialog.type === 'trainer' ? 'Trainer' : 'Plan'}
            value={assignDialog.value}
            onChange={e => setAssignDialog(d => ({ ...d, value: e.target.value }))}
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
          <Button onClick={() => setAssignDialog({ open: false, type: '', value: '', member: null })}>Cancel</Button>
          {assignDialog.member ? (
            <Button onClick={handleSingleAssign} variant="contained">Assign</Button>
          ) : (
            <Button onClick={handleBulkAssign} variant="contained">Bulk Assign</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments; 