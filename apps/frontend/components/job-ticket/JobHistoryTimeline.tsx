import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface JobHistoryTimelineProps {
  jobId: string;
}

interface HistoryEntry {
  _id: string;
  action: string;
  performedBy: {
    userId: string;
    name: string;
    role: string;
  };
  changes?: Record<string, any>;
  timestamp: string;
}

const actionLabels: Record<string, string> = {
  created: 'สร้างงาน',
  accepted: 'รับงาน',
  started: 'เริ่มงาน',
  completed: 'ปิดงาน',
  rejected: 'ปฏิเสธงาน',
  reassigned: 'มอบหมายใหม่',
  comment_added: 'เพิ่มความคิดเห็น',
  attachment_added: 'เพิ่มไฟล์แนบ',
  status_changed: 'เปลี่ยนสถานะ',
  updated: 'อัปเดตข้อมูล'
};

const actionIcons: Record<string, React.ReactNode> = {
  created: <AssignmentIcon />,
  accepted: <CheckCircleIcon />,
  started: <ScheduleIcon />,
  completed: <CheckCircleIcon />,
  rejected: <CancelIcon />,
  reassigned: <RefreshIcon />,
  comment_added: <CommentIcon />,
  attachment_added: <AttachFileIcon />,
  status_changed: <EditIcon />,
  updated: <EditIcon />
};

const actionColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'grey'> = {
  created: 'info',
  accepted: 'primary',
  started: 'warning',
  completed: 'success',
  rejected: 'error',
  reassigned: 'grey',
  comment_added: 'info',
  attachment_added: 'info',
  status_changed: 'primary',
  updated: 'grey'
};

export default function JobHistoryTimeline({ jobId }: JobHistoryTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
        
        const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data.data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('ไม่สามารถโหลดประวัติได้');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchHistory();
    }
  }, [jobId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="textSecondary">
          ยังไม่มีประวัติ
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 4 }}>
      {history.map((entry, index) => (
        <Box key={entry._id} sx={{ position: 'relative', mb: 3 }}>
          {/* Timeline Line */}
          {index < history.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: -28,
                top: 40,
                width: 2,
                height: 'calc(100% + 12px)',
                bgcolor: 'divider'
              }}
            />
          )}

          {/* Timeline Dot */}
          <Box
            sx={{
              position: 'absolute',
              left: -40,
              top: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: `${getActionColor(entry.action)}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: 2
            }}
          >
            {actionIcons[entry.action] || <EditIcon sx={{ fontSize: 18 }} />}
          </Box>

          {/* Content Card */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {actionLabels[entry.action] || entry.action}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(entry.timestamp), 'dd MMM yyyy HH:mm น.', { locale: th })}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="textSecondary">
              โดย {entry.performedBy.name}
            </Typography>

            {entry.changes && Object.keys(entry.changes).length > 0 && (
              <Box sx={{ mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                {Object.entries(entry.changes).map(([key, value]) => (
                  <Typography key={key} variant="caption" display="block" sx={{ mb: 0.5 }}>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );

  function getActionColor(action: string): string {
    const colors: Record<string, string> = {
      created: 'info',
      accepted: 'primary',
      started: 'warning',
      completed: 'success',
      rejected: 'error',
      reassigned: 'grey',
      comment_added: 'info',
      attachment_added: 'info',
      status_changed: 'primary',
      updated: 'grey'
    };
    return colors[action] || 'grey';
  }
