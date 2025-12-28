import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const UserDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser?.uid;
    const referralLink = `https://your-app-url.com/signup?ref=${userId}`;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                } else {
                    console.log("No such user document!");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        // Optional: Show a snackbar or toast to confirm copy
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!userData) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h5">Could not load user data.</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Welcome, {userData.name}!
            </Typography>

            <Grid container spacing={3}>
                 <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Current Wallet Balance</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                ₹{userData.walletBalance?.toFixed(2) || '0.00'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                 <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Earned (All Time)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                                ₹{userData.totalEarned?.toFixed(2) || '0.00'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" color="text.secondary">This Month's PV</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                            {userData.monthlyPV || 0} PV
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" color="text.secondary">Current Commission Slab</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                            {userData.currentSlab || 'N/A'}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box mt={5}>
                <Typography variant="h5" gutterBottom>
                    Your Referral Link
                </Typography>
                <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {referralLink}
                    </Typography>
                    <Button variant="contained" onClick={handleCopyToClipboard} startIcon={<ContentCopyIcon />}>
                        Copy
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default UserDashboard;
