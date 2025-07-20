import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const TaxForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/forms/');
      setForms(response.data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createForm = async (data) => {
    try {
      await axios.post('/api/forms/', {
        form_type: data.form_type,
        tax_year: parseInt(data.tax_year)
      });
      setOpen(false);
      reset();
      fetchForms();
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'filed': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container className="container">
        <Typography>Loading forms...</Typography>
      </Container>
    );
  }

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Tax Forms
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your tax forms and track their completion status.
      </Typography>

      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
      >
        Create New Form
      </Button>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} md={6} lg={4} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {form.form_type}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Tax Year: {form.tax_year}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Created: {new Date(form.created_at).toLocaleDateString()}
                </Typography>
                <Chip 
                  label={form.status.replace('_', ' ')} 
                  color={getStatusColor(form.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <br />
                {form.calculated_tax && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Calculated Tax: ${form.calculated_tax}
                  </Typography>
                )}
                <Button variant="contained" size="small">
                  {form.status === 'completed' ? 'View Form' : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {forms.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
          No tax forms found. Create your first form to get started.
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tax Form</DialogTitle>
        <form onSubmit={handleSubmit(createForm)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Form Type"
              margin="normal"
              {...register('form_type', { required: true })}
              placeholder="e.g., 1040, 1040EZ"
            />
            <TextField
              fullWidth
              label="Tax Year"
              type="number"
              margin="normal"
              {...register('tax_year', { required: true })}
              defaultValue={new Date().getFullYear() - 1}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TaxForms;