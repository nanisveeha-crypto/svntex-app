import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper } from '@mui/material';

const SalesDataPage = () => {
    const [pv, setPv] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pv || isNaN(pv) || pv <= 0) {
            setFeedback({ type: 'error', message: 'Please enter a valid positive number for PV.' });
            return;
        }

        setLoading(true);
        setFeedback({ type: '', message: '' });

        try {
            await addDoc(collection(db, 'dailySales'), {
                totalPV: Number(pv),
                date: serverTimestamp() // Use server timestamp for consistency
            });
            setFeedback({ type: 'success', message: `Successfully imported ${pv} PV for today.` });
            setPv('');
        } catch (error) {
            console.error("Error importing sales data:", error);
            setFeedback({ type: 'error', message: 'Failed to import sales data. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, mt: 2 }}>
            <Typography variant="h4" gutterBottom>
                Import Daily Sales Data
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Enter the total sales Point Value (PV) for the day. This will be used to calculate commissions for all eligible members.
            </Typography>
            <TextField
                fullWidth
                label="Total Daily Sales PV"
                variant="outlined"
                type="number"
                value={pv}
                onChange={(e) => setPv(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                    inputProps: { 
                        min: 1 
                    }
                }}
            />
            <Box sx={{ position: 'relative' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    size="large"
                >
                    Import and Finalize Today's Sales
                </Button>
                {loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>
            {feedback.message && (
                <Alert severity={feedback.type} sx={{ mt: 3 }}>
                    {feedback.message}
                </Alert>
            )}
        </Paper>
    );
};

export default SalesDataPage;
