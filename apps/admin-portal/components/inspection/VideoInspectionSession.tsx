'use client';

import { useState } from 'react';
import { Box, Button, Dialog, Stepper, Step, StepLabel, Alert } from '@mui/material';
import SnapshotGallery from './SnapshotGallery';
import InspectionReportForm from './InspectionReportForm';
import axios from 'axios';

interface Snapshot {
  id: string;
  blob: Blob;
  url: string;
  timestamp: Date;
  caption?: string;
}

interface VideoInspectionSessionProps {
  inspectionId: string;
  onComplete: () => void;
}

export default function VideoInspectionSession({
  inspectionId,
  onComplete,
}: VideoInspectionSessionProps) {
  const [step, setStep] = useState(0);
  const [inCall, setInCall] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const steps = ['Video Call', 'Review Snapshots', 'Submit Report'];

  const handleSnapshot = (blob: Blob) => {
    const snapshot: Snapshot = {
      id: Date.now().toString(),
      blob,
      url: URL.createObjectURL(blob),
      timestamp: new Date(),
    };
    setSnapshots(prev => [...prev, snapshot]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setSnapshots(prev => prev.map(s => (s.id === id ? { ...s, caption } : s)));
  };

  const handleEndCall = () => {
    setInCall(false);
    setStep(1);
  };

  const handleUploadSnapshots = async () => {
    const formData = new FormData();
    snapshots.forEach((snapshot, index) => {
      formData.append(`snapshots`, snapshot.blob, `snapshot-${index}.jpg`);
      formData.append(`captions`, snapshot.caption || '');
      formData.append(`timestamps`, snapshot.timestamp.toISOString());
    });

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/inspections/${inspectionId}/snapshots`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  };

  const handleContinueToReport = async () => {
    if (snapshots.length > 0) {
      await handleUploadSnapshots();
    }
    setStep(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && !inCall && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button variant="contained" size="large" onClick={() => setInCall(true)}>
            เริ่ม Video Call
          </Button>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <SnapshotGallery
            snapshots={snapshots}
            onDelete={handleDeleteSnapshot}
            onUpdateCaption={handleUpdateCaption}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button onClick={() => setInCall(true)}>ถ่ายภาพเพิ่ม</Button>
            <Button
              variant="contained"
              onClick={handleContinueToReport}
              disabled={snapshots.length === 0}
            >
              ดำเนินการต่อ
            </Button>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <InspectionReportForm
          inspectionId={inspectionId}
          snapshotCount={snapshots.length}
          onSubmit={onComplete}
        />
      )}

      {inCall && (
        <Dialog open fullScreen>
          <Box sx={{ p: 3 }}>
            <Alert severity="info">Video call feature is under development</Alert>
            <Button onClick={handleEndCall} sx={{ mt: 2 }}>End Call</Button>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
