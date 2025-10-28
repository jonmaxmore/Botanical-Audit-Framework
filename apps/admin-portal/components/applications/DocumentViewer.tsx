'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  CheckCircle as VerifiedIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Application, ApplicationDocument } from '../../lib/api/applications';

interface DocumentViewerProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onVerifyDocument: (documentId: string, verified: boolean) => void;
}

const documentTypeLabels: Record<string, string> = {
  farm_registration: 'ทะเบียนฟาร์ม',
  land_title: 'เอกสารสิทธิ์ที่ดิน',
  farmer_id: 'บัตรประชาชน',
  farm_map: 'แผนที่ฟาร์ม',
  water_analysis: 'ผลวิเคราะห์น้ำ',
  soil_analysis: 'ผลวิเคราะห์ดิน',
  cultivation_plan: 'แผนการเพาะปลูก',
  other: 'เอกสารอื่นๆ',
};

export default function DocumentViewer({
  open,
  application,
  onClose,
  onVerifyDocument,
}: DocumentViewerProps) {
  if (!application) return null;

  const handleDownload = (doc: ApplicationDocument) => {
    // Implement download logic
    window.open(doc.url, '_blank');
  };

  const handleView = (doc: ApplicationDocument) => {
    // Implement view logic
    window.open(doc.url, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">เอกสารประกอบคำขอ</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {application.applicationNumber} - {application.farmerName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {application.documents && application.documents.length > 0 ? (
          <List>
            {application.documents.map((doc, index) => (
              <React.Fragment key={doc.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon>
                    <FileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">{doc.name}</Typography>
                        {doc.verifiedBy && (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="ตรวจสอบแล้ว"
                            size="small"
                            color="success"
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          ประเภท: {documentTypeLabels[doc.type] || doc.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          อัปโหลดเมื่อ:{' '}
                          {new Date(doc.uploadedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        {doc.verifiedBy && (
                          <Typography variant="caption" color="success.main">
                            ตรวจสอบโดย: {doc.verifiedBy}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleView(doc)}
                      color="primary"
                      title="ดูเอกสาร"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(doc)}
                      color="primary"
                      title="ดาวน์โหลด"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant={doc.verifiedBy ? 'outlined' : 'contained'}
                      color={doc.verifiedBy ? 'success' : 'primary'}
                      onClick={() => onVerifyDocument(doc.id, !doc.verifiedBy)}
                      startIcon={doc.verifiedBy ? <VerifiedIcon /> : undefined}
                    >
                      {doc.verifiedBy ? 'ยืนยันแล้ว' : 'ยืนยันเอกสาร'}
                    </Button>
                  </Stack>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              ยังไม่มีเอกสารแนบ
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          เอกสารทั้งหมด: {application.documents?.length || 0} ไฟล์ | ตรวจสอบแล้ว:{' '}
          {application.documents?.filter((d) => d.verifiedBy).length || 0} ไฟล์
        </Typography>
        <Button onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}
