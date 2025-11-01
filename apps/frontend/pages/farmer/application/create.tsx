/**
 * Create Application Page
 * Farmer application creation form for GACP certification
 * Production-ready with validation and error handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import FarmerLayout from '../../../components/layout/FarmerLayout';
import DocumentUploadSection from '../../../components/farmer/DocumentUploadSection';
import ConsentBlock from '../../../components/farmer/ConsentBlock';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/user.types';

// Types
interface FarmerData {
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  applicantType: 'INDIVIDUAL' | 'COMMUNITY_ENTERPRISE' | 'LEGAL_ENTITY';
  organizationName: string;
  registrationNumber: string;
  taxId: string;
}

interface FarmData {
  farmName: string;
  farmAddress: string;
  farmProvince: string;
  farmDistrict: string;
  farmSubdistrict: string;
  farmPostalCode: string;
  farmSize: string;
  farmSizeUnit: string;
  cultivationType: string;
  cropType: string;
  latitude: string;
  longitude: string;
  receivingOffice: 'DEPARTMENT_THAI_TRADITIONAL_MEDICINE' | 'PROVINCIAL_HEALTH_OFFICE';
}

const steps = [
  'ข้อมูลเกษตรกร',
  'ข้อมูลฟาร์ม',
  'เอกสารประกอบ',
  'ความยินยอมและลายเซ็น',
  'ตรวจสอบข้อมูล'
];

type AddressHierarchy = Record<string, Record<string, string[]>>;

const addressHierarchy: AddressHierarchy = {
  กรุงเทพมหานคร: {
    เขตพระนคร: ['แขวงพระบรมมหาราชวัง', 'แขวงวังบูรพาภิรมย์', 'แขวงวัดราชบพิธ'],
    เขตดุสิต: ['แขวงดุสิต', 'แขวงวชิรพยาบาล', 'แขวงสวนจิตรลดา'],
    เขตบางรัก: ['แขวงบางรัก', 'แขวงสีลม', 'แขวงสี่พระยา'],
    เขตจตุจักร: ['แขวงลาดยาว', 'แขวงจตุจักร', 'แขวงบางเขน']
  },
  เชียงใหม่: {
    อำเภอเมืองเชียงใหม่: ['ตำบลศรีภูมิ', 'ตำบลพระสิงห์', 'ตำบลสุเทพ'],
    อำเภอสันทราย: ['ตำบลสันทรายน้อย', 'ตำบลสันทรายหลวง', 'ตำบลหนองแหย่ง'],
    อำเภอหางดง: ['ตำบลหางดง', 'ตำบลสันผักหวาน', 'ตำบลหนองแก๋ว']
  },
  เชียงราย: {
    อำเภอเมืองเชียงราย: ['ตำบลเวียง', 'ตำบลริมกก', 'ตำบลรอบเวียง'],
    อำเภอแม่จัน: ['ตำบลแม่จัน', 'ตำบลจันจว้า', 'ตำบลป่าซาง'],
    อำเภอเชียงของ: ['ตำบลเวียง', 'ตำบลศรีดอนชัย', 'ตำบลสถาน']
  }
};

const baseProvinces = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'ลำปาง',
  'น่าน',
  'พะเยา',
  'แพร่',
  'แม่ฮ่องสอน',
  'ลำพูน'
];

const provinces = Array.from(new Set([...Object.keys(addressHierarchy), ...baseProvinces]));

const cultivationTypes = [
  { value: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)' },
  { value: 'INDOOR', label: 'ในโรงเรือน (Indoor)' },
  { value: 'GREENHOUSE', label: 'โรงเรือนเกษตร (Greenhouse)' },
  { value: 'MIXED', label: 'แบบผสม (Mixed)' }
];

const applicantTypes = [
  { value: 'INDIVIDUAL', label: 'บุคคลธรรมดา' },
  { value: 'COMMUNITY_ENTERPRISE', label: 'วิสาหกิจชุมชน' },
  { value: 'LEGAL_ENTITY', label: 'นิติบุคคล' }
];

const receivingOffices = [
  {
    value: 'DEPARTMENT_THAI_TRADITIONAL_MEDICINE',
    label: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก'
  },
  { value: 'PROVINCIAL_HEALTH_OFFICE', label: 'สำนักงานสาธารณสุขจังหวัด' }
];

const cropTypes = [
  'กัญชา (Cannabis)',
  'กัญชง (Hemp)',
  'ฟ้าทะลายโจร',
  'ขมิ้นชัน',
  'ว่านหางจระเข้',
  'มะรุม',
  'อื่นๆ'
];

const farmSizeUnits = ['ไร่', 'งาน', 'ตารางเมตร'];

const farmerRequiredFields: Array<{ key: keyof FarmerData; label: string }> = [
  { key: 'fullName', label: 'ชื่อ-นามสกุล' },
  { key: 'nationalId', label: 'เลขบัตรประชาชน' },
  { key: 'email', label: 'อีเมล' },
  { key: 'phoneNumber', label: 'เบอร์โทรศัพท์' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'province', label: 'จังหวัด' },
  { key: 'district', label: 'อำเภอ/เขต' },
  { key: 'subdistrict', label: 'ตำบล/แขวง' },
  { key: 'postalCode', label: 'รหัสไปรษณีย์' }
];

const farmRequiredFields: Array<{ key: keyof FarmData; label: string }> = [
  { key: 'farmName', label: 'ชื่อฟาร์ม' },
  { key: 'farmAddress', label: 'ที่อยู่ฟาร์ม' },
  { key: 'farmProvince', label: 'จังหวัดของฟาร์ม' },
  { key: 'farmDistrict', label: 'อำเภอ/เขตของฟาร์ม' },
  { key: 'farmSubdistrict', label: 'ตำบล/แขวงของฟาร์ม' },
  { key: 'farmPostalCode', label: 'รหัสไปรษณีย์ฟาร์ม' },
  { key: 'farmSize', label: 'ขนาดพื้นที่' },
  { key: 'farmSizeUnit', label: 'หน่วยขนาดพื้นที่' },
  { key: 'cultivationType', label: 'ประเภทการปลูก' },
  { key: 'cropType', label: 'ประเภทพืช' }
];

export default function CreateApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applicationId, setApplicationId] = useState<string>('');
  const [consentData, setConsentData] = useState<any>(null);

  // Form data
  const [farmerData, setFarmerData] = useState<FarmerData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    address: '',
    province: '',
    district: '',
    subdistrict: '',
    postalCode: '',
    applicantType: 'INDIVIDUAL',
    organizationName: '',
    registrationNumber: '',
    taxId: ''
  });

  const [farmData, setFarmData] = useState<FarmData>({
    farmName: '',
    farmAddress: '',
    farmProvince: '',
    farmDistrict: '',
    farmSubdistrict: '',
    farmPostalCode: '',
    farmSize: '',
    farmSizeUnit: 'ไร่',
    cultivationType: '',
    cropType: '',
    latitude: '',
    longitude: '',
    receivingOffice: 'DEPARTMENT_THAI_TRADITIONAL_MEDICINE'
  });

  // Load user data on mount
  useEffect(() => {
    if (!user || user.role !== UserRole.FARMER) {
      return;
    }

    setFarmerData(prev => ({
      ...prev,
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phone || '',
      nationalId: user.idCardNumber || '',
      address: user.address || '',
      province: user.province || '',
      district: user.district || '',
      subdistrict: user.subdistrict || '',
      postalCode: user.postalCode || ''
    }));
  }, [user]);

  const farmerDistrictOptions = useMemo(() => {
    const province = farmerData.province;
    if (!province || !addressHierarchy[province]) {
      return [] as string[];
    }
    const options = Object.keys(addressHierarchy[province]);
    return farmerData.district && !options.includes(farmerData.district)
      ? [...options, farmerData.district]
      : options;
  }, [farmerData.province, farmerData.district]);

  const farmerSubdistrictOptions = useMemo(() => {
    const province = farmerData.province;
    const district = farmerData.district;
    if (!province || !district || !addressHierarchy[province]?.[district]) {
      return [] as string[];
    }
    const options = addressHierarchy[province][district];
    return farmerData.subdistrict && !options.includes(farmerData.subdistrict)
      ? [...options, farmerData.subdistrict]
      : options;
  }, [farmerData.province, farmerData.district, farmerData.subdistrict]);

  const farmDistrictOptions = useMemo(() => {
    const province = farmData.farmProvince;
    if (!province || !addressHierarchy[province]) {
      return [] as string[];
    }
    const options = Object.keys(addressHierarchy[province]);
    return farmData.farmDistrict && !options.includes(farmData.farmDistrict)
      ? [...options, farmData.farmDistrict]
      : options;
  }, [farmData.farmProvince, farmData.farmDistrict]);

  const farmSubdistrictOptions = useMemo(() => {
    const province = farmData.farmProvince;
    const district = farmData.farmDistrict;
    if (!province || !district || !addressHierarchy[province]?.[district]) {
      return [] as string[];
    }
    const options = addressHierarchy[province][district];
    return farmData.farmSubdistrict && !options.includes(farmData.farmSubdistrict)
      ? [...options, farmData.farmSubdistrict]
      : options;
  }, [farmData.farmProvince, farmData.farmDistrict, farmData.farmSubdistrict]);

  const handleFarmerProvinceChange = (provinceValue: string) => {
    setFarmerData(prev => ({
      ...prev,
      province: provinceValue,
      district: '',
      subdistrict: ''
    }));
  };

  const handleFarmerDistrictChange = (districtValue: string) => {
    setFarmerData(prev => ({
      ...prev,
      district: districtValue,
      subdistrict: ''
    }));
  };

  const handleFarmProvinceChange = (provinceValue: string) => {
    setFarmData(prev => ({
      ...prev,
      farmProvince: provinceValue,
      farmDistrict: '',
      farmSubdistrict: ''
    }));
  };

  const handleFarmDistrictChange = (districtValue: string) => {
    setFarmData(prev => ({
      ...prev,
      farmDistrict: districtValue,
      farmSubdistrict: ''
    }));
  };

  const getMissingFarmerFields = () =>
    farmerRequiredFields
      .filter(field => {
        const value = farmerData[field.key];
        return typeof value === 'string' ? value.trim() === '' : !value;
      })
      .map(field => field.label);

  const getMissingFarmFields = () =>
    farmRequiredFields
      .filter(field => {
        const value = farmData[field.key];
        return typeof value === 'string' ? value.trim() === '' : !value;
      })
      .map(field => field.label);

  const isCoordinateValid = (value: string) => {
    if (value.trim() === '') {
      return false;
    }
    return !Number.isNaN(Number(value));
  };

  const buildApplicationPayload = (status: 'DRAFT' | 'SUBMITTED') => {
    const farmerPayload = Object.keys(farmerData).reduce<Record<string, string>>((acc, key) => {
      const typedKey = key as keyof FarmerData;
      acc[key] = String(farmerData[typedKey]).trim();
      return acc;
    }, {});

    const farmPayload = Object.keys(farmData).reduce<Record<string, string>>((acc, key) => {
      const typedKey = key as keyof FarmData;
      acc[key] = String(farmData[typedKey]).trim();
      return acc;
    }, {});

    return {
      farmer: farmerPayload,
      farm: farmPayload,
      applicantType: farmerData.applicantType,
      organizationName: farmerData.organizationName || undefined,
      registrationNumber: farmerData.registrationNumber || undefined,
      taxId: farmerData.taxId || undefined,
      receivingOffice: farmData.receivingOffice,
      status
    };
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const missingFarmer = getMissingFarmerFields();
      if (missingFarmer.length) {
        setError(`กรุณากรอกข้อมูลเกษตรกรให้ครบ: ${missingFarmer.join(', ')}`);
        return;
      }
    }

    if (activeStep === 1) {
      const missingFarm = getMissingFarmFields();
      if (missingFarm.length) {
        setError(`กรุณากรอกข้อมูลฟาร์มให้ครบ: ${missingFarm.join(', ')}`);
        return;
      }

      if (!isCoordinateValid(farmData.latitude) || !isCoordinateValid(farmData.longitude)) {
        setError('กรุณากรอกละติจูดและลองจิจูดเป็นตัวเลขที่ถูกต้อง');
        return;
      }

      if (
        !farmData.farmSize ||
        Number.isNaN(Number(farmData.farmSize)) ||
        Number(farmData.farmSize) <= 0
      ) {
        setError('กรุณากรอกขนาดพื้นที่มากกว่า 0');
        return;
      }

      // Create DRAFT application before proceeding to documents
      if (!applicationId) {
        try {
          setLoading(true);
          const token = localStorage.getItem('authToken');
          const payload = buildApplicationPayload('DRAFT');

          const response = await fetch('/api/farmer/application', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'ไม่สามารถสร้างคำขอได้');
          }

          const responseData = await response.json();
          if (!responseData?.success || !responseData?.data?._id) {
            throw new Error(responseData?.message || 'ไม่สามารถสร้างคำขอได้');
          }

          setApplicationId(responseData.data._id);
        } catch (err: any) {
          setError(err.message || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
    }

    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');

      // Validate consent data
      if (!consentData) {
        setError('กรุณายืนยันความยินยอมและลายเซ็นก่อนส่งคำขอ');
        setLoading(false);
        return;
      }

      if (!applicationId) {
        setError('ไม่พบหมายเลขคำขอ');
        setLoading(false);
        return;
      }

      // Step 1: Submit consent
      const consentResponse = await fetch(`/api/farmer/application/${applicationId}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          acceptedTerms: consentData.acceptedTerms,
          acceptedPrivacy: consentData.acceptedPrivacy,
          fullName: consentData.fullName,
          nationalId: consentData.nationalId,
          signatureType: consentData.signature.type,
          signatureValue: consentData.signature.value,
          version: '1.0'
        })
      });

      if (!consentResponse.ok) {
        const errorData = await consentResponse.json();
        throw new Error(errorData.message || 'ไม่สามารถบันทึกความยินยอมได้');
      }

      // Step 2: Submit application
      const submitResponse = await fetch(`/api/farmer/application/${applicationId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || 'ไม่สามารถส่งคำขอได้');
      }

      const responseData = await submitResponse.json();
      if (!responseData?.success) {
        throw new Error(responseData?.message || 'ไม่สามารถส่งคำขอได้');
      }

      setSuccess(responseData.message || 'ส่งคำขอสำเร็จ! กำลังเปลี่ยนหน้า...');

      setTimeout(() => {
        router.push(`/farmer/application/payment?id=${applicationId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทผู้ขอ"
                value={farmerData.applicantType}
                onChange={e =>
                  setFarmerData({
                    ...farmerData,
                    applicantType: e.target.value as FarmerData['applicantType']
                  })
                }
                helperText="เลือกประเภทผู้ยื่นขอรับรอง"
              >
                {applicantTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Conditional fields for non-individual applicants */}
            {farmerData.applicantType !== 'INDIVIDUAL' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={
                      farmerData.applicantType === 'COMMUNITY_ENTERPRISE'
                        ? 'ชื่อวิสาหกิจชุมชน'
                        : 'ชื่อนิติบุคคล'
                    }
                    value={farmerData.organizationName}
                    onChange={e =>
                      setFarmerData({ ...farmerData, organizationName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label={
                      farmerData.applicantType === 'COMMUNITY_ENTERPRISE'
                        ? 'เลขทะเบียนวิสาหกิจชุมชน (สวช.01)'
                        : 'เลขทะเบียนนิติบุคคล'
                    }
                    value={farmerData.registrationNumber}
                    onChange={e =>
                      setFarmerData({ ...farmerData, registrationNumber: e.target.value })
                    }
                  />
                </Grid>
                {farmerData.applicantType === 'LEGAL_ENTITY' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="เลขประจำตัวผู้เสียภาษี"
                      value={farmerData.taxId}
                      onChange={e => setFarmerData({ ...farmerData, taxId: e.target.value })}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={farmerData.applicantType === 'INDIVIDUAL' ? 'ชื่อ-นามสกุล' : 'ผู้ติดต่อ'}
                value={farmerData.fullName}
                onChange={e => setFarmerData({ ...farmerData, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เลขบัตรประชาชน"
                value={farmerData.nationalId}
                onChange={e => setFarmerData({ ...farmerData, nationalId: e.target.value })}
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="อีเมล"
                value={farmerData.email}
                onChange={e => setFarmerData({ ...farmerData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เบอร์โทรศัพท์"
                value={farmerData.phoneNumber}
                onChange={e => setFarmerData({ ...farmerData, phoneNumber: e.target.value })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="ที่อยู่"
                value={farmerData.address}
                onChange={e => setFarmerData({ ...farmerData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="จังหวัด"
                value={farmerData.province}
                onChange={e => handleFarmerProvinceChange(e.target.value)}
              >
                {provinces.map(province => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="อำเภอ/เขต"
                select={Boolean(farmerDistrictOptions.length)}
                value={farmerData.district}
                onChange={e =>
                  farmerDistrictOptions.length
                    ? handleFarmerDistrictChange(e.target.value)
                    : setFarmerData({ ...farmerData, district: e.target.value })
                }
                helperText={
                  farmerDistrictOptions.length
                    ? 'เลือกอำเภอ/เขตตามจังหวัดที่ระบุ'
                    : 'ระบุอำเภอ/เขตด้วยตนเอง'
                }
                SelectProps={farmerDistrictOptions.length ? { displayEmpty: true } : undefined}
              >
                {farmerDistrictOptions.length > 0 && (
                  <MenuItem value="">
                    <em>เลือกอำเภอ/เขต</em>
                  </MenuItem>
                )}
                {farmerDistrictOptions.map(district => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ตำบล/แขวง"
                select={Boolean(farmerSubdistrictOptions.length)}
                value={farmerData.subdistrict}
                onChange={e => setFarmerData({ ...farmerData, subdistrict: e.target.value })}
                helperText={
                  farmerSubdistrictOptions.length
                    ? 'เลือกตำบล/แขวงตามอำเภอที่เลือก'
                    : 'ระบุตำบล/แขวงด้วยตนเอง'
                }
                SelectProps={farmerSubdistrictOptions.length ? { displayEmpty: true } : undefined}
              >
                {farmerSubdistrictOptions.length > 0 && (
                  <MenuItem value="">
                    <em>เลือกตำบล/แขวง</em>
                  </MenuItem>
                )}
                {farmerSubdistrictOptions.map(subdistrict => (
                  <MenuItem key={subdistrict} value={subdistrict}>
                    {subdistrict}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="รหัสไปรษณีย์"
                value={farmerData.postalCode}
                onChange={e => setFarmerData({ ...farmerData, postalCode: e.target.value })}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="หน่วยงานรับคำขอ"
                value={farmData.receivingOffice}
                onChange={e =>
                  setFarmData({
                    ...farmData,
                    receivingOffice: e.target.value as FarmData['receivingOffice']
                  })
                }
                helperText="เลือกหน่วยงานที่จะยื่นคำขอ"
              >
                {receivingOffices.map(office => (
                  <MenuItem key={office.value} value={office.value}>
                    {office.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ชื่อฟาร์ม"
                value={farmData.farmName}
                onChange={e => setFarmData({ ...farmData, farmName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทการปลูก"
                value={farmData.cultivationType}
                onChange={e => setFarmData({ ...farmData, cultivationType: e.target.value })}
              >
                {cultivationTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="ที่อยู่ฟาร์ม"
                value={farmData.farmAddress}
                onChange={e => setFarmData({ ...farmData, farmAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="จังหวัด"
                value={farmData.farmProvince}
                onChange={e => handleFarmProvinceChange(e.target.value)}
              >
                {provinces.map(province => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="อำเภอ/เขต"
                select={Boolean(farmDistrictOptions.length)}
                value={farmData.farmDistrict}
                onChange={e =>
                  farmDistrictOptions.length
                    ? handleFarmDistrictChange(e.target.value)
                    : setFarmData({ ...farmData, farmDistrict: e.target.value })
                }
                helperText={
                  farmDistrictOptions.length
                    ? 'เลือกอำเภอ/เขตตามจังหวัดที่ระบุ'
                    : 'ระบุอำเภอ/เขตด้วยตนเอง'
                }
                SelectProps={farmDistrictOptions.length ? { displayEmpty: true } : undefined}
              >
                {farmDistrictOptions.length > 0 && (
                  <MenuItem value="">
                    <em>เลือกอำเภอ/เขต</em>
                  </MenuItem>
                )}
                {farmDistrictOptions.map(district => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ตำบล/แขวง"
                select={Boolean(farmSubdistrictOptions.length)}
                value={farmData.farmSubdistrict}
                onChange={e => setFarmData({ ...farmData, farmSubdistrict: e.target.value })}
                helperText={
                  farmSubdistrictOptions.length
                    ? 'เลือกตำบล/แขวงตามอำเภอที่เลือก'
                    : 'ระบุตำบล/แขวงด้วยตนเอง'
                }
                SelectProps={farmSubdistrictOptions.length ? { displayEmpty: true } : undefined}
              >
                {farmSubdistrictOptions.length > 0 && (
                  <MenuItem value="">
                    <em>เลือกตำบล/แขวง</em>
                  </MenuItem>
                )}
                {farmSubdistrictOptions.map(subdistrict => (
                  <MenuItem key={subdistrict} value={subdistrict}>
                    {subdistrict}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="รหัสไปรษณีย์"
                value={farmData.farmPostalCode}
                onChange={e => setFarmData({ ...farmData, farmPostalCode: e.target.value })}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="ขนาดพื้นที่"
                value={farmData.farmSize}
                onChange={e => setFarmData({ ...farmData, farmSize: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="ระบุพื้นที่เพาะปลูกรวม"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="หน่วยขนาดพื้นที่"
                value={farmData.farmSizeUnit}
                onChange={e => setFarmData({ ...farmData, farmSizeUnit: e.target.value })}
              >
                {farmSizeUnits.map(unit => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทพืช"
                value={farmData.cropType}
                onChange={e => setFarmData({ ...farmData, cropType: e.target.value })}
              >
                {cropTypes.map(crop => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ละติจูด (Latitude)"
                value={farmData.latitude}
                onChange={e => setFarmData({ ...farmData, latitude: e.target.value })}
                placeholder="เช่น 18.7883"
                helperText="กรอกค่าพิกัดเป็นตัวเลขทศนิยม"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ลองจิจูด (Longitude)"
                value={farmData.longitude}
                onChange={e => setFarmData({ ...farmData, longitude: e.target.value })}
                placeholder="เช่น 98.9853"
                helperText="กรอกค่าพิกัดเป็นตัวเลขทศนิยม"
              />
            </Grid>
          </Grid>
        );

      case 2:
        // Documents Upload Step
        return (
          <Box>
            {applicationId ? (
              <DocumentUploadSection
                applicationId={applicationId}
                applicantType={farmerData.applicantType}
              />
            ) : (
              <Alert severity="warning">กรุณารอสักครู่...</Alert>
            )}
          </Box>
        );

      case 3:
        // Consent and Signature Step
        return (
          <Box>
            <ConsentBlock
              fullName={farmerData.fullName}
              nationalId={farmerData.nationalId}
              onConsentComplete={data => {
                setConsentData(data);
              }}
            />
          </Box>
        );

      case 4:
        // Review Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ข้อมูลเกษตรกร
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ชื่อ-นามสกุล
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    เลขบัตรประชาชน
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.nationalId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    อีเมล
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.phoneNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    ที่อยู่
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.address} {farmerData.subdistrict} {farmerData.district}{' '}
                    {farmerData.province} {farmerData.postalCode}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ข้อมูลฟาร์ม
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ชื่อฟาร์ม
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ประเภทการปลูก
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {cultivationTypes.find(t => t.value === farmData.cultivationType)?.label}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    ที่อยู่ฟาร์ม
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmAddress} {farmData.farmSubdistrict} {farmData.farmDistrict}{' '}
                    {farmData.farmProvince} {farmData.farmPostalCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ขนาดพื้นที่
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmSize} {farmData.farmSizeUnit}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ประเภทพืช
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.cropType}
                  </Typography>
                </Grid>
                {farmData.latitude && farmData.longitude && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      พิกัด GPS
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {farmData.latitude}, {farmData.longitude}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>สร้างคำขอรับรอง GACP | ระบบเกษตรกร</title>
      </Head>

      <FarmerLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}
          >
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/farmer/dashboard')}
            >
              กลับสู่แดชบอร์ด
            </Button>
            <Typography variant="h4" fontWeight={700}>
              สร้างคำขอรับรอง GACP
            </Typography>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: { sm: 1 } }}
                  variant="outlined"
                >
                  ย้อนกลับ
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{ bgcolor: '#2e7d32' }}
                    >
                      {loading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#2e7d32' }}>
                      ถัดไป
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </FarmerLayout>
    </>
  );
}
