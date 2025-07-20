import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data) => {
    try {
      await axios.post('/api/payments/', {
        payment_type: data.payment_type,
        amount: parseFloat(data.amount),
        form_id: data.form_id ? parseInt(data.form_id) : null
      });
      setOpen(false);
      reset();
      fetchPayments();
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container className="container">
        <Typography>Loading payments...</Typography>
      </Container>
    );
  }

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Payment History
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View your tax payment history and create new payments.
      </Typography>

      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
      >
        Make Payment
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {payment.payment_type.replace('_', ' ').toUpperCase()}
                </TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={payment.status.toUpperCase()} 
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{payment.reference_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {payments.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No payment history found.
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <form onSubmit={handleSubmit(createPayment)}>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Type</InputLabel>
              <Select
                {...register('payment_type', { required: true })}
                defaultValue="tax_payment"
                label="Payment Type"
              >
                <MenuItem value="tax_payment">Tax Payment</MenuItem>
                <MenuItem value="penalty">Penalty</MenuItem>
                <MenuItem value="interest">Interest</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              margin="normal"
              {...register('amount', { required: true })}
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              fullWidth
              label="Form ID (Optional)"
              type="number"
              margin="normal"
              {...register('form_id')}
              helperText="Link this payment to a specific tax form"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Payments;