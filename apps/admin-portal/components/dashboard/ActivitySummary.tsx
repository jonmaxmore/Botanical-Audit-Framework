'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Box,
} from '@mui/material';
import {
  Assignment as ApplicationIcon,
  Comment as CommentIcon,
  CheckCircle as ApprovedIcon,
  Person as UserIcon,
} from '@mui/icons-material';

export interface Activity {
  id: string;
  type: 'application' | 'comment' | 'approval' | 'user';
  title: string;
  description: string;
  time: string;
  user?: string;
}

interface ActivitySummaryProps {
  activities: Activity[];
}

export default function ActivitySummary({ activities }: ActivitySummaryProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <ApplicationIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'approval':
        return <ApprovedIcon />;
      case 'user':
        return <UserIcon />;
      default:
        return <ApplicationIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      application: '#2196f3',
      comment: '#ff9800',
      approval: '#4caf50',
      user: '#9c27b0',
    };
    return colors[type] || '#2196f3';
  };

  const formatTimeAgo = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'เมื่อสักครู่';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else {
      return `${diffInDays} วันที่แล้ว`;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          กิจกรรมล่าสุด
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List sx={{ p: 0 }}>
          {activities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีกิจกรรม
              </Typography>
            </Box>
          ) : (
            activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getActivityColor(activity.type),
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {activity.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(activity.time)}
                          </Typography>
                          {activity.user && (
                            <>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.user}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
}
