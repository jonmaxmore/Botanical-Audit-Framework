'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Stack,
  Paper,
  List,
  ListItem,
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Edit as RevisionIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AttachFile as AttachIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

export interface HistoryEvent {
  id: string;
  type: 'submit' | 'review' | 'comment' | 'revision' | 'approve' | 'reject';
  title: string;
  description: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: string;
  status?: 'approved' | 'rejected' | 'revision';
  comment?: string;
  attachments?: {
    id: string;
    name: string;
  }[];
}

interface ReviewHistoryProps {
  events: HistoryEvent[];
}

export default function ReviewHistory({ events }: ReviewHistoryProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return <ApprovedIcon />;
      case 'reject':
        return <RejectedIcon />;
      case 'revision':
        return <RevisionIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'submit':
        return <PersonIcon />;
      case 'review':
        return <ViewIcon />;
      default:
        return <CircleIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'approve':
        return 'success';
      case 'reject':
        return 'error';
      case 'revision':
        return 'warning';
      case 'comment':
        return 'info';
      case 'submit':
        return 'primary';
      default:
        return 'grey';
    }
  };

  const getStatusChip = (status?: string) => {
    if (!status) return null;

    const labels: Record<string, string> = {
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
      revision: 'ส่งกลับแก้ไข',
    };

    const colors: Record<string, 'success' | 'error' | 'warning'> = {
      approved: 'success',
      rejected: 'error',
      revision: 'warning',
    };

    return <Chip label={labels[status]} color={colors[status]} size="small" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          ประวัติการตรวจสอบ
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <List sx={{ width: '100%' }}>
          {events.map((event, index) => {
            const dateTime = formatDateTime(event.timestamp);
            const isLast = index === events.length - 1;

            return (
              <ListItem
                key={event.id}
                alignItems="flex-start"
                sx={{
                  display: 'flex',
                  gap: 2,
                  position: 'relative',
                  '&::before': !isLast
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: '20px',
                        top: '50px',
                        bottom: '-50px',
                        width: '2px',
                        bgcolor: 'grey.300',
                      }
                    : {},
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: `${getEventColor(event.type)}.main`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {getEventIcon(event.type)}
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dateTime.date} • {dateTime.time}
                        </Typography>
                      </Box>
                      {event.status && getStatusChip(event.status)}
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {event.description}
                    </Typography>

                    {event.comment && (
                      <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'grey.50' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          gutterBottom
                        >
                          ความเห็น:
                        </Typography>
                        <Typography variant="body2">{event.comment}</Typography>
                      </Paper>
                    )}

                    {event.attachments && event.attachments.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {event.attachments.map(attachment => (
                            <Chip
                              key={attachment.id}
                              icon={<AttachIcon />}
                              label={attachment.name}
                              size="small"
                              variant="outlined"
                              onClick={() => console.log('Download:', attachment.id)}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Avatar
                        src={event.user.avatar}
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        {event.user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {event.user.name} ({event.user.role})
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              ยังไม่มีประวัติการตรวจสอบ
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
