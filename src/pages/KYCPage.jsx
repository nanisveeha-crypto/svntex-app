import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import Header from '../components/Header';
import KYCForm from '../components/KYCForm';

const KYCPage = () => {
  return (
    <>
      <Header />
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            KYC Verification
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Please provide your details and upload the required documents to complete the verification process.
          </Typography>
          <KYCForm />
        </Paper>
      </Container>
    </>
  );
};

export default KYCPage;
