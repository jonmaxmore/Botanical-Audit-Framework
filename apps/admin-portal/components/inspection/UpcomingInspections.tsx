'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, List, ListItem, ListItemText } from '@mui/material';
import { Videocam, LocationOn, AccessTime } from '@mui/icons-material';
import { format, isToday, isTomorrow } from 'date-fns';
import axios from 'axios';

interface Inspection {
  id: string;
  type: 'video_call' | 'onsite';
  scheduledDate: string;
  scheduledTime: string;
  farmerName: string;
  status: string;
}

export default function UpcomingInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inspections/upcoming`
      );
      setInspections(response.data.inspections || []);
    } catch (error) {
      console.error('Failed to fetch upcoming inspections:', error);
    }
  };

  const getDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'วันนี้';
    if (isTomorrow(d)) return 'พรุ่งนี้';
    return format(d, 'dd/MM/yyyy');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>การตรวจสอบที่กำลังจะมาถึง</Typography>
        
        {inspections.length === 0 ? (
          <Typography color="text.secondary">ไม่มีการนัดหมาย</Typography>
        ) : (
          <List>
            {inspections.map(inspection => (
              <ListItem
                key={inspection.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {inspection.type === 'video_call' ? <Videocam /> : <LocationOn />}
                  
                  <ListItemText
                    primary={inspection.farmerName}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <AccessTime fontSize="small" />
                        <Typography variant="caption">
                          {getDateLabel(inspection.scheduledDate)} {inspection.scheduledTime}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Chip
                    label={inspection.type === 'video_call' ? 'Video Call' : 'Onsite'}
                    size="small"
                    color={inspection.type === 'video_call' ? 'primary' : 'secondary'}
                  />
                  
                  <Button size="small" variant="outlined">
                    เข้าร่วม
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
