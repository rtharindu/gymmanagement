import React, { useState, useContext, createContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../utils/AuthContext';

const drawerWidth = 220;

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { label: 'Members', icon: <PeopleIcon />, path: '/admin/members' },
    { label: 'Trainers', icon: <FitnessCenterIcon />, path: '/admin/trainers' },
    { label: 'Workout Plans', icon: <AssignmentIcon />, path: '/admin/workout-plans' },
    { label: 'Assignments', icon: <AssignmentIcon />, path: '/admin/assignments' },
    { label: 'Schedule', icon: <CalendarMonthIcon />, path: '/admin/schedule' },
    { label: 'Profile', icon: <SettingsIcon />, path: '/profile/settings' },
  ],
  trainer: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/trainer/dashboard' },
    { label: 'My Members', icon: <PeopleIcon />, path: '/trainer/my-members' },
    { label: 'Availability', icon: <CalendarMonthIcon />, path: '/trainer/availability' },
    { label: 'Profile', icon: <SettingsIcon />, path: '/profile/settings' },
  ],
  member: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/member/dashboard' },
    { label: 'Workout Plan', icon: <AssignmentIcon />, path: '/member/workout-plan' },
    { label: 'BMI Calculator', icon: <FitnessCenterIcon />, path: '/member/bmi' },
    { label: 'Schedule Session', icon: <CalendarMonthIcon />, path: '/member/schedule' },
    { label: 'Profile', icon: <SettingsIcon />, path: '/profile/settings' },
  ],
};

const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar = () => {
  const { user } = React.useContext(AuthContext);
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  if (!user) return null;
  const links = navConfig[user.role] || [];

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {links.map(link => (
          <ListItem
            button
            key={link.path}
            selected={location.pathname === link.path}
            onClick={() => {
              navigate(link.path);
              setOpen(false);
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export { SidebarProvider };
export default Sidebar; 