import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import SnackbarProvider from './components/Snackbar';
import AppBar from './components/AppBar';
import Sidebar, { SidebarProvider } from './components/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminTrainers from './pages/admin/Trainers';
import AdminWorkoutPlans from './pages/admin/WorkoutPlans';
import AdminAssignments from './pages/admin/Assignments';
import AdminScheduleManager from './pages/admin/ScheduleManager';
import TrainerDashboard from './pages/trainer/Dashboard';
import TrainerMyMembers from './pages/trainer/MyMembers';
import TrainerAvailability from './pages/trainer/Availability';
import MemberDashboard from './pages/member/Dashboard';
import MemberWorkoutPlanView from './pages/member/WorkoutPlanView';
import MemberBMICalculator from './pages/member/BMICalculator';
import MemberScheduleSession from './pages/member/ScheduleSession';
import ProfileSettings from './pages/profile/ProfileSettings';
import NotFound from './pages/NotFound';
import AuthContext from './utils/AuthContext';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#00b8d9' },
    background: { default: '#f5f6fa' },
  },
  shape: { borderRadius: 8 },
  shadows: Array(25).fill('none'),
});

function ProtectedRoute({ roles, children }) {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/not-found" replace />;
  return children ? children : <Outlet />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // Axios auth header
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  if (loading) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, setUser }}>
        <SnackbarProvider>
          <SidebarProvider>
            {user && <AppBar />}
            {user && <Sidebar />}
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/trainers" element={<AdminTrainers />} />
                <Route path="/admin/workout-plans" element={<AdminWorkoutPlans />} />
                <Route path="/admin/assignments" element={<AdminAssignments />} />
                <Route path="/admin/schedule" element={<AdminScheduleManager />} />
              </Route>
              {/* Trainer routes */}
              <Route element={<ProtectedRoute roles={['trainer']} />}>
                <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                <Route path="/trainer/my-members" element={<TrainerMyMembers />} />
                <Route path="/trainer/availability" element={<TrainerAvailability />} />
              </Route>
              {/* Member routes */}
              <Route element={<ProtectedRoute roles={['member']} />}>
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/workout-plan" element={<MemberWorkoutPlanView />} />
                <Route path="/member/bmi" element={<MemberBMICalculator />} />
                <Route path="/member/schedule" element={<MemberScheduleSession />} />
              </Route>
              {/* Profile */}
              <Route element={<ProtectedRoute roles={['admin', 'trainer', 'member']} />}>
                <Route path="/profile/settings" element={<ProfileSettings />} />
              </Route>
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </SnackbarProvider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App; 