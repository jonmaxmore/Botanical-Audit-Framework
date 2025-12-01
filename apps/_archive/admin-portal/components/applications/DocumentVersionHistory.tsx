'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  RestorePage as RestoreIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
  uploadedAt: string;
  changeDescription?: string;
  current: boolean;
}

interface DocumentVersionHistoryProps {
  documentId: string;
  documentName: string;
  versions: DocumentVersion[];
  onDownload: (versionId: string) => void;
  onRestore: (versionId: string) => void;
  onView: (versionId: string) => void;
}

export default function DocumentVersionHistory({
  documentName,
  versions,
  onDownload,
  onRestore,
  onView,
}: DocumentVersionHistoryProps) {
  const [compareDialogOpen, setCompareDialogOpen] = React.useState(false);
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([]);

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCompareClick = () => {
    setCompareDialogOpen(true);
  };

  const handleCompareClose = () => {
    setCompareDialogOpen(false);
    setSelectedVersions([]);
  };

  return (
    <>
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                ประวัติเวอร์ชัน
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {versions.length} เวอร์ชัน
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              เอกสาร:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {documentName}
            </Typography>
          </Box>

          {versions.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
              }}
            >
              <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">ไม่มีประวัติเวอร์ชัน</Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {versions.map((version, index) => (
                <React.Fragment key={version.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: version.current ? 'primary.50' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                      border: version.current ? '1px solid' : 'none',
                      borderColor: 'primary.light',
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => onView(version.id)}
                          title="ดูเอกสาร"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => onDownload(version.id)}
                          title="ดาวน์โหลด"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        {!version.current && (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => onRestore(version.id)}
                            title="กู้คืนเวอร์ชันนี้"
                            color="primary"
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={version.uploadedBy.avatar}
                        sx={{
                          bgcolor: version.current ? 'primary.main' : 'grey.400',
                        }}
                      >
                        {version.uploadedBy.avatar ? null : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            เวอร์ชัน {version.version}
                          </Typography>
                          {version.current && (
                            <Chip
                              label="ปัจจุบัน"
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {version.fileName} ({version.fileSize})
                          </Typography>
                          {version.changeDescription && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5, fontStyle: 'italic' }}
                            >
                              {version.changeDescription}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.disabled">
                              อัพโหลดโดย {version.uploadedBy.name}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {formatRelativeTime(version.uploadedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < versions.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}

          {versions.length > 1 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" size="small" onClick={handleCompareClick}>
                เปรียบเทียบเวอร์ชัน
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onClose={handleCompareClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              เปรียบเทียบเวอร์ชัน
            </Typography>
            <IconButton size="small" onClick={handleCompareClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            เลือก 2 เวอร์ชันเพื่อเปรียบเทียบความแตกต่าง
          </Typography>
          <List>
            {versions.map(version => {
              const isSelected = selectedVersions.includes(version.id);
              const isDisabled = selectedVersions.length >= 2 && !isSelected;

              return (
                <ListItem key={version.id} disablePadding>
                  <ListItemButton
                    selected={isSelected}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                      } else if (selectedVersions.length < 2) {
                        setSelectedVersions([...selectedVersions, version.id]);
                      }
                    }}
                  >
                    <ListItemText
                      primary={`เวอร์ชัน ${version.version}`}
                      secondary={`${version.uploadedBy.name} - ${formatDateTime(version.uploadedAt)}`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompareClose}>ยกเลิก</Button>
          <Button
            variant="contained"
            disabled={selectedVersions.length !== 2}
            onClick={() => {
              // TODO: Implement comparison view
              alert(`เปรียบเทียบเวอร์ชัน: ${selectedVersions.join(' กับ ')}`);
              handleCompareClose();
            }}
          >
            เปรียบเทียบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
