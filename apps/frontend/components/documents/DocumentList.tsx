/**
 * DocumentList Component
 * Display and manage documents with filtering and pagination
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  History as HistoryIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Document {
  _id: string;
  documentId: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  status: string;
  filename: string;
  mimetype: string;
  filesize: number;
  uploadedBy: {
    userId: string;
    name: string;
    role: string;
  };
  uploadedAt: string;
  currentVersion: number;
  tags?: string[];
  applicationId?: string;
  certificateId?: string;
  inspectionId?: string;
}

interface DocumentListProps {
  onDocumentClick?: (document: Document) => void;
  onDocumentDownload?: (documentId: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentEdit?: (document: Document) => void;
  onDocumentApprove?: (documentId: string) => void;
  onDocumentReject?: (documentId: string, reason: string) => void;
  filterByType?: string;
  filterByCategory?: string;
  filterByEntityId?: string;
  showActions?: boolean;
  compact?: boolean;
}

export default function DocumentList({
  onDocumentClick,
  onDocumentDownload,
  onDocumentDelete,
  onDocumentEdit,
  onDocumentApprove,
  onDocumentReject,
  filterByType,
  filterByCategory,
  filterByEntityId,
  showActions = true,
  compact = false
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(filterByType || '');
  const [categoryFilter, setCategoryFilter] = useState(filterByCategory || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const limit = compact ? 5 : 10;

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, [page, typeFilter, categoryFilter, statusFilter, searchQuery, filterByEntityId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (filterByEntityId) params.append('entityId', filterByEntityId);

      const response = await fetch(`/api/documents?${params.toString()}`, {
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        }
      });

      if (!response.ok) throw new Error('ไม่สามารถโหลดเอกสารได้');

      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // Get file icon
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (mimetype === 'application/pdf') {
      return <PdfIcon color="error" />;
    }
    return <FileIcon />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending_review':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'info';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'ฉบับร่าง',
      uploaded: 'อัปโหลดแล้ว',
      pending_review: 'รอตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
      archived: 'เก็บถาวร',
      deleted: 'ลบแล้ว'
    };
    return labels[status] || status;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  // Handle actions
  const handleView = () => {
    if (selectedDocument && onDocumentClick) {
      onDocumentClick(selectedDocument);
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedDocument && onDocumentDownload) {
      onDocumentDownload(selectedDocument.documentId);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedDocument && onDocumentEdit) {
      onDocumentEdit(selectedDocument);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDocument && onDocumentDelete) {
      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
        onDocumentDelete(selectedDocument.documentId);
      }
    }
    handleMenuClose();
  };

  const handleApprove = () => {
    if (selectedDocument && onDocumentApprove) {
      onDocumentApprove(selectedDocument.documentId);
    }
    handleMenuClose();
  };

  const handleReject = () => {
    if (selectedDocument && onDocumentReject) {
      const reason = window.prompt('กรุณาระบุเหตุผลในการไม่อนุมัติ:');
      if (reason) {
        onDocumentReject(selectedDocument.documentId, reason);
      }
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* Filters */}
      {!compact && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="ค้นหาเอกสาร..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>ประเภท</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  label="ประเภท"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="APPLICATION_FORM">ใบสมัคร</MenuItem>
                  <MenuItem value="CERTIFICATE_PDF">ใบรับรอง</MenuItem>
                  <MenuItem value="INSPECTION_REPORT">รายงานตรวจสอบ</MenuItem>
                  <MenuItem value="SOP_DOCUMENT">เอกสาร SOP</MenuItem>
                  <MenuItem value="PAYMENT_RECEIPT">ใบเสร็จ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  label="หมวดหมู่"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="application">การสมัคร</MenuItem>
                  <MenuItem value="certificate">ใบรับรอง</MenuItem>
                  <MenuItem value="inspection">การตรวจสอบ</MenuItem>
                  <MenuItem value="sop">SOP</MenuItem>
                  <MenuItem value="payment">การชำระเงิน</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label="สถานะ"
                >
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="draft">ฉบับร่าง</MenuItem>
                  <MenuItem value="uploaded">อัปโหลดแล้ว</MenuItem>
                  <MenuItem value="pending_review">รอตรวจสอบ</MenuItem>
                  <MenuItem value="approved">อนุมัติ</MenuItem>
                  <MenuItem value="rejected">ไม่อนุมัติ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setTypeFilter('');
                  setCategoryFilter('');
                  setStatusFilter('');
                  setSearchQuery('');
                }}
                sx={{ height: '56px' }}
              >
                ล้างตัวกรอง
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <Alert severity="info">ไม่พบเอกสาร</Alert>
      ) : (
        <Grid container spacing={2}>
          {documents.map(doc => (
            <Grid item xs={12} key={doc._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="flex-start">
                    <Box sx={{ mr: 2, mt: 0.5 }}>{getFileIcon(doc.mimetype)}</Box>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => onDocumentClick && onDocumentClick(doc)}
                      >
                        {doc.title}
                      </Typography>
                      {doc.description && !compact && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {doc.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={getStatusLabel(doc.status)}
                          color={getStatusColor(doc.status)}
                          size="small"
                        />
                        <Chip label={`v${doc.currentVersion}`} size="small" variant="outlined" />
                        <Chip
                          label={formatFileSize(doc.filesize)}
                          size="small"
                          variant="outlined"
                        />
                        {doc.tags?.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        อัปโหลดโดย: {doc.uploadedBy.name} •{' '}
                        {format(new Date(doc.uploadedAt), 'dd MMM yyyy HH:mm', { locale: th })}
                      </Typography>
                    </Box>
                    {showActions && (
                      <Box>
                        <IconButton onClick={e => handleMenuOpen(e, doc)}>
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          <ListItemText>ดูรายละเอียด</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>ดาวน์โหลด</ListItemText>
        </MenuItem>
        {selectedDocument?.status === 'pending_review' && (
          <>
            <MenuItem onClick={handleApprove}>
              <ListItemIcon>
                <ApproveIcon color="success" />
              </ListItemIcon>
              <ListItemText>อนุมัติ</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleReject}>
              <ListItemIcon>
                <RejectIcon color="error" />
              </ListItemIcon>
              <ListItemText>ไม่อนุมัติ</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>แก้ไข</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
