'use client';

import React from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button } from '@mui/material';
import {
  Notifications as NotificationIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'comment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationBadgeProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}

export default function NotificationBadge({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
}: NotificationBadgeProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    handleClose();
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

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    handleClose();
  };

  const handleViewAll = () => {
    onViewAll();
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              การแจ้งเตือน
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" startIcon={<MarkReadIcon />} onClick={handleMarkAllAsRead}>
                อ่านทั้งหมด
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {recentNotifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              ไม่มีการแจ้งเตือน
            </Typography>
          </Box>
        ) : (
          <>
            {recentNotifications.map(notification => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={notification.read ? 400 : 600}
                    sx={{ mb: 0.5 }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatRelativeTime(notification.timestamp)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}

            <Divider />

            <Box sx={{ py: 1, px: 2, textAlign: 'center' }}>
              <Button fullWidth variant="text" onClick={handleViewAll}>
                ดูการแจ้งเตือนทั้งหมด
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
