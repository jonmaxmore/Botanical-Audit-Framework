'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TablePagination,
  CircularProgress,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CloudUpload,
  Visibility,
  Download,
  Delete,
  CheckCircle,
  Schedule,
  Cancel,
  Refresh,
  Search,
  Clear,
} from '@mui/icons-material';
import Link from 'next/link';
import {
  getDocuments,
  getDocumentStatistics,
  deleteDocument,
  downloadDocument,
  type Document,
} from '@/lib/api/documents';
import { formatFileSize } from '@/lib/validations/documentSchema';

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle fontSize="small" />;
    case 'pending':
      return <Schedule fontSize="small" />;
    case 'rejected':
      return <Cancel fontSize="small" />;
    default:
      return <Schedule fontSize="small" />;
  }
};

export default function DocumentListPage() {
  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Handle delete document
  const handleDelete = async (documentId: string, documentTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${documentTitle}"?`)) {
      return;
    }

    try {
      setDeleteLoading(documentId);

      const response = await deleteDocument(documentId);

      if (response.success) {
        // Trigger refresh by incrementing counter
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      alert('Failed to delete document. Please try again.');
      console.error('Error deleting document:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle download document
  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const blob = await downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download document. Please try again.');
      console.error('Error downloading document:', err);
    }
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle search with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setPage(0); // Reset to first page on search
      setRefreshTrigger((prev) => prev + 1);
    }, 500);

    setSearchDebounce(timeout);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as 'all' | 'pending' | 'approved' | 'rejected');
    setPage(0); // Reset to first page
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle document type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(event.target.value as string);
    setPage(0); // Reset to first page
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  // Fetch data on component mount and when pagination changes
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getDocuments({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          documentType: typeFilter !== 'all' ? typeFilter : undefined,
        });

        if (response.success && response.data) {
          setDocuments(response.data.documents);
          setTotalDocuments(response.data.total);
        }
      } catch (err) {
        setError('Failed to load documents. Please try again.');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [page, rowsPerPage, refreshTrigger, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await getDocumentStatistics();

        if (response.success && response.data) {
          setStatistics(response.data);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
      }
    };

    loadStatistics();
  }, [refreshTrigger]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6 flex justify-between items-start">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800">
              My Documents 📄
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Manage all your uploaded GACP certification documents.
            </Typography>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              className="border-gray-300"
            >
              Refresh
            </Button>
            <Link href="/farmer/documents/upload">
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upload New
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper className="p-4 mb-6">
          <Box className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <TextField
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              className="flex-1"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Status Filter */}
            <FormControl variant="outlined" size="small" className="w-full md:w-48">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={handleStatusFilterChange} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            {/* Document Type Filter */}
            <FormControl variant="outlined" size="small" className="w-full md:w-56">
              <InputLabel>Document Type</InputLabel>
              <Select value={typeFilter} onChange={handleTypeFilterChange} label="Document Type">
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Farm Registration">Farm Registration</MenuItem>
                <MenuItem value="Land Certificate">Land Certificate</MenuItem>
                <MenuItem value="Water Test">Water Test</MenuItem>
                <MenuItem value="Soil Test">Soil Test</MenuItem>
                <MenuItem value="Cultivation Plan">Cultivation Plan</MenuItem>
                <MenuItem value="Organic Certificate">Organic Certificate</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box className="mt-3 flex flex-wrap gap-2">
              <Typography variant="body2" className="text-gray-600 mr-2">
                Active filters:
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size="small"
                  onDelete={() => {
                    setSearchQuery('');
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  size="small"
                  onDelete={() => {
                    setStatusFilter('all');
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              )}
              {typeFilter !== 'all' && (
                <Chip
                  label={`Type: ${typeFilter}`}
                  size="small"
                  onDelete={() => {
                    setTypeFilter('all');
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Statistics Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Paper className="p-4 text-center">
            {loading && !statistics.total ? (
              <Skeleton variant="text" height={40} />
            ) : (
              <Typography variant="h4" className="font-bold text-blue-600">
                {statistics.total}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              Total
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            {loading && !statistics.pending ? (
              <Skeleton variant="text" height={40} />
            ) : (
              <Typography variant="h4" className="font-bold text-orange-600">
                {statistics.pending}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              Pending
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            {loading && !statistics.approved ? (
              <Skeleton variant="text" height={40} />
            ) : (
              <Typography variant="h4" className="font-bold text-green-600">
                {statistics.approved}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              Approved
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            {loading && !statistics.rejected ? (
              <Skeleton variant="text" height={40} />
            ) : (
              <Typography variant="h4" className="font-bold text-red-600">
                {statistics.rejected}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              Rejected
            </Typography>
          </Paper>
        </Box>

        {/* Documents Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Document Title</TableCell>
                  <TableCell className="font-semibold">Type</TableCell>
                  <TableCell className="font-semibold">Upload Date</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">File Size</TableCell>
                  <TableCell className="font-semibold">Reviewer</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  [...Array(rowsPerPage)].map((_, index) => (
                    <TableRow key={`skeleton-row-${index}`}>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-8">
                      <Typography variant="body1" className="text-gray-500">
                        No documents found. Upload your first document to get started!
                      </Typography>
                      <Link href="/farmer/documents/upload">
                        <Button
                          variant="contained"
                          startIcon={<CloudUpload />}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          Upload Document
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Document rows
                  documents.map((doc) => (
                    <TableRow key={doc._id} hover>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {doc.documentTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {doc.documentType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {formatDate(doc.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(doc.status)}
                          label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          color={getStatusColor(doc.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {formatFileSize(doc.fileSize)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {doc.reviewedBy || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box className="flex gap-1 justify-center">
                          <Link href={`/farmer/documents/${doc._id}`}>
                            <IconButton size="small" color="primary" title="View">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Link>
                          <IconButton
                            size="small"
                            color="success"
                            title="Download"
                            onClick={() => handleDownload(doc._id, doc.fileName)}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            title="Delete"
                            onClick={() => handleDelete(doc._id, doc.documentTitle)}
                            disabled={deleteLoading === doc._id}
                          >
                            {deleteLoading === doc._id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Delete fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalDocuments}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Success Notice */}
        <Box className="mt-6 p-4 bg-green-50 rounded-lg">
          <Typography variant="body2" className="text-green-800">
            ✅ <strong>Week 2 Day 3-4 Complete:</strong> Search and filter features added to
            document list!
          </Typography>
          <Typography variant="body2" className="text-green-800 mt-2">
            ✨ Features: Real-time search (debounced 500ms), status filter, document type filter,
            clear filters, active filter chips, pagination, delete, download.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
