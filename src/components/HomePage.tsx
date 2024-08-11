// src/components/HomePage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Delivio
      </Typography>
      <Typography variant="body1">
        This is the homepage. Navigate using the sidebar.
      </Typography>
    </Box>
  );
};

export default HomePage;
