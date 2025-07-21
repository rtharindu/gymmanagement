import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useSnackbar } from '../../components/Snackbar';
import AuthContext from '../../utils/AuthContext';

const Availability = () => {
  const { user } = React.useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [availability, setAvailability] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/trainers/' + user.id);
      setAvailability(res.data.availability || []);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to load availability', 'error');
    }
  };

  useEffect(() => { fetchData(); }, [user.id]);

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

  const handleRemoveSlot = (date, slot) => {
    const idx = availability.findIndex(a => a.date === date);
    if (idx >= 0) {
      availability[idx].slots = availability[idx].slots.filter(s => s !== slot);
      if (availability[idx].slots.length === 0) {
        setAvailability(availability.filter((_, i) => i !== idx));
      } else {
        setAvailability([...availability]);
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/trainers/' + user.id, { availability });
      showSnackbar('Availability updated', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>My Availability</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}><TextField type="date" label="Date" value={newDate} onChange={e => setNewDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
        <Grid item xs={12} md={4}><TextField label="Time Slot (e.g. 10:00)" value={newSlot} onChange={e => setNewSlot(e.target.value)} fullWidth /></Grid>
        <Grid item xs={12} md={4} display="flex" alignItems="center"><Button onClick={handleAddSlot} variant="contained">Add Slot</Button></Grid>
      </Grid>
      <List>
        {availability.map((a, idx) => (
          <ListItem key={idx} alignItems="flex-start">
            <ListItemText primary={a.date} secondary={a.slots.map(slot => (
              <span key={slot} style={{ marginRight: 8 }}>
                {slot}
                <IconButton size="small" onClick={() => handleRemoveSlot(a.date, slot)}><DeleteIcon fontSize="small" /></IconButton>
              </span>
            ))} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }}>Save Availability</Button>
    </Box>
  );
};

export default Availability; 