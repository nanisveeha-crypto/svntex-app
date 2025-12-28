
import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

const ProductCard = ({ product }) => {
  return (
    <Card sx={{ 
      maxWidth: 345, 
      m: 2,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      ':hover': {
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        transform: 'translateY(-2px)'
      },
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
                {product.price}
            </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
