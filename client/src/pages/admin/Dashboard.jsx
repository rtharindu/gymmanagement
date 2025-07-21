import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Stack, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const metricCards = [
  {
    label: 'Total Members',
    icon: <PeopleIcon fontSize="large" />, color: '#1976d2',
    key: 'members',
  },
  {
    label: 'Total Trainers',
    icon: <FitnessCenterIcon fontSize="large" />, color: '#00b8d9',
    key: 'trainers',
  },
  {
    label: 'Total Sessions',
    icon: <CalendarMonthIcon fontSize="large" />, color: '#43a047',
    key: 'sessions',
  },
];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ members: 0, trainers: 0, sessions: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentTrainers, setRecentTrainers] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [membersRes, trainersRes, sessionsRes] = await Promise.all([
        axios.get('/api/members'),
        axios.get('/api/trainers'),
        axios.get('/api/schedules'),
      ]);
      setMetrics({
        members: membersRes.data.length,
        trainers: trainersRes.data.length,
        sessions: sessionsRes.data.length,
      });
      setRecentMembers(membersRes.data.slice(-5).reverse());
      setRecentTrainers(trainersRes.data.slice(-5).reverse());
      setRecentSessions(sessionsRes.data.slice(-5).reverse());
      setLoading(false);
    };
    fetchData();
  }, []);

  const gridProps = {
    autoHeight: true,
    pageSize: 5,
    rowsPerPageOptions: [5],
    disableSelectionOnClick: true,
    sx: { borderRadius: 2, background: '#fff' },
    sortingOrder: ['asc', 'desc'],
    components: {
      NoRowsOverlay: () => <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No data available</Box>,
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Admin Dashboard</Typography>
      {loading && <LoadingSpinner message="Loading dashboard..." />}
      <Grid container spacing={3} mb={2}>
        {metricCards.map(card => (
          <Grid item xs={12} md={4} key={card.key}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Avatar sx={{ bgcolor: card.color, width: 56, height: 56, mr: 2 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h4" color="text.primary">{metrics[card.key]}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/members')}>Add Member</Button>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => navigate('/admin/trainers')}>Add Trainer</Button>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => navigate('/admin/workout-plans')}>Add Workout Plan</Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" mb={1}>Recent Members</Typography>
          <DataGrid
            {...gridProps}
            rows={recentMembers.map(m => ({ id: m._id, name: m.user?.name, email: m.user?.email }))}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1, sortable: true },
              { field: 'email', headerName: 'Email', flex: 1, sortable: true },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" mb={1}>Recent Trainers</Typography>
          <DataGrid
            {...gridProps}
            rows={recentTrainers.map(t => ({ id: t._id, name: t.user?.name, email: t.user?.email }))}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1, sortable: true },
              { field: 'email', headerName: 'Email', flex: 1, sortable: true },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" mb={1}>Recent Sessions</Typography>
          <DataGrid
            {...gridProps}
            rows={recentSessions.map(s => ({ id: s._id, member: s.member?.user?.name, trainer: s.trainer?.user?.name, date: s.date?.slice(0, 10) }))}
            columns={[
              { field: 'member', headerName: 'Member', flex: 1, sortable: true },
              { field: 'trainer', headerName: 'Trainer', flex: 1, sortable: true },
              { field: 'date', headerName: 'Date', flex: 1, sortable: true },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 