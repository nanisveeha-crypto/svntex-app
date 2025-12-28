
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import WelcomePage from './WelcomePage';
import { Typography, Box, Button, Container, Paper, CircularProgress } from '@mui/material';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            // This component should only handle the routing logic.
            // The actual display is based on kycStatus.
            if (!userData.kycStatus || userData.kycStatus === 'not-submitted') {
              navigate('/kyc');
            } else {
              setUser(userData); // Set user only when we intend to show something.
            }
          } else {
            console.error("User data not found in Firestore. Forcing logout.");
            await auth.signOut();
            navigate('/login');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await auth.signOut();
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is set, we can render based on their status
  if (user) {
    const kycStatus = user.kycStatus;
    switch (kycStatus) {
      case 'verified':
        return <WelcomePage userRole={user.role} />;
      case 'pending':
        return (
          <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
              <Typography variant="h5">KYC Verification Pending</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Your document has been submitted and is pending review. We'll notify you once the process is complete.
              </Typography>
            </Paper>
          </Container>
        );
      case 'rejected':
        return (
          <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
              <Typography variant="h5" color="error">KYC Verification Rejected</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                There was an issue with your document. Please re-submit a valid government-issued ID.
              </Typography>
              <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/kyc')}>
                Re-submit KYC
              </Button>
            </Paper>
          </Container>
        );
      default:
        // Fallback for any other unexpected status
        return <p>An unexpected error occurred. Please contact support.</p>;
    }
  }

  // If not loading and no user, it means a redirect is in progress.
  // Showing the loader is better than a blank screen.
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default Dashboard;
