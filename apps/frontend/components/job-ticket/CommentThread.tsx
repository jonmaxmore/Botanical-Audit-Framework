import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CommentThreadProps {
  jobId: string;
  onUpdate?: () => void;
}

interface Comment {
  _id: string;
  author: {
    userId: string;
    name: string;
    role: string;
  };
  content: string;
  attachments?: string[];
  createdAt: string;
}

export default function CommentThread({ jobId, onUpdate }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');

      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('ไม่สามารถโหลดความคิดเห็นได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchComments();
    }
  }, [jobId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem('token') || localStorage.getItem('inspector_token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const response = await fetch(`${API_BASE_URL}/job-assignments/${jobId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: {
            userId: currentUser._id || currentUser.id,
            name: currentUser.fullName || currentUser.name,
            role: currentUser.role
          },
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setNewComment('');
      await fetchComments();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError('ไม่สามารถส่งความคิดเห็นได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitComment();
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      inspector: 'ผู้ตรวจประเมิน',
      reviewer: 'ผู้ตรวจสอบ',
      admin: 'ผู้ดูแลระบบ',
      farmer: 'เกษตรกร'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      inspector: '#ff9800',
      reviewer: '#2196f3',
      admin: '#9c27b0',
      farmer: '#4caf50'
    };
    return roleColors[role] || '#757575';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Comment Input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="เขียนความคิดเห็น... (กด Ctrl+Enter เพื่อส่ง)"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={submitting}
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            ส่งความคิดเห็น
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="textSecondary">
            ยังไม่มีความคิดเห็น
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.map(comment => (
            <Paper key={comment._id} sx={{ p: 2 }} elevation={1}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(comment.author.role),
                    width: 40,
                    height: 40
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {comment.author.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: `${getRoleColor(comment.author.role)}20`,
                        color: getRoleColor(comment.author.role),
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 500
                      }}
                    >
                      {getRoleLabel(comment.author.role)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: th
                      })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {comment.content}
                  </Typography>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        ไฟล์แนบ: {comment.attachments.length} ไฟล์
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
