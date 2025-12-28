
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, CircularProgress, Alert } from '@mui/material';

const ShopifyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch Products from Shopify using our secure serverless function.
        const response = await fetch('/.netlify/functions/shopify-products', {
          method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Use a more user-friendly error message
            const errorMessage = errorData.error.includes("configuration error") 
                ? 'Shopify credentials are not set in the Netlify environment. Please contact support.'
                : errorData.error || 'Failed to fetch products from Shopify.';
            throw new Error(errorMessage);
        }

        const data = await response.json();
        setProducts(data.products);

      } catch (err) {
        console.error("Error fetching Shopify products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Shopify Products</Typography>
        <Table>
            <TableHead>
            <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Inventory</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {products && products.length > 0 ? (
                products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                            <img src={product.image?.src} alt={product.title} width="50" />
                        </TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>${product.variants[0]?.price}</TableCell>
                        <TableCell>{product.variants[0]?.inventory_quantity}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} align="center">
                        No products found.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </Paper>
  );
};

export default ShopifyProducts;
