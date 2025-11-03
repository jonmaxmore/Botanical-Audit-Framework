/**
 * PT9 Step 3: Documents & Declaration
 * เอกสารประกอบและคำรับรอง
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import DocumentUpload, {
  UploadedFile,
} from '@/components/farmer/application/shared/DocumentUpload';

export interface PT9Documents {
  idCardFileId: string;
  landDocumentFileId: string;
  farmMapFileId: string;
  farmPhotos: string[];
  soilTestFileId?: string;
  waterTestFileId?: string;
  organicCertFileId?: string;
}

export interface PT9Declaration {
  accepted: boolean;
  signedBy: string;
  signedAt: string;
  signature?: string;
}

interface PT9Step3Props {
  data: PT9Documents;
  onChange: (data: PT9Documents) => void;
  declaration: PT9Declaration;
  onDeclarationChange: (data: PT9Declaration) => void;
}

const PT9Step3Documents: React.FC<PT9Step3Props> = ({
  data,
  onChange,
  declaration,
  onDeclarationChange,
}) => {
  const [idCardFiles, setIdCardFiles] = useState<UploadedFile[]>([]);
  const [landDocFiles, setLandDocFiles] = useState<UploadedFile[]>([]);
  const [farmMapFiles, setFarmMapFiles] = useState<UploadedFile[]>([]);
  const [farmPhotoFiles, setFarmPhotoFiles] = useState<UploadedFile[]>([]);
  const [soilTestFiles, setSoilTestFiles] = useState<UploadedFile[]>([]);
  const [waterTestFiles, setWaterTestFiles] = useState<UploadedFile[]>([]);
  const [organicCertFiles, setOrganicCertFiles] = useState<UploadedFile[]>([]);

  const handleIdCardUpload = (files: UploadedFile[]) => {
    setIdCardFiles(files);
    onChange({
      ...data,
      idCardFileId: files[0]?.id || '',
    });
  };

  const handleLandDocUpload = (files: UploadedFile[]) => {
    setLandDocFiles(files);
    onChange({
      ...data,
      landDocumentFileId: files[0]?.id || '',
    });
  };

  const handleFarmMapUpload = (files: UploadedFile[]) => {
    setFarmMapFiles(files);
    onChange({
      ...data,
      farmMapFileId: files[0]?.id || '',
    });
  };

  const handleFarmPhotosUpload = (files: UploadedFile[]) => {
    setFarmPhotoFiles(files);
    onChange({
      ...data,
      farmPhotos: files.map((f) => f.id),
    });
  };

  const handleSoilTestUpload = (files: UploadedFile[]) => {
    setSoilTestFiles(files);
    onChange({
      ...data,
      soilTestFileId: files[0]?.id,
    });
  };

  const handleWaterTestUpload = (files: UploadedFile[]) => {
    setWaterTestFiles(files);
    onChange({
      ...data,
      waterTestFileId: files[0]?.id,
    });
  };

  const handleOrganicCertUpload = (files: UploadedFile[]) => {
    setOrganicCertFiles(files);
    onChange({
      ...data,
      organicCertFileId: files[0]?.id,
    });
  };

  const handleDeclarationChange = (field: keyof PT9Declaration, value: any) => {
    onDeclarationChange({
      ...declaration,
      [field]: value,
    });
  };

  const isAllRequiredDocsUploaded = () => {
    return (
      data.idCardFileId !== '' &&
      data.landDocumentFileId !== '' &&
      data.farmMapFileId !== '' &&
      data.farmPhotos.length >= 4
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        เอกสารประกอบคำขอ
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        กรุณาอัปโหลดเอกสารที่จำเป็นทั้งหมด (ไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10 MB)
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Required Documents */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="error">
          เอกสารที่ต้องแนบ *
        </Typography>

        <Grid container spacing={3}>
          {/* ID Card */}
          <Grid item xs={12}>
            <DocumentUpload
              label="สำเนาบัตรประชาชน / ทะเบียนนิติบุคคล"
              description="สำเนาบัตรประชาชนผู้ยื่นคำขอ (บุคคลธรรมดา) หรือหนังสือรับรองบริษัท (นิติบุคคล)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              required
              files={idCardFiles}
              onChange={handleIdCardUpload}
              error={!data.idCardFileId}
            />
          </Grid>

          {/* Land Document */}
          <Grid item xs={12}>
            <DocumentUpload
              label="เอกสารสิทธิ์ในที่ดิน"
              description="โฉนดที่ดิน / น.ส.3 / สัญญาเช่า (ต้องระบุขอบเขตที่ดินชัดเจน)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              required
              files={landDocFiles}
              onChange={handleLandDocUpload}
              error={!data.landDocumentFileId}
            />
          </Grid>

          {/* Farm Map */}
          <Grid item xs={12}>
            <DocumentUpload
              label="แผนที่แปลงเพาะปลูก"
              description="แผนที่หรือ GPS Map แสดงตำแหน่งแปลงเพาะปลูก"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              required
              files={farmMapFiles}
              onChange={handleFarmMapUpload}
              error={!data.farmMapFileId}
            />
          </Grid>

          {/* Farm Photos */}
          <Grid item xs={12}>
            <DocumentUpload
              label="รูปถ่ายแปลงเพาะปลูก"
              description="รูปถ่ายแปลงเพาะปลูกจาก 4 มุม พร้อมภาพรวมและภาพระยะใกล้ (อย่างน้อย 4 รูป)"
              accept=".jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={10}
              required
              files={farmPhotoFiles}
              onChange={handleFarmPhotosUpload}
              error={data.farmPhotos.length < 4}
              helperText={`อัปโหลดแล้ว ${data.farmPhotos.length} รูป (ต้องการอย่างน้อย 4 รูป)`}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Optional Documents */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          เอกสารเพิ่มเติม (ถ้ามี)
        </Typography>

        <Grid container spacing={3}>
          {/* Soil Test */}
          <Grid item xs={12}>
            <DocumentUpload
              label="รายงานการทดสอบดิน"
              description="ผลการทดสอบคุณภาพดิน (ถ้ามีการทดสอบ)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              files={soilTestFiles}
              onChange={handleSoilTestUpload}
            />
          </Grid>

          {/* Water Test */}
          <Grid item xs={12}>
            <DocumentUpload
              label="รายงานการทดสอบน้ำ"
              description="ผลการทดสอบคุณภาพน้ำ (ถ้ามีการทดสอบ)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              files={waterTestFiles}
              onChange={handleWaterTestUpload}
            />
          </Grid>

          {/* Organic Certification */}
          <Grid item xs={12}>
            <DocumentUpload
              label="ใบรับรองเกษตรอินทรีย์"
              description="ใบรับรองมาตรฐานเกษตรอินทรีย์ (ถ้ามี)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              maxFiles={1}
              files={organicCertFiles}
              onChange={handleOrganicCertUpload}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Document Checklist */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          สถานะเอกสาร
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              {data.idCardFileId ? (
                <CheckIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="สำเนาบัตรประชาชน / ทะเบียนนิติบุคคล"
              secondary={data.idCardFileId ? 'อัปโหลดแล้ว' : 'ยังไม่อัปโหลด'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {data.landDocumentFileId ? (
                <CheckIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="เอกสารสิทธิ์ในที่ดิน"
              secondary={data.landDocumentFileId ? 'อัปโหลดแล้ว' : 'ยังไม่อัปโหลด'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {data.farmMapFileId ? (
                <CheckIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="แผนที่แปลงเพาะปลูก"
              secondary={data.farmMapFileId ? 'อัปโหลดแล้ว' : 'ยังไม่อัปโหลด'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {data.farmPhotos.length >= 4 ? (
                <CheckIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="รูปถ่ายแปลงเพาะปลูก"
              secondary={`อัปโหลดแล้ว ${data.farmPhotos.length} รูป (ต้องการอย่างน้อย 4 รูป)`}
            />
          </ListItem>
        </List>

        {isAllRequiredDocsUploaded() ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✓ เอกสารที่จำเป็นครบถ้วนแล้ว
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠ กรุณาอัปโหลดเอกสารที่จำเป็นให้ครบถ้วน
          </Alert>
        )}
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Declaration */}
      <Paper variant="outlined" sx={{ p: 3, borderColor: 'primary.main' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
          คำรับรองและคำยินยอม
        </Typography>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" paragraph>
            ข้าพเจ้าขอรับรองว่า:
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
            • ข้อมูลทั้งหมดที่ได้ให้ไว้ในคำขอนี้เป็นความจริง
            <br />
            • เอกสารที่แนบมานั้นถูกต้องและเป็นปัจจุบัน
            <br />
            • จะปฏิบัติตามกฎหมายและระเบียบที่เกี่ยวข้องอย่างเคร่งครัด
            <br />
            • ยินยอมให้เจ้าหน้าที่ตรวจสอบสถานที่และข้อมูลได้ตลอดเวลา
            <br />• หากพบข้อมูลเท็จ ยินยอมรับผิดตามกฎหมาย
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={declaration.accepted}
              onChange={(e) => {
                handleDeclarationChange('accepted', e.target.checked);
                if (e.target.checked) {
                  handleDeclarationChange('signedAt', new Date().toISOString());
                }
              }}
              required
            />
          }
          label={
            <Typography variant="body2" fontWeight="bold">
              ข้าพเจ้ายอมรับเงื่อนไขและคำรับรองข้างต้น *
            </Typography>
          }
        />

        {!declaration.accepted && (
          <Alert severity="error" sx={{ mt: 2 }}>
            กรุณายอมรับเงื่อนไขและคำรับรองก่อนยื่นคำขอ
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default PT9Step3Documents;
