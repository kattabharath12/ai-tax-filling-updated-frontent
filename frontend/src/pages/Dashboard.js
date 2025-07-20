import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, LinearProgress, Chip, Alert, Paper, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    documents: [],
    forms: [],
    payments: [],
    recentActivity: [],
    taxSummary: null,
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [documentsRes, formsRes, paymentsRes] = await Promise.all([
        axios.get('/api/documents/'),
        axios.get('/api/forms/'),
        axios.get('/api/payments/')
      ]);

      setDashboardData({
        documents: documentsRes.data,
        forms: formsRes.data,
        payments: paymentsRes.data,
        notifications: generateNotifications(documentsRes.data, formsRes.data, paymentsRes.data)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (documents, forms, payments) => {
    const notifications = [];
    
    // Check for processing documents
    const processingDocs = documents.filter(doc => doc.status === 'processing');
    if (processingDocs.length > 0) {
      notifications.push({
        type: 'info',
        message: `${processingDocs.length} document(s) are being processed`,
        icon: <PendingIcon />
      });
    }

    // Check for failed documents
    const failedDocs = documents.filter(doc => doc.status === 'error');
    if (failedDocs.length > 0) {
      notifications.push({
        type: 'error',
        message: `${failedDocs.length} document(s) failed to process`,
        icon: <ErrorIcon />
      });
    }

    // Check for incomplete forms
    const incompleteForms = forms.filter(form => form.status === 'draft' || form.status === 'in_progress');
    if (incompleteForms.length > 0) {
      notifications.push({
        type: 'warning',
        message: `${incompleteForms.length} tax form(s) need completion`,
        icon: <WarningIcon />
      });
    }

    // Check for pending payments
    const pendingPayments = payments.filter(payment => payment.status === 'pending');
    if (pendingPayments.length > 0) {
      notifications.push({
        type: 'info',
        message: `${pendingPayments.length} payment(s) pending`,
        icon: <PendingIcon />
      });
    }

    // Tax season reminders
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const taxDeadline = new Date(currentYear, 3, 15); // April 15
    
    if (currentDate < taxDeadline) {
      const daysLeft = Math.ceil((taxDeadline - currentDate) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        notifications.push({
          type: 'warning',
          message: `Tax deadline in ${daysLeft} days - File by April 15th`,
          icon: <CalendarTodayIcon />
        });
      }
    }

    return notifications;
  };

  const getCompletionPercentage = () => {
    const { documents, forms } = dashboardData;
    const totalSteps = 4; // Upload docs, Create forms, Calculate tax, File/Pay
    let completedSteps = 0;

    if (documents.length > 0) completedSteps++;
    if (forms.some(form => form.status === 'completed' || form.status === 'filed')) completedSteps++;
    if (forms.some(form => form.calculated_tax)) completedSteps++;
    if (dashboardData.payments.some(payment => payment.status === 'completed')) completedSteps++;

    return (completedSteps / totalSteps) * 100;
  };

  const getTotalTaxOwed = () => {
    return dashboardData.forms.reduce((total, form) => {
      return total + (form.calculated_tax || 0);
    }, 0);
  };

  const getTotalPayments = () => {
    return dashboardData.payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'processed':
      case 'filed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'error':
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

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

  if (loading) {
    return (
      <Container className="container">
        <Typography variant="h6">Loading dashboard...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Container>
    );
  }

  const completionPercentage = getCompletionPercentage();
  const totalTaxOwed = getTotalTaxOwed();
  const totalPayments = getTotalPayments();
  const remainingBalance = totalTaxOwed - totalPayments;

  return (
    <Container className="container">
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.full_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your tax filing progress and manage your documents, forms, and payments.
        </Typography>
      </Box>

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <Box mb={3}>
          {dashboardData.notifications.map((notification, index) => (
            <Alert 
              key={index} 
              severity={notification.type} 
              icon={notification.icon}
              sx={{ mb: 1 }}
            >
              {notification.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Progress Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tax Filing Progress
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Box minWidth={35}>
            <Typography variant="body2" color="text.secondary">
              {Math.round(completionPercentage)}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Complete all steps to file your taxes
        </Typography>
      </Paper>

      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Tax Owed
                  </Typography>
                  <Typography variant="h5">
                    ${totalTaxOwed.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Payments Made
                  </Typography>
                  <Typography variant="h5">
                    ${totalPayments.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalanceIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Remaining Balance
                  </Typography>
                  <Typography variant="h5" color={remainingBalance > 0 ? 'error' : 'success'}>
                    ${Math.abs(remainingBalance).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {remainingBalance > 0 ? 'Amount Due' : remainingBalance < 0 ? 'Refund Expected' : 'Paid in Full'}
                  </Typography>
                </Box>
                <TrendingUpIcon color={remainingBalance > 0 ? 'error' : 'success'} sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <UploadFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Upload Documents
                </Typography>
                <Chip 
                  label={dashboardData.documents.length} 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
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
                <Chip 
                  label={dashboardData.forms.length} 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
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
                <Chip 
                  label={dashboardData.payments.length} 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
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

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <List dense>
              {dashboardData.documents.slice(0, 5).map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemIcon>
                    {getStatusIcon(doc.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.filename}
                    secondary={`${doc.document_type} • ${new Date(doc.created_at).toLocaleDateString()}`}
                  />
                  <Chip label={doc.status} size="small" />
                </ListItem>
              ))}
              {dashboardData.documents.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No documents uploaded yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tax Forms Status
            </Typography>
            <List dense>
              {dashboardData.forms.slice(0, 5).map((form) => (
                <ListItem key={form.id}>
                  <ListItemIcon>
                    {getStatusIcon(form.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${form.form_type} (${form.tax_year})`}
                    secondary={`Status: ${form.status.replace('_', ' ')}`}
                  />
                  {form.calculated_tax && (
                    <Chip label={`$${form.calculated_tax}`} size="small" />
                  )}
                </ListItem>
              ))}
              {dashboardData.forms.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No tax forms created yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
