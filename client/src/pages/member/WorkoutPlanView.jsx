import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Checkbox, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const WorkoutPlanView = () => {
  const { user } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [plan, setPlan] = useState(null);
  const [checked, setChecked] = useState([]);

  const fetchData = async () => {
    try {
      const memberRes = await axios.get(`http://localhost:5000/api/members/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (memberRes.data.workoutPlanId) {
        const planRes = await axios.get(`http://localhost:5000/api/workout-plans/${memberRes.data.workoutPlanId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPlan(planRes.data);
        setChecked([]);
      } else {
        setPlan(null);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to load plan', 'error');
    }
  };

  useEffect(() => { fetchData(); }, [user.id]);

  const handleToggle = (idx) => {
    setChecked(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  if (!plan) {
    return <Box sx={{ p: 3 }}><Typography>No workout plan assigned.</Typography></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={1}>{plan.title}</Typography>
        <Typography color="text.secondary" mb={2}>{plan.description}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" mb={1}>Exercises</Typography>
        <List>
          {plan.exercises.map((ex, idx) => (
            <ListItem key={idx} button onClick={() => handleToggle(idx)}>
              <ListItemIcon>
                <Checkbox edge="start" checked={checked.includes(idx)} tabIndex={-1} disableRipple />
              </ListItemIcon>
              <ListItemText primary={ex.name} secondary={`Sets: ${ex.sets}, Reps: ${ex.reps}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default WorkoutPlanView;