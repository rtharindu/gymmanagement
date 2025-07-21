import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Stack, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from '../../utils/Axios'; // Use centralized Axios
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../utils/AuthContext';

const metricCards = [
  {
    label: 'BMI',
    icon: <FitnessCenterIcon fontSize="large" />, color: '#1976d2',
    key: 'bmi',
  },
  {
    label: 'Assigned Trainer',
    icon: <PeopleIcon fontSize="large" />, color: '#00b8d9',
    key: 'trainer',
  },
  {
    label: 'Upcoming Sessions',
    icon: <CalendarMonthIcon fontSize="large" />, color: '#43a047',
    key: 'sessions',
  },
];

const MemberDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [bmi, setBmi] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !localStorage.getItem('token')) {
        console.error('No user ID or token found, redirecting to login');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const [bmiRes, memberRes, sessionsRes] = await Promise.all([
          axios.get(`/api/BMI/${user.id}`),
          axios.get(`/api/members/${user.id}`),
          axios.get(`/api/schedule/me`),
        ]);
        setBmi(bmiRes.data);
        setTrainer(memberRes.data.trainerId?.userId?.name || null);
        setSessions(sessionsRes.data.slice(-5).reverse());
      } catch (err) {
        console.error('Axios error:', err.message, err.config?.url, err.response?.status);
        if (err.response?.status === 401) {
          console.error('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

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

  const metrics = {
    bmi: bmi?.bmi ? bmi.bmi.toFixed(1) : '--',
    trainer: trainer || '--',
    sessions: sessions.length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Member Dashboard</Typography>
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
        <Button variant="contained" startIcon={<FitnessCenterIcon />} onClick={() => navigate('/member/bmi')}>BMI Calculator</Button>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => navigate('/member/workout-plan')}>View Workout Plan</Button>
        <Button variant="contained" color="success" startIcon={<CalendarMonthIcon />} onClick={() => navigate('/member/schedule')}>Schedule Session</Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" mb={1}>Upcoming Sessions</Typography>
          <DataGrid
            {...gridProps}
            rows={sessions.map(s => ({ id: s._id, trainer: s.trainerId?.userId?.name, date: s.startTime?.slice(0, 10), time: s.startTime?.slice(11, 16) }))}
            columns={[
              { field: 'trainer', headerName: 'Trainer', flex: 1, sortable: true },
              { field: 'date', headerName: 'Date', flex: 1, sortable: true },
              { field: 'time', headerName: 'Time', flex: 1, sortable: true },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDashboard;