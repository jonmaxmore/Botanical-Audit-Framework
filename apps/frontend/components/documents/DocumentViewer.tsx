/**
 * DocumentViewer Component
 * Display document details with preview and actions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface DocumentVersion {
  versionNumber: number;
  filename: string;
  filesize: number;
  uploadedBy: {
    userId: string;
    name: string;
  };
  uploadedAt: string;
  changeLog?: string;
}

interface DocumentDetails {
  _id: string;
  documentId: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  status: string;
  filename: string;
  filepath: string;
  mimetype: string;
  filesize: number;
  currentVersion: number;
  uploadedBy: {
    userId: string;
    name: string;
    role: string;
  };
  uploadedAt: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
  applicationId?: string;
  certificateId?: string;
  inspectionId?: string;
  reviewedBy?: {
    userId: string;
    name: string;
    reviewedAt: string;
    comments?: string;
  };
  versions: DocumentVersion[];
}

interface DocumentViewerProps {
  documentId: string | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (documentId: string) => void;
  onEdit?: (document: DocumentDetails) => void;
  onDelete?: (documentId: string) => void;
  onApprove?: (documentId: string) => void;
  onReject?: (documentId: string, reason: string) => void;
  canEdit?: boolean;
  canApprove?: boolean;
}

export default function DocumentViewer({
  documentId,
  open,
  onClose,
  onDownload,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  canEdit = false,
  canApprove = false
}: DocumentViewerProps) {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch document details
  useEffect(() => {
    if (documentId && open) {
      fetchDocument();
      fetchVersions();
    }
  }, [documentId, open]);

  const fetchDocument = async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        }
      });

      if (!response.ok) throw new Error('ไม่สามารถโหลดเอกสารได้');

      const data = await response.json();
      setDocument(data);

      // Set preview for images and PDFs
      if (data.mimetype.startsWith('image/') || data.mimetype === 'application/pdf') {
        setPreviewUrl(`/api/documents/${documentId}/download`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (!documentId) return;

    try {
      const response = await fetch(`/api/documents/${documentId}/versions`, {
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (document) {
          setDocument({ ...document, versions: data.versions });
        }
      }
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      approved: 'success',
      rejected: 'error',
      pending_review: 'warning',
      draft: 'default',
      uploaded: 'info'
    };
    return colors[status] || 'default';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'ฉบับร่าง',
      uploaded: 'อัปโหลดแล้ว',
      pending_review: 'รอตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
      archived: 'เก็บถาวร'
    };
    return labels[status] || status;
  };

  // Handle actions
  const handleDownload = () => {
    if (documentId && onDownload) {
      onDownload(documentId);
    }
  };

  const handleEdit = () => {
    if (document && onEdit) {
      onEdit(document);
    }
  };

  const handleDelete = () => {
    if (documentId && onDelete) {
      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
        onDelete(documentId);
        onClose();
      }
    }
  };

  const handleApprove = () => {
    if (documentId && onApprove) {
      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการอนุมัติเอกสารนี้?')) {
        onApprove(documentId);
      }
    }
  };

  const handleReject = () => {
    if (documentId && onReject) {
      const reason = window.prompt('กรุณาระบุเหตุผลในการไม่อนุมัติ:');
      if (reason) {
        onReject(documentId, reason);
      }
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">รายละเอียดเอกสาร</Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {document && !loading && (
          <Box>
            {/* Tabs */}
            <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)} sx={{ mb: 2 }}>
              <Tab label="รายละเอียด" />
              <Tab label="ตัวอย่าง" />
              <Tab label="ประวัติเวอร์ชัน" />
            </Tabs>

            {/* Details Tab */}
            {currentTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {document.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusLabel(document.status)}
                      color={getStatusColor(document.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip label={`เวอร์ชัน ${document.currentVersion}`} size="small" />
                  </Box>
                </Grid>

                {document.description && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary">
                      {document.description}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ชื่อไฟล์
                  </Typography>
                  <Typography variant="body1">{document.filename}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ขนาดไฟล์
                  </Typography>
                  <Typography variant="body1">{formatFileSize(document.filesize)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ประเภท
                  </Typography>
                  <Typography variant="body1">{document.type}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    หมวดหมู่
                  </Typography>
                  <Typography variant="body1">{document.category}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    อัปโหลดโดย
                  </Typography>
                  <Typography variant="body1">
                    {document.uploadedBy.name} ({document.uploadedBy.role})
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    วันที่อัปโหลด
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(document.uploadedAt), 'dd MMM yyyy HH:mm', {
                      locale: th
                    })}
                  </Typography>
                </Grid>

                {document.tags && document.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      แท็ก
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {document.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {document.reviewedBy && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        การตรวจสอบ
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ตรวจสอบโดย
                      </Typography>
                      <Typography variant="body1">{document.reviewedBy.name}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        วันที่ตรวจสอบ
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(document.reviewedBy.reviewedAt), 'dd MMM yyyy HH:mm', {
                          locale: th
                        })}
                      </Typography>
                    </Grid>

                    {document.reviewedBy.comments && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          ความเห็น
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body2">{document.reviewedBy.comments}</Typography>
                        </Paper>
                      </Grid>
                    )}
                  </>
                )}

                {/* Related Entities */}
                {(document.applicationId || document.certificateId || document.inspectionId) && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        เอกสารที่เกี่ยวข้อง
                      </Typography>
                    </Grid>

                    {document.applicationId && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          เลขที่ใบสมัคร: <strong>{document.applicationId}</strong>
                        </Typography>
                      </Grid>
                    )}

                    {document.certificateId && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          เลขที่ใบรับรอง: <strong>{document.certificateId}</strong>
                        </Typography>
                      </Grid>
                    )}

                    {document.inspectionId && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          เลขที่การตรวจสอบ: <strong>{document.inspectionId}</strong>
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            )}

            {/* Preview Tab */}
            {currentTab === 1 && (
              <Box>
                {previewUrl ? (
                  <Box>
                    {document.mimetype.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={previewUrl}
                        alt={document.title}
                        sx={{
                          width: '100%',
                          maxHeight: '600px',
                          objectFit: 'contain'
                        }}
                      />
                    ) : document.mimetype === 'application/pdf' ? (
                      <Box
                        component="iframe"
                        src={previewUrl}
                        sx={{
                          width: '100%',
                          height: '600px',
                          border: 'none'
                        }}
                      />
                    ) : (
                      <Alert severity="info">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้</Alert>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info">ไม่มีตัวอย่างสำหรับไฟล์นี้</Alert>
                )}
              </Box>
            )}

            {/* Version History Tab */}
            {currentTab === 2 && (
              <Box>
                {document.versions && document.versions.length > 0 ? (
                  <List>
                    {document.versions.map((version, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <HistoryIcon fontSize="small" />
                              <Typography variant="subtitle1">
                                เวอร์ชัน {version.versionNumber}
                              </Typography>
                              {version.versionNumber === document.currentVersion && (
                                <Chip label="ปัจจุบัน" size="small" color="primary" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                ไฟล์: {version.filename} ({formatFileSize(version.filesize)})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                อัปโหลดโดย: {version.uploadedBy.name} •{' '}
                                {format(new Date(version.uploadedAt), 'dd MMM yyyy HH:mm', {
                                  locale: th
                                })}
                              </Typography>
                              {version.changeLog && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  บันทึก: {version.changeLog}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">ไม่มีประวัติเวอร์ชัน</Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            p: 1
          }}
        >
          <Box>
            {document?.status === 'pending_review' && canApprove && (
              <>
                <Button
                  startIcon={<ApproveIcon />}
                  onClick={handleApprove}
                  color="success"
                  variant="contained"
                  sx={{ mr: 1 }}
                >
                  อนุมัติ
                </Button>
                <Button
                  startIcon={<RejectIcon />}
                  onClick={handleReject}
                  color="error"
                  variant="outlined"
                >
                  ไม่อนุมัติ
                </Button>
              </>
            )}
          </Box>
          <Box>
            <Button startIcon={<DownloadIcon />} onClick={handleDownload}>
              ดาวน์โหลด
            </Button>
            {canEdit && (
              <>
                <Button startIcon={<EditIcon />} onClick={handleEdit}>
                  แก้ไข
                </Button>
                <Button startIcon={<DeleteIcon />} onClick={handleDelete} color="error">
                  ลบ
                </Button>
              </>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
