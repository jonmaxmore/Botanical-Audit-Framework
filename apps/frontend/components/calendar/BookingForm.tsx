/**
 * Booking Form Component
 *
 * Form for farmers to book inspector appointments.
 * Includes inspector selection, time slot picker, and booking details.
 *
 * @component BookingForm
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { AvailabilityPicker } from './AvailabilityPicker';
import { calendarApi } from '../../lib/api/calendar';

interface Inspector {
  _id: string;
  userId: string;
  name: string;
  province: string;
  district: string;
  specializations: string[];
  rating: number;
}

interface BookingFormProps {
  farmId: string;
  applicationId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const steps = ['Select Inspector', 'Choose Time Slot', 'Confirm Details'];

export const BookingForm: React.FC<BookingFormProps> = ({
  farmId,
  applicationId,
  onSuccess,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState({
    purpose: '',
    specialRequirements: '',
    contactPerson: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available inspectors
  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual inspector API endpoint
      // For now, using mock data
      const mockInspectors = [
        {
          _id: '1',
          userId: 'inspector1',
          name: 'สมชาย ใจดี',
          province: 'เชียงใหม่',
          district: 'เมือง',
          specializations: ['Organic Farming', 'GAP'],
          rating: 4.8
        },
        {
          _id: '2',
          userId: 'inspector2',
          name: 'สมหญิง รักษาดี',
          province: 'เชียงใหม่',
          district: 'สันทราย',
          specializations: ['GACP', 'Herbal Plants'],
          rating: 4.9
        }
      ];
      setInspectors(mockInspectors);
    } catch (error: any) {
      console.error('Error fetching inspectors:', error);
      setError('Failed to load inspectors');
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && !selectedInspector) {
      setError('Please select an inspector');
      return;
    }
    if (activeStep === 1 && !selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    setError('');
    setActiveStep(prev => prev + 1);
  };

  // Handle back step
  const handleBack = () => {
    setError('');
    setActiveStep(prev => prev - 1);
  };

  // Handle form change
  const handleDetailsChange = (field: string, value: string) => {
    setBookingDetails(prev => ({ ...prev, [field]: value }));
  };

  // Submit booking
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingData = {
        inspectorId: selectedInspector,
        startTime: selectedSlot.start.toISOString(),
        endTime: selectedSlot.end.toISOString(),
        farmId,
        applicationId,
        purpose: bookingDetails.purpose,
        specialRequirements: bookingDetails.specialRequirements,
        contactPerson: bookingDetails.contactPerson,
        contactPhone: bookingDetails.contactPhone
      };

      await calendarApi.bookInspection(bookingData);

      // Success
      onSuccess();
    } catch (error: any) {
      console.error('Error booking inspection:', error);
      setError(error.response?.data?.message || 'Failed to book inspection');
    } finally {
      setLoading(false);
    }
  };

  // Get selected inspector details
  const getInspectorDetails = () => {
    return inspectors.find(i => i._id === selectedInspector);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Step 0: Select Inspector */}
      {activeStep === 0 && (
        <Stack spacing={3}>
          <Typography variant="h6">Select Inspector</Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Inspector</InputLabel>
              <Select
                value={selectedInspector}
                onChange={e => setSelectedInspector(e.target.value)}
                label="Inspector"
              >
                {inspectors.map(inspector => (
                  <MenuItem key={inspector._id} value={inspector._id}>
                    {inspector.name} - {inspector.province} ({inspector.district}) - Rating:{' '}
                    {inspector.rating}⭐
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {selectedInspector && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Inspector Details
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {getInspectorDetails()?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {getInspectorDetails()?.province},{' '}
                  {getInspectorDetails()?.district}
                </Typography>
                <Typography variant="body2">
                  <strong>Specializations:</strong>{' '}
                  {getInspectorDetails()?.specializations.join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Rating:</strong> {getInspectorDetails()?.rating}⭐
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Step 1: Choose Time Slot */}
      {activeStep === 1 && (
        <Stack spacing={3}>
          <Typography variant="h6">Choose Time Slot</Typography>
          <Typography variant="body2" color="text.secondary">
            Standard inspection duration: 120 minutes
          </Typography>

          <AvailabilityPicker
            inspectorId={selectedInspector}
            duration={120}
            onSelectSlot={setSelectedSlot}
            selectedSlot={selectedSlot}
          />
        </Stack>
      )}

      {/* Step 2: Confirm Details */}
      {activeStep === 2 && (
        <Stack spacing={3}>
          <Typography variant="h6">Confirm Booking Details</Typography>

          {/* Booking Summary */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Booking Summary
              </Typography>
              <Typography variant="body2">
                <strong>Inspector:</strong> {getInspectorDetails()?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {selectedSlot?.start.toLocaleDateString('th-TH')}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {selectedSlot?.start.toLocaleTimeString('th-TH')} -{' '}
                {selectedSlot?.end.toLocaleTimeString('th-TH')}
              </Typography>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <TextField
            label="Purpose of Inspection"
            value={bookingDetails.purpose}
            onChange={e => handleDetailsChange('purpose', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="e.g., GACP certification inspection"
          />

          <TextField
            label="Special Requirements"
            value={bookingDetails.specialRequirements}
            onChange={e => handleDetailsChange('specialRequirements', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Any special requirements or notes"
          />

          <TextField
            label="Contact Person"
            value={bookingDetails.contactPerson}
            onChange={e => handleDetailsChange('contactPerson', e.target.value)}
            fullWidth
            placeholder="Name of contact person on farm"
          />

          <TextField
            label="Contact Phone"
            value={bookingDetails.contactPhone}
            onChange={e => handleDetailsChange('contactPhone', e.target.value)}
            fullWidth
            placeholder="Phone number for day of inspection"
          />
        </Stack>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={activeStep === 0 ? onCancel : handleBack} disabled={loading}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BookingForm;
