import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const TaxCalculator = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/tax-engine/calculate', {
        income: parseFloat(data.income),
        deductions: parseFloat(data.deductions || 0),
        filing_status: data.filing_status
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to calculate taxes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Tax Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate your estimated tax liability based on your income and deductions.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tax Information
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Annual Income"
                type="number"
                margin="normal"
                {...register('income', { 
                  required: 'Income is required',
                  min: { value: 0, message: 'Income must be positive' }
                })}
                error={!!errors.income}
                helperText={errors.income?.message}
                InputProps={{
                  startAdornment: '$',
                }}
              />

              <TextField
                fullWidth
                label="Total Deductions"
                type="number"
                margin="normal"
                {...register('deductions')}
                helperText="Leave blank to use standard deduction"
                InputProps={{
                  startAdornment: '$',
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Filing Status</InputLabel>
                <Select
                  {...register('filing_status')}
                  defaultValue="single"
                  label="Filing Status"
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married_filing_jointly">Married Filing Jointly</MenuItem>
                  <MenuItem value="married_filing_separately">Married Filing Separately</MenuItem>
                  <MenuItem value="head_of_household">Head of Household</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate Tax'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {result && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tax Calculation Results
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Gross Income
                      </Typography>
                      <Typography variant="h6">
                        ${result.gross_income?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Deductions
                      </Typography>
                      <Typography variant="h6">
                        ${result.total_deductions?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Taxable Income
                      </Typography>
                      <Typography variant="h6">
                        ${result.taxable_income?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <CardContent>
                      <Typography variant="body2">
                        Tax Owed
                      </Typography>
                      <Typography variant="h5">
                        ${result.tax_owed?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Effective Rate
                      </Typography>
                      <Typography variant="h6">
                        {result.effective_tax_rate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Marginal Rate
                      </Typography>
                      <Typography variant="h6">
                        {result.marginal_tax_rate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TaxCalculator;