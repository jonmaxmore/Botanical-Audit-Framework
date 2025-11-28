import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
  Divider,
  Link,
  Paper
} from '@mui/material';
import { WarningAmber, CheckCircle, Info } from '@mui/icons-material';

interface ApplicationConsentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (consents: ApplicationConsents) => void;
  loading?: boolean;
}

export interface ApplicationConsents {
  // Mandatory Consents (บังคับ)
  acceptDataProcessing: boolean;
  acceptFieldInspection: boolean;
  acceptDataRetention5Years: boolean;
  acceptGACPTerms: boolean;

  // Acknowledgements (รับทราบ - ไม่ใช่ความยินยอม แต่ต้อง check)
  acknowledgeApplicationFee: boolean;
  acknowledgeProcessingTime: boolean;

  // Metadata
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const ApplicationConsentModal: React.FC<ApplicationConsentModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [consents, setConsents] = useState<ApplicationConsentModalProps>({
    acceptDataProcessing: false,
    acceptFieldInspection: false,
    acceptDataRetention5Years: false,
    acceptGACPTerms: false,
    acknowledgeApplicationFee: false,
    acknowledgeProcessingTime: false
  });

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsents({
      ...consents,
      [event.target.name]: event.target.checked
    });
  };

  const allMandatoryAccepted =
    consents.acceptDataProcessing &&
    consents.acceptFieldInspection &&
    consents.acceptDataRetention5Years &&
    consents.acceptGACPTerms &&
    consents.acknowledgeApplicationFee &&
    consents.acknowledgeProcessingTime;

  const handleSubmit = () => {
    if (!allMandatoryAccepted) return;

    onSubmit({
      ...consents,
      timestamp: new Date(),
      ipAddress: 'N/A', // Will be captured by backend
      userAgent: navigator.userAgent
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmber color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={600}>
            ความยินยอมก่อนยื่นคำขอ GACP
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          กรุณาอ่านและยอมรับเงื่อนไขทั้งหมดก่อนยื่นคำขอรับรอง GACP
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Important Information Alert */}
        <Alert severity="warning" icon={<Info />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            ⚠️ สิ่งที่ท่านควรรู้:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>ค่าธรรมเนียม:</strong> 30,000 บาท (ค่ายื่นคำขอ 5,000 บาท + ค่าตรวจสอบ
                25,000 บาท)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>ระยะเวลาพิจารณา:</strong> 90-180 วัน (3-6 เดือน)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>ข้อมูลจะถูกเก็บไว้:</strong> 5 ปี ตามกฎหมาย GMP Annex 11
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>ค่าธรรมเนียมไม่สามารถคืนได้</strong> หาก DTAM ปฏิเสธคำขอ
              </Typography>
            </li>
          </Box>
        </Alert>

        <Divider sx={{ my: 2 }} />

        {/* Section 1: Mandatory Consents */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          ความยินยอม (บังคับ)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          ท่านต้องยอมรับทั้งหมดเพื่อยื่นคำขอ
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acceptDataProcessing}
                onChange={handleConsentChange}
                name="acceptDataProcessing"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  1. ยินยอมให้ DTAM เข้าถึงข้อมูล ✅
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันยินยอมให้กรมแพทย์แผนไทย (DTAM) เข้าถึงและประมวลผลข้อมูลฟาร์ม ข้อมูลการเก็บเกี่ยว
                  และเอกสารประกอบทั้งหมดเพื่อวัตถุประสงค์ในการตรวจสอบและรับรอง GACP
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acceptFieldInspection}
                onChange={handleConsentChange}
                name="acceptFieldInspection"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  2. ยินยอมให้ตรวจสอบภาคสนาม (On-site Inspection) ✅
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันยินยอมให้เจ้าหน้าที่ DTAM เข้าตรวจสอบฟาร์มของฉันจริง
                  และจะอำนวยความสะดวกในการตรวจสอบทุกประการ
                  รวมถึงการเข้าถึงพื้นที่ฟาร์มและเอกสารที่เกี่ยวข้อง
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acceptDataRetention5Years}
                onChange={handleConsentChange}
                name="acceptDataRetention5Years"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  3. รับทราบการเก็บข้อมูล 5 ปี ✅
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันรับทราบว่าข้อมูลทั้งหมดจะถูกเก็บไว้เป็นระยะเวลา 5 ปี ตามข้อกำหนด GMP Annex
                  11 และกฎหมาย PDPA และไม่สามารถขอลบข้อมูลได้ภายในระยะเวลาดังกล่าว
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acceptGACPTerms}
                onChange={handleConsentChange}
                name="acceptGACPTerms"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  4. ยอมรับเงื่อนไข GACP ทั้งหมด ✅
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันได้อ่านและเข้าใจ{' '}
                  <Link href="/docs/gacp-terms" target="_blank">
                    เงื่อนไขการสมัคร GACP
                  </Link>{' '}
                  และยอมรับเงื่อนไขทั้งหมด รวมถึงการปฏิบัติตามมาตรฐาน WHO GACP Guidelines,
                  GMP และกฎหมายที่เกี่ยวข้อง
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start' }}
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Acknowledgements */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          การรับทราบ (บังคับ)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          ท่านต้องรับทราบข้อมูลต่อไปนี้
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acknowledgeApplicationFee}
                onChange={handleConsentChange}
                name="acknowledgeApplicationFee"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  1. รับทราบค่าธรรมเนียม 30,000 บาท 💰
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันรับทราบว่าต้องชำระค่าธรรมเนียม 30,000 บาท (ค่ายื่นคำขอ 5,000 บาท +
                  ค่าตรวจสอบ 25,000 บาท) หลังจากยื่นคำขอและ DTAM ยืนยันรับเรื่อง
                  และค่าธรรมเนียมนี้ไม่สามารถคืนได้หาก DTAM ปฏิเสธคำขอ
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={consents.acknowledgeProcessingTime}
                onChange={handleConsentChange}
                name="acknowledgeProcessingTime"
                color="primary"
                required
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  2. รับทราบระยะเวลา 90-180 วัน ⏰
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ฉันรับทราบว่า DTAM จะใช้เวลาพิจารณา 90-180 วัน (3-6 เดือน)
                  และระบบไม่สามารถเร่งรัดกระบวนการของ DTAM ได้
                  การตัดสินอยู่ในดุลพินิจของ DTAM แต่เพียงผู้เดียว
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start' }}
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Summary */}
        <Alert severity="success" icon={<CheckCircle />}>
          <Typography variant="body2" fontWeight={600}>
            ✅ สิ่งที่จะเกิดขึ้นหลังจากยื่นคำขอ:
          </Typography>
          <Box component="ol" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li>
              <Typography variant="body2">ชำระค่าธรรมเนียม 30,000 บาท ภายใน 7 วัน</Typography>
            </li>
            <li>
              <Typography variant="body2">DTAM ตรวจสอบเอกสารเบื้องต้น (30 วัน)</Typography>
            </li>
            <li>
              <Typography variant="body2">
                DTAM นัดหมายตรวจสอบภาคสนาม (On-site Inspection)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                DTAM พิจารณาและออกผลการตรวจสอบ (90-180 วัน)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                ได้รับใบรับรอง GACP (หาก Approve) หรือแจ้งเหตุผล (หาก Reject)
              </Typography>
            </li>
          </Box>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined" size="large" disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={!allMandatoryAccepted || loading}
          startIcon={allMandatoryAccepted ? <CheckCircle /> : <WarningAmber />}
        >
          {loading ? 'กำลังยื่นคำขอ...' : 'ยืนยันและยื่นคำขอ GACP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationConsentModal;
