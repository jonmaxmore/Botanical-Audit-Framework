/**
 * Document Upload Section Component
 * Handles document uploads with validation based on applicant type
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface Document {
  file: File;
  documentType: string;
  description?: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  uploadedAt: string;
}

interface DocumentUploadSectionProps {
  applicationId: string;
  applicantType: 'INDIVIDUAL' | 'COMMUNITY_ENTERPRISE' | 'LEGAL_ENTITY';
  onUploadComplete?: (documents: UploadedDocument[]) => void;
}

const DOCUMENT_CATEGORIES = {
  INDIVIDUAL: [
    { type: 'application_form', label: 'แบบฟอร์มคำขอ', required: true },
    { type: 'farm_management_plan', label: 'แผนการจัดการฟาร์ม', required: true },
    { type: 'cultivation_records', label: 'บันทึกการเพาะปลูก', required: true },
    { type: 'land_rights_certificate', label: 'เอกสารสิทธิ์ที่ดิน', required: true },
    { type: 'identification_document', label: 'สำเนาบัตรประชาชน', required: true },
    {
      type: 'cooperation_agreement',
      label: 'หนังสือความร่วมมือกับผู้รับอนุญาตผลิตยา',
      required: true
    },
    { type: 'farm_photos', label: 'รูปภาพฟาร์ม', required: false },
    { type: 'farm_map', label: 'แผนที่/แบบแปลน', required: false },
    { type: 'security_plan', label: 'มาตรการรักษาความปลอดภัย', required: false }
  ],
  COMMUNITY_ENTERPRISE: [
    { type: 'application_form', label: 'แบบฟอร์มคำขอ', required: true },
    { type: 'farm_management_plan', label: 'แผนการจัดการฟาร์ม', required: true },
    { type: 'cultivation_records', label: 'บันทึกการเพาะปลูก', required: true },
    { type: 'land_rights_certificate', label: 'เอกสารสิทธิ์ที่ดิน', required: true },
    {
      type: 'community_enterprise_certificate',
      label: 'หนังสือรับรองการจดทะเบียนวิสาหกิจชุมชน (สวช.01)',
      required: true
    },
    { type: 'member_list', label: 'บัญชีรายชื่อสมาชิก', required: true },
    { type: 'representative_id', label: 'สำเนาบัตรประชาชนผู้แทน', required: true },
    { type: 'farm_photos', label: 'รูปภาพฟาร์ม', required: false },
    { type: 'farm_map', label: 'แผนที่/แบบแปลน', required: false }
  ],
  LEGAL_ENTITY: [
    { type: 'application_form', label: 'แบบฟอร์มคำขอ', required: true },
    { type: 'farm_management_plan', label: 'แผนการจัดการฟาร์ม', required: true },
    { type: 'cultivation_records', label: 'บันทึกการเพาะปลูก', required: true },
    { type: 'land_rights_certificate', label: 'เอกสารสิทธิ์ที่ดิน', required: true },
    { type: 'company_certificate', label: 'หนังสือรับรองการจดทะเบียนนิติบุคคล', required: true },
    { type: 'board_member_list', label: 'บัญชีรายชื่อกรรมการ', required: true },
    { type: 'representative_authorization', label: 'หนังสือมอบอำนาจ (ถ้ามี)', required: false },
    { type: 'farm_photos', label: 'รูปภาพฟาร์ม', required: false },
    { type: 'farm_map', label: 'แผนที่/แบบแปลน', required: false }
  ]
};

export default function DocumentUploadSection({
  applicationId,
  applicantType,
  onUploadComplete
}: DocumentUploadSectionProps) {
  const [documents, setDocuments] = useState<Map<string, Document>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const categories = DOCUMENT_CATEGORIES[applicantType] || DOCUMENT_CATEGORIES.INDIVIDUAL;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('กรุณาเลือกไฟล์ PDF, JPG หรือ PNG เท่านั้น');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    const newDocs = new Map(documents);
    newDocs.set(documentType, { file, documentType });
    setDocuments(newDocs);
    setError('');
  };

  const handleRemoveDocument = (documentType: string) => {
    const newDocs = new Map(documents);
    newDocs.delete(documentType);
    setDocuments(newDocs);
  };

  const handleUpload = async () => {
    if (documents.size === 0) {
      setError('กรุณาเลือกไฟล์เอกสารอย่างน้อย 1 ไฟล์');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const documentTypes: string[] = [];
      const descriptions: string[] = [];

      documents.forEach((doc, type) => {
        formData.append('documents', doc.file);
        documentTypes.push(type);
        descriptions.push(doc.description || '');
      });

      documentTypes.forEach(type => formData.append('documentTypes', type));
      descriptions.forEach(desc => formData.append('descriptions', desc));

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/farmer/application/${applicationId}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'อัปโหลดเอกสารไม่สำเร็จ');
      }

      const data = await response.json();

      setSuccess(`อัปโหลดเอกสารสำเร็จ ${documents.size} ไฟล์`);
      setDocuments(new Map());
      setUploadedDocs(data.data?.attachments || []);

      if (onUploadComplete) {
        onUploadComplete(data.data?.attachments || []);
      }

      // Show missing documents if any
      if (data.data?.missingDocuments && data.data.missingDocuments.length > 0) {
        setError(`ยังขาดเอกสาร: ${data.data.missingDocuments.join(', ')}`);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const requiredDocs = categories.filter(cat => cat.required);
  const optionalDocs = categories.filter(cat => !cat.required);
  const uploadedTypes = new Set(uploadedDocs.map(doc => doc.documentType));
  const missingRequired = requiredDocs.filter(
    doc => !uploadedTypes.has(doc.type) && !documents.has(doc.type)
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600, mb: 3 }}>
        เอกสารแนบ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Required Documents */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#d32f2f' }}>
        เอกสารบังคับ *
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {requiredDocs.map(category => {
          const isUploaded = uploadedTypes.has(category.type);
          const isPending = documents.has(category.type);

          return (
            <Grid item xs={12} key={category.type}>
              <Card sx={{ bgcolor: isUploaded ? '#e8f5e9' : '#fff' }}>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {category.label}
                        {isUploaded && <CheckIcon sx={{ ml: 1, color: '#4caf50', fontSize: 20 }} />}
                      </Typography>
                      {isPending && (
                        <Typography variant="body2" color="textSecondary">
                          {documents.get(category.type)?.file.name}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      {!isUploaded && !isPending && (
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          size="small"
                        >
                          เลือกไฟล์
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => handleFileSelect(e, category.type)}
                          />
                        </Button>
                      )}
                      {isPending && (
                        <IconButton
                          onClick={() => handleRemoveDocument(category.type)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {isUploaded && <Chip label="อัปโหลดแล้ว" color="success" size="small" />}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            เอกสารเพิ่มเติม (ถ้ามี)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {optionalDocs.map(category => {
              const isUploaded = uploadedTypes.has(category.type);
              const isPending = documents.has(category.type);

              return (
                <Grid item xs={12} md={6} key={category.type}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {category.label}
                          </Typography>
                          {isPending && (
                            <Typography variant="caption" color="textSecondary">
                              {documents.get(category.type)?.file.name}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          {!isUploaded && !isPending && (
                            <Button
                              component="label"
                              variant="text"
                              startIcon={<UploadIcon />}
                              size="small"
                            >
                              เลือก
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileSelect(e, category.type)}
                              />
                            </Button>
                          )}
                          {isPending && (
                            <IconButton
                              onClick={() => handleRemoveDocument(category.type)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Upload Button */}
      {documents.size > 0 && (
        <Box sx={{ mt: 3 }}>
          {uploading && <LinearProgress value={uploadProgress} sx={{ mb: 2 }} />}
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUpload}
            disabled={uploading}
            sx={{ bgcolor: '#2e7d32' }}
            fullWidth
          >
            {uploading ? 'กำลังอัปโหลด...' : `อัปโหลดเอกสาร (${documents.size} ไฟล์)`}
          </Button>
        </Box>
      )}

      {/* Missing Required Documents Alert */}
      {missingRequired.length > 0 && (
        <Alert severity="warning" icon={<ErrorIcon />} sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            ยังขาดเอกสารบังคับ {missingRequired.length} รายการ:
          </Typography>
          <List dense>
            {missingRequired.map(doc => (
              <ListItem key={doc.type} sx={{ py: 0.5 }}>
                <ListItemText primary={`• ${doc.label}`} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Summary */}
      {uploadedDocs.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            เอกสารที่อัปโหลดแล้ว ({uploadedDocs.length} ไฟล์)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ✅ อัปโหลดครบ {uploadedDocs.length} จาก {requiredDocs.length} เอกสารบังคับ
          </Typography>
        </Box>
      )}
    </Box>
  );
}
