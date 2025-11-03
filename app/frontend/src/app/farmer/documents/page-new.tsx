'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Description as FileIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';

// Required document types
const DOCUMENT_TYPES = [
  { id: 'ID_CARD', label: 'บัตรประชาชน', required: true },
  { id: 'HOUSE_REGISTRATION', label: 'ทะเบียนบ้าน', required: true },
  { id: 'LAND_DEED', label: 'โฉนดที่ดิน', required: true },
  { id: 'FARM_MAP', label: 'แผนที่ฟาร์ม', required: true },
  { id: 'WATER_PERMIT', label: 'ใบอนุญาตแหล่งน้ำ', required: true },
];

const DocumentsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applications, fetchApplicationById, uploadDocument, currentApplication } =
    useApplication();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');

  const applicationId = searchParams.get('app');

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (applicationId) {
        await fetchApplicationById(applicationId);
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadDialog = (docType: string) => {
    setSelectedDocType(docType);
    setSelectedFile(null);
    setRemarks('');
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    // Prevent closing during upload
    if (uploading) return;

    setUploadDialogOpen(false);
    setSelectedDocType('');
    setSelectedFile(null);
    setRemarks('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัปโหลดไฟล์ PDF, JPG หรือ PNG เท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !applicationId) return;

    setUploading(true);
    setError('');

    try {
      // Create proper FormData object
      const formData = new FormData();
      if (selectedFile) formData.append('file', selectedFile);
      if (selectedDocType) formData.append('documentType', selectedDocType);
      if (remarks) formData.append('remarks', remarks);
      
      await uploadDocument(applicationId, formData);

      alert('อัปโหลดเอกสารสำเร็จ!');
      handleCloseUploadDialog();
      await loadData(); // Reload to show updated documents
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถอัปโหลดเอกสารได้');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (docTypeId: string) => {
    if (!currentApplication?.documents) return null;
    return currentApplication.documents.find((doc: any) => doc.documentType === docTypeId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckIcon color="success" />;
      case 'REJECTED':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Chip label="อนุมัติ" color="success" size="small" />;
      case 'REJECTED':
        return <Chip label="ไม่อนุมัติ" color="error" size="small" />;
      default:
        return <Chip label="รอตรวจสอบ" color="default" size="small" />;
    }
  };

  const calculateProgress = () => {
    if (!currentApplication?.documents) return 0;
    const uploadedCount = DOCUMENT_TYPES.filter((dt) =>
      currentApplication.documents.some((doc: any) => doc.documentType === dt.id)
    ).length;
    return (uploadedCount / DOCUMENT_TYPES.length) * 100;
  };

  const canUploadDocuments = () => {
    if (!currentApplication) return false;
    const allowedStates = [
      'SUBMITTED',
      'PAYMENT_PROCESSING_1',
      'DOCUMENT_REVIEW',
      'DOCUMENT_REVISION',
    ];
    return allowedStates.includes(currentApplication.currentState);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Container>
    );
  }

  if (!applicationId || !currentApplication) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          กรุณาเลือกใบสมัครที่ต้องการอัปโหลดเอกสาร
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/farmer/dashboard')}
        >
          กลับไปหน้า Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            จัดการเอกสาร
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ใบสมัครเลขที่: {applicationId}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/farmer/applications/${applicationId}`)}
        >
          กลับ
        </Button>
      </Box>

      {/* Progress Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ความคืบหน้าการอัปโหลดเอกสาร
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(calculateProgress())}%
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            อัปโหลดแล้ว {currentApplication.documents?.length || 0} / {DOCUMENT_TYPES.length} ไฟล์
          </Typography>
        </CardContent>
      </Card>

      {/* Instructions */}
      {canUploadDocuments() ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          กรุณาอัปโหลดเอกสารทั้ง 5 ประเภทให้ครบถ้วน ไฟล์ที่รองรับ: PDF, JPG, PNG (ขนาดไม่เกิน 5 MB)
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ไม่สามารถอัปโหลดเอกสารได้ในขณะนี้ สถานะปัจจุบัน: {currentApplication.currentState}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Document List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          เอกสารที่ต้องอัปโหลด
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {DOCUMENT_TYPES.map((docType, index) => {
            const uploadedDoc = getDocumentStatus(docType.id);

            return (
              <React.Fragment key={docType.id}>
                <ListItem
                  sx={{
                    bgcolor: uploadedDoc ? 'grey.50' : 'white',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    {uploadedDoc ? getStatusIcon(uploadedDoc.status) : <FileIcon color="action" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{docType.label}</Typography>
                        {docType.required && <Chip label="จำเป็น" size="small" color="error" />}
                        {uploadedDoc && getStatusChip(uploadedDoc.status)}
                      </Box>
                    }
                    secondary={
                      uploadedDoc
                        ? `อัปโหลดเมื่อ: ${new Date(uploadedDoc.uploadedAt).toLocaleDateString('th-TH')}`
                        : 'ยังไม่ได้อัปโหลด'
                    }
                  />
                  <Button
                    variant={uploadedDoc ? 'outlined' : 'contained'}
                    size="small"
                    startIcon={<UploadIcon />}
                    onClick={() => handleOpenUploadDialog(docType.id)}
                    disabled={!canUploadDocuments()}
                  >
                    {uploadedDoc ? 'อัปโหลดใหม่' : 'อัปโหลด'}
                  </Button>
                </ListItem>
                {index < DOCUMENT_TYPES.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={uploading}
      >
        <DialogTitle>
          อัปโหลดเอกสาร: {DOCUMENT_TYPES.find((dt) => dt.id === selectedDocType)?.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              เลือกไฟล์
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
            </Button>

            {selectedFile && (
              <Alert severity="success" sx={{ mb: 2 }}>
                เลือกไฟล์: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="หมายเหตุ (ถ้ามี)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="เช่น เอกสารฉบับนี้มีอายุถึง..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} disabled={uploading}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            อัปโหลด
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentsPage;
