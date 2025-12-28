import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const EligibilityStatus = () => {
    const [eligibility, setEligibility] = useState({
        kycApproved: false,
        successfulSales: 0,
        feePaid: false,
    });
    const [loading, setLoading] = useState(true);
    const salesTarget = 4;
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchEligibilityData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch KYC Status
                const kycDocRef = doc(db, 'kyc', userId);
                const kycDocSnap = await getDoc(kycDocRef);
                const kycApproved = kycDocSnap.exists() && kycDocSnap.data().status === 'approved';

                // Fetch User Data (Sales and Fee Status)
                const userDocRef = doc(db, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);
                const userData = userDocSnap.exists() ? userDocSnap.data() : {};
                const successfulSales = userData.successfulSales || 0;
                const feePaid = userData.feePaid || false;

                setEligibility({
                    kycApproved,
                    successfulSales,
                    feePaid,
                });

            } catch (error) {
                console.error("Error fetching eligibility data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEligibilityData();
    }, [userId]);

    const isEligible = eligibility.kycApproved && eligibility.successfulSales >= salesTarget && eligibility.feePaid;

    const getStatusIcon = (status) => {
        if (status) {
            return <CheckCircleIcon color="success" />;
        } else {
            return <CancelIcon color="error" />;
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 1 }}>Loading Eligibility Status...</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                    Eligibility Status
                </Typography>
                <Chip 
                    icon={isEligible ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
                    label={isEligible ? "Eligible for Commissions" : "Not Yet Eligible"}
                    color={isEligible ? "success" : "warning"}
                    variant="outlined"
                />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You must meet all the following requirements to become eligible for earning commissions.
            </Typography>
            <List>
                <ListItem divider>
                    <ListItemIcon>{getStatusIcon(eligibility.kycApproved)}</ListItemIcon>
                    <ListItemText primary="KYC Verified" secondary={eligibility.kycApproved ? "Your documents have been approved." : "Pending or needs submission."} />
                </ListItem>
                <ListItem divider>
                    <ListItemIcon>{getStatusIcon(eligibility.successfulSales >= salesTarget)}</ListItemIcon>
                    <ListItemText 
                        primary={`Complete ${salesTarget} Successful Sales`} 
                        secondary={`You have ${eligibility.successfulSales} out of ${salesTarget} required sales.`} 
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon>{getStatusIcon(eligibility.feePaid)}</ListItemIcon>
                    <ListItemText primary="Dashboard & Training Access Fee" secondary={eligibility.feePaid ? "Fee has been paid." : "Payment not yet confirmed."} />
                </ListItem>
            </List>
        </Paper>
    );
};

export default EligibilityStatus;
