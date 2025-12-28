import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Box, Grid, TextField, CircularProgress, Alert, List, ListItem, ListItemText, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const KYCList = ({ title, submissions, onUpdate, rejectionReasons, onReasonChange, showActions, isHistory }) => (
    <Paper elevation={2} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ddd' }}>{title}</Typography>
        {submissions.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No submissions found.</Alert>
        ) : (
            submissions.map((sub) => (
                <Accordion key={sub.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography><b>{sub.accountHolderName || 'Name not provided'}</b> - {sub.id}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><b>Aadhaar:</b> {sub.aadhaarNumber}</Grid>
                            <Grid item xs={12} md={6}><b>PAN:</b> {sub.panNumber}</Grid>
                            <Grid item xs={12} md={6}><b>Account Holder:</b> {sub.accountHolderName}</Grid>
                            <Grid item xs={12} md={6}><b>Account Number:</b> {sub.accountNumber}</Grid>
                            <Grid item xs={12} md={6}><b>IFSC:</b> {sub.ifscCode}</Grid>
                            <Grid item xs={12} md={6}><b>Branch:</b> {sub.branchName}</Grid>

                            <Grid item xs={12} sm={6} md={3}><a href={sub.aadhaarFrontUrl} target="_blank" rel="noopener noreferrer"><img src={sub.aadhaarFrontUrl} alt='Aadhaar Front' style={{width:'100%'}}/></a></Grid>
                            <Grid item xs={12} sm={6} md={3}><a href={sub.aadhaarBackUrl} target="_blank" rel="noopener noreferrer"><img src={sub.aadhaarBackUrl} alt='Aadhaar Back' style={{width:'100%'}}/></a></Grid>
                            <Grid item xs={12} sm={6} md={3}><a href={sub.panCardUrl} target="_blank" rel="noopener noreferrer"><img src={sub.panCardUrl} alt='PAN Card' style={{width:'100%'}}/></a></Grid>
                            <Grid item xs={12} sm={6} md={3}><a href={sub.passbookUrl} target="_blank" rel="noopener noreferrer"><img src={sub.passbookUrl} alt='Passbook' style={{width:'100%'}}/></a></Grid>
                            
                            {isHistory && sub.status === 'rejected' && (
                                <Grid item xs={12} sx={{mt:1}}>
                                    <Alert severity="error"><b>Rejection Reason:</b> {sub.rejectionReason}</Alert>
                                </Grid>
                            )}
                             {isHistory && sub.status === 'approved' && (
                                <Grid item xs={12} sx={{mt:1}}>
                                    <Alert severity="success"><b>Approved on:</b> {sub.updatedAt?.toDate().toLocaleString()}</Alert>
                                </Grid>
                            )}

                            {showActions && (
                                <>
                                    <Grid item xs={12} sx={{mt: 2}}>
                                        <TextField 
                                            fullWidth
                                            label="Rejection Reason (Required if rejecting)"
                                            variant="outlined"
                                            value={rejectionReasons[sub.id] || ''}
                                            onChange={(e) => onReasonChange(sub.id, e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
                                        <Grid item><Button variant="contained" color="success" onClick={() => onUpdate(sub.id, 'approved')}>Approve</Button></Grid>
                                        <Grid item><Button variant="contained" color="error" onClick={() => onUpdate(sub.id, 'rejected')}>Reject</Button></Grid>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))
        )}
    </Paper>
);


const KYCManagementPage = () => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const kycCollection = collection(db, 'kyc');
      const qPending = query(kycCollection, where('status', '==', 'pending'));
      const qApproved = query(kycCollection, where('status', '==', 'approved'));
      const qRejected = query(kycCollection, where('status', '==', 'rejected'));

      const [pendingSnapshot, approvedSnapshot, rejectedSnapshot] = await Promise.all([
        getDocs(qPending),
        getDocs(qApproved),
        getDocs(qRejected)
      ]);

      setPending(pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setApproved(approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setRejected(rejectedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error fetching KYC submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

 const handleUpdateStatus = async (userId, newStatus) => {
    const reason = rejectionReasons[userId] || '';
    if (newStatus === 'rejected' && !reason) {
        alert('Rejection reason is required.');
        return;
    }

    try {
      const kycDocRef = doc(db, 'kyc', userId);
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'rejected') {
        updateData.rejectionReason = reason;
        const historyCollectionRef = collection(db, `kyc/${userId}/rejectionHistory`);
        await addDoc(historyCollectionRef, {
            reason: reason,
            rejectedAt: serverTimestamp()
        });
      } else {
        updateData.rejectionReason = ''; // Clear reason on approval
      }
      
      await updateDoc(kycDocRef, updateData);
      fetchSubmissions(); 
    } catch (error) {
      console.error("Error updating KYC status:", error);
    }
  };

  const handleReasonChange = (userId, reason) => {
    setRejectionReasons(prev => ({ ...prev, [userId]: reason }));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>KYC Management</Typography>
      <KYCList 
        title="Pending Submissions"
        submissions={pending}
        onUpdate={handleUpdateStatus}
        rejectionReasons={rejectionReasons}
        onReasonChange={handleReasonChange}
        showActions={true}
      />
      <KYCList 
        title="Approved History"
        submissions={approved}
        isHistory={true}
      />
      <KYCList 
        title="Rejected History"
        submissions={rejected}
        isHistory={true}
      />
    </Box>
  );
};

export default KYCManagementPage;
