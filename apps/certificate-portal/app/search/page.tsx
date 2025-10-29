'use client';

import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Card, CardContent, Alert } from '@mui/material';
import { Search } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    setResult(null);

    if (!query.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    // Mock search
    if (query === 'GACP-2025-0001') {
      setResult({
        id: 'GACP-2025-0001',
        farmName: 'ฟาร์มกัญชาเขียว',
        owner: 'นายสมชาย ใจดี',
        status: 'Active',
        issueDate: '2025-01-10',
        expiryDate: '2026-01-10',
      });
    } else {
      setError('Certificate not found');
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔍 Search Certificates
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Enter certificate number (e.g., GACP-2025-0001)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" startIcon={<Search />} onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {result && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {result.id}
              </Typography>
              <Typography variant="body1">Farm: {result.farmName}</Typography>
              <Typography variant="body1">Owner: {result.owner}</Typography>
              <Typography variant="body1">Status: {result.status}</Typography>
              <Typography variant="body1">Issued: {result.issueDate}</Typography>
              <Typography variant="body1">Expires: {result.expiryDate}</Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </ErrorBoundary>
  );
}
