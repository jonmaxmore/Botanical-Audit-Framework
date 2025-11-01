const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Application = require('../models/Application');
const { authenticate, authorize } = require('../middleware/auth');
const { handleAsync } = require('../middleware/error-handler');
const { createLogger } = require('../shared/logger');
const { generatePromptPayQR, generatePaymentReference } = require('../utils/promptpay-qr');

const logger = createLogger('farmer-application-route');
const router = express.Router();

const FARMER_ALLOWED_ROLES = ['farmer'];

const REQUIRED_DOCUMENT_TYPES = [
  'application_form',
  'farm_management_plan',
  'cultivation_records',
  'land_rights_certificate'
];

// Required documents by applicant type
const REQUIRED_DOCUMENTS_BY_TYPE = {
  INDIVIDUAL: [
    ...REQUIRED_DOCUMENT_TYPES,
    'identification_document', // สำเนาบัตรประชาชน
    'cooperation_agreement' // หนังสือความร่วมมือกับผู้รับอนุญาตผลิตยา
  ],
  COMMUNITY_ENTERPRISE: [
    ...REQUIRED_DOCUMENT_TYPES,
    'community_enterprise_certificate', // หนังสือรับรองการจดทะเบียนวิสาหกิจชุมชน (สวช.01)
    'member_list', // บัญชีรายชื่อสมาชิก
    'representative_id' // สำเนาบัตรประชาชนผู้แทน
  ],
  LEGAL_ENTITY: [
    ...REQUIRED_DOCUMENT_TYPES,
    'company_certificate', // หนังสือรับรองการจดทะเบียนนิติบุคคล
    'board_member_list', // บัญชีรายชื่อกรรมการ
    'representative_authorization' // หนังสือมอบอำนาจ (ถ้ามี)
  ]
};

const ALLOWED_DOCUMENT_TYPES = new Set([
  ...REQUIRED_DOCUMENT_TYPES,
  'identification_document',
  'cooperation_agreement',
  'community_enterprise_certificate',
  'member_list',
  'representative_id',
  'company_certificate',
  'board_member_list',
  'representative_authorization',
  'water_quality_report',
  'soil_quality_report',
  'organic_certificate',
  'training_certificate',
  'payment_proof',
  'farm_photos',
  'farm_map',
  'security_plan',
  'other'
]);

const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const MAX_DOCUMENT_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

const DOCUMENT_STORAGE_DIR = path.resolve(__dirname, '..', 'storage', 'documents');
let isDocumentStorageReady = false;

function ensureDocumentStorageDir() {
  if (isDocumentStorageReady) {
    return;
  }

  fs.mkdirSync(DOCUMENT_STORAGE_DIR, { recursive: true });
  isDocumentStorageReady = true;
}

function normalizeDocumentType(rawValue) {
  const stringValue = rawValue ? String(rawValue) : '';
  const normalized = stringValue.trim().toLowerCase();

  if (ALLOWED_DOCUMENT_TYPES.has(normalized)) {
    return normalized;
  }

  return 'other';
}

