import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Alert, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage('');
      await axios.put('/api/auth/profile', data);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="container">
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Update your personal information and account settings.
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                {...register('full_name', { required: 'Full name is required' })}
                error={!!errors.full_name}
                helperText={errors.full_name?.message}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                {...register('email', { required: 'Email is required' })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label="Phone"
                margin="normal"
                {...register('phone')}
              />

              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                margin="normal"
                {...register('address')}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Account Type: Individual
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Member Since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Status: {user?.is_active ? 'Active' : 'Inactive'}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Verified: {user?.is_verified ? 'Yes' : 'No'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;