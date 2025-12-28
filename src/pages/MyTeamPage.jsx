import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Avatar } from '@mui/material';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PersonIcon from '@mui/icons-material/Person';

const MyTeamPage = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchTeam = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('referrerId', '==', userId));
                const querySnapshot = await getDocs(q);

                const teamMembers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTeam(teamMembers);
            } catch (error) {
                console.error("Error fetching team members:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
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
                My Team ({team.length})
            </Typography>

            {team.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                    <Typography color="text.secondary">
                        You haven't referred anyone yet. Share your referral link to build your team!
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {team.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <Card elevation={2}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{member.name}</Typography>
                                        <Typography color="text.secondary">{member.email}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Joined: {member.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyTeamPage;
