/**
 * Sync Settings Component
 *
 * UI for managing Google Calendar synchronization.
 * Allows inspectors to enable/disable sync and configure settings.
 *
 * @component SyncSettings
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
  Switch,
  FormControlLabel,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { calendarApi } from '../../lib/api/calendar';

interface SyncSettingsProps {
  inspectorId: string;
}

export const SyncSettings: React.FC<SyncSettingsProps> = ({ inspectorId: _inspectorId }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await calendarApi.getSyncStatus();
      setSyncStatus(response.data);
      setSyncEnabled(response.data?.enabled || false);
    } catch (error: any) {
      console.error('Error fetching sync status:', error);
      // If not found, sync is not enabled
      setSyncEnabled(false);
      setSyncStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Load sync status on mount
  useEffect(() => {
    fetchSyncStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle enable sync
  const handleEnableSync = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get Google OAuth URL
      const response = await calendarApi.getGoogleAuthUrl();
      const authUrl = response.data?.authUrl;

      if (authUrl) {
        // Open Google OAuth consent screen in new window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const authWindow = window.open(
          authUrl,
          'Google Calendar Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        const checkWindowClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkWindowClosed);
            // Refresh sync status after OAuth flow
            setTimeout(() => {
              fetchSyncStatus();
            }, 1000);
          }
        }, 500);

        setSuccess('Please authorize Google Calendar access in the popup window');
      }
    } catch (error: any) {
      console.error('Error enabling sync:', error);
      setError(error.response?.data?.message || 'Failed to enable sync');
    } finally {
      setLoading(false);
    }
  };

  // Handle disable sync
  const handleDisableSync = async () => {
    if (!confirm('Are you sure you want to disable Google Calendar sync?')) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await calendarApi.disableGoogleSync();

      setSyncEnabled(false);
      setSyncStatus(null);
      setSuccess('Google Calendar sync disabled successfully');
    } catch (error: any) {
      console.error('Error disabling sync:', error);
      setError(error.response?.data?.message || 'Failed to disable sync');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual sync
  const handleSyncNow = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await calendarApi.syncNow();

      setSuccess('Sync completed successfully');
      fetchSyncStatus();
    } catch (error: any) {
      console.error('Error syncing:', error);
      setError(error.response?.data?.message || 'Failed to sync');
    } finally {
      setLoading(false);
    }
  };

  // Get sync status color
  const getSyncStatusColor = () => {
    if (!syncStatus) return 'default';
    switch (syncStatus.syncStatus) {
      case 'active':
        return 'success';
      case 'error':
        return 'error';
      case 'syncing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Google Calendar Sync
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sync your GACP calendar with Google Calendar for seamless scheduling
          </Typography>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Sync Status Card */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              {/* Enable/Disable Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Sync Status</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncEnabled}
                      onChange={e =>
                        e.target.checked ? handleEnableSync() : handleDisableSync()
                      }
                      disabled={loading}
                    />
                  }
                  label={syncEnabled ? 'Enabled' : 'Disabled'}
                />
              </Box>

              <Divider />

              {/* Sync Details */}
              {syncEnabled && syncStatus && (
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip label={syncStatus.syncStatus} color={getSyncStatusColor()} size="small" />
                  </Box>

                  {syncStatus.lastSyncAt && (
                    <Typography variant="body2" color="text.secondary">
                      Last Sync: {format(new Date(syncStatus.lastSyncAt), 'PPp')}
                    </Typography>
                  )}

                  {syncStatus.nextSyncAt && (
                    <Typography variant="body2" color="text.secondary">
                      Next Sync: {format(new Date(syncStatus.nextSyncAt), 'PPp')}
                    </Typography>
                  )}

                  {syncStatus.syncDirection && (
                    <Typography variant="body2" color="text.secondary">
                      Sync Direction: {syncStatus.syncDirection}
                    </Typography>
                  )}

                  {syncStatus.eventsCount !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      Synced Events: {syncStatus.eventsCount}
                    </Typography>
                  )}

                  {syncStatus.lastError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Last Error: {syncStatus.lastError}
                    </Alert>
                  )}
                </Stack>
              )}

              {/* Not Enabled Message */}
              {!syncEnabled && (
                <Typography variant="body2" color="text.secondary">
                  Google Calendar sync is not enabled. Enable sync to automatically synchronize your
                  calendar events.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Manual Sync Button */}
        {syncEnabled && (
          <Button
            variant="outlined"
            onClick={handleSyncNow}
            disabled={loading || syncStatus?.syncStatus === 'syncing'}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Sync Now'}
          </Button>
        )}

        {/* Information Card */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              ℹ️ How it works
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                • Events created in GACP will be automatically synced to your Google Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Events created in Google Calendar will be imported to GACP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Sync occurs automatically every hour
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You can manually trigger sync at any time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Conflicts are detected and displayed in the calendar
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> We only access your calendar events and do not have
            access to your other Google data. You can revoke access at any time from your Google
            Account settings.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};

export default SyncSettings;
