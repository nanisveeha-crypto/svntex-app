import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => handleNavigation('/member')}>Home</Button>
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => handleNavigation('/earnings')}>My Earnings</Button>
          <Button color="inherit" onClick={() => handleNavigation('/profile')}>Profile</Button>
          <Button color="inherit" onClick={() => handleNavigation('/support')}>Support</Button> {/* Add the new support link */}
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
