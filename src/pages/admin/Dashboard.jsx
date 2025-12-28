import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { ShowChart } from '@mui/icons-material';

const Dashboard = () => {
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPV, setTotalPV] = useState(0);
  const [liveMonthlyPV, setLiveMonthlyPV] = useState(0);

  useEffect(() => {
    // --- Listener for Live Monthly PV ---
    // This provides real-time updates from the webhook.
    const companyStatsDoc = doc(db, "company_stats", "monthly_pv");
    const unsubscribe = onSnapshot(companyStatsDoc, (docSnap) => {
      if (docSnap.exists()) {
        // The 'pv' field is updated by the webhook function
        setLiveMonthlyPV(docSnap.data().pv || 0);
      } else {
        console.log("Company stats document does not exist!");
        setLiveMonthlyPV(0); // Set to 0 if doc doesn't exist
      }
    }, (error) => {
        console.error("Error listening to live PV:", error);
    });

    // --- Fetching other historical data ---
    const fetchDashboardData = async () => {
      // Fetch total members
      const usersSnapshot = await getDocs(collection(db, "users"));
      setTotalMembers(usersSnapshot.size);

      // Fetch total sales and PV from historical data
      // Note: This is separate from the live webhook data.
      const salesSnapshot = await getDocs(collection(db, "dailySales"));
      let sales = 0;
      let pv = 0;
      salesSnapshot.forEach(doc => {
        sales += doc.data().totalSales;
        pv += doc.data().totalPV;
      });
      setTotalSales(sales);
      setTotalPV(pv);
    };

    fetchDashboardData();

    // Cleanup: Detach the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Live Monthly PV Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            border: '2px solid', 
            borderColor: 'primary.main', 
            boxShadow: '0 8px 32px 0 rgba(100, 100, 200, 0.37)' 
          }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShowChart color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary">Live Monthly PV</Typography>
                </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{liveMonthlyPV.toFixed(2)}</Typography>
              <Typography variant="caption">Updates in real-time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Members</Typography>
              <Typography variant="h3">{totalMembers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Sales (Historical)</Typography>
              <Typography variant="h3">${totalSales.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total PV (Historical)</Typography>
              <Typography variant="h3">{totalPV}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
