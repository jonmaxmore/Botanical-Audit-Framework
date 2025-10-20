/**
 * GACP Platform Demo Data & Mock Users
 *
 * ข้อมูลตัวอย่างสำหรับการ demo ระบบครบวงจร
 * รวมทุก user roles และ workflow scenarios
 */

// Demo Users for each role
export const demoUsers = {
  farmer: {
    id: 'demo-farmer-001',
    email: 'somchai.farmer@demo.gacp.th',
    name: 'นายสมชาย ใจดี',
    role: 'farmer',
    password: 'demo123',
    profile: {
      farmName: 'ฟาร์มสมุนไพรใจดี',
      address: '123 หมู่ 5 ตำบลป่าซาง อำเภอป่าซาง จังหวัดลำพูน 51120',
      phone: '081-234-5678',
      idCard: '1234567890123',
      farmSize: '15 ไร่',
      cropTypes: ['กระชายดำ', 'ฟ้าทะลายโจร', 'ขมิ้นชัน'],
      coordinates: { lat: 18.5204, lng: 99.077 },
    },
    applications: ['APP-2024-001', 'APP-2024-005'],
    certificates: ['CERT-2023-001'],
  },

  inspector: {
    id: 'demo-inspector-001',
    email: 'inspector.demo@gacp.th',
    name: 'นางสาววิไล ตรวจสอบ',
    role: 'inspector',
    password: 'demo123',
    profile: {
      employeeId: 'INS-001',
      department: 'ฝ่ายตรวจสอบมาตรฐาน',
      specialization: ['สมุนไพร', 'การเกษตรอินทรีย์'],
      region: 'ภาคเหนือ',
      certifications: ['GACP Inspector Level 3', 'Organic Agriculture Inspector'],
    },
    assignedInspections: ['INS-2024-001', 'INS-2024-003', 'INS-2024-007'],
    completedInspections: 23,
  },

  reviewer: {
    id: 'demo-reviewer-001',
    email: 'reviewer.demo@gacp.th',
    name: 'ดร.สมหญิง ประเมินผล',
    role: 'reviewer',
    password: 'demo123',
    profile: {
      employeeId: 'REV-001',
      department: 'ฝ่ายประเมินและรับรอง',
      education: 'Ph.D. เภสัชศาสตร์',
      experience: '15 ปี',
      specialization: ['เภสัชกรรมพื้นบ้าน', 'มาตรฐานสมุนไพร'],
    },
    pendingReviews: ['APP-2024-002', 'APP-2024-004'],
    completedReviews: 156,
  },

  admin: {
    id: 'demo-admin-001',
    email: 'admin.demo@gacp.th',
    name: 'นายประสิทธิ์ จัดการ',
    role: 'admin',
    password: 'demo123',
    profile: {
      employeeId: 'ADM-001',
      department: 'ฝ่ายบริหารระบบ',
      position: 'ผู้อำนวยการฝ่าย',
      permissions: ['user_management', 'system_config', 'reports', 'audit_logs'],
    },
  },
};

