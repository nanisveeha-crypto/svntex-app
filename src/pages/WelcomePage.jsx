import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Import the Header

// Keyframe animations for a more dynamic feel
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const WelcomePage = ({ userRole }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/member');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header /> {/* Add the Header here */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          color: 'white',
          textAlign: 'center',
          animation: `${fadeIn} 1s ease-in-out`,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to the SVNTEX Affiliate Dashboard!
            </Typography>
            <Typography variant="h5" sx={{ mb: 4 }}>
              Your central hub for managing affiliate activities and driving growth.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleNavigation}
              sx={{
                background: 'white',
                color: '#FF8E53',
                '&:hover': {
                  background: '#f2f2f2',
                },
                fontWeight: 'bold',
              }}
            >
              Go to Your Dashboard
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
