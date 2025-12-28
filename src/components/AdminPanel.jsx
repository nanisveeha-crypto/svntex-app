import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  CircularProgress,
  Paper,
  Button
} from '@mui/material';
import KYCVerification from './KYCVerification';

const AdminPanel = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('members'); // 'members' or 'kyc'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(usersList);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleMemberClick = (memberId) => {
    navigate(`/admin/member/${memberId}`);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Button onClick={() => setView('members')} sx={{ mr: 1 }} variant={view === 'members' ? 'contained' : 'text'}>Members</Button>
        <Button onClick={() => setView('kyc')} variant={view === 'kyc' ? 'contained' : 'text'}>KYC Verification</Button>
      </Box>

      {view === 'members' ? (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Members List</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {members.map(member => (
                <ListItem key={member.id} disablePadding>
                  <ListItemButton onClick={() => handleMemberClick(member.id)}>
                    <ListItemText 
                      primary={`${member.firstName} ${member.lastName}`}
                      secondary={member.email}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      ) : (
        <KYCVerification />
      )}
    </Container>
  );
};

export default AdminPanel;
