'use client';

import { Box, FormControlLabel, Checkbox, TextField, Typography, Divider } from '@mui/material';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes: string;
}

interface GACPChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const DEFAULT_ITEMS = [
  { id: 'seed_quality', label: 'คุณภาพเมล็ดพันธุ์และวัสดุขยายพันธุ์', checked: false, notes: '' },
  { id: 'soil_management', label: 'การจัดการดินและปุ๋ย', checked: false, notes: '' },
  { id: 'pest_management', label: 'การจัดการศัตรูพืชและโรคพืช', checked: false, notes: '' },
  { id: 'harvesting', label: 'การเก็บเกี่ยว', checked: false, notes: '' },
  { id: 'post_harvest', label: 'การปฏิบัติหลังการเก็บเกี่ยว', checked: false, notes: '' },
  { id: 'storage', label: 'การเก็บรักษาและบรรจุภัณฑ์', checked: false, notes: '' },
  { id: 'documentation', label: 'การจัดทำเอกสารและบันทึก', checked: false, notes: '' },
  { id: 'personnel', label: 'บุคลากรและการฝึกอบรม', checked: false, notes: '' },
];

export default function GACPChecklist({ items = DEFAULT_ITEMS, onChange }: GACPChecklistProps) {
  const handleCheck = (id: string, checked: boolean) => {
    onChange(items.map(item => (item.id === id ? { ...item, checked } : item)));
  };

  const handleNotes = (id: string, notes: string) => {
    onChange(items.map(item => (item.id === id ? { ...item, notes } : item)));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        GACP Compliance Checklist
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {items.map(item => (
        <Box key={item.id} sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={item.checked}
                onChange={e => handleCheck(item.id, e.target.checked)}
              />
            }
            label={item.label}
          />
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            placeholder="หมายเหตุ..."
            value={item.notes}
            onChange={e => handleNotes(item.id, e.target.value)}
            sx={{ mt: 1, ml: 4 }}
          />
        </Box>
      ))}
    </Box>
  );
}
