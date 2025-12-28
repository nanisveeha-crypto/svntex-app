
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { auth } from '../../firebase'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut

const Navbar = () => {
  const navigate = useNavigate();

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
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          SVNTEX Admin
        </Typography>
        <Button color="inherit" component={Link} to="/admin/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/admin/members">Members</Button>
        <Button color="inherit" component={Link} to="/admin/sales">Sales</Button>
        <Button color="inherit" component={Link} to="/admin/tickets">Tickets</Button>
        <Button color="inherit" component={Link} to="/admin/shopify">Shopify</Button>
        <Button color="inherit" component={Link} to="/admin/products">Products</Button> {/* Add Products link */}
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