// Demo Applications in various stages
export const demoApplications = [
  {
    id: 'APP-2024-001',
    applicantId: 'demo-farmer-001',
    applicantName: 'นายสมชาย ใจดี',
    farmName: 'ฟาร์มสมุนไพรใจดี',
    cropType: 'กระชายดำ',
    farmSize: '15 ไร่',
    submissionDate: '2024-10-01',
    status: 'under_review',
    currentStage: 'document_review',
    reviewer: 'demo-reviewer-001',
    documents: [
      { name: 'แบบฟอร์มคำขอ', type: 'application_form', status: 'approved' },
      { name: 'แผนที่แปลง', type: 'farm_map', status: 'approved' },
      { name: 'สำเนาบัตรประชาชน', type: 'id_copy', status: 'approved' },
      { name: 'ใบรับรองการใช้ที่ดิน', type: 'land_certificate', status: 'pending' },
    ],
    timeline: [
      { date: '2024-10-01', event: 'ยื่นคำขอ', status: 'completed' },
      { date: '2024-10-02', event: 'ตรวจสอบเอกสารเบื้องต้น', status: 'completed' },
      { date: '2024-10-05', event: 'รอเอกสารเพิ่มเติม', status: 'current' },
      { date: null, event: 'กำหนดวันตรวจประเมิน', status: 'pending' },
      { date: null, event: 'ตรวจประเมินในพื้นที่', status: 'pending' },
      { date: null, event: 'ประเมินผลและอนุมัติ', status: 'pending' },
    ],
    notes: 'รอเอกสารใบรับรองการใช้ที่ดินเพิ่มเติม',
  },

  {
    id: 'APP-2024-002',
    applicantId: 'demo-farmer-002',
    applicantName: 'นางมาลี สมุนไพร',
    farmName: 'สวนสมุนไพรมาลี',
    cropType: 'ฟ้าทะลายโจร',
    farmSize: '8 ไร่',
    submissionDate: '2024-09-15',
    status: 'inspection_scheduled',
    currentStage: 'field_inspection',
    inspector: 'demo-inspector-001',
    inspectionDate: '2024-10-25',
    documents: [
      { name: 'แบบฟอร์มคำขอ', type: 'application_form', status: 'approved' },
      { name: 'แผนที่แปลง', type: 'farm_map', status: 'approved' },
      { name: 'สำเนาบัตรประชาชน', type: 'id_copy', status: 'approved' },
      { name: 'ใบรับรองการใช้ที่ดิน', type: 'land_certificate', status: 'approved' },
    ],
    timeline: [
      { date: '2024-09-15', event: 'ยื่นคำขอ', status: 'completed' },
      { date: '2024-09-16', event: 'ตรวจสอบเอกสารเบื้องต้น', status: 'completed' },
      { date: '2024-09-20', event: 'อนุมัติเอกสาร', status: 'completed' },
      { date: '2024-10-05', event: 'กำหนดวันตรวจประเมิน', status: 'completed' },
      { date: '2024-10-25', event: 'ตรวจประเมินในพื้นที่', status: 'current' },
      { date: null, event: 'ประเมินผลและอนุมัติ', status: 'pending' },
    ],
  },

  {
    id: 'APP-2024-003',
    applicantId: 'demo-farmer-003',
    applicantName: 'นายจิรายุ เกษตรกร',
    farmName: 'ฟาร์มออร์แกนิคจิรายุ',
    cropType: 'ขมิ้นชัน',
    farmSize: '25 ไร่',
    submissionDate: '2024-08-10',
    status: 'approved',
    currentStage: 'certificate_issued',
    certificateId: 'CERT-2024-001',
    issueDate: '2024-10-15',
    expiryDate: '2027-10-15',
    timeline: [
      { date: '2024-08-10', event: 'ยื่นคำขอ', status: 'completed' },
      { date: '2024-08-12', event: 'ตรวจสอบเอกสารเบื้องต้น', status: 'completed' },
      { date: '2024-08-15', event: 'อนุมัติเอกสาร', status: 'completed' },
      { date: '2024-08-25', event: 'กำหนดวันตรวจประเมิน', status: 'completed' },
      { date: '2024-09-05', event: 'ตรวจประเมินในพื้นที่', status: 'completed' },
      { date: '2024-10-15', event: 'ประเมินผลและอนุมัติ', status: 'completed' },
    ],
  },
];

// Demo Inspections
export const demoInspections = [
  {
    id: 'INS-2024-001',
    applicationId: 'APP-2024-002',
    inspectorId: 'demo-inspector-001',
    farmName: 'สวนสมุนไพรมาลี',
    farmLocation: 'ตำบลสันป่าตอง อำเภอดอยสะเก็ด จังหวัดเชียงใหม่',
    scheduledDate: '2024-10-25',
    scheduledTime: '09:00',
    status: 'scheduled',
    checklistItems: [
      {
        category: 'การเตรียมพื้นที่',
        items: ['ความสะอาดของพื้นที่', 'การจัดเก็บอุปกรณ์', 'ระบบการระบายน้ำ'],
      },
      {
        category: 'การใช้สารเคมี',
        items: ['บันทึกการใช้สาร', 'การเก็บรักษาสารเคมี', 'ความปลอดภัย'],
      },
      {
        category: 'การเก็บเกี่ยว',
        items: ['ความสะอาดของภาชนะ', 'กระบวนการเก็บเกี่ยว', 'การป้องกันการปนเปื้อน'],
      },
      {
        category: 'การจัดเก็บและขนส่ง',
        items: ['สภาพห้องเก็บ', 'อุณหภูมิและความชื้น', 'การติดฉลาก'],
      },
    ],
  },
];

