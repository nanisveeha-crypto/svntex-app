import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

// --- CONFIGURATION --- 
// TODO: Replace this placeholder with the actual URL to your Shopify product.
const SHOPIFY_JOIN_URL = 'https://your-store.myshopify.com/products/affiliate-join-product'; // Example URL

const JoinPage = () => {

  const handleJoinNow = () => {
    if (!SHOPIFY_JOIN_URL.includes('your-store')) {
        window.location.href = SHOPIFY_JOIN_URL;
    } else {
        alert('Shopify integration is not configured yet. Please update the placeholder URL in the code.');
        console.log(`User would be redirected to: ${SHOPIFY_JOIN_URL}`);
    }
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
              Joining Fee: ₹4,000
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (One-time payment for the Affiliate Join Product)
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
