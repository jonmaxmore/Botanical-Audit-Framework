'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
  Alert,
  Skeleton,
  Snackbar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
// Dynamic import for ReviewDialog (code splitting)
const ReviewDialog = dynamic(() => import('@/components/ReviewDialog'), {
  ssr: false,
  loading: () => null,
});
import {
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Refresh,
  Search,
  Clear,
} from '@mui/icons-material';
import {
  getApplications,
  getApplicationStatistics,
  downloadApplicationDocument,
  type Application,
} from '@/lib/api/applications';

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

export default function DTAMReviewPage() {
  // State management
  const [applications, setApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalApplications, setTotalApplications] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Success notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all',
  );
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Fetch applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getApplications({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
        });
        if (response.data) {
          setApplications(response.data.applications);
          setTotalApplications(response.data.total);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [page, rowsPerPage, refreshTrigger, searchQuery, statusFilter, urgencyFilter]);

  // Fetch statistics
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await getApplicationStatistics();
        if (response.data) {
          setStatistics(response.data);
        }
      } catch (err) {
        console.error('Failed to load statistics:', err);
      }
    };

    loadStatistics();
  }, [refreshTrigger]);

  // Event handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
      setRefreshTrigger(prev => prev + 1);
    }, 500);

    setSearchDebounce(timeout);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as 'all' | 'pending' | 'approved' | 'rejected');
    setPage(0);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle urgency filter change
  const handleUrgencyFilterChange = (event: SelectChangeEvent<string>) => {
    setUrgencyFilter(event.target.value as 'all' | 'low' | 'medium' | 'high');
    setPage(0);
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setPage(0);
    setRefreshTrigger(prev => prev + 1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || urgencyFilter !== 'all';

  const handleOpenReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewDialogOpen(true);
  };

  const handleCloseReview = () => {
    setReviewDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleReviewComplete = () => {
    setSuccessMessage('Application reviewed successfully');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDownload = async (applicationId: string, fileName: string) => {
    try {
      const blob = await downloadApplicationDocument(applicationId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download document';
      setError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6 flex justify-between items-start">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800">
              Review Applications 📋
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Review and approve farmer certification applications.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper className="p-4 mb-6">
          <Box className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <TextField
              placeholder="Search by farmer name..."
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

            {/* Urgency Filter */}
            <FormControl variant="outlined" size="small" className="w-full md:w-48">
              <InputLabel>Urgency</InputLabel>
              <Select value={urgencyFilter} onChange={handleUrgencyFilterChange} label="Urgency">
                <MenuItem value="all">All Urgency</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
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
                    setRefreshTrigger(prev => prev + 1);
                  }}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  size="small"
                  onDelete={() => {
                    setStatusFilter('all');
                    setRefreshTrigger(prev => prev + 1);
                  }}
                />
              )}
              {urgencyFilter !== 'all' && (
                <Chip
                  label={`Urgency: ${urgencyFilter}`}
                  size="small"
                  onDelete={() => {
                    setUrgencyFilter('all');
                    setRefreshTrigger(prev => prev + 1);
                  }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Statistics Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Paper className="p-4 text-center">
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} className="mx-auto" />
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
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} className="mx-auto" />
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
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} className="mx-auto" />
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
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} className="mx-auto" />
            ) : (
              <Typography variant="h4" className="font-bold text-red-600">
                {statistics.rejected}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              Rejected
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} className="mx-auto" />
            ) : (
              <Typography variant="h4" className="font-bold text-purple-600">
                {statistics.highPriority}
              </Typography>
            )}
            <Typography variant="body2" className="text-gray-600">
              High Priority
            </Typography>
          </Paper>
        </Box>

        {/* Applications Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Farmer Name</TableCell>
                  <TableCell className="font-semibold">Farm Name</TableCell>
                  <TableCell className="font-semibold">Document</TableCell>
                  <TableCell className="font-semibold">Type</TableCell>
                  <TableCell className="font-semibold">Submit Date</TableCell>
                  <TableCell className="font-semibold">Urgency</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  [...Array(rowsPerPage)].map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
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
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={100} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : applications.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-12">
                      <Typography variant="body1" className="text-gray-500">
                        No applications found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  applications.map(app => (
                    <TableRow key={app._id} hover>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {app.farmerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {app.farmName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {app.documentTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {app.documentType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {formatDate(app.submitDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.urgency.charAt(0).toUpperCase() + app.urgency.slice(1)}
                          color={getUrgencyColor(app.urgency)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(app.status)}
                          label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          color={getStatusColor(app.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box className="flex gap-1 justify-center">
                          <IconButton
                            size="small"
                            color="primary"
                            title="Download Document"
                            onClick={() => handleDownload(app._id, app.fileName)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          {app.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                title="Review Application"
                                onClick={() => handleOpenReview(app)}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                title="Review Application"
                                onClick={() => handleOpenReview(app)}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </>
                          )}
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
            count={totalApplications}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Review Dialog */}
        <ReviewDialog
          open={reviewDialogOpen}
          onClose={handleCloseReview}
          application={selectedApplication}
          onReviewComplete={handleReviewComplete}
        />

        {/* Success Notification */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Week 2 Notice */}
        <Box className="mt-6 p-4 bg-green-50 rounded-lg">
          <Typography variant="body2" className="text-green-800">
            ✅ <strong>Week 2 Day 3-4 Complete:</strong> Search and filter features added to
            application review!
          </Typography>
          <Typography variant="body2" className="text-green-800 mt-2">
            ✨ Features: Real-time search (debounced 500ms), status filter, urgency filter, clear
            filters, active filter chips, review dialog, approve/reject, download documents.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
