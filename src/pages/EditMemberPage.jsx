import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const EditMemberPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', mobile: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', memberId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setMember({ id: docSnap.id, ...docSnap.data() });
        } else {
          setNotification({ open: true, message: 'Member not found.', severity: 'error' });
        }
      } catch (error) {
        console.error("Error fetching member:", error);
        setNotification({ open: true, message: 'Error fetching member data.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  // This effect synchronizes the member data with the form data
  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        mobile: member.mobile || ''
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', memberId);
      await updateDoc(userDocRef, formData);
      setNotification({ open: true, message: 'Member details updated successfully!', severity: 'success' });
    } catch (error) {
      console.error("Error updating member:", error);
      setNotification({ open: true, message: 'Failed to update member details.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!member?.email) {
      setNotification({ open: true, message: 'Member email is not available.', severity: 'error' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, member.email);
      setNotification({ open: true, message: `Password reset email sent to ${member.email}.`, severity: 'info' });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setNotification({ open: true, message: 'Failed to send password reset email.', severity: 'error' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (!member) {
    return <Typography sx={{ textAlign: 'center', mt: 5 }}>Member not found.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Edit Member: {member.firstName} {member.lastName}
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Email Address"
            value={member.email || ''}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveChanges} 
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={handlePasswordReset}>
              Send Password Reset Email
            </Button>
          </Box>
        </Box>
      </Paper>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditMemberPage;
