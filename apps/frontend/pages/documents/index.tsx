/**
 * Documents Management Page
 * Main page for managing all documents
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { FileUploader, DocumentList, DocumentViewer } from '../../components/documents';

export default function DocumentsPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Document metadata for upload
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    description: '',
    type: 'GENERAL_DOCUMENT',
    category: 'general',
    tags: [] as string[],
    status: 'uploaded'
  });

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadMetadata.title || file.name);
        formData.append('description', uploadMetadata.description);
        formData.append('type', uploadMetadata.type);
        formData.append('category', uploadMetadata.category);
        formData.append('status', uploadMetadata.status);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'x-user-id': localStorage.getItem('userId') || '',
            'x-user-role': localStorage.getItem('userRole') || ''
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('ไม่สามารถอัปโหลดไฟล์ได้');
        }
      }

      setSnackbar({
        open: true,
        message: `อัปโหลดสำเร็จ ${files.length} ไฟล์`,
        severity: 'success'
      });

      setUploadDialogOpen(false);
      setRefreshKey(prev => prev + 1);

      // Reset metadata
      setUploadMetadata({
        title: '',
        description: '',
        type: 'GENERAL_DOCUMENT',
        category: 'general',
        tags: [],
        status: 'uploaded'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  // Handle document actions
  const handleDocumentClick = (document: any) => {
    setSelectedDocumentId(document.documentId);
    setViewerOpen(true);
  };

  const handleDocumentDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        }
      });

      if (!response.ok) throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'ดาวน์โหลดสำเร็จ',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        }
      });

      if (!response.ok) throw new Error('ไม่สามารถลบเอกสารได้');

      setSnackbar({
        open: true,
        message: 'ลบเอกสารสำเร็จ',
        severity: 'success'
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  const handleDocumentApprove = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        },
        body: JSON.stringify({
          comments: 'อนุมัติโดยระบบ'
        })
      });

      if (!response.ok) throw new Error('ไม่สามารถอนุมัติเอกสารได้');

      setSnackbar({
        open: true,
        message: 'อนุมัติเอกสารสำเร็จ',
        severity: 'success'
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  const handleDocumentReject = async (documentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-user-role': localStorage.getItem('userRole') || ''
        },
        body: JSON.stringify({
          comments: reason
        })
      });

      if (!response.ok) throw new Error('ไม่สามารถไม่อนุมัติเอกสารได้');

      setSnackbar({
        open: true,
        message: 'ไม่อนุมัติเอกสารสำเร็จ',
        severity: 'success'
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            จัดการเอกสาร
          </Typography>
          <Typography variant="body1" color="text.secondary">
            จัดการและติดตามเอกสารทั้งหมดในระบบ
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          size="large"
        >
          อัปโหลดเอกสาร
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab label="เอกสารทั้งหมด" />
          <Tab label="รอตรวจสอบ" />
          <Tab label="อนุมัติแล้ว" />
          <Tab label="ไม่อนุมัติ" />
        </Tabs>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 3 }}>
        {currentTab === 0 && (
          <DocumentList
            key={refreshKey}
            onDocumentClick={handleDocumentClick}
            onDocumentDownload={handleDocumentDownload}
            onDocumentDelete={handleDocumentDelete}
            onDocumentApprove={handleDocumentApprove}
            onDocumentReject={handleDocumentReject}
            showActions={true}
          />
        )}
        {currentTab === 1 && (
          <DocumentList
            key={refreshKey}
            filterByType="pending_review"
            onDocumentClick={handleDocumentClick}
            onDocumentDownload={handleDocumentDownload}
            onDocumentApprove={handleDocumentApprove}
            onDocumentReject={handleDocumentReject}
            showActions={true}
          />
        )}
        {currentTab === 2 && (
          <DocumentList
            key={refreshKey}
            filterByType="approved"
            onDocumentClick={handleDocumentClick}
            onDocumentDownload={handleDocumentDownload}
            showActions={true}
          />
        )}
        {currentTab === 3 && (
          <DocumentList
            key={refreshKey}
            filterByType="rejected"
            onDocumentClick={handleDocumentClick}
            onDocumentDownload={handleDocumentDownload}
            showActions={true}
          />
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ชื่อเอกสาร"
                  value={uploadMetadata.title}
                  onChange={e => setUploadMetadata({ ...uploadMetadata, title: e.target.value })}
                  helperText="ถ้าไม่ระบุจะใช้ชื่อไฟล์"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="คำอธิบาย"
                  multiline
                  rows={3}
                  value={uploadMetadata.description}
                  onChange={e =>
                    setUploadMetadata({ ...uploadMetadata, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>ประเภทเอกสาร</InputLabel>
                  <Select
                    value={uploadMetadata.type}
                    onChange={e => setUploadMetadata({ ...uploadMetadata, type: e.target.value })}
                    label="ประเภทเอกสาร"
                  >
                    <MenuItem value="GENERAL_DOCUMENT">เอกสารทั่วไป</MenuItem>
                    <MenuItem value="APPLICATION_FORM">ใบสมัคร</MenuItem>
                    <MenuItem value="CERTIFICATE_PDF">ใบรับรอง PDF</MenuItem>
                    <MenuItem value="INSPECTION_REPORT">รายงานตรวจสอบ</MenuItem>
                    <MenuItem value="SOP_DOCUMENT">เอกสาร SOP</MenuItem>
                    <MenuItem value="PAYMENT_RECEIPT">ใบเสร็จรับเงิน</MenuItem>
                    <MenuItem value="ID_CARD">บัตรประชาชน</MenuItem>
                    <MenuItem value="FARM_MAP">แผนที่แปลง</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    value={uploadMetadata.category}
                    onChange={e =>
                      setUploadMetadata({ ...uploadMetadata, category: e.target.value })
                    }
                    label="หมวดหมู่"
                  >
                    <MenuItem value="general">ทั่วไป</MenuItem>
                    <MenuItem value="application">การสมัคร</MenuItem>
                    <MenuItem value="certificate">ใบรับรอง</MenuItem>
                    <MenuItem value="inspection">การตรวจสอบ</MenuItem>
                    <MenuItem value="sop">SOP</MenuItem>
                    <MenuItem value="payment">การชำระเงิน</MenuItem>
                    <MenuItem value="legal">เอกสารทางกฎหมาย</MenuItem>
                    <MenuItem value="template">เทมเพลต</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FileUploader onUpload={handleUpload} multiple={true} maxFiles={10} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>ยกเลิก</Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer */}
      <DocumentViewer
        documentId={selectedDocumentId}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedDocumentId(null);
        }}
        onDownload={handleDocumentDownload}
        onDelete={handleDocumentDelete}
        onApprove={handleDocumentApprove}
        onReject={handleDocumentReject}
        canEdit={true}
        canApprove={true}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
