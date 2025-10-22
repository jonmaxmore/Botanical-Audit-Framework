/**
 * 🎭 Mock Backend API Server
 * =========================
 * Production-quality Mock API with realistic workflow logic
 * 
 * Features:
 * - Express server on port 3004
 * - In-memory database with relationships
 * - JWT authentication
 * - GACP 8-step workflow state machine
 * - Realistic mock data
 * - Complete CRUD operations
 * 
 * Usage:
 *   node mock-backend/server.js
 * 
 * Endpoints:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   GET    /api/applications
 *   POST   /api/applications
 *   GET    /api/applications/:id
 *   PUT    /api/applications/:id
 *   POST   /api/applications/:id/review
 *   POST   /api/applications/:id/inspection/vdo-call
 *   POST   /api/applications/:id/inspection/on-site
 *   POST   /api/applications/:id/approve
 *   GET    /api/certificates
 *   GET    /api/users
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3004;
const JWT_SECRET = 'gacp_mock_secret_2025';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// 💾 IN-MEMORY DATABASE
// ============================================================================

const database = {
  users: [],
  applications: [],
  documents: [],
  inspections: [],
  certificates: [],
  payments: [],
};

// ============================================================================
// 🔐 AUTHENTICATION MIDDLEWARE
// ============================================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================================================
// 🎯 GACP WORKFLOW STATE MACHINE
// ============================================================================

const WORKFLOW_STATES = {
  // Step 1-2: Farmer
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  
  // Step 3: Officer Review
  DOCUMENT_REVIEW: 'DOCUMENT_REVIEW',
  DOCUMENT_APPROVED: 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  DOCUMENT_REVISION: 'DOCUMENT_REVISION',
  
  // Step 4: System Auto-approval
  AUTO_APPROVED: 'AUTO_APPROVED',
  
  // Step 5: Farmer Payment 2
  INSPECTION_PAYMENT_PENDING: 'INSPECTION_PAYMENT_PENDING',
  
  // Step 6: Inspector
  INSPECTION_SCHEDULED: 'INSPECTION_SCHEDULED',
  VDO_CALL_COMPLETED: 'VDO_CALL_COMPLETED',
  ON_SITE_REQUIRED: 'ON_SITE_REQUIRED',
  ON_SITE_COMPLETED: 'ON_SITE_COMPLETED',
  
  // Step 7: Admin
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  
  // Step 8: Certificate
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
};

const WORKFLOW_TRANSITIONS = {
  [WORKFLOW_STATES.DRAFT]: [WORKFLOW_STATES.SUBMITTED],
  [WORKFLOW_STATES.SUBMITTED]: [WORKFLOW_STATES.PAYMENT_PENDING, WORKFLOW_STATES.DOCUMENT_REVIEW],
  [WORKFLOW_STATES.PAYMENT_PENDING]: [WORKFLOW_STATES.DOCUMENT_REVIEW],
  [WORKFLOW_STATES.DOCUMENT_REVIEW]: [
    WORKFLOW_STATES.DOCUMENT_APPROVED,
    WORKFLOW_STATES.DOCUMENT_REJECTED,
    WORKFLOW_STATES.DOCUMENT_REVISION,
  ],
  [WORKFLOW_STATES.DOCUMENT_REVISION]: [WORKFLOW_STATES.SUBMITTED],
  [WORKFLOW_STATES.DOCUMENT_APPROVED]: [WORKFLOW_STATES.AUTO_APPROVED],
  [WORKFLOW_STATES.AUTO_APPROVED]: [WORKFLOW_STATES.INSPECTION_PAYMENT_PENDING],
  [WORKFLOW_STATES.INSPECTION_PAYMENT_PENDING]: [WORKFLOW_STATES.INSPECTION_SCHEDULED],
  [WORKFLOW_STATES.INSPECTION_SCHEDULED]: [
    WORKFLOW_STATES.VDO_CALL_COMPLETED,
    WORKFLOW_STATES.ON_SITE_REQUIRED,
  ],
  [WORKFLOW_STATES.VDO_CALL_COMPLETED]: [WORKFLOW_STATES.PENDING_APPROVAL, WORKFLOW_STATES.ON_SITE_REQUIRED],
  [WORKFLOW_STATES.ON_SITE_REQUIRED]: [WORKFLOW_STATES.ON_SITE_COMPLETED],
  [WORKFLOW_STATES.ON_SITE_COMPLETED]: [WORKFLOW_STATES.PENDING_APPROVAL],
  [WORKFLOW_STATES.PENDING_APPROVAL]: [WORKFLOW_STATES.APPROVED, WORKFLOW_STATES.REJECTED],
  [WORKFLOW_STATES.APPROVED]: [WORKFLOW_STATES.CERTIFICATE_ISSUED],
};

function canTransition(currentState, newState) {
  const allowedStates = WORKFLOW_TRANSITIONS[currentState] || [];
  return allowedStates.includes(newState);
}

// ============================================================================
// 📊 MOCK DATA GENERATOR
// ============================================================================

function generateMockUsers() {
  const roles = [
    { role: 'FARMER', email: 'farmer@example.com', name: 'สมชาย ใจดี' },
    { role: 'FARMER', email: 'farmer2@example.com', name: 'สมศรี รักษ์ดิน' },
    { role: 'DTAM_OFFICER', email: 'officer@example.com', name: 'นางสาว พิมพ์ใจ ตรวจสอบ' },
    { role: 'INSPECTOR', email: 'inspector@example.com', name: 'นาย วิชัย ตรวจการ' },
    { role: 'ADMIN', email: 'admin@example.com', name: 'ผู้จัดการ ระบบ' },
  ];

  return roles.map((user, index) => ({
    id: `user-${index + 1}`,
    email: user.email,
    password: 'password123', // In production, this would be hashed
    role: user.role,
    name: user.name,
    phoneNumber: `081-${String(index + 1).padStart(3, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function generateMockApplications(users) {
  const farmers = users.filter(u => u.role === 'FARMER');
  const provinces = ['เชียงใหม่', 'เชียงราย', 'ลำปาง', 'น่าน', 'พะเยา'];
  const cropTypes = ['Cannabis Sativa', 'Cannabis Indica', 'Hybrid Strain'];
  
  const applications = [];
  const now = Date.now();

  // Application 1: APPROVED (ผ่านครบทุก step)
  applications.push({
    id: 'app-001',
    farmerId: farmers[0]?.id,
    farmerName: farmers[0]?.name,
    farmName: 'ฟาร์มกัญชาเชียงใหม่ออร์แกนิค',
    farmSize: 25.5,
    farmAddress: '123/45 หมู่ 5 ถนนเชียงใหม่-ลำปาง',
    province: 'เชียงใหม่',
    district: 'สันทราย',
    subDistrict: 'แม่แฝก',
    postalCode: '50290',
    latitude: 18.7883,
    longitude: 98.9853,
    cropType: 'Cannabis Sativa',
    estimatedYield: 500,
    email: farmers[0]?.email,
    phoneNumber: farmers[0]?.phoneNumber,
    idCardNumber: '1-5099-00123-45-6',
    experience: 5,
    previousCertification: 'GAP',
    remarks: 'ฟาร์มตัวอย่างที่ผ่านการรับรองแล้ว - ระบบปลูกแบบออร์แกนิค ใช้น้ำจากบ่อบาดาล',
    
    // Workflow state
    workflowState: WORKFLOW_STATES.APPROVED,
    currentStep: 8,
    
    // Documents
    documents: {
      idCard: { url: '/mock/id-card-001.pdf', status: 'APPROVED', uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() },
      houseRegistration: { url: '/mock/house-001.pdf', status: 'APPROVED', uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() },
      landDeed: { url: '/mock/land-001.pdf', status: 'APPROVED', uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() },
      farmMap: { url: '/mock/map-001.jpg', status: 'APPROVED', uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() },
      waterQuality: { url: '/mock/water-001.pdf', status: 'APPROVED', uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() },
    },
    
    // Review data (Officer)
    reviewData: {
      officerId: 'user-3',
      officerName: 'นางสาว พิมพ์ใจ ตรวจสอบ',
      completenessScore: 5,
      accuracyScore: 5,
      riskLevel: 'low',
      comments: 'เอกสารครบถ้วน ถูกต้องทุกประการ ข้อมูลชัดเจน',
      decision: 'APPROVED',
      reviewedAt: new Date(now - 55 * 24 * 60 * 60 * 1000).toISOString(),
    },
    
    // Inspection data
    inspectionData: {
      inspectorId: 'user-4',
      inspectorName: 'นาย วิชัย ตรวจการ',
      type: 'ON_SITE',
      scheduledDate: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
      
      vdoCallData: {
        checklistItems: [
          { id: 1, label: 'ตรวจสอบพื้นที่ปลูกผ่าน VDO', checked: true },
          { id: 2, label: 'ตรวจสอบระบบน้ำ', checked: true },
          { id: 3, label: 'ตรวจสอบโครงสร้างเรือนปลูก', checked: true },
        ],
        decision: 'ON_SITE_REQUIRED',
        notes: 'ต้องลงพื้นที่เพื่อตรวจสอบรายละเอียดเพิ่มเติม',
      },
      
      onSiteData: {
        ccpScores: [
          { id: 1, name: 'Seed Selection & Planting Material', score: 14, maxScore: 15, notes: 'เมล็ดพันธุ์มีคุณภาพดี มีใบรับรอง' },
          { id: 2, name: 'Soil Management & Fertilization', score: 15, maxScore: 15, notes: 'ดินมีความอุดมสมบูรณ์ ระบบปุ๋ยอินทรีย์ดีเยี่ยม' },
          { id: 3, name: 'Pest & Disease Management', score: 14, maxScore: 15, notes: 'ใช้ IPM มีการบันทึกประจำ' },
          { id: 4, name: 'Harvesting Procedures', score: 14, maxScore: 15, notes: 'กระบวนการเก็บเกี่ยวถูกต้อง' },
          { id: 5, name: 'Post-Harvest Handling', score: 15, maxScore: 15, notes: 'การจัดการหลังการเก็บเกี่ยวดีมาก' },
          { id: 6, name: 'Storage Conditions', score: 9, maxScore: 10, notes: 'ห้องเก็บมีอุณหภูมิและความชื้นเหมาะสม' },
          { id: 7, name: 'Record Keeping & Traceability', score: 10, maxScore: 10, notes: 'ระบบบันทึกครบถ้วน สามารถตรวจสอบย้อนกลับได้' },
          { id: 8, name: 'Worker Safety & Hygiene', score: 5, maxScore: 5, notes: 'มีมาตรการความปลอดภัยครบถ้วน' },
        ],
        totalScore: 96,
        passStatus: 'PASS',
        finalNotes: 'ฟาร์มมีมาตรฐานสูงมาก แนะนำให้รับรอง ⭐⭐⭐⭐⭐',
        photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      },
    },
    
    // Approval data (Admin)
    approvalData: {
      adminId: 'user-5',
      adminName: 'ผู้จัดการ ระบบ',
      decision: 'APPROVED',
      notes: 'อนุมัติการรับรอง - คะแนนผ่านเกณฑ์สูงมาก (96/100)',
      approvedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    
    // Certificate
    certificateId: 'cert-001',
    
    // Payments
    payments: [
      { id: 'pay-001', amount: 5000, type: 'APPLICATION_FEE', status: 'PAID', paidAt: new Date(now - 58 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'pay-002', amount: 8000, type: 'INSPECTION_FEE', status: 'PAID', paidAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    
    createdAt: new Date(now - 65 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Application 2: PENDING_APPROVAL (รอ Admin อนุมัติ)
  applications.push({
    id: 'app-002',
    farmerId: farmers[1]?.id,
    farmerName: farmers[1]?.name,
    farmName: 'ฟาร์มกัญชาเชียงราย',
    farmSize: 15.0,
    farmAddress: '456/78 หมู่ 3 ถนนพหลโยธิน',
    province: 'เชียงราย',
    district: 'เมือง',
    subDistrict: 'วังหิน',
    postalCode: '57000',
    latitude: 19.9105,
    longitude: 99.8406,
    cropType: 'Cannabis Indica',
    estimatedYield: 300,
    email: farmers[1]?.email,
    phoneNumber: farmers[1]?.phoneNumber,
    idCardNumber: '1-5799-00234-56-7',
    experience: 3,
    previousCertification: 'ไม่มี',
    remarks: 'เริ่มปลูกใหม่ ต้องการรับรอง GACP',
    
    workflowState: WORKFLOW_STATES.PENDING_APPROVAL,
    currentStep: 7,
    
    documents: {
      idCard: { url: '/mock/id-card-002.pdf', status: 'APPROVED', uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() },
      houseRegistration: { url: '/mock/house-002.pdf', status: 'APPROVED', uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() },
      landDeed: { url: '/mock/land-002.pdf', status: 'APPROVED', uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() },
      farmMap: { url: '/mock/map-002.jpg', status: 'APPROVED', uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() },
      waterQuality: { url: '/mock/water-002.pdf', status: 'APPROVED', uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() },
    },
    
    reviewData: {
      officerId: 'user-3',
      officerName: 'นางสาว พิมพ์ใจ ตรวจสอบ',
      completenessScore: 4,
      accuracyScore: 4,
      riskLevel: 'medium',
      comments: 'เอกสารครบถ้วน แต่ควรปรับปรุงแผนที่ฟาร์มให้ชัดเจนขึ้น',
      decision: 'APPROVED',
      reviewedAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    
    inspectionData: {
      inspectorId: 'user-4',
      inspectorName: 'นาย วิชัย ตรวจการ',
      type: 'VDO_CALL',
      scheduledDate: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      
      vdoCallData: {
        checklistItems: [
          { id: 1, label: 'ตรวจสอบพื้นที่ปลูกผ่าน VDO', checked: true },
          { id: 2, label: 'ตรวจสอบระบบน้ำ', checked: true },
          { id: 3, label: 'ตรวจสอบโครงสร้างเรือนปลูก', checked: true },
        ],
        decision: 'SUFFICIENT',
        notes: 'ผ่าน VDO Call ไม่ต้องลงพื้นที่',
        estimatedScore: 85,
      },
    },
    
    payments: [
      { id: 'pay-003', amount: 5000, type: 'APPLICATION_FEE', status: 'PAID', paidAt: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'pay-004', amount: 8000, type: 'INSPECTION_FEE', status: 'PAID', paidAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    
    createdAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Application 3: DOCUMENT_REVIEW (รอ Officer ตรวจ)
  applications.push({
    id: 'app-003',
    farmerId: farmers[0]?.id,
    farmerName: farmers[0]?.name,
    farmName: 'ฟาร์มกัญชาลำปาง',
    farmSize: 8.5,
    farmAddress: '789/12 หมู่ 7 ถนนลำปาง-แม่ทะ',
    province: 'ลำปาง',
    district: 'เกาะคา',
    subDistrict: 'ท่าผา',
    postalCode: '52130',
    latitude: 18.4000,
    longitude: 99.5000,
    cropType: 'Hybrid Strain',
    estimatedYield: 150,
    email: farmers[0]?.email,
    phoneNumber: farmers[0]?.phoneNumber,
    idCardNumber: '1-5099-00123-45-6',
    experience: 5,
    previousCertification: 'GAP',
    remarks: 'ฟาร์มใหม่ในเครือข่าย',
    
    workflowState: WORKFLOW_STATES.DOCUMENT_REVIEW,
    currentStep: 3,
    
    documents: {
      idCard: { url: '/mock/id-card-003.pdf', status: 'PENDING', uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
      houseRegistration: { url: '/mock/house-003.pdf', status: 'PENDING', uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
      landDeed: { url: '/mock/land-003.pdf', status: 'PENDING', uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
      farmMap: { url: '/mock/map-003.jpg', status: 'PENDING', uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
      waterQuality: { url: '/mock/water-003.pdf', status: 'PENDING', uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
    },
    
    payments: [
      { id: 'pay-005', amount: 5000, type: 'APPLICATION_FEE', status: 'PAID', paidAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    
    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Application 4: INSPECTION_SCHEDULED (รอ Inspector ตรวจ)
  applications.push({
    id: 'app-004',
    farmerId: farmers[1]?.id,
    farmerName: farmers[1]?.name,
    farmName: 'ฟาร์มกัญชาน่าน',
    farmSize: 12.0,
    farmAddress: '321/55 หมู่ 2 ถนนน่าน-พะเยา',
    province: 'น่าน',
    district: 'เมือง',
    subDistrict: 'บ่อ',
    postalCode: '55000',
    latitude: 18.7768,
    longitude: 100.7722,
    cropType: 'Cannabis Sativa',
    estimatedYield: 250,
    email: farmers[1]?.email,
    phoneNumber: farmers[1]?.phoneNumber,
    idCardNumber: '1-5799-00234-56-7',
    experience: 3,
    previousCertification: 'ไม่มี',
    remarks: 'พร้อมรับการตรวจสอบ',
    
    workflowState: WORKFLOW_STATES.INSPECTION_SCHEDULED,
    currentStep: 6,
    
    documents: {
      idCard: { url: '/mock/id-card-004.pdf', status: 'APPROVED', uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString() },
      houseRegistration: { url: '/mock/house-004.pdf', status: 'APPROVED', uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString() },
      landDeed: { url: '/mock/land-004.pdf', status: 'APPROVED', uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString() },
      farmMap: { url: '/mock/map-004.jpg', status: 'APPROVED', uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString() },
      waterQuality: { url: '/mock/water-004.pdf', status: 'APPROVED', uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString() },
    },
    
    reviewData: {
      officerId: 'user-3',
      officerName: 'นางสาว พิมพ์ใจ ตรวจสอบ',
      completenessScore: 5,
      accuracyScore: 4,
      riskLevel: 'low',
      comments: 'เอกสารครบถ้วน',
      decision: 'APPROVED',
      reviewedAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    
    inspectionData: {
      inspectorId: 'user-4',
      inspectorName: 'นาย วิชัย ตรวจการ',
      type: 'VDO_CALL',
      scheduledDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(), // อีก 3 วัน
    },
    
    payments: [
      { id: 'pay-006', amount: 5000, type: 'APPLICATION_FEE', status: 'PAID', paidAt: new Date(now - 22 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'pay-007', amount: 8000, type: 'INSPECTION_FEE', status: 'PAID', paidAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    
    createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Application 5: DRAFT (ยังไม่ส่ง)
  applications.push({
    id: 'app-005',
    farmerId: farmers[0]?.id,
    farmerName: farmers[0]?.name,
    farmName: 'ฟาร์มกัญชาพะเยา (ใหม่)',
    farmSize: 20.0,
    farmAddress: '555/99 หมู่ 8',
    province: 'พะเยา',
    district: '',
    subDistrict: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    cropType: 'Cannabis Sativa',
    estimatedYield: 400,
    email: farmers[0]?.email,
    phoneNumber: farmers[0]?.phoneNumber,
    idCardNumber: '1-5099-00123-45-6',
    experience: 5,
    previousCertification: '',
    remarks: '',
    
    workflowState: WORKFLOW_STATES.DRAFT,
    currentStep: 1,
    
    documents: {},
    
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return applications;
}

function generateMockCertificates(applications) {
  return applications
    .filter(app => app.workflowState === WORKFLOW_STATES.APPROVED)
    .map(app => ({
      id: app.certificateId || `cert-${app.id}`,
      applicationId: app.id,
      certificateNumber: `GACP-2025-${app.id.replace('app-', '').padStart(4, '0')}`,
      farmName: app.farmName,
      farmerName: app.farmerName,
      province: app.province,
      cropType: app.cropType,
      farmSize: app.farmSize,
      issueDate: app.approvalData?.approvedAt || new Date().toISOString(),
      expiryDate: new Date(new Date(app.approvalData?.approvedAt || Date.now()).setFullYear(new Date().getFullYear() + 1)).toISOString(),
      status: 'ACTIVE',
      qrCode: `https://gacp.example.com/verify/${app.certificateId}`,
      pdfUrl: `/certificates/${app.certificateId}.pdf`,
    }));
}

// Initialize database
function initializeDatabase() {
  database.users = generateMockUsers();
  database.applications = generateMockApplications(database.users);
  database.certificates = generateMockCertificates(database.applications);
  
  console.log('✅ Database initialized:');
  console.log(`   - Users: ${database.users.length}`);
  console.log(`   - Applications: ${database.applications.length}`);
  console.log(`   - Certificates: ${database.certificates.length}`);
}

// ============================================================================
// 🔐 AUTHENTICATION ENDPOINTS
// ============================================================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, phoneNumber } = req.body;

  // Validate input
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if user exists
  const existingUser = database.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Create new user
  const newUser = {
    id: `user-${uuidv4()}`,
    email,
    password, // In production, hash this
    name,
    role,
    phoneNumber: phoneNumber || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  database.users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return user (without password)
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    message: 'Registration successful',
    token,
    user: userWithoutPassword,
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Find user
  const user = database.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check password (in production, compare hashed passwords)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return user (without password)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword,
  });
});

// ============================================================================
// 📝 APPLICATION ENDPOINTS
// ============================================================================

// Get all applications (with filters)
app.get('/api/applications', authenticateToken, (req, res) => {
  const { status, province, cropType, search, page = 1, limit = 10 } = req.query;
  const userRole = req.user.role;
  const userId = req.user.id;

  let filtered = database.applications;

  // Filter by role
  if (userRole === 'FARMER') {
    filtered = filtered.filter(app => app.farmerId === userId);
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter(app => app.workflowState === status);
  }

  // Filter by province
  if (province) {
    filtered = filtered.filter(app => app.province === province);
  }

  // Filter by cropType
  if (cropType) {
    filtered = filtered.filter(app => app.cropType === cropType);
  }

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(app =>
      app.farmName.toLowerCase().includes(searchLower) ||
      app.farmerName.toLowerCase().includes(searchLower) ||
      app.id.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = filtered.slice(startIndex, endIndex);

  res.json({
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filtered.length / limit),
    data: paginatedResults,
  });
});

// Get single application
app.get('/api/applications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Check permission
  const userRole = req.user.role;
  const userId = req.user.id;

  if (userRole === 'FARMER' && application.farmerId !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(application);
});

// Create new application
app.post('/api/applications', authenticateToken, (req, res) => {
  const userRole = req.user.role;

  if (userRole !== 'FARMER') {
    return res.status(403).json({ message: 'Only farmers can create applications' });
  }

  const newApplication = {
    id: `app-${uuidv4()}`,
    farmerId: req.user.id,
    ...req.body,
    workflowState: WORKFLOW_STATES.DRAFT,
    currentStep: 1,
    documents: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  database.applications.push(newApplication);

  res.status(201).json({
    message: 'Application created',
    data: newApplication,
  });
});

// Update application
app.put('/api/applications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = database.applications.findIndex(app => app.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const application = database.applications[index];

  // Check permission
  if (req.user.role === 'FARMER' && application.farmerId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Update application
  database.applications[index] = {
    ...application,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    message: 'Application updated',
    data: database.applications[index],
  });
});

// Submit application (transition from DRAFT to SUBMITTED)
app.post('/api/applications/:id/submit', authenticateToken, (req, res) => {
  const { id } = req.params;
  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (!canTransition(application.workflowState, WORKFLOW_STATES.SUBMITTED)) {
    return res.status(400).json({ message: 'Invalid workflow transition' });
  }

  application.workflowState = WORKFLOW_STATES.SUBMITTED;
  application.currentStep = 2;
  application.updatedAt = new Date().toISOString();

  res.json({
    message: 'Application submitted',
    data: application,
  });
});

// ============================================================================
// 📋 REVIEW ENDPOINT (Officer)
// ============================================================================

app.post('/api/applications/:id/review', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { completenessScore, accuracyScore, riskLevel, comments, decision } = req.body;

  if (req.user.role !== 'DTAM_OFFICER') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const newState = decision === 'APPROVED' ? WORKFLOW_STATES.DOCUMENT_APPROVED :
                   decision === 'REJECTED' ? WORKFLOW_STATES.DOCUMENT_REJECTED :
                   WORKFLOW_STATES.DOCUMENT_REVISION;

  if (!canTransition(application.workflowState, newState)) {
    return res.status(400).json({ message: 'Invalid workflow transition' });
  }

  application.reviewData = {
    officerId: req.user.id,
    officerName: req.user.name || req.user.email,
    completenessScore,
    accuracyScore,
    riskLevel,
    comments,
    decision,
    reviewedAt: new Date().toISOString(),
  };

  application.workflowState = newState;
  application.currentStep = newState === WORKFLOW_STATES.DOCUMENT_APPROVED ? 4 : 3;
  application.updatedAt = new Date().toISOString();

  // Auto-approve if decision is APPROVED
  if (newState === WORKFLOW_STATES.DOCUMENT_APPROVED) {
    application.workflowState = WORKFLOW_STATES.AUTO_APPROVED;
  }

  res.json({
    message: 'Review submitted',
    data: application,
  });
});

// ============================================================================
// 🔍 INSPECTION ENDPOINTS (Inspector)
// ============================================================================

// VDO Call Inspection
app.post('/api/applications/:id/inspection/vdo-call', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { checklistItems, decision, notes, estimatedScore } = req.body;

  if (req.user.role !== 'INSPECTOR') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const newState = decision === 'SUFFICIENT' ? WORKFLOW_STATES.VDO_CALL_COMPLETED :
                   WORKFLOW_STATES.ON_SITE_REQUIRED;

  application.inspectionData = {
    ...application.inspectionData,
    inspectorId: req.user.id,
    inspectorName: req.user.name || req.user.email,
    type: decision === 'SUFFICIENT' ? 'VDO_CALL' : 'ON_SITE',
    completedDate: new Date().toISOString(),
    vdoCallData: {
      checklistItems,
      decision,
      notes,
      estimatedScore,
    },
  };

  application.workflowState = newState;
  application.updatedAt = new Date().toISOString();

  // If sufficient, move to pending approval
  if (newState === WORKFLOW_STATES.VDO_CALL_COMPLETED) {
    application.workflowState = WORKFLOW_STATES.PENDING_APPROVAL;
    application.currentStep = 7;
  }

  res.json({
    message: 'VDO call inspection completed',
    data: application,
  });
});

// On-Site Inspection
app.post('/api/applications/:id/inspection/on-site', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { ccpScores, totalScore, passStatus, finalNotes, photos } = req.body;

  if (req.user.role !== 'INSPECTOR') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  application.inspectionData = {
    ...application.inspectionData,
    onSiteData: {
      ccpScores,
      totalScore,
      passStatus,
      finalNotes,
      photos,
    },
  };

  application.workflowState = WORKFLOW_STATES.ON_SITE_COMPLETED;
  application.currentStep = 7;
  application.updatedAt = new Date().toISOString();

  // Move to pending approval
  application.workflowState = WORKFLOW_STATES.PENDING_APPROVAL;

  res.json({
    message: 'On-site inspection completed',
    data: application,
  });
});

// ============================================================================
// ✅ APPROVAL ENDPOINT (Admin)
// ============================================================================

app.post('/api/applications/:id/approve', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { decision, notes } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const application = database.applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const newState = decision === 'APPROVED' ? WORKFLOW_STATES.APPROVED :
                   WORKFLOW_STATES.REJECTED;

  if (!canTransition(application.workflowState, newState)) {
    return res.status(400).json({ message: 'Invalid workflow transition' });
  }

  application.approvalData = {
    adminId: req.user.id,
    adminName: req.user.name || req.user.email,
    decision,
    notes,
    approvedAt: new Date().toISOString(),
  };

  application.workflowState = newState;
  application.currentStep = newState === WORKFLOW_STATES.APPROVED ? 8 : 7;
  application.updatedAt = new Date().toISOString();

  // Generate certificate if approved
  if (newState === WORKFLOW_STATES.APPROVED) {
    const certificate = {
      id: `cert-${uuidv4()}`,
      applicationId: application.id,
      certificateNumber: `GACP-2025-${Date.now()}`,
      farmName: application.farmName,
      farmerName: application.farmerName,
      province: application.province,
      cropType: application.cropType,
      farmSize: application.farmSize,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      qrCode: `https://gacp.example.com/verify/cert-${uuidv4()}`,
      pdfUrl: `/certificates/cert-${uuidv4()}.pdf`,
    };

    database.certificates.push(certificate);
    application.certificateId = certificate.id;
    application.workflowState = WORKFLOW_STATES.CERTIFICATE_ISSUED;
  }

  res.json({
    message: decision === 'APPROVED' ? 'Application approved' : 'Application rejected',
    data: application,
  });
});

// ============================================================================
// 📜 CERTIFICATE ENDPOINTS
// ============================================================================

app.get('/api/certificates', authenticateToken, (req, res) => {
  res.json({
    total: database.certificates.length,
    data: database.certificates,
  });
});

// ============================================================================
// 👥 USER ENDPOINTS
// ============================================================================

app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const usersWithoutPasswords = database.users.map(({ password, ...user }) => user);

  res.json({
    total: usersWithoutPasswords.length,
    data: usersWithoutPasswords,
  });
});

// ============================================================================
// ❤️ HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      users: database.users.length,
      applications: database.applications.length,
      certificates: database.certificates.length,
    },
  });
});

// ============================================================================
// 🚀 START SERVER
// ============================================================================

app.listen(PORT, () => {
  initializeDatabase();
  console.log('\n🚀 Mock Backend API Server is running!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log('\n📚 Available endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/applications');
  console.log('   POST   /api/applications');
  console.log('   GET    /api/applications/:id');
  console.log('   PUT    /api/applications/:id');
  console.log('   POST   /api/applications/:id/review');
  console.log('   POST   /api/applications/:id/inspection/vdo-call');
  console.log('   POST   /api/applications/:id/inspection/on-site');
  console.log('   POST   /api/applications/:id/approve');
  console.log('   GET    /api/certificates');
  console.log('   GET    /api/users');
  console.log('\n✅ Ready for testing!\n');
});
