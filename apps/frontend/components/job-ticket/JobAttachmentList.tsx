import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface JobAttachmentListProps {
  jobId: string;
  onUpdate?: () => void;
}

interface Attachment {
  _id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    userId: string;
    name: string;
  };
  uploadedAt: string;
}

export default function JobAttachmentList({ jobId, onUpdate }: JobAttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');

      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/attachments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }

      const data = await response.json();
      setAttachments(data.data || []);
    } catch (err) {
      console.error('Failed to load attachments:', err);
      setError('ไม่สามารถโหลดไฟล์แนบได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchAttachments();
    }
  }, [jobId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append(
        'uploadedBy',
        JSON.stringify({
          userId: currentUser._id || currentUser.id,
          name: currentUser.fullName || currentUser.name
        })
      );

      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/attachments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      await fetchAttachments();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType === 'application/pdf') return <PdfIcon />;
    return <FileIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Button */}
      <Box sx={{ mb: 3 }}>
        <input
          accept="*/*"
          style={{ display: 'none' }}
          id="file-upload-button"
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label htmlFor="file-upload-button">
          <Button
            variant="contained"
            component="span"
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            disabled={uploading}
          >
            อัปโหลดไฟล์
          </Button>
        </label>
      </Box>

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <AttachFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            ยังไม่มีไฟล์แนบ
          </Typography>
        </Box>
      ) : (
        <List>
          {attachments.map(attachment => (
            <ListItem
              key={attachment._id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDownload(attachment.url, attachment.filename)}
                >
                  <DownloadIcon />
                </IconButton>
              }
            >
              <ListItemIcon>{getFileIcon(attachment.mimeType)}</ListItemIcon>
              <ListItemText
                primary={attachment.filename}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip label={formatFileSize(attachment.size)} size="small" variant="outlined" />
                    <Typography variant="caption" color="textSecondary">
                      • อัปโหลดโดย {attachment.uploadedBy.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      •{' '}
                      {formatDistanceToNow(new Date(attachment.uploadedAt), {
                        addSuffix: true,
                        locale: th
                      })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