// Demo Certificates
export const demoCertificates = [
  {
    id: 'CERT-2024-001',
    applicationId: 'APP-2024-003',
    certificateNumber: 'GACP-2024-001',
    farmerName: 'นายจิรายุ เกษตรกร',
    farmName: 'ฟาร์มออร์แกนิคจิรายุ',
    cropType: 'ขมิ้นชัน',
    farmLocation: 'จังหวัดลำปาง',
    issueDate: '2024-10-15',
    expiryDate: '2027-10-15',
    status: 'active',
    qrCode: 'GACP2024001QR',
    digitalSignature: 'DS-GACP-2024-001',
  },
];

// Demo Workflow Scenarios
export const demoWorkflowScenarios = [
  {
    id: 'scenario-1',
    title: 'เกษตรกรใหม่ยื่นคำขอครั้งแรก',
    description: 'แสดงกระบวนการยื่นคำขอตั้งแต่เริ่มต้นจนได้รับใบรับรอง',
    steps: [
      { role: 'farmer', action: 'สมัครสมาชิกและยื่นคำขอ', page: '/farmer/register' },
      { role: 'reviewer', action: 'ตรวจสอบเอกสารเบื้องต้น', page: '/reviewer/applications' },
      { role: 'inspector', action: 'รับมอบหมายและกำหนดวันตรวจ', page: '/inspector/schedule' },
      { role: 'inspector', action: 'ตรวจประเมินในพื้นที่', page: '/inspector/inspection' },
      { role: 'reviewer', action: 'ประเมินผลและอนุมัติ', page: '/reviewer/approval' },
      { role: 'farmer', action: 'ดาวน์โหลดใบรับรอง', page: '/farmer/certificates' },
    ],
  },

  {
    id: 'scenario-2',
    title: 'การตรวจประเมินในพื้นที่',
    description: 'แสดงกระบวนการตรวจสอบในฟาร์มตามมาตรฐาน GACP',
    steps: [
      { role: 'inspector', action: 'เตรียมการตรวจประเมิน', page: '/inspector/preparation' },
      { role: 'inspector', action: 'ตรวจสอบตาม checklist', page: '/inspector/checklist' },
      { role: 'inspector', action: 'บันทึกผลและถ่ายรูป', page: '/inspector/record' },
      { role: 'inspector', action: 'สรุปและส่งรายงาน', page: '/inspector/report' },
    ],
  },

  {
    id: 'scenario-3',
    title: 'การบริหารจัดการระบบ',
    description: 'แสดงการทำงานของผู้บริหารในการดูแลระบบ',
    steps: [
      { role: 'admin', action: 'ติดตามสถิติการดำเนินงาน', page: '/admin/dashboard' },
      { role: 'admin', action: 'จัดการผู้ใช้งาน', page: '/admin/users' },
      { role: 'admin', action: 'ตั้งค่าระบบ', page: '/admin/settings' },
      { role: 'admin', action: 'ออกรายงาน', page: '/admin/reports' },
    ],
  },
];

// Demo System Statistics
export const demoStatistics = {
  overview: {
    totalApplications: 2547,
    approvedCertificates: 1892,
    pendingApplications: 325,
    totalUsers: 1247,
    monthlyGrowth: {
      applications: '+12%',
      certificates: '+8%',
      users: '+15%',
    },
  },

  performance: {
    averageProcessingTime: '45 วัน',
    approvalRate: '74.3%',
    inspectionCompletionRate: '96.7%',
    customerSatisfaction: '4.6/5.0',
  },

  regionalData: [
    { region: 'ภาคเหนือ', applications: 789, certificates: 601 },
    { region: 'ภาคกลาง', applications: 456, certificates: 342 },
    { region: 'ภาคอีสาน', applications: 623, certificates: 478 },
    { region: 'ภาคใต้', applications: 679, certificates: 471 },
  ],

  cropTypes: [
    { crop: 'กระชายดำ', count: 234, percentage: 18.7 },
    { crop: 'ฟ้าทะลายโจร', count: 189, percentage: 15.1 },
    { crop: 'ขมิ้นชัน', count: 167, percentage: 13.3 },
    { crop: 'ขิง', count: 145, percentage: 11.6 },
    { crop: 'อื่นๆ', count: 512, percentage: 41.3 },
  ],
};

// Export all demo data
export const demoData = {
  users: demoUsers,
  applications: demoApplications,
  inspections: demoInspections,
  certificates: demoCertificates,
  workflows: demoWorkflowScenarios,
  statistics: demoStatistics,
};

export default demoData;
