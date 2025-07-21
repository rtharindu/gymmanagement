import React from 'react';
import { AppBar as MUIAppBar, Toolbar, Typography, IconButton, Avatar, Box, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AuthContext from '../utils/AuthContext';
import { useSidebar } from './Sidebar';

const AppBar = () => {
  const { user, setUser } = React.useContext(AuthContext);
  const { setOpen } = useSidebar();
  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <MUIAppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setOpen(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gym Management System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={user.avatar} alt={user.name} />
          <Typography>{user.name}</Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </MUIAppBar>
  );
};

export default AppBar; 