'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Delete,
  Description,
  CalendarToday,
  Person,
  CheckCircle,
  Cancel,
  Pending,
  Fullscreen,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getDocumentById,
  deleteDocument,
  downloadDocument,
  type Document as DocumentType,
} from '@/lib/api/documents';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [doc, setDoc] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Load document details
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDocumentById(documentId);

        if (response.success && response.data) {
          setDoc(response.data);
        } else {
          setError(response.message || 'Failed to load document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  // Handle download
  const handleDownload = async () => {
    if (!doc) return;

    try {
      setDownloading(true);
      const blob = await downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await deleteDocument(documentId);

      if (response.success) {
        router.push('/farmer/documents/list');
      } else {
        setError(response.message || 'Failed to delete document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: <CheckCircle />, color: 'success' as const, label: 'Approved' };
      case 'rejected':
        return { icon: <Cancel />, color: 'error' as const, label: 'Rejected' };
      default:
        return { icon: <Pending />, color: 'warning' as const, label: 'Pending' };
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get file type for preview
  const getFileType = (fileName: string): 'pdf' | 'image' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'other';
  };

  // Render preview
  const renderPreview = () => {
    if (!doc) return null;

    const fileType = getFileType(doc.fileName);
    const previewUrl = `/api/documents/${documentId}/preview`;

    if (fileType === 'pdf') {
      return (
        <Box className="w-full h-96 border rounded-lg overflow-hidden bg-gray-50">
          <iframe src={previewUrl} className="w-full h-full" title="Document Preview" />
        </Box>
      );
    }

    if (fileType === 'image') {
      return (
        <Box className="w-full flex justify-center border rounded-lg overflow-hidden bg-gray-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={doc.documentTitle}
            className="max-w-full max-h-96 object-contain"
          />
        </Box>
      );
    }

    return (
      <Card variant="outlined" className="bg-gray-50">
        <CardContent className="text-center py-8">
          <Description className="text-gray-400" style={{ fontSize: 64 }} />
          <Typography variant="body1" color="textSecondary" className="mt-4">
            Preview not available for this file type
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click the download button to view the file
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout userRole="farmer">
      <Box className="p-6">
        {/* Header with Back Button */}
        <Box className="flex items-center justify-between mb-6">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/farmer/documents/list')}
            variant="outlined"
          >
            Back to Documents
          </Button>

          {doc && (
            <Box className="flex gap-2">
              <Button
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                onClick={handleDownload}
                disabled={downloading}
                variant="contained"
                color="primary"
              >
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box className="flex justify-center items-center py-20">
            <CircularProgress />
          </Box>
        )}

        {/* Document Details */}
        {!loading && doc && (
          <Grid container spacing={3}>
            {/* Left Column - Document Info */}
            <Grid item xs={12} md={8}>
              {/* Document Header */}
              <Paper className="p-6 mb-4">
                <Box className="flex items-start justify-between mb-4">
                  <Box className="flex-1">
                    <Typography variant="h5" className="mb-2 font-semibold">
                      {doc.documentTitle}
                    </Typography>
                    <Box className="flex gap-2 flex-wrap">
                      <Chip
                        label={doc.documentType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={getStatusConfig(doc.status).icon}
                        label={getStatusConfig(doc.status).label}
                        size="small"
                        color={getStatusConfig(doc.status).color}
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider className="my-4" />

                {/* Description */}
                {doc.description && (
                  <>
                    <Typography variant="subtitle2" className="mb-2 font-semibold">
                      Description
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      {doc.description}
                    </Typography>
                  </>
                )}

                {/* File Information */}
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  File Information
                </Typography>
                <Box className="space-y-2">
                  <Box className="flex items-center gap-2">
                    <Description className="text-gray-500" fontSize="small" />
                    <Typography variant="body2">
                      <strong>File Name:</strong> {doc.fileName}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Description className="text-gray-500" fontSize="small" />
                    <Typography variant="body2">
                      <strong>File Size:</strong> {formatFileSize(doc.fileSize)}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <CalendarToday className="text-gray-500" fontSize="small" />
                    <Typography variant="body2">
                      <strong>Uploaded:</strong> {formatDate(doc.createdAt)}
                    </Typography>
                  </Box>
                  {doc.updatedAt !== doc.createdAt && (
                    <Box className="flex items-center gap-2">
                      <CalendarToday className="text-gray-500" fontSize="small" />
                      <Typography variant="body2">
                        <strong>Last Updated:</strong> {formatDate(doc.updatedAt)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Document Preview */}
              <Paper className="p-6">
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold">
                    Document Preview
                  </Typography>
                  <Button
                    startIcon={<Fullscreen />}
                    onClick={() => setPreviewDialogOpen(true)}
                    size="small"
                  >
                    Fullscreen
                  </Button>
                </Box>
                {renderPreview()}
              </Paper>
            </Grid>

            {/* Right Column - Review Information */}
            <Grid item xs={12} md={4}>
              <Paper className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold">
                  Review Information
                </Typography>

                <Box className="space-y-4">
                  {/* Status */}
                  <Box>
                    <Typography variant="subtitle2" className="mb-2 text-gray-600">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusConfig(doc.status).icon}
                      label={getStatusConfig(doc.status).label}
                      color={getStatusConfig(doc.status).color}
                      className="w-full"
                    />
                  </Box>

                  <Divider />

                  {/* Reviewer Information */}
                  {doc.reviewedBy && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" className="mb-2 text-gray-600">
                          Reviewed By
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <Person className="text-gray-500" fontSize="small" />
                          <Typography variant="body2">{doc.reviewedBy}</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" className="mb-2 text-gray-600">
                          Reviewed At
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <CalendarToday className="text-gray-500" fontSize="small" />
                          <Typography variant="body2">{formatDate(doc.reviewedAt!)}</Typography>
                        </Box>
                      </Box>

                      <Divider />
                    </>
                  )}

                  {/* Review Comment */}
                  {doc.reviewComment && (
                    <Box>
                      <Typography variant="subtitle2" className="mb-2 text-gray-600">
                        Review Comment
                      </Typography>
                      <Alert severity={doc.status === 'rejected' ? 'error' : 'info'}>
                        {doc.reviewComment}
                      </Alert>
                    </Box>
                  )}

                  {/* Pending Status Message */}
                  {doc.status === 'pending' && (
                    <Alert severity="info">
                      Your document is currently under review. You will be notified once it has been
                      reviewed.
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this document? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={20} /> : null}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fullscreen Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box className="flex items-center justify-between">
              <Typography variant="h6">{doc?.documentTitle}</Typography>
              <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box className="min-h-[70vh]">
              {doc && getFileType(doc.fileName) === 'pdf' && (
                <iframe
                  src={`/api/documents/${documentId}/preview`}
                  className="w-full h-[70vh]"
                  title="Document Preview"
                />
              )}
              {doc && getFileType(doc.fileName) === 'image' && (
                <Box className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/documents/${documentId}/preview`}
                    alt={doc.documentTitle}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Week 2 Notice */}
        <Paper className="mt-6 p-4 bg-green-50 border-l-4 border-green-500">
          <Typography variant="subtitle2" className="font-semibold text-green-800 mb-2">
            ✅ Week 2 Day 4-5 Complete: Document Details & Download!
          </Typography>
          <Typography variant="body2" className="text-green-700">
            Features: Dynamic document page, full details display, PDF/image preview, download
            button, delete with confirmation, review information display, status chips, fullscreen
            preview dialog, back navigation, file size formatting, date formatting
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