function getRequiredDocumentsForApplicantType(applicantType) {
  const normalizedType = String(applicantType || 'INDIVIDUAL').toUpperCase();
  return REQUIRED_DOCUMENTS_BY_TYPE[normalizedType] || REQUIRED_DOCUMENTS_BY_TYPE.INDIVIDUAL;
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureDocumentStorageDir();
      cb(null, DOCUMENT_STORAGE_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension).replace(/[^a-z0-9_-]/gi, '');
    const safeBase = baseName || 'document';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${extension}`);
  }
});

const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: MAX_DOCUMENT_UPLOAD_SIZE, files: 10 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
      cb(null, true);
      return;
    }

    cb(new Error('รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG เท่านั้น'));
  }
});

const cropTypeMap = new Map([
  ['ขมิ้น', 'turmeric'],
  ['ขมิ้นชัน', 'turmeric'],
  ['turmeric', 'turmeric'],
  ['ginger', 'ginger'],
  ['ขิง', 'ginger'],
  ['holy basil', 'holy_basil'],
  ['กระเพรา', 'holy_basil'],
  ['กะเพรา', 'holy_basil'],
  ['galangal', 'galangal'],
  ['ข่า', 'galangal'],
  ['lemongrass', 'lemongrass'],
  ['ตะไคร้', 'lemongrass'],
  ['kaffir lime', 'kaffir_lime'],
  ['มะกรูด', 'kaffir_lime'],
  ['pandan', 'pandan'],
  ['ใบเตย', 'pandan'],
  ['andrographis', 'andrographis'],
  ['ฟ้าทะลายโจร', 'andrographis'],
  ['centella', 'centella'],
  ['ใบบัวบก', 'centella'],
  ['บัวบก', 'centella'],
  ['butterfly pea', 'butterfly_pea'],
  ['อัญชัน', 'butterfly_pea']
]);

function safeObjectId(value) {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
}

function ensureNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function convertAreaToRai(totalArea, unit) {
  const numeric = ensureNumber(totalArea);
  if (numeric === null) {
    return null;
  }

  const normalizedUnit = String(unit || '').toLowerCase();
  switch (normalizedUnit) {
    case 'งาน':
    case 'ngan':
      return numeric / 4;
    case 'ตารางเมตร':
    case 'square_meter':
    case 'sqm':
      return numeric / 1600;
    case 'hectare':
    case 'ha':
      return numeric * 6.25;
    case 'ไร่':
    case 'rai':
    default:
      return numeric;
  }
}

function mapCropTypeFromForm(label) {
  if (!label) {
    return { cropType: 'other', variety: undefined };
  }

  const normalized = String(label).trim().toLowerCase();
  for (const [key, value] of cropTypeMap.entries()) {
    if (normalized.includes(key)) {
      return {
        cropType: value,
        variety: value === 'other' ? label : label
      };
    }
  }

  return {
    cropType: 'other',
    variety: label
  };
}

function mapPlantingMethod(cultivationType) {
  const normalized = String(cultivationType || '').toUpperCase();
  if (normalized === 'INDOOR' || normalized === 'GREENHOUSE') {
    return 'seedlings';
  }
  if (normalized === 'OUTDOOR') {
    return 'seeds';
  }
  return 'other';
}

function normalizePostalCode(value) {
  const str = String(value || '').trim();
  if (!str) {
    return null;
  }
  if (/^[0-9]{5}$/.test(str)) {
    return str;
  }
  const numericOnly = str.replace(/[^0-9]/g, '');
  const padded = numericOnly.padStart(5, '0').slice(0, 5);
  return padded || null;
}

function buildApplicationResponse(applicationDoc, rawId) {
  const applicantInfo = buildApplicantInfo(applicationDoc, applicationDoc.applicant || {});
  const farmInfo = buildFarmInfo(applicationDoc);
  const attachments = buildAttachments(applicationDoc.documents);

  if (!farmInfo.landOwnerName && applicantInfo.fullName) {
    farmInfo.landOwnerName = applicantInfo.fullName;
  }

  return {
    id: applicationDoc._id ? String(applicationDoc._id) : rawId,
    applicationNumber: applicationDoc.applicationNumber,
    status: applicationDoc.currentStatus || 'draft',
    submittedAt: applicationDoc.submissionDate
      ? new Date(applicationDoc.submissionDate).toISOString()
      : applicationDoc.createdAt
        ? new Date(applicationDoc.createdAt).toISOString()
        : undefined,
    updatedAt: applicationDoc.updatedAt
      ? new Date(applicationDoc.updatedAt).toISOString()
      : undefined,
    applicant: applicantInfo,
    farm: farmInfo,
    attachments,
    consent: applicationDoc.consent || null
  };
}

function mapApplicantType(userDoc) {
  const rawType =
    userDoc?.farmerType ||
    userDoc?.organizationType ||
    userDoc?.metadata?.farmerType ||
    'individual';

  const normalized = String(rawType).toLowerCase();

  if (['cooperative', 'community_enterprise', 'farmer_group'].includes(normalized)) {
    return 'COMMUNITY_ENTERPRISE';
  }

  if (['company', 'juristic_person', 'enterprise', 'legal_entity'].includes(normalized)) {
    return 'LEGAL_ENTITY';
  }

  return 'INDIVIDUAL';
}

function resolveAddressString(addressValue, fallback) {
  if (!addressValue) {
    return fallback;
  }

  if (typeof addressValue === 'string') {
    return addressValue;
  }

  const parts = [
    addressValue.houseNumber,
    addressValue.street,
    addressValue.village,
    addressValue.addressLine1,
    addressValue.addressLine2
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return fallback;
}

function resolveAdministrativeField(addressValue, field, fallback) {
  if (!addressValue) {
    return fallback;
  }

  if (typeof addressValue === 'object' && addressValue[field]) {
    return addressValue[field];
  }

  return fallback;
}

function convertAreaToSqMeters(areaValue, unit = 'rai') {
  if (typeof areaValue !== 'number' || Number.isNaN(areaValue)) {
    return null;
  }

  switch (unit) {
    case 'rai':
      return areaValue * 1600;
    case 'hectare':
      return areaValue * 10000;
    case 'sqm':
    default:
      return areaValue;
  }
}

function mapLandStatus(type) {
  const normalized = String(type || '').toLowerCase();

  if (normalized === 'owned') {
    return 'OWNER';
  }

  if (normalized === 'rented') {
    return 'RENTED';
  }

  if (normalized === 'cooperative' || normalized === 'contract') {
    return 'AUTHORIZED_USE';
  }

  return undefined;
}

function mapFarmType(cropDoc) {
  const method = String(cropDoc?.cultivationMethod || '').toLowerCase();

  if (!method) {
    return 'OTHER';
  }

  if (method.includes('greenhouse')) {
    return 'GREENHOUSE';
  }

  if (['indoor', 'hydroponic', 'aeroponic'].some(keyword => method.includes(keyword))) {
    return 'INDOOR';
  }

  if (['outdoor', 'soil', 'field'].some(keyword => method.includes(keyword))) {
    return 'OUTDOOR';
  }

  return 'OTHER';
}

function mapPurpose(applicationDoc) {
  const intent = applicationDoc?.marketIntent || applicationDoc?.purpose;

  if (!intent) {
    return 'OTHER';
  }

  const normalized = String(intent).toLowerCase();

  if (normalized.includes('medical')) {
    return 'MEDICAL_USE';
  }

  if (normalized.includes('export')) {
    return 'EXPORT';
  }

  return 'OTHER';
}

function mapHarvestRounds(productionCycle) {
  const normalized = String(productionCycle || '').toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized === 'annual') {
    return 1;
  }

  if (normalized === 'biennial') {
    return 0.5;
  }

  if (normalized === 'perennial') {
    return 2;
  }

  return undefined;
}

function resolveAuthUserId(user) {
  return (
    user?.userId || user?.id || user?._id || user?.sub || user?.subject || user?.subjectId || null
  );
}

function buildAttachments(documents = []) {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents.map((document, index) => ({
    id: document?._id ? String(document._id) : `doc-${index}`,
    category: document?.documentType || 'general',
    documentType: document?.documentType || 'general',
    fileName:
      document?.fileName || document?.storageFileName || document?.documentType || 'attachment',
    storageFileName: document?.storageFileName,
    fileUrl: (document?.storagePath || document?.path || '').replace(/\\/g, '/'),
    mimeType: document?.mimeType,
    fileSize: document?.fileSize,
    verificationStatus: document?.verificationStatus || 'pending',
    uploadedAt: document?.uploadDate ? new Date(document.uploadDate).toISOString() : undefined
  }));
}

function buildApplicantInfo(applicationDoc, applicantDoc) {
  const farmLocation = applicationDoc?.farmInformation?.location || {};
  const applicantAddress = applicantDoc?.address;

  return {
    applicantType: mapApplicantType(applicantDoc),
    fullName:
      applicantDoc?.fullName ||
      [applicantDoc?.firstName, applicantDoc?.lastName].filter(Boolean).join(' ') ||
      undefined,
    organizationName: applicantDoc?.organizationName || undefined,
    registrationNumber: applicantDoc?.registrationNumber || applicantDoc?.taxId || undefined,
    idCardNumber: applicantDoc?.nationalId || applicantDoc?.citizenId || undefined,
    address: resolveAddressString(applicantAddress, farmLocation.address || '-'),
    subDistrict: resolveAdministrativeField(
      applicantAddress,
      'subDistrict',
      farmLocation.subDistrict
    ),
    district: resolveAdministrativeField(applicantAddress, 'district', farmLocation.district),
    province: resolveAdministrativeField(
      applicantAddress,
      'province',
      farmLocation.province || '-'
    ),
    postalCode: resolveAdministrativeField(applicantAddress, 'postalCode', farmLocation.postalCode),
    phone: applicantDoc?.phone || applicantDoc?.phoneNumber || '-',
    email: applicantDoc?.email || undefined,
    lineId: applicantDoc?.lineId || undefined
  };
}

function buildFarmInfo(applicationDoc) {
  const farm = applicationDoc?.farmInformation || {};
  const farmLocation = farm.location || {};
  const crop = Array.isArray(applicationDoc?.cropInformation)
    ? applicationDoc.cropInformation[0]
    : undefined;

  const coordinates = farmLocation.coordinates || {};
  const farmArea = convertAreaToSqMeters(farm.farmSize?.totalArea, farm.farmSize?.unit);

  return {
    farmName: farm.farmName || '-',
    purpose: mapPurpose(applicationDoc),
    farmType: mapFarmType(crop),
    farmAddress: farmLocation.address || '-',
    subDistrict: farmLocation.subDistrict,
    district: farmLocation.district,
    province: farmLocation.province || '-',
    postalCode: farmLocation.postalCode,
    gpsLatitude: coordinates.latitude ?? coordinates.lat ?? undefined,
    gpsLongitude: coordinates.longitude ?? coordinates.lng ?? undefined,
    landDocumentType: farm.landOwnership?.type || undefined,
    landDocumentNumber: farm.landOwnership?.landRightsCertificate || undefined,
    landStatus: mapLandStatus(farm.landOwnership?.type),
    landOwnerName: farm.landOwnership?.ownerName || undefined,
    farmAreaSqM: farmArea !== null ? farmArea : undefined,
    plantVariety: crop?.variety || undefined,
    plantPart: crop?.plantPart || undefined,
    plantSource: crop?.plantingMethod || undefined,
    plantQuantity: crop?.expectedYield || undefined,
    harvestRoundsPerYear: mapHarvestRounds(crop?.productionCycle)
  };
}

router.get(
  '/:applicationId',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  handleAsync(async (req, res) => {
    const rawId = String(req.params.applicationId || '').trim();

    if (!rawId) {
      return res.status(400).json({
        message: 'Application identifier is required'
      });
    }

    const query = mongoose.Types.ObjectId.isValid(rawId)
      ? { _id: rawId }
      : { applicationNumber: rawId.toUpperCase() };

    const application = await Application.findOne(query).populate('applicant').lean();

    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    const applicantId =
      application.applicant?._id?.toString() ||
      (typeof application.applicant === 'string' ? application.applicant : null);

    const authRole = String(req.user?.role || '').toUpperCase();
    const authUserId =
      req.user?.userId || req.user?.id || req.user?._id || req.user?.sub || req.user?.subject;

    if (authRole === 'FARMER' && applicantId && authUserId && applicantId !== String(authUserId)) {
      logger.warn('Attempt to access another farmer application blocked', {
        applicantId,
        authUserId,
        applicationNumber: application.applicationNumber
      });

      return res.status(403).json({
        message: 'Access to this application is not permitted'
      });
    }

    const applicantInfo = buildApplicantInfo(application, application.applicant || {});
    const farmInfo = buildFarmInfo(application);
    const attachments = buildAttachments(application.documents);

    if (!farmInfo.landOwnerName && applicantInfo.fullName) {
      farmInfo.landOwnerName = applicantInfo.fullName;
    }

    const responsePayload = {
      id: application._id ? String(application._id) : rawId,
      applicationNumber: application.applicationNumber,
      status: application.currentStatus || 'draft',
      submittedAt: application.submissionDate
        ? new Date(application.submissionDate).toISOString()
        : application.createdAt
          ? new Date(application.createdAt).toISOString()
          : undefined,
      updatedAt: application.updatedAt ? new Date(application.updatedAt).toISOString() : undefined,
      applicant: applicantInfo,
      farm: farmInfo,
      attachments,
      consent: application.consent || null
    };

    return res.status(200).json(responsePayload);
  })
);

router.post(
  '/',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  handleAsync(async (req, res) => {
    const farmerIdRaw =
      req.user?.userId || req.user?.id || req.user?._id || req.user?.sub || req.user?.subject;
    const farmerId = safeObjectId(farmerIdRaw);

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer identifier'
      });
    }

    const farmerProfile = req.body?.farmer || {};
    const farmPayload = req.body?.farm || {};

    const requiredFarmerFields = ['fullName', 'nationalId', 'email', 'phoneNumber'];
    const missingFarmer = requiredFarmerFields.filter(field => {
      const value = farmerProfile[field];
      return typeof value !== 'string' || !value.trim();
    });

    const requiredFarmFields = [
      'farmName',
      'farmAddress',
      'farmProvince',
      'farmDistrict',
      'farmSubdistrict',
      'farmPostalCode',
      'farmSize',
      'farmSizeUnit',
      'cultivationType',
      'cropType',
      'latitude',
      'longitude'
    ];

    const missingFarm = requiredFarmFields.filter(field => {
      const value = farmPayload[field];
      return typeof value !== 'string' || !value.trim();
    });

    if (missingFarmer.length || missingFarm.length) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ครบถ้วน',
        details: {
          farmer: missingFarmer,
          farm: missingFarm
        }
      });
    }

    const latitude = ensureNumber(farmPayload.latitude);
    const longitude = ensureNumber(farmPayload.longitude);

    if (latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกพิกัดฟาร์มให้ถูกต้อง'
      });
    }

    const postalCode = normalizePostalCode(farmPayload.farmPostalCode);
    if (!postalCode) {
      return res.status(400).json({
        success: false,
        message: 'รหัสไปรษณีย์ไม่ถูกต้อง'
      });
    }

    const totalAreaRai = convertAreaToRai(farmPayload.farmSize, farmPayload.farmSizeUnit);
    if (totalAreaRai === null || totalAreaRai <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ขนาดพื้นที่ต้องมากกว่า 0'
      });
    }

    const { cropType, variety } = mapCropTypeFromForm(farmPayload.cropType);

    // Extract applicantType and receivingOffice from payload
    const applicantType = String(req.body?.applicantType || 'INDIVIDUAL').toUpperCase();
    const validApplicantTypes = ['INDIVIDUAL', 'COMMUNITY_ENTERPRISE', 'LEGAL_ENTITY'];

    if (!validApplicantTypes.includes(applicantType)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทผู้ขอไม่ถูกต้อง'
      });
    }

    const receivingOffice = String(
      req.body?.receivingOffice || 'DEPARTMENT_THAI_TRADITIONAL_MEDICINE'
    ).toUpperCase();
    const validReceivingOffices = [
      'DEPARTMENT_THAI_TRADITIONAL_MEDICINE',
      'PROVINCIAL_HEALTH_OFFICE'
    ];

    if (!validReceivingOffices.includes(receivingOffice)) {
      return res.status(400).json({
        success: false,
        message: 'หน่วยงานรับคำขอไม่ถูกต้อง'
      });
    }

    // Organization info for non-individual applicants
    const organizationInfo = {};
    if (applicantType !== 'INDIVIDUAL') {
      organizationInfo.organizationName = req.body?.organizationName || null;
      organizationInfo.registrationNumber = req.body?.registrationNumber || null;
      organizationInfo.taxId = req.body?.taxId || null;
    }

    const receivingOfficeDetails = {};
    if (receivingOffice === 'PROVINCIAL_HEALTH_OFFICE') {
      receivingOfficeDetails.provinceName = farmPayload.farmProvince;
    }

    const farmInformation = {
      farmName: farmPayload.farmName,
      location: {
        address: farmPayload.farmAddress,
        province: farmPayload.farmProvince,
        district: farmPayload.farmDistrict || 'ไม่ระบุ',
        subDistrict: farmPayload.farmSubdistrict || 'ไม่ระบุ',
        postalCode,
        coordinates: {
          latitude,
          longitude
        }
      },
      farmSize: {
        totalArea: Number(totalAreaRai.toFixed(4)),
        cultivatedArea: Number(totalAreaRai.toFixed(4)),
        unit: 'rai'
      },
      landOwnership: {
        type: 'owned',
        documents: [],
        landRightsCertificate: null
      },
      waterSource: {
        primary: 'rainwater',
        quality: 'unknown',
        testResults: []
      },
      soilType: {
        type: 'mixed',
        ph: undefined,
        organicMatter: undefined,
        testResults: []
      }
    };

    const cropInformation = [
      {
        cropType,
        variety,
        plantingArea: Number(totalAreaRai.toFixed(4)),
        plantingMethod: mapPlantingMethod(farmPayload.cultivationType),
        productionCycle: 'annual'
      }
    ];

    const application = new Application({
      applicant: farmerId,
      applicantType,
      organizationInfo,
      receivingOffice,
      receivingOfficeDetails,
      farmInformation,
      cropInformation,
      documents: [],
      currentStatus: 'draft',
      statusHistory: [
        {
          status: 'draft',
          changedBy: farmerId,
          changedAt: new Date(),
          reason: 'Application created by farmer',
          systemGenerated: true
        }
      ]
    });

    application.assessRisk();

    await application.save();

    const desiredStatus = String(req.body?.status || 'draft').toLowerCase();
    if (desiredStatus === 'submitted') {
      application.currentStatus = 'submitted';
      application.submissionDate = new Date();
      application.statusHistory.push({
        status: 'submitted',
        changedBy: farmerId,
        changedAt: new Date(),
        reason: 'Farmer submitted application',
        systemGenerated: false
      });
      await application.save();
    }

    const populatedApplication = await Application.findById(application._id)
      .populate('applicant')
      .lean();

    if (!populatedApplication) {
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถสร้างคำขอได้'
      });
    }

    const responsePayload = buildApplicationResponse(populatedApplication, application._id);

    res.status(201).json({
      success: true,
      message: desiredStatus === 'submitted' ? 'ส่งคำขอสำเร็จ' : 'บันทึกแบบร่างคำขอสำเร็จ',
      data: responsePayload
    });
  })
);

router.post(
  '/:applicationId/documents',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  uploadDocuments.array('documents', 10),
  handleAsync(async (req, res) => {
    const farmerIdRaw = resolveAuthUserId(req.user);
    const farmerObjectId = safeObjectId(farmerIdRaw);

    if (!farmerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลเกษตรกร'
      });
    }

    const applicationId = String(req.params.applicationId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขคำขอไม่ถูกต้อง'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอ'
      });
    }

    if (String(application.applicant) !== String(farmerObjectId)) {
      logger.warn('Attempt to upload documents for another farmer application blocked', {
        applicationId,
        farmerId: farmerIdRaw
      });

      return res.status(403).json({
        success: false,
        message: 'คุณไม่สามารถอัปโหลดเอกสารให้คำขอนี้ได้'
      });
    }

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    if (!uploadedFiles.length) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์เอกสารเพื่ออัปโหลด'
      });
    }

    let documentTypesInput = req.body?.documentTypes ?? [];
    if (!Array.isArray(documentTypesInput)) {
      documentTypesInput = [documentTypesInput];
    }

    let descriptionsInput = req.body?.descriptions ?? [];
    if (!Array.isArray(descriptionsInput)) {
      descriptionsInput = [descriptionsInput];
    }

    const now = new Date();
    const documentsToPersist = uploadedFiles.map((file, index) => {
      const normalizedType = normalizeDocumentType(documentTypesInput[index]);
      const description = descriptionsInput[index]
        ? String(descriptionsInput[index]).trim() || undefined
        : undefined;

      const storageRelativePath = path
        .join('storage', 'documents', file.filename)
        .replace(/\\/g, '/');

      return {
        documentType: normalizedType,
        fileName: file.originalname,
        storageFileName: file.filename,
        storagePath: storageRelativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadDate: now,
        verificationStatus: 'pending',
        uploadedBy: farmerObjectId,
        description
      };
    });

    application.documents.push(...documentsToPersist);
    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('applicant')
      .lean();

    const attachments = buildAttachments(updatedApplication?.documents || []);
    const uploadedTypes = new Set(
      (updatedApplication?.documents || []).map(doc => doc.documentType || 'other')
    );

    // Get required documents based on applicant type
    const applicantType = updatedApplication?.applicantType || 'INDIVIDUAL';
    const requiredDocs = getRequiredDocumentsForApplicantType(applicantType);
    const missingDocuments = requiredDocs.filter(type => !uploadedTypes.has(type));

    logger.info('Farmer uploaded application documents', {
      applicationId,
      farmerId: farmerIdRaw,
      applicantType,
      uploadedCount: uploadedFiles.length,
      missingCount: missingDocuments.length
    });

    return res.status(201).json({
      success: true,
      message: 'อัปโหลดเอกสารสำเร็จ',
      data: {
        attachments,
        requiredDocuments: requiredDocs,
        missingDocuments,
        isComplete: missingDocuments.length === 0
      }
    });
  })
);

router.post(
  '/:applicationId/consent',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  handleAsync(async (req, res) => {
    const farmerIdRaw = resolveAuthUserId(req.user);
    const farmerObjectId = safeObjectId(farmerIdRaw);

    if (!farmerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลเกษตรกร'
      });
    }

    const applicationId = String(req.params.applicationId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขคำขอไม่ถูกต้อง'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอ'
      });
    }

    if (String(application.applicant) !== String(farmerObjectId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่สามารถยืนยันคำยินยอมแทนผู้อื่นได้'
      });
    }

    const {
      acceptedTerms,
      acceptedPrivacy,
      fullName,
      nationalId,
      signatureType,
      signatureValue,
      version
    } = req.body || {};

    if (!acceptedTerms || !acceptedPrivacy) {
      return res.status(400).json({
        success: false,
        message: 'กรุณายืนยันการยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว'
      });
    }

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อ-นามสกุลสำหรับการยืนยัน'
      });
    }

    if (!nationalId || !String(nationalId).trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเลขบัตรประชาชนสำหรับการยืนยัน'
      });
    }

    const consentPayload = {
      acceptedTerms: Boolean(acceptedTerms),
      acceptedPrivacy: Boolean(acceptedPrivacy),
      fullName: String(fullName).trim(),
      nationalId: String(nationalId).trim(),
      signedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
      version: version ? String(version) : '1.0'
    };

    if (signatureValue) {
      consentPayload.signature = {
        type: signatureType === 'drawn' ? 'drawn' : 'typed',
        value: String(signatureValue)
      };
    }

    application.consent = consentPayload;
    await application.save();

    logger.info('Farmer submitted consent for application', {
      applicationId,
      farmerId: farmerIdRaw
    });

    return res.status(200).json({
      success: true,
      message: 'บันทึกการให้ความยินยอมเรียบร้อยแล้ว'
    });
  })
);

// GET /:applicationId/payment - Get payment information
router.get(
  '/:applicationId/payment',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  handleAsync(async (req, res) => {
    const farmerIdRaw = resolveAuthUserId(req.user);
    const farmerObjectId = safeObjectId(farmerIdRaw);

    if (!farmerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลเกษตรกร'
      });
    }

    const applicationId = String(req.params.applicationId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขคำขอไม่ถูกต้อง'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอ'
      });
    }

    if (String(application.applicant) !== String(farmerObjectId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่สามารถดูข้อมูลการชำระเงินของผู้อื่นได้'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        payment: application.payment || {},
        currentStatus: application.currentStatus
      }
    });
  })
);

// POST /:applicationId/payment/slip - Upload payment slip
router.post(
  '/:applicationId/payment/slip',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  uploadDocuments.single('slip'),
  handleAsync(async (req, res) => {
    const farmerIdRaw = resolveAuthUserId(req.user);
    const farmerObjectId = safeObjectId(farmerIdRaw);

    if (!farmerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลเกษตรกร'
      });
    }

    const applicationId = String(req.params.applicationId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขคำขอไม่ถูกต้อง'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอ'
      });
    }

    if (String(application.applicant) !== String(farmerObjectId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่สามารถอัปโหลดสลิปให้ผู้อื่นได้'
      });
    }

    if (application.currentStatus !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'คำขอนี้ไม่อยู่ในสถานะรอชำระเงิน'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัปโหลดสลิปการโอนเงิน'
      });
    }

    const slipUrl = `/storage/documents/${req.file.filename}`;

    application.payment = application.payment || {};
    application.payment.slipUrl = slipUrl;
    application.payment.paidAt = new Date();
    application.payment.status = 'paid';

    await application.save();

    logger.info('Farmer uploaded payment slip', {
      applicationId,
      farmerId: farmerIdRaw
    });

    return res.status(200).json({
      success: true,
      message: 'อัปโหลดสลิปการโอนเงินสำเร็จ',
      data: {
        slipUrl,
        payment: application.payment
      }
    });
  })
);

router.post(
  '/:applicationId/submit',
  authenticate,
  authorize(FARMER_ALLOWED_ROLES),
  handleAsync(async (req, res) => {
    const farmerIdRaw = resolveAuthUserId(req.user);
    const farmerObjectId = safeObjectId(farmerIdRaw);

    if (!farmerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลเกษตรกร'
      });
    }

    const applicationId = String(req.params.applicationId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขคำขอไม่ถูกต้อง'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอ'
      });
    }

    if (String(application.applicant) !== String(farmerObjectId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่สามารถส่งคำขอแทนผู้อื่นได้'
      });
    }

    if (application.currentStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'คำขอนี้ไม่อยู่ในสถานะที่สามารถส่งได้'
      });
    }

    if (!application.consent?.acceptedTerms || !application.consent?.acceptedPrivacy) {
      return res.status(400).json({
        success: false,
        message: 'กรุณายืนยันการให้ความยินยอมก่อนส่งคำขอ'
      });
    }

    const submittedDocumentTypes = new Set(
      application.documents
        .filter(doc => doc.verificationStatus !== 'rejected')
        .map(doc => doc.documentType)
    );
    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter(
      type => !submittedDocumentTypes.has(type)
    );

    if (missingDocuments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัปโหลดเอกสารให้ครบถ้วนก่อนส่งคำขอ',
        details: { missingDocuments }
      });
    }

    application.currentStatus = 'pending_payment';
    application.submissionDate = new Date();

    // Generate PromptPay QR Code
    const paymentReference = generatePaymentReference(application.applicationNumber);

    try {
      // ใช้เลขบัตรประชาชนหรือเบอร์โทรของหน่วยงานรับเรื่อง
      // ในที่นี้ใช้เบอร์โทรตัวอย่าง (ควรเก็บไว้ใน config)
      const promptPayId = '0812345678'; // เปลี่ยนเป็นเบอร์จริงของหน่วยงาน

      const qrCodeDataUrl = await generatePromptPayQR({
        identifier: promptPayId,
        amount: 5000,
        format: 'data_url'
      });

      // Initialize payment information
      application.payment = {
        amount: 5000, // ค่าธรรมเนียมการตรวจรับรอง
        currency: 'THB',
        status: 'pending',
        method: 'qr_code',
        referenceNumber: paymentReference,
        qrCodeUrl: qrCodeDataUrl // Data URL ของ QR code
      };
    } catch (qrError) {
      logger.error('Failed to generate QR code:', qrError);
      // Fallback: ใช้ placeholder
      application.payment = {
        amount: 5000,
        currency: 'THB',
        status: 'pending',
        method: 'qr_code',
        referenceNumber: paymentReference,
        qrCodeUrl: '/images/payment-qr-placeholder.png'
      };
    }

    application.statusHistory.push({
      status: 'submitted',
      changedBy: farmerObjectId,
      changedAt: new Date(),
      reason: 'Farmer submitted application',
      systemGenerated: false
    });

    application.statusHistory.push({
      status: 'pending_payment',
      changedBy: farmerObjectId,
      changedAt: new Date(),
      reason: 'Waiting for payment',
      systemGenerated: true
    });

    await application.save();

    const hydratedApplication = await Application.findById(application._id)
      .populate('applicant')
      .lean();

    logger.info('Farmer submitted application, pending payment', {
      applicationId,
      farmerId: farmerIdRaw,
      paymentAmount: application.payment.amount
    });

    return res.status(200).json({
      success: true,
      message: 'ส่งคำขอสําเร็จ กรุณาชำระเงินเพื่อดำเนินการต่อ',
      data: {
        application: buildApplicationResponse(hydratedApplication, application._id),
        payment: application.payment
      }
    });
  })
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'ไฟล์มีขนาดใหญ่เกินกำหนด (สูงสุด 10MB)'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
    });
  }

  if (error && error.message === 'รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG เท่านั้น') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return next(error);
});

module.exports = router;
