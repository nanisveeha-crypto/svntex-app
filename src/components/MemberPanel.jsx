import React from 'react';
import { Container, Typography } from '@mui/material';
import EligibilityStatus from './EligibilityStatus'; // Import the new component

const MemberPanel = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Member Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Welcome back! Here's a summary of your account and progress.
      </Typography>
      
      {/* Eligibility Status Component */}
      <EligibilityStatus />

      {/* We can add other dashboard widgets here in the future */}

    </Container>
  );
};

export default MemberPanel;
