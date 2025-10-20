'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Badge,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Assignment as TaskIcon,
  Comment as CommentIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'comment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  metadata?: {
    applicationId?: string;
    userName?: string;
  };
}

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onNavigate?: (link: string) => void;
}

export default function NotificationsList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNavigate,
}: NotificationsListProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <ApprovedIcon />;
      case 'error':
        return <RejectedIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'task':
        return <TaskIcon />;
      case 'comment':
        return <CommentIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'task':
        return 'primary';
      case 'comment':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
    }
  };

  return (
    <Card sx={{ boxShadow: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              การแจ้งเตือน
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }}>
                <Box sx={{ width: 20 }} />
              </Badge>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<MarkReadIcon />} onClick={onMarkAllAsRead}>
              ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <NotificationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">ไม่มีการแจ้งเตือน</Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    cursor: notification.link ? 'pointer' : 'default',
                    '&:hover': notification.link
                      ? {
                          bgcolor: 'action.selected',
                        }
                      : {},
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!notification.read && (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          title="ทำเครื่องหมายว่าอ่านแล้ว"
                        >
                          <MarkReadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(notification.id);
                        }}
                        title="ลบ"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type)}.main`,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="ใหม่"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatRelativeTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
