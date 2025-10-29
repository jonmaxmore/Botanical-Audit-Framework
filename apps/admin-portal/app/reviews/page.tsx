'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { getApplications } from '@/lib/api/applications';
import { useRouter } from 'next/navigation';

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApplications({ status: 'under_review', limit: 50 });
      setReviews(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Document Reviews</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Farm Name</TableCell>
                <TableCell>Reviewer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No reviews pending</TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.applicationNumber || review.id}</TableCell>
                    <TableCell>{review.farmName}</TableCell>
                    <TableCell>{review.assignedReviewer?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip label={review.status} color={review.status === 'approved' ? 'success' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>{new Date(review.submittedAt || review.createdAt).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => router.push(`/applications/${review.id}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ErrorBoundary>
  );
}
