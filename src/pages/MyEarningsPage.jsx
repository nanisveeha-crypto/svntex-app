
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MyEarningsPage = () => {
    const [earnings, setEarnings] = useState({
        currentBalance: 0,
        totalEarned: 0,
        monthlyPV: 0,
        currentSlab: 'N/A',
    });
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchEarningsData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setEarnings({
                        currentBalance: userData.walletBalance || 0,
                        totalEarned: userData.totalEarned || 0,
                        monthlyPV: userData.monthlyPV || 0,
                        currentSlab: userData.currentSlab || 'N/A',
                    });
                } else {
                    // Handle case where user document doesn't exist yet
                    console.log("No such user document!");
                }
            } catch (error) {
                console.error("Error fetching earnings data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
    }, [userId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                My Earnings & Performance
            </Typography>

            <Card sx={{ mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
                <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                            <AccountBalanceWalletIcon sx={{ fontSize: 50 }} />
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">Current Wallet Balance</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                ₹{earnings.currentBalance.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">Total Earned (All Time)</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                            ₹{earnings.totalEarned.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">This Month's PV</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                            {earnings.monthlyPV} PV
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">Current Commission Slab</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'medium', mt: 1 }}>
                            {earnings.currentSlab}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box mt={5}>
                <Typography variant="h5" gutterBottom>
                    Recent Transactions
                </Typography>
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography color="text.secondary">
                        Your daily earnings and withdrawal history will appear here soon.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default MyEarningsPage;
