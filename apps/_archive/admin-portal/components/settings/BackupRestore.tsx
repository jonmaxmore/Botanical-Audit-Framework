import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

export interface BackupRestoreProps {
  onBackup: () => Promise<void>;
  onRestore: (backupId: string) => Promise<void>;
  onDelete: (backupId: string) => Promise<void>;
  loading?: boolean;
}

interface BackupFile {
  id: string;
  name: string;
  date: Date;
  size: string;
  type: 'automatic' | 'manual';
}

const mockBackups: BackupFile[] = [
  {
    id: '1',
    name: 'backup-2025-10-15-auto.sql',
    date: new Date('2025-10-15T02:00:00'),
    size: '45.2 MB',
    type: 'automatic',
  },
  {
    id: '2',
    name: 'backup-2025-10-14-manual.sql',
    date: new Date('2025-10-14T16:30:00'),
    size: '44.8 MB',
    type: 'manual',
  },
  {
    id: '3',
    name: 'backup-2025-10-14-auto.sql',
    date: new Date('2025-10-14T02:00:00'),
    size: '44.5 MB',
    type: 'automatic',
  },
  {
    id: '4',
    name: 'backup-2025-10-13-auto.sql',
    date: new Date('2025-10-13T02:00:00'),
    size: '44.1 MB',
    type: 'automatic',
  },
];

export default function BackupRestore({
  onBackup,
  onRestore,
  onDelete,
  loading = false,
}: BackupRestoreProps) {
  const [backups] = React.useState<BackupFile[]>(mockBackups);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedBackup, setSelectedBackup] = React.useState<BackupFile | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleBackupClick = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    await onBackup();

    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
    }, 3500);
  };

  const handleRestoreClick = (backup: BackupFile) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (selectedBackup) {
      setRestoreDialogOpen(false);
      setIsProcessing(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 8;
        });
      }, 400);

      await onRestore(selectedBackup.id);

      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 4500);
    }
  };

  const handleDeleteClick = (backup: BackupFile) => {
    setSelectedBackup(backup);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBackup) {
      setDeleteDialogOpen(false);
      await onDelete(selectedBackup.id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <BackupIcon color="success" />
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600}>
              สำรองและกู้คืนข้อมูล
            </Typography>
            <Typography variant="body2" color="text.secondary">
              จัดการการสำรองข้อมูลและกู้คืนระบบ
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={handleBackupClick}
            disabled={loading || isProcessing}
          >
            สำรองข้อมูลตอนนี้
          </Button>
        </Box>

        {isProcessing && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              กำลังดำเนินการ... กรุณารอสักครู่
            </Alert>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress}% เสร็จสมบูรณ์
            </Typography>
          </Box>
        )}

        <Stack spacing={2}>
          {/* Automatic Backup Settings */}
          <Alert severity="info" icon={<BackupIcon />}>
            <Typography variant="body2" fontWeight={500}>
              การสำรองข้อมูลอัตโนมัติ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ระบบจะสำรองข้อมูลอัตโนมัติทุกวันเวลา 02:00 น. และเก็บไฟล์สำรองย้อนหลัง 30 วัน
            </Typography>
          </Alert>

          {/* Backup Files List */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ไฟล์สำรองข้อมูล
            </Typography>
            {backups.length > 0 ? (
              <List>
                {backups.map(backup => (
                  <ListItem
                    key={backup.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {backup.name}
                          </Typography>
                          <Chip
                            label={backup.type === 'automatic' ? 'อัตโนมัติ' : 'ด้วยตนเอง'}
                            size="small"
                            color={backup.type === 'automatic' ? 'default' : 'primary'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box display="flex" gap={2} mt={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            วันที่:{' '}
                            {backup.date.toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ขนาด: {backup.size}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton edge="end" aria-label="download" size="small" color="primary">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="restore"
                          size="small"
                          color="success"
                          onClick={() => handleRestoreClick(backup)}
                          disabled={loading || isProcessing}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(backup)}
                          disabled={loading || isProcessing}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">ไม่มีไฟล์สำรองข้อมูล</Alert>
            )}
          </Box>

          {/* Upload Backup */}
          <Box>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              disabled={loading || isProcessing}
            >
              อัปโหลดไฟล์สำรองจากภายนอก
            </Button>
          </Box>
        </Stack>
      </CardContent>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>ยืนยันการกู้คืนข้อมูล</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการกู้คืนข้อมูลจากไฟล์สำรอง &quot;{selectedBackup?.name}&quot; หรือไม่?
            <br />
            <br />
            <strong>คำเตือน:</strong> การกู้คืนข้อมูลจะแทนที่ข้อมูลปัจจุบันทั้งหมด
            กรุณาสำรองข้อมูลปัจจุบันก่อนดำเนินการ
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleRestoreConfirm} color="warning" variant="contained">
            ยืนยันการกู้คืน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ยืนยันการลบไฟล์สำรอง</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบไฟล์สำรอง &quot;{selectedBackup?.name}&quot; หรือไม่?
            <br />
            <br />
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            ยืนยันการลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
