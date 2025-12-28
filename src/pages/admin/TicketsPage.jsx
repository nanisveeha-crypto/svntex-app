import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Select, MenuItem, Button, IconButton } from '@mui/material';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';

const TicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const ticketsRef = collection(db, 'tickets');
                const q = query(ticketsRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const ticketsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTickets(ticketsData);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            const ticketRef = doc(db, 'tickets', ticketId);
            await updateDoc(ticketRef, { status: newStatus });
            setTickets(tickets.map(ticket => ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket));
        } catch (error) {
            console.error("Error updating ticket status:", error);
        }
    };

    const handleDelete = async (ticketId) => {
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            try {
                const ticketRef = doc(db, 'tickets', ticketId);
                await deleteDoc(ticketRef);
                setTickets(tickets.filter(ticket => ticket.id !== ticketId));
            } catch (error) {
                console.error("Error deleting ticket:", error);
            }
        }
    };

    const getStatusChip = (status) => {
        let color;
        switch (status) {
            case 'Open':
                color = 'error';
                break;
            case 'In Progress':
                color = 'warning';
                break;
            case 'Closed':
                color = 'success';
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
                Support Tickets
            </Typography>

            {tickets.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography color="text.secondary">
                        No support tickets found.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={2}>
                    <Table sx={{ minWidth: 650 }} aria-label="tickets table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        {ticket.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                    </TableCell>
                                    <TableCell>{ticket.name}</TableCell>
                                    <TableCell>{ticket.email}</TableCell>
                                    <TableCell>{ticket.message}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={ticket.status}
                                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                            sx={{ minWidth: 120 }}
                                            size="small"
                                        >
                                            <MenuItem value="Open">Open</MenuItem>
                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                            <MenuItem value="Closed">Closed</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDelete(ticket.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
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

export default TicketsPage;
