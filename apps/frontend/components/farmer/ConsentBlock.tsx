/**
 * Consent Block Component
 * Handles user consent and digital signature
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Paper,
  RadioGroup,
  Radio,
  Divider
} from '@mui/material';
import { CheckCircle as CheckIcon, Edit as EditIcon } from '@mui/icons-material';

interface ConsentBlockProps {
  fullName: string;
  nationalId: string;
  onConsentComplete?: (consentData: ConsentData) => void;
}

export interface ConsentData {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  fullName: string;
  nationalId: string;
  signature: {
    type: 'typed' | 'drawn';
    value: string;
  };
}

export default function ConsentBlock({
  fullName: initialFullName,
  nationalId: initialNationalId,
  onConsentComplete
}: ConsentBlockProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>('typed');
  const [typedSignature, setTypedSignature] = useState('');
  const [fullName, setFullName] = useState(initialFullName);
  const [nationalId, setNationalId] = useState(initialNationalId);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleConfirm = async () => {
    setError('');

    // Validation
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('กรุณายืนยันข้อตกลงทั้งหมด');
      return;
    }

    if (!fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!nationalId.trim() || nationalId.length !== 13) {
      setError('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
      return;
    }

    let signatureValue = '';
    if (signatureType === 'typed') {
      if (!typedSignature.trim()) {
        setError('กรุณากรอกลายเซ็น (พิมพ์ชื่อ)');
        return;
      }
      signatureValue = typedSignature.trim();
    } else {
      if (!canvasRef.current) {
        setError('ไม่พบพื้นที่วาดลายเซ็น');
        return;
      }
      signatureValue = canvasRef.current.toDataURL('image/png');
    }

    const consentData: ConsentData = {
      acceptedTerms,
      acceptedPrivacy,
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      signature: {
        type: signatureType,
        value: signatureValue
      }
    };

    setIsComplete(true);

    if (onConsentComplete) {
      onConsentComplete(consentData);
    }
  };

  if (isComplete) {
    return (
      <Paper sx={{ p: 3, bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
            ยืนยันความยินยอมเรียบร้อยแล้ว
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          ข้อมูลของคุณได้รับการบันทึกและปกป้องตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
        </Typography>
        <Button
          startIcon={<EditIcon />}
          onClick={() => setIsComplete(false)}
          sx={{ mt: 2 }}
          variant="text"
        >
          แก้ไขข้อมูล
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
        การยินยอมและลายเซ็น
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Terms and Privacy */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          ข้อตกลงและเงื่อนไข
        </Typography>

        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            maxHeight: 200,
            overflow: 'auto'
          }}
        >
          <Typography variant="body2" paragraph>
            <strong>1. การยืนยันความถูกต้องของข้อมูล</strong>
            <br />
            ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดที่ได้ให้ไว้ในคำขอนี้เป็นความจริงทุกประการ
            และยินยอมให้เจ้าหน้าที่ตรวจสอบความถูกต้องของข้อมูลและเอกสารที่แนบมาพร้อมนี้
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>2. การเปิดเผยข้อมูล</strong>
            <br />
            ข้าพเจ้ายินยอมให้กรมการแพทย์แผนไทยและการแพทย์ทางเลือก เก็บรวบรวม ใช้
            และเปิดเผยข้อมูลส่วนบุคคล รวมถึงข้อมูลสถานที่เพาะปลูกเพื่อวัตถุประสงค์ในการพิจารณาอนุญาต
            ตรวจสอบ และติดตามผล
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>3. การปฏิบัติตามกฎหมาย</strong>
            <br />
            ข้าพเจ้าจะปฏิบัติตามพระราชบัญญัติยาเสพติดให้โทษ พ.ศ. 2522
            และกฎหมายที่เกี่ยวข้องอย่างเคร่งครัด รวมถึงข้อกำหนดของ GACP (Good Agricultural and
            Collection Practices)
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              ข้าพเจ้ายืนยันว่าได้อ่านและเข้าใจข้อตกลงข้างต้น และยินยอมให้ดำเนินการตามที่ระบุ *
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedPrivacy}
              onChange={e => setAcceptedPrivacy(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              ข้าพเจ้ายินยอมให้เปิดเผยข้อมูลส่วนบุคคลตามนโยบายความเป็นส่วนตัวของกรมการแพทย์แผนไทยฯ *
            </Typography>
          }
        />

        <Divider sx={{ my: 3 }} />

        {/* Personal Info Confirmation */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          ยืนยันข้อมูลส่วนตัว
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            required
            label="ชื่อ-นามสกุล"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <TextField
            fullWidth
            required
            label="เลขบัตรประชาชน"
            value={nationalId}
            onChange={e => setNationalId(e.target.value)}
            inputProps={{ maxLength: 13 }}
          />
        </Box>

        {/* Digital Signature */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          ลายเซ็นดิจิทัล *
        </Typography>

        <RadioGroup
          value={signatureType}
          onChange={e => setSignatureType(e.target.value as 'typed' | 'drawn')}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="typed" control={<Radio />} label="พิมพ์ชื่อเป็นลายเซ็น" />
          <FormControlLabel value="drawn" control={<Radio />} label="วาดลายเซ็น" />
        </RadioGroup>

        {signatureType === 'typed' ? (
          <TextField
            fullWidth
            required
            label="พิมพ์ชื่อของคุณเป็นลายเซ็น"
            value={typedSignature}
            onChange={e => setTypedSignature(e.target.value)}
            placeholder="กรอกชื่อ-นามสกุลเพื่อเป็นลายเซ็น"
            sx={{
              '& input': {
                fontFamily: 'cursive',
                fontSize: '1.2rem'
              }
            }}
          />
        ) : (
          <Box>
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 1,
                bgcolor: '#fafafa',
                cursor: 'crosshair'
              }}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                style={{
                  border: '1px dashed #ccc',
                  width: '100%',
                  height: '150px',
                  backgroundColor: 'white'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </Paper>
            <Button onClick={handleClearCanvas} size="small" variant="outlined">
              ล้างลายเซ็น
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            💡 <strong>หมายเหตุ:</strong> ลายเซ็นดิจิทัลของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย
            มีผลทางกฎหมายเท่าเทียมกับลายเซ็นจริงตามพระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ.
            2544
          </Typography>
        </Box>
      </Paper>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleConfirm}
        disabled={!acceptedTerms || !acceptedPrivacy}
        sx={{ bgcolor: '#2e7d32' }}
      >
        ยืนยันความยินยอมและลายเซ็น
      </Button>
    </Box>
  );
}
