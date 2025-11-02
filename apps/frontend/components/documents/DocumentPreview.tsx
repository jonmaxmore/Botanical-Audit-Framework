/**
 * DocumentPreview Component
 * Quick preview card for documents
 */

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface DocumentPreviewProps {
  document: {
    _id: string;
    documentId: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    filename: string;
    mimetype: string;
    filesize: number;
    uploadedAt: string;
    currentVersion: number;
  };
  onView?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  showPreview?: boolean;
  compact?: boolean;
}

export default function DocumentPreview({
  document,
  onView,
  onDownload,
  showPreview = true,
  compact = false
}: DocumentPreviewProps) {
  // Get file icon
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    } else if (mimetype === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 48, color: 'error.main' }} />;
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      return <DocIcon sx={{ fontSize: 48, color: 'info.main' }} />;
    }
    return <FileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
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
      rejected: 'ไม่อนุมัติ'
    };
    return labels[status] || status;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s'
        }
      }}
    >
      {/* Preview/Icon */}
      {showPreview && (
        <Box
          sx={{
            height: compact ? 120 : 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            cursor: 'pointer'
          }}
          onClick={() => onView && onView(document.documentId)}
        >
          {document.mimetype.startsWith('image/') ? (
            <CardMedia
              component="img"
              image={`/api/documents/${document.documentId}/download`}
              alt={document.title}
              sx={{
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            getFileIcon(document.mimetype)
          )}
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Tooltip title={document.title}>
          <Typography
            variant={compact ? 'body1' : 'h6'}
            noWrap
            sx={{
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => onView && onView(document.documentId)}
          >
            {document.title}
          </Typography>
        </Tooltip>

        {!compact && document.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {document.description}
          </Typography>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={getStatusLabel(document.status)}
            color={getStatusColor(document.status)}
            size="small"
          />
          <Chip label={`v${document.currentVersion}`} size="small" variant="outlined" />
          <Chip label={formatFileSize(document.filesize)} size="small" variant="outlined" />
        </Box>

        {!compact && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {format(new Date(document.uploadedAt), 'dd MMM yyyy', { locale: th })}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="ดูรายละเอียด">
          <IconButton
            size="small"
            onClick={() => onView && onView(document.documentId)}
            color="primary"
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ดาวน์โหลด">
          <IconButton size="small" onClick={() => onDownload && onDownload(document.documentId)}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
