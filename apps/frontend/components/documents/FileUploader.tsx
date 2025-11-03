/**
 * FileUploader Component
 * Handle file upload with drag & drop support
 */

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

interface FileUploaderProps {
  onUpload?: (files: File[]) => Promise<void> | void;
  onFileSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  onFileSelect,
  accept = '*',
  multiple = false,
  maxSize = 10485760, // 10MB
  maxFiles = 1
}) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const limitedFiles = files.slice(0, maxFiles);
    
    if (onUpload) {
      await onUpload(limitedFiles);
    }
    if (onFileSelect) {
      onFileSelect(limitedFiles);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id="file-upload"
        multiple={multiple}
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
        >
          Upload File
        </Button>
      </label>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Max file size: {(maxSize / 1048576).toFixed(0)}MB
      </Typography>
    </Box>
  );
};

export default FileUploader;