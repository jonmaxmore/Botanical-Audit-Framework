'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

export interface Activity {
  id: string;
  type:
    | 'document_upload'
    | 'document_download'
    | 'status_change'
    | 'comment'
    | 'edit'
    | 'user_action';
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  description?: string;
  timestamp: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fileName?: string;
  };
}

interface ActivityLogProps {
  activities: Activity[];
  maxHeight?: number;
}

export default function ActivityLog({ activities, maxHeight = 600 }: ActivityLogProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_upload':
        return <UploadIcon />;
      case 'document_download':
        return <DownloadIcon />;
      case 'status_change':
        return <EditIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'edit':
        return <EditIcon />;
      case 'user_action':
        return <PersonIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document_upload':
        return 'primary';
      case 'document_download':
        return 'info';
      case 'status_change':
        return 'warning';
      case 'comment':
        return 'success';
      case 'edit':
        return 'secondary';
      case 'user_action':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffMins < 1) relative = 'เมื่อสักครู่';
    else if (diffMins < 60) relative = `${diffMins} นาทีที่แล้ว`;
    else if (diffHours < 24) relative = `${diffHours} ชั่วโมงที่แล้ว`;
    else if (diffDays < 7) relative = `${diffDays} วันที่แล้ว`;
    else {
      relative = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    const time = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${relative} เวลา ${time}`;
  };

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          กิจกรรมล่าสุด
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ติดตามการดำเนินการทั้งหมด
        </Typography>

        <List
          sx={{
            maxHeight,
            overflow: 'auto',
            '& .MuiListItem-root': {
              borderLeft: 2,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
            },
          }}
        >
          {activities.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    ยังไม่มีกิจกรรม
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            activities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 2,
                  borderBottom: index < activities.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getActivityColor(activity.type)}.main`,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 0.5,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {activity.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.action}
                        </Typography>
                      </Box>
                      <Chip
                        label={activity.type.replace('_', ' ')}
                        size="small"
                        color={getActivityColor(activity.type)}
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    {activity.description && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                      >
                        {activity.description}
                      </Typography>
                    )}

                    {activity.metadata && (
                      <Box sx={{ mt: 1 }}>
                        {activity.metadata.fileName && (
                          <Typography variant="caption" color="text.secondary">
                            📄 {activity.metadata.fileName}
                          </Typography>
                        )}
                        {activity.metadata.oldValue && activity.metadata.newValue && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            เปลี่ยนจาก &quot;{activity.metadata.oldValue}&quot; → &quot;
                            {activity.metadata.newValue}&quot;
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}
