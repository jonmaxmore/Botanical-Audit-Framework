import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Grid,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
} from '@mui/icons-material';

export type ReportType = 'applications' | 'reviews' | 'users' | 'statistics';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => void;
  loading?: boolean;
}

export interface ReportConfig {
  type: ReportType;
  startDate: string;
  endDate: string;
  format: ExportFormat;
}

const reportTypes = [
  { value: 'applications', label: 'รายงานคำขอรับรอง' },
  { value: 'reviews', label: 'รายงานการตรวจสอบ' },
  { value: 'users', label: 'รายงานผู้ใช้งาน' },
  { value: 'statistics', label: 'รายงานสถิติ' },
];

const exportFormats = [
  { value: 'pdf', label: 'PDF', icon: <PdfIcon />, color: '#d32f2f' },
  { value: 'excel', label: 'Excel', icon: <ExcelIcon />, color: '#2e7d32' },
  { value: 'csv', label: 'CSV', icon: <CsvIcon />, color: '#1976d2' },
];

export default function ReportGenerator({ onGenerate, loading = false }: ReportGeneratorProps) {
  const [reportType, setReportType] = React.useState<ReportType>('applications');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [format, setFormat] = React.useState<ExportFormat>('pdf');

  // Set default dates (last 30 days)
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value as ReportType);
  };

  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
  };

  const handleGenerate = () => {
    onGenerate({
      type: reportType,
      startDate,
      endDate,
      format,
    });
  };

  const isValidDateRange = startDate && endDate && new Date(startDate) <= new Date(endDate);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          สร้างรายงาน
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          เลือกประเภทรายงานและช่วงเวลาที่ต้องการ
        </Typography>

        <Stack spacing={3}>
          {/* Report Type Selection */}
          <FormControl fullWidth>
            <InputLabel id="report-type-label">ประเภทรายงาน</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type"
              value={reportType}
              label="ประเภทรายงาน"
              onChange={handleReportTypeChange}
            >
              {reportTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="วันที่เริ่มต้น"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="วันที่สิ้นสุด"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: startDate,
                }}
              />
            </Grid>
          </Grid>

          {/* Export Format Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              รูปแบบการส่งออก
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              {exportFormats.map(exportFormat => (
                <Chip
                  key={exportFormat.value}
                  icon={exportFormat.icon}
                  label={exportFormat.label}
                  onClick={() => handleFormatChange(exportFormat.value as ExportFormat)}
                  color={format === exportFormat.value ? 'primary' : 'default'}
                  variant={format === exportFormat.value ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                    ...(format === exportFormat.value && {
                      bgcolor: exportFormat.color,
                      color: 'white',
                      '&:hover': {
                        bgcolor: exportFormat.color,
                      },
                    }),
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Generate Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleGenerate}
            disabled={!isValidDateRange || loading}
            sx={{
              mt: 2,
              py: 1.5,
            }}
          >
            {loading ? 'กำลังสร้างรายงาน...' : 'สร้างรายงาน'}
          </Button>

          {/* Info Text */}
          {!isValidDateRange && startDate && endDate && (
            <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
              วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
