'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  edited?: boolean;
  replies?: Comment[];
}

interface CommentsListProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onReplyComment?: (parentId: string, content: string) => void;
  currentUser?: {
    name: string;
    avatar?: string;
  };
}

export default function CommentsList({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReplyComment,
  currentUser = { name: 'Admin User' },
}: CommentsListProps) {
  const [newComment, setNewComment] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleEditClick = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleSaveEdit = (id: string) => {
    if (editContent.trim()) {
      onEditComment(id, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteClick = () => {
    if (selectedCommentId) {
      onDeleteComment(selectedCommentId);
    }
    handleMenuClose();
  };

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
    handleMenuClose();
  };

  const handleSendReply = (parentId: string) => {
    if (replyContent.trim() && onReplyComment) {
      onReplyComment(parentId, replyContent);
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Box key={comment.id} sx={{ mb: 2, ml: isReply ? 6 : 0 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar
          sx={{
            width: isReply ? 32 : 40,
            height: isReply ? 32 : 40,
            bgcolor: 'primary.main',
          }}
        >
          {comment.user.avatar || comment.user.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {comment.user.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={comment.user.role}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(comment.timestamp)}
                      {comment.edited && ' (แก้ไขแล้ว)'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={e => handleMenuOpen(e, comment.id)}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>

              {editingId === comment.id ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSaveEdit(comment.id)}
                    >
                      บันทึก
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleCancelEdit}>
                      ยกเลิก
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {currentUser.avatar || currentUser.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="เขียนตอบกลับ..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleSendReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    ส่ง
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    ยกเลิก
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2 }}>{comment.replies.map(reply => renderComment(reply, true))}</Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Add Comment Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {currentUser.avatar || currentUser.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="เขียนความคิดเห็น..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              helperText={`${newComment.length} ตัวอักษร`}
            />
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              sx={{ mt: 1 }}
            >
              เพิ่มความคิดเห็น
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Comments List */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          ความคิดเห็นทั้งหมด ({comments.length})
        </Typography>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            ยังไม่มีความคิดเห็น
          </Typography>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const comment = comments.find(c => c.id === selectedCommentId);
            if (comment) handleEditClick(comment);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          แก้ไข
        </MenuItem>
        {onReplyComment && (
          <MenuItem
            onClick={() => {
              if (selectedCommentId) handleReplyClick(selectedCommentId);
            }}
          >
            <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
            ตอบกลับ
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          ลบ
        </MenuItem>
      </Menu>
    </Box>
  );
}
