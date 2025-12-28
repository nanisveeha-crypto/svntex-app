import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const PayoutsPage = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchPayouts = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const payoutsRef = collection(db, 'payouts');
                const q = query(payoutsRef, where('userId', '==', userId), orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);

                const payoutsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPayouts(payoutsData);
            } catch (error) {
                console.error("Error fetching payouts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayouts();
    }, [userId]);

    const getStatusChip = (status) => {
        let color;
        switch (status) {
            case 'Paid':
                color = 'success';
                break;
            case 'Pending':
                color = 'warning';
                break;
            case 'Failed':
                color = 'error';
                break;
            default:
                color = 'default';
        }
        return <Chip label={status} color={color} />;
    };

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
                Payout History
            </Typography>

            {payouts.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography color="text.secondary">
                        You have no payout history yet.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={2}>
                    <Table sx={{ minWidth: 650 }} aria-label="payouts table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payouts.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell>
                                        {payout.date?.toDate().toLocaleDateString() || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        ₹{payout.amount?.toFixed(2) || '0.00'}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(payout.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default PayoutsPage;
