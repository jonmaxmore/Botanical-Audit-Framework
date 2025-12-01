'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import apiClient from '@/lib/api-client';

// Schema validation
const certificateSchema = z.object({
  farmName: z.string().min(1, 'Farm Name is required'),
  farmerName: z.string().min(1, 'Farmer Name is required'),
  cropType: z.string().min(1, 'Crop Type is required'),
  issueDate: z.string().min(1, 'Issue Date is required'),
  expiryDate: z.string().min(1, 'Expiry Date is required'),
  status: z.enum(['Active', 'Expired', 'Revoked']).default('Active'),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function CreateCertificatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      status: 'Active',
    },
  });

  const onSubmit = async (data: CertificateFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        farmName: data.farmName,
        farmerName: data.farmerName,
        cropType: data.cropType,
        validFrom: new Date(data.issueDate).toISOString(),
        validUntil: new Date(data.expiryDate).toISOString(),
        status: data.status,
        // Add other required fields if any, or let backend handle defaults
      };

      const response = await apiClient.post('/certificates', payload);

      if (response.data.success) {
        setSuccessMessage('Certificate created successfully!');
        // Redirect after short delay
        setTimeout(() => {
          router.push('/certificates');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error creating certificate:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to create certificate. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back to List
      </Button>

      <Typography variant="h4" gutterBottom>
        📝 Issue New Certificate
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Farm Name"
                {...register('farmName')}
                error={!!errors.farmName}
                helperText={errors.farmName?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Farmer Name"
                {...register('farmerName')}
                error={!!errors.farmerName}
                helperText={errors.farmerName?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Crop Type"
                defaultValue=""
                inputProps={register('cropType')}
                error={!!errors.cropType}
                helperText={errors.cropType?.message}
              >
                <MenuItem value="Cannabis">Cannabis</MenuItem>
                <MenuItem value="Hemp">Hemp</MenuItem>
                <MenuItem value="Herbs">Herbs</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Issue Date"
                InputLabelProps={{ shrink: true }}
                {...register('issueDate')}
                error={!!errors.issueDate}
                helperText={errors.issueDate?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                {...register('expiryDate')}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Certificate'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
