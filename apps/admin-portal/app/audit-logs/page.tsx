'use client';

import { Container, Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <LoadingSpinner />;

  const logs = [
    { id: 1, user: 'admin@gacp.go.th', action: 'Login', timestamp: '2025-01-15 10:30:00', ip: '192.168.1.1' },
    { id: 2, user: 'reviewer@gacp.go.th', action: 'Approved Application', timestamp: '2025-01-15 11:45:00', ip: '192.168.1.2' },
    { id: 3, user: 'inspector@gacp.go.th', action: 'Scheduled Inspection', timestamp: '2025-01-15 14:20:00', ip: '192.168.1.3' },
  ];

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📋 Audit Logs
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ErrorBoundary>
  );
}
