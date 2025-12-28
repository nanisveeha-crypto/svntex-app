
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { TextField, Button, Container, Typography, Paper, Alert, CircularProgress } from '@mui/material';

const ShopifyCreds = () => {
  const [creds, setCreds] = useState({ storeUrl: '', apiKey: '', apiPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchCreds = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'company_stats', 'shopify');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCreds(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching Shopify credentials:", error);
        setFeedback({ type: 'error', message: 'Failed to fetch credentials.' });
      }
      setLoading(false);
    };
    fetchCreds();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ type: '', message: '' });
    if (!creds.storeUrl || !creds.apiKey || !creds.apiPassword) {
      setFeedback({ type: 'error', message: 'All fields are required.' });
      setSaving(false);
      return;
    }
    try {
      const docRef = doc(db, 'company_stats', 'shopify');
      await setDoc(docRef, creds, { merge: true });
      setFeedback({ type: 'success', message: 'Credentials saved successfully!' });
    } catch (error) {
      console.error("Error saving Shopify credentials:", error);
      setFeedback({ type: 'error', message: 'Failed to save credentials.' });
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Shopify API Credentials</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          These credentials are required to fetch products and sales data from your Shopify store. They are stored securely and are only accessible by admins.
        </Typography>
        {feedback.message && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}
        <TextField
          label="Shopify Store URL (e.g., your-store.myshopify.com)"
          name="storeUrl"
          value={creds.storeUrl}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="API Key"
          name="apiKey"
          value={creds.apiKey}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="API Password"
          name="apiPassword"
          type="password"
          value={creds.apiPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 2 }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Credentials'}
        </Button>
      </Paper>
    </Container>
  );
};

export default ShopifyCreds;
