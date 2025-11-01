'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, Description } from '@mui/icons-material';
import { reviewApplication, type Application } from '@/lib/api/applications';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  onReviewComplete: () => void;
}

export default function ReviewDialog({
  open,
  onClose,
  application,
  onReviewComplete,
}: ReviewDialogProps) {
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

  const handleClose = () => {
    setReviewComment('');
    setError(null);
    setReviewAction(null);
    onClose();
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!application) return;

    // Require comment for rejection
    if (status === 'rejected' && !reviewComment.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError(null);
    setReviewAction(status);

    try {
      await reviewApplication({
        applicationId: application._id,
        status,
        reviewComment: reviewComment.trim() || undefined,
      });

      // Success - close dialog and refresh table
      handleClose();
      onReviewComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      setLoading(false);
      setReviewAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!application) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gray-50">
        <Box className="flex items-center gap-2">
          <Description className="text-orange-600" />
          <Typography variant="h6" component="span">
            Review Application
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Application Details */}
        <Box className="space-y-4">
          {/* Farmer & Farm Info */}
          <Box>
            <Typography variant="subtitle2" className="text-gray-600 mb-2">
              Farmer Information
            </Typography>
            <Box className="grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Farmer Name
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {application.farmerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Farm Name
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {application.farmName}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Document Info */}
          <Box>
            <Typography variant="subtitle2" className="text-gray-600 mb-2">
              Document Information
            </Typography>
            <Box className="space-y-2">
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Document Title
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {application.documentTitle}
                </Typography>
              </Box>
              <Box className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-500">
                    Document Type
                  </Typography>
                  <Typography variant="body1">{application.documentType}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-500">
                    File Size
                  </Typography>
                  <Typography variant="body1">{formatFileSize(application.fileSize)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Status & Dates */}
          <Box>
            <Typography variant="subtitle2" className="text-gray-600 mb-2">
              Application Status
            </Typography>
            <Box className="grid grid-cols-3 gap-4">
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Submit Date
                </Typography>
                <Typography variant="body1">{formatDate(application.submitDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Status
                </Typography>
                <Chip
                  label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  color={getStatusColor(application.status)}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" className="text-gray-500">
                  Urgency
                </Typography>
                <Chip
                  label={application.urgency.charAt(0).toUpperCase() + application.urgency.slice(1)}
                  color={getUrgencyColor(application.urgency)}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Review Comment Field */}
          <Box>
            <Typography variant="subtitle2" className="text-gray-600 mb-2">
              Review Comment
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder={
                reviewAction === 'rejected'
                  ? 'Please provide a reason for rejection (required)'
                  : 'Add optional comments about this review'
              }
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              disabled={loading}
              error={reviewAction === 'rejected' && !reviewComment.trim()}
              helperText={
                reviewAction === 'rejected' && !reviewComment.trim()
                  ? 'Comment is required for rejection'
                  : ''
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => handleReview('rejected')}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={
            loading && reviewAction === 'rejected' ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Cancel />
            )
          }
        >
          {loading && reviewAction === 'rejected' ? 'Rejecting...' : 'Reject'}
        </Button>
        <Button
          onClick={() => handleReview('approved')}
          color="success"
          variant="contained"
          disabled={loading}
          startIcon={
            loading && reviewAction === 'approved' ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircle />
            )
          }
        >
          {loading && reviewAction === 'approved' ? 'Approving...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
