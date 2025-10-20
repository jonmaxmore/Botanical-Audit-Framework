import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  Alert,
  Chip,
} from '@mui/material';
import { Email as EmailIcon, Save as SaveIcon, Preview as PreviewIcon } from '@mui/icons-material';

export interface EmailTemplatesProps {
  onSave: (data: EmailTemplatesData) => Promise<void>;
  loading?: boolean;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplatesData {
  newApplication: EmailTemplate;
  applicationApproved: EmailTemplate;
  applicationRejected: EmailTemplate;
  commentAdded: EmailTemplate;
  reminderNotification: EmailTemplate;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const defaultTemplates: EmailTemplatesData = {
  newApplication: {
    subject: 'คำขอรับรอง GACP ใหม่: {{applicationId}}',
    body: `เรียน ผู้ดูแลระบบ,

มีคำขอรับรอง GACP ใหม่เข้าสู่ระบบ

รหัสคำขอ: {{applicationId}}
ชื่อผู้ยื่นคำขอ: {{applicantName}}
วันที่ยื่นคำขอ: {{submissionDate}}

กรุณาเข้าสู่ระบบเพื่อตรวจสอบรายละเอียด

ขอแสดงความนับถือ
ระบบ GACP Certification`,
  },
  applicationApproved: {
    subject: 'คำขอรับรอง GACP ของคุณได้รับการอนุมัติ',
    body: `เรียน คุณ{{applicantName}},

ยินดีด้วย! คำขอรับรอง GACP ของคุณได้รับการอนุมัติแล้ว

รหัสคำขอ: {{applicationId}}
วันที่อนุมัติ: {{approvalDate}}
หมายเลขใบรับรอง: {{certificateNumber}}

คุณสามารถดาวน์โหลดใบรับรองได้จากระบบ

ขอแสดงความนับถือ
ทีมงาน GACP Certification`,
  },
  applicationRejected: {
    subject: 'แจ้งผลการพิจารณาคำขอรับรอง GACP',
    body: `เรียน คุณ{{applicantName}},

เราขออภัยที่ต้องแจ้งว่าคำขอรับรอง GACP ของคุณยังไม่ผ่านการพิจารณา

รหัสคำขอ: {{applicationId}}
วันที่พิจารณา: {{reviewDate}}
เหตุผล: {{rejectionReason}}

คุณสามารถแก้ไขและยื่นคำขอใหม่ได้

ขอแสดงความนับถือ
ทีมงาน GACP Certification`,
  },
  commentAdded: {
    subject: 'มีความเห็นใหม่ในคำขอ: {{applicationId}}',
    body: `เรียน คุณ{{recipientName}},

มีความเห็นใหม่เพิ่มเติมในคำขอรับรอง GACP

รหัสคำขอ: {{applicationId}}
ผู้แสดงความเห็น: {{commenterName}}
วันที่: {{commentDate}}

ความเห็น:
{{commentText}}

กรุณาเข้าสู่ระบบเพื่อดูรายละเอียด

ขอแสดงความนับถือ
ระบบ GACP Certification`,
  },
  reminderNotification: {
    subject: 'แจ้งเตือน: คำขอของคุณรอดำเนินการ',
    body: `เรียน คุณ{{applicantName}},

นี่เป็นการแจ้งเตือนว่าคำขอรับรอง GACP ของคุณรอดำเนินการ

รหัสคำขอ: {{applicationId}}
สถานะ: {{currentStatus}}
รอดำเนินการมาแล้ว: {{daysPending}} วัน

กรุณาตรวจสอบและดำเนินการที่จำเป็น

ขอแสดงความนับถือ
ทีมงาน GACP Certification`,
  },
};

export default function EmailTemplates({ onSave, loading = false }: EmailTemplatesProps) {
  const [templates, setTemplates] = React.useState<EmailTemplatesData>(defaultTemplates);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTemplateChange = (
    templateKey: keyof EmailTemplatesData,
    field: 'subject' | 'body',
    value: string,
  ) => {
    setTemplates(prev => ({
      ...prev,
      [templateKey]: {
        ...prev[templateKey],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(templates);
    setHasChanges(false);
  };

  const availableVariables = [
    '{{applicationId}}',
    '{{applicantName}}',
    '{{submissionDate}}',
    '{{approvalDate}}',
    '{{certificateNumber}}',
    '{{rejectionReason}}',
    '{{commenterName}}',
    '{{commentText}}',
    '{{currentStatus}}',
    '{{daysPending}}',
  ];

  const renderTemplateEditor = (templateKey: keyof EmailTemplatesData, title: string) => (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          label="หัวข้ออีเมล"
          value={templates[templateKey].subject}
          onChange={e => handleTemplateChange(templateKey, 'subject', e.target.value)}
        />

        <TextField
          fullWidth
          label="เนื้อหาอีเมล"
          multiline
          rows={12}
          value={templates[templateKey].body}
          onChange={e => handleTemplateChange(templateKey, 'body', e.target.value)}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            ตัวแปรที่ใช้ได้:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
            {availableVariables.map(variable => (
              <Chip
                key={variable}
                label={variable}
                size="small"
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(variable);
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <EmailIcon color="info" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              เทมเพลตอีเมล
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กำหนดเทมเพลตอีเมลสำหรับการแจ้งเตือนต่างๆ
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="email template tabs">
            <Tab label="คำขอใหม่" />
            <Tab label="อนุมัติ" />
            <Tab label="ไม่อนุมัติ" />
            <Tab label="ความเห็น" />
            <Tab label="แจ้งเตือน" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          {renderTemplateEditor('newApplication', 'เทมเพลตการแจ้งเตือนคำขอใหม่')}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {renderTemplateEditor('applicationApproved', 'เทมเพลตการแจ้งการอนุมัติ')}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {renderTemplateEditor('applicationRejected', 'เทมเพลตการแจ้งการไม่อนุมัติ')}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {renderTemplateEditor('commentAdded', 'เทมเพลตการแจ้งเตือนความเห็น')}
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          {renderTemplateEditor('reminderNotification', 'เทมเพลตการแจ้งเตือนทั่วไป')}
        </TabPanel>

        {hasChanges && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </Alert>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            onClick={() => {
              setTemplates(defaultTemplates);
              setHasChanges(false);
            }}
            disabled={loading || !hasChanges}
          >
            รีเซ็ต
          </Button>
          <Button variant="outlined" startIcon={<PreviewIcon />} disabled={loading}>
            ดูตัวอย่าง
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !hasChanges}
            startIcon={<SaveIcon />}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกเทมเพลต'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
