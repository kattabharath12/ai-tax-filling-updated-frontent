import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="container">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Register
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your Tax Engine account
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
            label="Password"
            type="password"
            margin="normal"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Typography align="center">
            Already have an account? <Link to="/login">Login here</Link>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;