/**
 * PT9 Application Wizard - Herbal Cultivation License
 * ฟอร์มยื่นขอใบอนุญาตเพาะปลูกพืชสมุนไพร (3 steps)
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  NavigateBefore as BackIcon,
  NavigateNext as NextIcon,
  Save as SaveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

import PT9Step1Applicant from './steps/PT9Step1Applicant';
import PT9Step2Cultivation from './steps/PT9Step2Cultivation';
import PT9Step3Documents from './steps/PT9Step3Documents';

// Import types
import type { ThaiAddress } from '@/components/farmer/application/shared/AddressForm';
import type { GPSCoordinates } from '@/components/farmer/application/shared/GPSPicker';

export interface PT9Applicant {
  type: 'individual' | 'company';
  individual?: {
    firstNameTh: string;
    lastNameTh: string;
    nationalId: string;
    dateOfBirth: string;
  };
  company?: {
    companyNameTh: string;
    companyNameEn?: string;
    registrationNumber: string;
    taxId: string;
    representative: {
      name: string;
      nationalId: string;
      position: string;
    };
  };
  address: ThaiAddress;
  phone: string;
  email: string;
}

export interface PT9Cultivation {
  farmName: string;
  location: {
    address: ThaiAddress;
    gps: GPSCoordinates;
  };
  landArea: {
    total: number;
    cultivated: number;
    unit: 'rai' | 'hectare';
  };
  landOwnership: {
    type: 'owned' | 'leased' | 'rented';
    documentFileId?: string;
  };
  species: string[];
  variety: string;
  plantingMethod: 'seeds' | 'seedlings' | 'cuttings' | 'rhizomes';
  expectedYield: number;
  harvestPeriod: {
    start: string;
    end: string;
  };
  quality: {
    soilTest: {
      ph: number;
      organicMatter: number;
      reportFileId?: string;
      testDate: string;
    };
    waterTest: {
      source: 'well' | 'river' | 'canal' | 'rainwater';
      quality: 'good' | 'fair' | 'poor';
      reportFileId?: string;
      testDate: string;
    };
  };
  safety: {
    pestControl: boolean;
    chemicalFree: boolean;
    organicCertification?: {
      certified: boolean;
      certNumber?: string;
      certFileId?: string;
    };
  };
}

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

export interface PT9FormData {
  applicant: PT9Applicant;
  cultivation: PT9Cultivation;
  documents: PT9Documents;
  declaration: PT9Declaration;
}

const steps = [
  'ข้อมูลผู้ยื่นคำขอ',
  'ข้อมูลแปลงเพาะปลูก',
  'เอกสารประกอบ',
];

const PT9Wizard: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PT9FormData>>({
    applicant: {
      type: 'individual',
      address: {
        addressLine1: '',
        subDistrict: '',
        district: '',
        province: '',
        postalCode: '',
      },
      phone: '',
      email: '',
    },
    cultivation: {
      farmName: '',
      location: {
        address: {
          addressLine1: '',
          subDistrict: '',
          district: '',
          province: '',
          postalCode: '',
        },
        gps: { lat: 0, lng: 0 },
      },
      landArea: {
        total: 0,
        cultivated: 0,
        unit: 'rai',
      },
      landOwnership: {
        type: 'owned',
      },
      species: [],
      variety: '',
      plantingMethod: 'seeds',
      expectedYield: 0,
      harvestPeriod: {
        start: '',
        end: '',
      },
      quality: {
        soilTest: {
          ph: 0,
          organicMatter: 0,
          testDate: '',
        },
        waterTest: {
          source: 'well',
          quality: 'good',
          testDate: '',
        },
      },
      safety: {
        pestControl: false,
        chemicalFree: false,
      },
    },
    documents: {
      idCardFileId: '',
      landDocumentFileId: '',
      farmMapFileId: '',
      farmPhotos: [],
    },
    declaration: {
      accepted: false,
      signedBy: '',
      signedAt: '',
    },
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Call API to save draft
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('บันทึก Draft สำเร็จ!');
      router.push('/farmer/applications');
    } catch (err) {
      setError('ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Call API to submit application
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('ยื่นคำขอสำเร็จ!');
      router.push('/farmer/applications');
    } catch (err) {
      setError('ไม่สามารถยื่นคำขอได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (section: keyof PT9FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PT9Step1Applicant
            data={formData.applicant!}
            onChange={(data) => updateFormData('applicant', data)}
          />
        );
      case 1:
        return (
          <PT9Step2Cultivation
            data={formData.cultivation!}
            onChange={(data: PT9Cultivation) => updateFormData('cultivation', data)}
          />
        );
      case 2:
        return (
          <PT9Step3Documents
            data={formData.documents!}
            onChange={(data: PT9Documents) => updateFormData('documents', data)}
            onDeclarationChange={(data: PT9Declaration) => updateFormData('declaration', data)}
            declaration={formData.declaration!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>ยื่นขอใบอนุญาตเพาะปลูก PT9 | GACP System</title>
      </Head>

      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              PT9 - ใบอนุญาตเพาะปลูกพืชสมุนไพร
            </Typography>
            <Typography variant="body2">
              Herbal Cultivation License Application
            </Typography>
          </Paper>

          {/* Stepper */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Form Content */}
          <Paper sx={{ p: 4, mb: 3 }}>{renderStepContent(activeStep)}</Paper>

          {/* Navigation Buttons */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<BackIcon />}
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
              >
                ย้อนกลับ
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  บันทึก Draft
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<NextIcon />}
                    onClick={handleNext}
                    disabled={loading}
                  >
                    ถัดไป
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSubmit}
                    disabled={loading || !formData.declaration?.accepted}
                  >
                    {loading ? 'กำลังส่ง...' : 'ยื่นคำขอ'}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default PT9Wizard;
