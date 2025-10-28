'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, CircularProgress } from '@mui/material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>System Settings</Typography>
        
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
        
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </ErrorBoundary>
  );
}
