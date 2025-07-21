import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Stack, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../utils/AuthContext';

const metricCards = [
  {
    label: 'Assigned Members',
    icon: <PeopleIcon fontSize="large" />, color: '#1976d2',
    key: 'members',
  },
  {
    label: 'Upcoming Sessions',
    icon: <CalendarMonthIcon fontSize="large" />, color: '#43a047',
    key: 'sessions',
  },
];

const TrainerDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [metrics, setMetrics] = useState({ members: 0, sessions: 0 });
  const [myMembers, setMyMembers] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [membersRes, sessionsRes] = await Promise.all([
        axios.get('/api/members?trainer=' + user.id),
        axios.get('/api/schedules?trainer=' + user.id),
      ]);
      setMetrics({
        members: membersRes.data.length,
        sessions: sessionsRes.data.length,
      });
      setMyMembers(membersRes.data.slice(-5).reverse());
      setUpcomingSessions(sessionsRes.data.slice(-5).reverse());
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

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
      <Typography variant="h4" mb={3}>Trainer Dashboard</Typography>
      {loading && <LoadingSpinner message="Loading dashboard..." />}
      <Grid container spacing={3} mb={2}>
        {metricCards.map(card => (
          <Grid item xs={12} md={6} key={card.key}>
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
        <Button variant="contained" startIcon={<PeopleIcon />} onClick={() => navigate('/trainer/my-members')}>View My Members</Button>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => navigate('/trainer/availability')}>Set Availability</Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={1}>Recent Members</Typography>
          <DataGrid
            {...gridProps}
            rows={myMembers.map(m => ({ id: m._id, name: m.user?.name, email: m.user?.email }))}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1, sortable: true },
              { field: 'email', headerName: 'Email', flex: 1, sortable: true },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={1}>Upcoming Sessions</Typography>
          <DataGrid
            {...gridProps}
            rows={upcomingSessions.map(s => ({ id: s._id, member: s.member?.user?.name, date: s.date?.slice(0, 10), time: s.time }))}
            columns={[
              { field: 'member', headerName: 'Member', flex: 1, sortable: true },
              { field: 'date', headerName: 'Date', flex: 1, sortable: true },
              { field: 'time', headerName: 'Time', flex: 1, sortable: true },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainerDashboard; 