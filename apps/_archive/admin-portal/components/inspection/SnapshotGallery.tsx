'use client';

import { useState } from 'react';
import { Box, Card, CardMedia, IconButton, TextField, Typography, Grid, Chip } from '@mui/material';
import { Delete, Edit, Save, Close } from '@mui/icons-material';
import { format } from 'date-fns';

interface Snapshot {
  id: string;
  blob: Blob;
  url: string;
  timestamp: Date;
  caption?: string;
}

interface SnapshotGalleryProps {
  snapshots: Snapshot[];
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

export default function SnapshotGallery({
  snapshots,
  onDelete,
  onUpdateCaption,
}: SnapshotGalleryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const handleEdit = (snapshot: Snapshot) => {
    setEditingId(snapshot.id);
    setEditCaption(snapshot.caption || '');
  };

  const handleSave = (id: string) => {
    onUpdateCaption(id, editCaption);
    setEditingId(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">ภาพที่บันทึก</Typography>
        <Chip label={`${snapshots.length} ภาพ`} color="primary" />
      </Box>

      <Grid container spacing={2}>
        {snapshots.map(snapshot => (
          <Grid item xs={12} sm={6} md={4} key={snapshot.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={snapshot.url}
                alt={`Snapshot ${snapshot.id}`}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {format(snapshot.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                </Typography>

                {editingId === snapshot.id ? (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      placeholder="เพิ่มคำอธิบาย..."
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleSave(snapshot.id)}>
                        <Save />
                      </IconButton>
                      <IconButton size="small" onClick={() => setEditingId(null)}>
                        <Close />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">{snapshot.caption || 'ไม่มีคำอธิบาย'}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEdit(snapshot)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDelete(snapshot.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {snapshots.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">ยังไม่มีภาพที่บันทึก</Typography>
        </Box>
      )}
    </Box>
  );
}
