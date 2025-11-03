/**
 * GPS Location Picker Component
 * เลือกตำแหน่ง GPS สำหรับสถานที่ต่างๆ
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Map as MapIcon,
} from '@mui/icons-material';

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

interface GPSPickerProps {
  value?: GPSCoordinates;
  onChange: (coords: GPSCoordinates) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: boolean;
}

const GPSPicker: React.FC<GPSPickerProps> = ({
  value,
  onChange,
  label = 'พิกัด GPS',
  required = false,
  helperText,
  error = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGetCurrentLocation = useCallback(() => {
    setLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง GPS');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GPSCoordinates = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        };
        onChange(coords);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'ไม่สามารถระบุตำแหน่งได้';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'ไม่สามารถระบุตำแหน่งได้ในขณะนี้';
            break;
          case error.TIMEOUT:
            errorMessage = 'หมดเวลาการระบุตำแหน่ง';
            break;
        }
        setGpsError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onChange]);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) {
      onChange({ lat, lng: value?.lng || 0 });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) {
      onChange({ lat: value?.lat || 0, lng });
    }
  };

  const isValidThailandCoords = (coords: GPSCoordinates | undefined): boolean => {
    if (!coords) return false;
    // Thailand boundaries approximately
    return (
      coords.lat >= 5.0 &&
      coords.lat <= 21.0 &&
      coords.lng >= 97.0 &&
      coords.lng <= 106.0
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} {required && <Typography component="span" color="error">*</Typography>}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Latitude Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ละติจูด (Latitude)"
              type="number"
              value={value?.lat || ''}
              onChange={handleLatChange}
              inputProps={{
                step: 0.000001,
                min: 5.0,
                max: 21.0,
              }}
              placeholder="เช่น 13.756331"
              error={error || (value !== undefined && !isValidThailandCoords(value))}
              helperText={
                value !== undefined && !isValidThailandCoords(value)
                  ? 'พิกัดอยู่นอกประเทศไทย'
                  : ''
              }
            />
          </Grid>

          {/* Longitude Input */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ลองจิจูด (Longitude)"
              type="number"
              value={value?.lng || ''}
              onChange={handleLngChange}
              inputProps={{
                step: 0.000001,
                min: 97.0,
                max: 106.0,
              }}
              placeholder="เช่น 100.501765"
              error={error || (value !== undefined && !isValidThailandCoords(value))}
            />
          </Grid>

          {/* Get Current Location Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <MyLocationIcon />}
              onClick={handleGetCurrentLocation}
              disabled={loading}
            >
              {loading ? 'กำลังระบุตำแหน่ง...' : 'ใช้ตำแหน่งปัจจุบัน'}
            </Button>
          </Grid>

          {/* Google Maps Link */}
          {value && isValidThailandCoords(value) && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="text"
                startIcon={<MapIcon />}
                href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                ดูใน Google Maps
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Error Alert */}
        {gpsError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {gpsError}
          </Alert>
        )}

        {/* Success Alert */}
        {value && isValidThailandCoords(value) && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✓ พิกัด GPS บันทึกแล้ว: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </Alert>
        )}

        {/* Helper Text */}
        {helperText && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            {helperText}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default GPSPicker;
