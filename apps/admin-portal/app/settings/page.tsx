'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, CircularProgress, Alert, Snackbar } from '@mui/material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data.data || data || {});
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      setSnackbar({ open: true, message: 'บันทึกการตั้งค่าสำเร็จ', severity: 'success' });
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSnackbar({ open: true, message: err.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>System Settings</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {Object.keys(settings).length === 0 && !error && (
          <Alert severity="info" sx={{ mb: 3 }}>No settings configured - Please configure via API</Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Application Settings</Typography>
                <TextField fullWidth label="Application Fee (THB)" defaultValue="5000" sx={{ mb: 2 }} />
                <TextField fullWidth label="Certification Fee (THB)" defaultValue="25000" sx={{ mb: 2 }} />
                <TextField fullWidth label="Max Resubmissions" defaultValue="2" type="number" />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Notification Settings</Typography>
                <TextField fullWidth label="Email From" defaultValue="noreply@gacp.com" sx={{ mb: 2 }} />
                <TextField fullWidth label="SMS Gateway" defaultValue="Thai SMS Gateway" sx={{ mb: 2 }} />
                <TextField fullWidth label="LINE Notify Token" type="password" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Button variant="contained" onClick={handleSave} disabled={saving || Object.keys(settings).length === 0} sx={{ mt: 3 }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}
