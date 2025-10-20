'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface ReviewData {
  id: string;
  applicationNumber: string;
  status: string;
  submittedDate: string;
  dueDate: string;
  farmer: {
    name: string;
    idCard: string;
    phone: string;
    email: string;
  };
  farm: {
    name: string;
    address: string;
    province: string;
    district: string;
    subdistrict: string;
    area: string;
    cropType: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
  }[];
  checklistItems: {
    id: string;
    category: string;
    item: string;
    status: 'pass' | 'fail' | 'pending';
    note: string;
  }[];
}

interface ReviewDetailProps {
  data: ReviewData;
  onSubmitReview: (decision: 'approve' | 'reject' | 'revise', comment: string) => void;
  onSaveDraft: () => void;
}

export default function ReviewDetail({ data, onSubmitReview, onSaveDraft }: ReviewDetailProps) {
  const [decision, setDecision] = React.useState<'approve' | 'reject' | 'revise' | ''>('');
  const [reviewComment, setReviewComment] = React.useState('');
  const [checklist, setChecklist] = React.useState(data.checklistItems);

  const handleChecklistChange = (id: string, status: 'pass' | 'fail' | 'pending') => {
    setChecklist(checklist.map(item => (item.id === id ? { ...item, status } : item)));
  };

  const handleChecklistNoteChange = (id: string, note: string) => {
    setChecklist(checklist.map(item => (item.id === id ? { ...item, note } : item)));
  };

  const handleSubmit = () => {
    if (!decision) {
      alert('กรุณาเลือกผลการตรวจสอบ');
      return;
    }
    if (!reviewComment.trim()) {
      alert('กรุณาระบุความเห็น');
      return;
    }
    onSubmitReview(decision, reviewComment);
  };

  const completedItems = checklist.filter(item => item.status !== 'pending').length;
  const totalItems = checklist.length;
  const progress = (completedItems / totalItems) * 100;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column - Application Info */}
        <Grid item xs={12} md={8}>
          {/* Application Header */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {data.applicationNumber}
                    </Typography>
                    <Chip label="รอตรวจสอบ" color="warning" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="พิมพ์">
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      วันที่ส่งคำขอ
                    </Typography>
                    <Typography variant="body2">
                      {new Date(data.submittedDate).toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      กำหนดส่ง
                    </Typography>
                    <Typography variant="body2">
                      {new Date(data.dueDate).toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Farmer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PersonIcon color="primary" />
                ข้อมูลเกษตรกร
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    ชื่อ-นามสกุล
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {data.farmer.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    เลขบัตรประชาชน
                  </Typography>
                  <Typography variant="body2">{data.farmer.idCard}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography variant="body2">{data.farmer.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    อีเมล
                  </Typography>
                  <Typography variant="body2">{data.farmer.email}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Farm Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocationIcon color="primary" />
                ข้อมูลแปลงเพาะปลูก
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    ชื่อแปลง
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {data.farm.name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    ที่อยู่
                  </Typography>
                  <Typography variant="body2">{data.farm.address}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    จังหวัด
                  </Typography>
                  <Typography variant="body2">{data.farm.province}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    อำเภอ
                  </Typography>
                  <Typography variant="body2">{data.farm.district}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    ตำบล
                  </Typography>
                  <Typography variant="body2">{data.farm.subdistrict}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    พื้นที่
                  </Typography>
                  <Typography variant="body2">{data.farm.area}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    ประเภทพืช
                  </Typography>
                  <Typography variant="body2">{data.farm.cropType}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <DocumentIcon color="primary" />
                เอกสารประกอบ ({data.documents.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {data.documents.map(doc => (
                  <ListItem
                    key={doc.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="ดูเอกสาร">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ดาวน์โหลด">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.name}
                      secondary={`${doc.type} • ${doc.size} • ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Review Form */}
        <Grid item xs={12} md={4}>
          {/* Progress Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ความคืบหน้า
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${progress}%`,
                      height: '100%',
                      bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                      transition: 'width 0.3s',
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                ตรวจสอบแล้ว {completedItems} / {totalItems} รายการ
              </Typography>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <AssignmentIcon color="primary" />
                รายการตรวจสอบ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {checklist.map(item => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" fontWeight={500} gutterBottom>
                      {item.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.item}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant={item.status === 'pass' ? 'contained' : 'outlined'}
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleChecklistChange(item.id, 'pass')}
                      >
                        ผ่าน
                      </Button>
                      <Button
                        size="small"
                        variant={item.status === 'fail' ? 'contained' : 'outlined'}
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleChecklistChange(item.id, 'fail')}
                      >
                        ไม่ผ่าน
                      </Button>
                    </Box>
                    {item.status === 'fail' && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="ระบุเหตุผล..."
                        value={item.note}
                        onChange={e => handleChecklistNoteChange(item.id, e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Review Decision */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ผลการตรวจสอบ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth>
                <RadioGroup
                  value={decision}
                  onChange={e => setDecision(e.target.value as typeof decision)}
                >
                  <FormControlLabel
                    value="approve"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon color="success" />
                        <Typography>อนุมัติ</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="revise"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        <Typography>ส่งกลับแก้ไข</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="reject"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon color="error" />
                        <Typography>ไม่อนุมัติ</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="ความเห็น/ข้อเสนอแนะ"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                sx={{ mt: 2 }}
                required
              />

              {decision === 'reject' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  กรุณาระบุเหตุผลที่ไม่อนุมัติอย่างชัดเจน
                </Alert>
              )}

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!decision || !reviewComment.trim()}
                >
                  ส่งผลการตรวจสอบ
                </Button>
                <Button fullWidth variant="outlined" onClick={onSaveDraft}>
                  บันทึกแบบร่าง
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
