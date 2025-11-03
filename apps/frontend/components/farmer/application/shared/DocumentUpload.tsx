/**
 * Document Upload Component
 * อัปโหลดเอกสารพร้อม Preview และ Validation
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // MB
  maxFiles?: number;
  required?: boolean;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  error?: boolean;
  helperText?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10, // 10 MB
  maxFiles = 5,
  required = false,
  files,
  onChange,
  error = false,
  helperText,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `ไฟล์มีขนาดใหญ่เกิน ${maxSize} MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isAccepted = acceptedTypes.some(
      (type) => type === fileExt || type === file.type
    );

    if (!isAccepted) {
      return `ประเภทไฟล์ไม่ถูกต้อง (ยอมรับเฉพาะ ${accept})`;
    }

    return null;
  };

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];

      // Check max files
      if (files.length + fileList.length > maxFiles) {
        alert(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
        return;
      }

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const validationError = validateFile(file);

        if (validationError) {
          newFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'error',
            error: validationError,
          });
        } else {
          // Simulate upload
          const uploadedFile: UploadedFile = {
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'uploading',
            uploadProgress: 0,
          };
          newFiles.push(uploadedFile);

          // Mock upload progress
          simulateUpload(uploadedFile, (updated) => {
            const updatedFiles = [...files, ...newFiles];
            const index = updatedFiles.findIndex((f) => f.id === updated.id);
            if (index !== -1) {
              updatedFiles[index] = updated;
              onChange(updatedFiles);
            }
          });
        }
      }

      onChange([...files, ...newFiles]);
    },
    [files, maxFiles, onChange, accept, maxSize]
  );

  const simulateUpload = (
    file: UploadedFile,
    onProgress: (file: UploadedFile) => void
  ) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        onProgress({
          ...file,
          status: 'success',
          uploadProgress: 100,
          url: `/api/files/${file.id}`,
        });
      } else {
        onProgress({
          ...file,
          uploadProgress: progress,
        });
      }
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDelete = (fileId: string) => {
    onChange(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} {required && <Typography component="span" color="error">*</Typography>}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {description}
        </Typography>
      )}

      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          border: error ? '2px dashed' : '2px dashed',
          borderColor: error ? 'error.main' : dragActive ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Box
          component="label"
          htmlFor={`file-upload-${label}`}
          sx={{ cursor: 'pointer', display: 'block' }}
        >
          <Box
            component="input"
            type="file"
            id={`file-upload-${label}`}
            accept={accept}
            multiple
            onChange={handleFileChange}
            sx={{ display: 'none' }}
            aria-label={`Upload ${label}`}
          />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            ลากไฟล์มาวางที่นี่ หรือ
          </Typography>
          <Button variant="contained" component="span" sx={{ mt: 1 }}>
            เลือกไฟล์
          </Button>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
            ยอมรับ: {accept} | ขนาดสูงสุด: {maxSize} MB | จำนวนสูงสุด: {maxFiles} ไฟล์
          </Typography>
        </Box>
      </Paper>

      {/* File List */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file) => (
            <ListItem
              key={file.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <ListItemIcon>
                {file.status === 'success' ? (
                  <CheckIcon color="success" />
                ) : file.status === 'error' ? (
                  <ErrorIcon color="error" />
                ) : (
                  <FileIcon color="action" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{file.name}</Typography>
                    <Chip
                      label={formatFileSize(file.size)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  file.status === 'uploading' ? (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={file.uploadProgress || 0}
                      />
                      <Typography variant="caption" color="text.secondary">
                        กำลังอัปโหลด {file.uploadProgress}%
                      </Typography>
                    </Box>
                  ) : file.status === 'error' ? (
                    <Typography variant="caption" color="error">
                      {file.error}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="success.main">
                      อัปโหลดสำเร็จ
                    </Typography>
                  )
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(file.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Error/Helper Text */}
      {(error || helperText) && (
        <Alert severity={error ? 'error' : 'info'} sx={{ mt: 2 }}>
          {error ? 'กรุณาอัปโหลดเอกสาร' : helperText}
        </Alert>
      )}
    </Box>
  );
};

export default DocumentUpload;
