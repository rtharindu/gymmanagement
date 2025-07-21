import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const MyMembers = () => {
  const { user } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/members?trainer=${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMembers(res.data);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to load members', 'error');
    }
  };

  useEffect(() => { fetchData(); }, [user.id]);

  const filtered = members.filter(m => m.userId?.name?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: p => p.row.userId?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: p => p.row.userId?.email },
    { field: 'bmi', headerName: 'BMI', flex: 0.7 },
    { field: 'bmiCategory', headerName: 'BMI Category', flex: 1 },
    { field: 'plan', headerName: 'Plan', flex: 1, valueGetter: p => p.row.workoutPlanId?.title || '' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>My Members</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}><TextField label="Search Name" value={search} onChange={e => setSearch(e.target.value)} fullWidth /></Grid>
      </Grid>
      <DataGrid
        autoHeight
        rows={filtered.map(m => ({ ...m, id: m._id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
      />
    </Box>
  );
};

export default MyMembers;