import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Box, Button, TextField, Typography, Grid, Paper, Alert, CircularProgress, Divider } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const KYCForm = () => {
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
  });
  const [files, setFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    passbook: null,
  });
  const [previews, setPreviews] = useState({
    aadhaarFront: '',
    aadhaarBack: '',
    panCard: '',
    passbook: '',
  });
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchKYCData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      const kycDocRef = doc(db, 'kyc', userId);
      const docSnap = await getDoc(kycDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          aadhaarNumber: data.aadhaarNumber || '',
          panNumber: data.panNumber || '',
          accountHolderName: data.accountHolderName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          branchName: data.branchName || '',
        });
        setPreviews({
          aadhaarFront: data.aadhaarFrontUrl || '',
          aadhaarBack: data.aadhaarBackUrl || '',
          panCard: data.panCardUrl || '',
          passbook: data.passbookUrl || '',
        });
        setKycStatus(data.status || 'not_submitted');
        setRejectionReason(data.rejectionReason || '');
      }
      setLoading(false);
    };

    fetchKYCData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles[0]) {
      const file = inputFiles[0];
      setFiles({ ...files, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to submit KYC.');
      return;
    }

    if (kycStatus === 'not_submitted') {
      if (!files.aadhaarFront || !files.aadhaarBack || !files.panCard || !files.passbook) {
        setError('Please upload all the required documents before submitting.');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const uploadFile = async (file, path) => {
        if (!file) return null;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      const filePaths = {
        aadhaarFront: `kyc/${userId}/aadhaarFront.jpg`,
        aadhaarBack: `kyc/${userId}/aadhaarBack.jpg`,
        panCard: `kyc/${userId}/panCard.jpg`,
        passbook: `kyc/${userId}/passbook.jpg`,
      };

      const urls = {
        aadhaarFrontUrl: files.aadhaarFront ? await uploadFile(files.aadhaarFront, filePaths.aadhaarFront) : previews.aadhaarFront,
        aadhaarBackUrl: files.aadhaarBack ? await uploadFile(files.aadhaarBack, filePaths.aadhaarBack) : previews.aadhaarBack,
        panCardUrl: files.panCard ? await uploadFile(files.panCard, filePaths.panCard) : previews.panCard,
        passbookUrl: files.passbook ? await uploadFile(files.passbook, filePaths.passbook) : previews.passbook,
      };

      const kycDocRef = doc(db, 'kyc', userId);
      await setDoc(kycDocRef, {
        ...formData,
        ...urls,
        userId,
        status: 'pending',
        submittedAt: new Date(),
      }, { merge: true });

      setKycStatus('pending');
    } catch (err) {
      setError('Failed to submit KYC data. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = kycStatus === 'not_submitted' || kycStatus === 'rejected';

  if (loading) {
    return <CircularProgress />;
  }

  const renderFileUpload = (name, label) => (
    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>{label}</Typography>
      {previews[name] ? (
        <img src={previews[name]} alt={`${label} preview`} style={{ width: '100%', height: '120px', objectFit: 'contain', marginBottom: '10px' }} />
      ) : (
        <Box sx={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>Preview</Box>
      )}
      <Button variant="contained" component="label" startIcon={<PhotoCamera />} disabled={!isEditable}>
        Upload
        <input type="file" hidden name={name} onChange={handleFileChange} accept="image/*" />
      </Button>
    </Paper>
  );

  return (
    <Box>
      {kycStatus === 'pending' && <Alert severity="warning" sx={{ mb: 2 }}>Your KYC is under verification. This may take 24 to 48 hours.</Alert>}
      {kycStatus === 'approved' && <Alert severity="success" sx={{ mb: 2 }}>Your KYC has been approved!</Alert>}
      {kycStatus === 'rejected' && <Alert severity="error" sx={{ mb: 2 }}>Your KYC was rejected. Reason: {rejectionReason}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* AADHAAR SECTION */}
          <Grid item xs={12}><Divider sx={{ my: 2 }}><Typography variant="h6">Aadhaar Details</Typography></Divider></Grid>
          <Grid item xs={12} container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
                <TextField name="aadhaarNumber" label="Aadhaar Number" fullWidth value={formData.aadhaarNumber} onChange={handleInputChange} required disabled={!isEditable} />
            </Grid>
            <Grid item xs={12} md={6} container spacing={2}>
                <Grid item xs={12} sm={6}>{renderFileUpload('aadhaarFront', 'Aadhaar Front Photo')}</Grid>
                <Grid item xs={12} sm={6}>{renderFileUpload('aadhaarBack', 'Aadhaar Back Photo')}</Grid>
            </Grid>
          </Grid>

          {/* PAN SECTION */}
          <Grid item xs={12}><Divider sx={{ my: 2 }}><Typography variant="h6">PAN Card Details</Typography></Divider></Grid>
          <Grid item xs={12} container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField name="panNumber" label="PAN Card Number" fullWidth value={formData.panNumber} onChange={handleInputChange} required disabled={!isEditable} />
            </Grid>
            <Grid item xs={12} md={6}>{renderFileUpload('panCard', 'PAN Card Photo')}</Grid>
          </Grid>

          {/* BANK SECTION */}
          <Grid item xs={12}><Divider sx={{ my: 2 }}><Typography variant="h6">Bank Account Details</Typography></Divider></Grid>
          <Grid item xs={12} container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={6} container spacing={2}>
              <Grid item xs={12}><TextField name="accountHolderName" label="Account Holder Name" fullWidth value={formData.accountHolderName} onChange={handleInputChange} required disabled={!isEditable}/></Grid>
              <Grid item xs={12}><TextField name="accountNumber" label="Account Number" fullWidth value={formData.accountNumber} onChange={handleInputChange} required disabled={!isEditable}/></Grid>
              <Grid item xs={12} sm={6}><TextField name="ifscCode" label="IFSC Code" fullWidth value={formData.ifscCode} onChange={handleInputChange} required disabled={!isEditable}/></Grid>
              <Grid item xs={12} sm={6}><TextField name="branchName" label="Branch Name" fullWidth value={formData.branchName} onChange={handleInputChange} required disabled={!isEditable}/></Grid>
            </Grid>
            <Grid item xs={12} md={6}>{renderFileUpload('passbook', 'Bank Passbook Photo')}</Grid>
          </Grid>

          {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}

          {isEditable && (
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button type="submit" variant="contained" color="primary" disabled={submitting} fullWidth size="large">
                {submitting ? <CircularProgress size={24} /> : 'Submit KYC'}
              </Button>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
};

export default KYCForm;
