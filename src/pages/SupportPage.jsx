import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SupportPage = () => {
    const [name, setName] = useState(auth.currentUser?.displayName || '');
    const [email, setEmail] = useState(auth.currentUser?.email || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'tickets'), {
                name,
                email,
                message,
                createdAt: serverTimestamp(),
                status: 'Open',
                userId: auth.currentUser?.uid,
            });
            setMessage('');
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Error creating ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Submit a Support Ticket
            </Typography>
            <Paper elevation={2} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={6}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit Ticket'}
                    </Button>
                </form>
            </Paper>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Your support ticket has been submitted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SupportPage;
