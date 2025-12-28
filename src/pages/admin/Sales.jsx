import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust the import path as needed
import { collection, getDocs } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography 
} from '@mui/material';

const Sales = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const querySnapshot = await getDocs(collection(db, "dailySales"));
      const salesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
    };

    fetchSales();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom style={{ margin: '20px' }}>
        Daily Sales Data
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Total Sales</TableCell>
              <TableCell>Total PV</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.totalSales}</TableCell>
                <TableCell>{sale.totalPV}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Sales;
