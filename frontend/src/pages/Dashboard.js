import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaymentIcon from '@mui/icons-material/Payment';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="container">
        <Box textAlign="center" py={8}>
          <Typography variant="h3" gutterBottom>
            Welcome to Tax Engine
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Simplify your tax filing with our automated tax processing system
          </Typography>
          <Box mt={4}>
            <Button variant="contained" size="large" component={Link} to="/login" sx={{ mr: 2 }}>
              Login
            </Button>
            <Button variant="outlined" size="large" component={Link} to="/register">
              Register
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Welcome back, {user.full_name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your tax documents, forms, and payments all in one place.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <UploadFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Upload Documents
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload your tax documents (W-2, 1099, receipts) for automatic processing and data extraction.
              </Typography>
              <Button variant="contained" component={Link} to="/documents">
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Tax Forms
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                View and complete your tax forms with auto-filled data from your uploaded documents.
              </Typography>
              <Button variant="contained" component={Link} to="/forms">
                View Forms
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalculateIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Tax Calculator
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate your tax liability and estimated payments with our built-in tax calculator.
              </Typography>
              <Button variant="contained" component={Link} to="/calculator">
                Calculate Taxes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Payments
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage tax payments, view payment history, and track refunds securely.
              </Typography>
              <Button variant="contained" component={Link} to="/payments">
                View Payments
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;