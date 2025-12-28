import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

// --- CONFIGURATION --- 
// This is the direct link to the Shopify product that a user must purchase to join the affiliate program.
const SHOPIFY_JOIN_URL = 'https://mysvntex.in/products/affiliate-training-fee?variant=47349566636276';

const JoinPage = () => {

  const handleJoinNow = () => {
    // Redirect the user directly to the Shopify product page.
    window.location.href = SHOPIFY_JOIN_URL;
  };

  return (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Adjust if you have a header
        background: 'linear-gradient(45deg, #f3e5f5 30%, #e1bee7 90%)',
        p: 3
    }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Become an Affiliate
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ my: 3 }}>
            Join our affiliate program by purchasing our exclusive affiliate product. Start your journey to earning with us today!
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
              Affiliate Training Fee: ₹4,000
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (One-time payment to join the program)
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            endIcon={<ArrowForward />}
            onClick={handleJoinNow}
            sx={{
                fontWeight: 'bold',
                py: 1.5,
                px: 5,
                borderRadius: '50px',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.05)'
                }
            }}
          >
            Join Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default JoinPage;