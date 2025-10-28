import { Farmer, DocumentChecker, Inspector, Approver, Admin, UserRole } from '../types/user.types';

// เกษตรกร 10 คน
export const farmers: Farmer[] = [
  {
    id: 'F001',
    username: 'somchai.farmer',
    email: 'somchai@example.com',
    fullName: 'สมชาย ใจดี',
    role: UserRole.FARMER,
    phone: '081-234-5671',
    idCardNumber: '1509900123456',
    address: '123 หมู่ 5',
    subdistrict: 'บ้านนา',
    district: 'เมือง',
    province: 'เชียงใหม่',
    postalCode: '50000',
    farmingExperience: 15,
    totalFarmArea: 20,
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'F002',
    username: 'somying.herb',
    email: 'somying@example.com',
    fullName: 'สมหญิง รักษ์ไทย',
    role: UserRole.FARMER,
    phone: '082-345-6782',
    idCardNumber: '1509900234567',
    address: '456 หมู่ 3',
    subdistrict: 'ดอยสะเก็ด',
    district: 'ดอยสะเก็ด',
    province: 'เชียงใหม่',
    postalCode: '50220',
    farmingExperience: 8,
    totalFarmArea: 15,
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'F003',
    username: 'narong.organic',
    email: 'narong@example.com',
    fullName: 'ณรงค์ ปลูกดี',
    role: UserRole.FARMER,
    phone: '083-456-7893',
    idCardNumber: '1509900345678',
    address: '789 หมู่ 7',
    subdistrict: 'สันทราย',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50210',
    farmingExperience: 12,
    totalFarmArea: 25,
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'F004',
    username: 'wanpen.green',
    email: 'wanpen@example.com',
    fullName: 'วันเพ็ญ เขียวขจี',
    role: UserRole.FARMER,
    phone: '084-567-8904',
    idCardNumber: '1509900456789',
    address: '234 หมู่ 2',
    subdistrict: 'แม่แตง',
    district: 'แม่แตง',
    province: 'เชียงใหม่',
    postalCode: '50150',
    farmingExperience: 6,
    totalFarmArea: 10,
    isActive: true,
    createdAt: new Date('2024-02-10')
  },
  {
    id: 'F005',
    username: 'prasit.farm',
    email: 'prasit@example.com',
    fullName: 'ประสิทธิ์ เกษตรกร',
    role: UserRole.FARMER,
    phone: '085-678-9015',
    idCardNumber: '1579900123456',
    address: '567 หมู่ 4',
    subdistrict: 'ป่าแดด',
    district: 'เมือง',
    province: 'เชียงราย',
    postalCode: '57000',
    farmingExperience: 20,
    totalFarmArea: 30,
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'F006',
    username: 'anong.nature',
    email: 'anong@example.com',
    fullName: 'อนงค์ ธรรมชาติ',
    role: UserRole.FARMER,
    phone: '086-789-0126',
    idCardNumber: '1579900234567',
    address: '890 หมู่ 6',
    subdistrict: 'แม่สาย',
    district: 'แม่สาย',
    province: 'เชียงราย',
    postalCode: '57130',
    farmingExperience: 10,
    totalFarmArea: 18,
    isActive: true,
    createdAt: new Date('2024-03-01')
  },
  {
    id: 'F007',
    username: 'manop.herb',
    email: 'manop@example.com',
    fullName: 'มานพ สมุนไพร',
    role: UserRole.FARMER,
    phone: '087-890-1237',
    idCardNumber: '1579900345678',
    address: '123 หมู่ 1',
    subdistrict: 'เวียงป่าเป้า',
    district: 'เวียงป่าเป้า',
    province: 'เชียงราย',
    postalCode: '57260',
    farmingExperience: 14,
    totalFarmArea: 22,
    isActive: true,
    createdAt: new Date('2024-03-10')
  },
  {
    id: 'F008',
    username: 'suwanna.clean',
    email: 'suwanna@example.com',
    fullName: 'สุวรรณา สะอาด',
    role: UserRole.FARMER,
    phone: '088-901-2348',
    idCardNumber: '1579900456789',
    address: '456 หมู่ 8',
    subdistrict: 'ริมกก',
    district: 'เชียงของ',
    province: 'เชียงราย',
    postalCode: '57140',
    farmingExperience: 7,
    totalFarmArea: 12,
    isActive: true,
    createdAt: new Date('2024-03-20')
  },
  {
    id: 'F009',
    username: 'boonmee.safe',
    email: 'boonmee@example.com',
    fullName: 'บุญมี ปลอดภัย',
    role: UserRole.FARMER,
    phone: '089-012-3459',
    idCardNumber: '1579900567890',
    address: '789 หมู่ 9',
    subdistrict: 'แม่จัน',
    district: 'แม่จัน',
    province: 'เชียงราย',
    postalCode: '57110',
    farmingExperience: 18,
    totalFarmArea: 28,
    isActive: true,
    createdAt: new Date('2024-04-01')
  },
  {
    id: 'F010',
    username: 'chanya.quality',
    email: 'chanya@example.com',
    fullName: 'ชัญญา คุณภาพ',
    role: UserRole.FARMER,
    phone: '090-123-4560',
    idCardNumber: '1579900678901',
    address: '321 หมู่ 10',
    subdistrict: 'ดอยหล่อ',
    district: 'ดอยหล่อ',
    province: 'เชียงราย',
    postalCode: '57250',
    farmingExperience: 5,
    totalFarmArea: 8,
    isActive: true,
    createdAt: new Date('2024-04-10')
  }
];

// ผู้ตรวจสอบเอกสาร 1 คน
export const documentCheckers: DocumentChecker[] = [
  {
    id: 'DC001',
    username: 'surapong.doc',
    email: 'surapong.doc@dtam.moph.go.th',
    fullName: 'สุรพงษ์ ตรวจสอบ',
    role: UserRole.DOCUMENT_CHECKER,
    employeeId: 'EMP-DC-001',
    department: 'แผนกตรวจสอบเอกสาร',
    phone: '02-149-7001',
    assignedApplications: 0,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// ผู้ตรวจประเมิน 1 คน
export const inspectors: Inspector[] = [
  {
    id: 'INS001',
    username: 'wichai.inspect',
    email: 'wichai.inspect@dtam.moph.go.th',
    fullName: 'วิชัย ประเมินผล',
    role: UserRole.INSPECTOR,
    employeeId: 'EMP-INS-001',
    licenseNumber: 'GACP-INS-2024-001',
    certifications: ['GACP Inspector Level 3', 'Organic Certification', 'Food Safety Auditor'],
    phone: '02-149-7002',
    assignedInspections: 0,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// ผู้อนุมัติ 1 คน
export const approvers: Approver[] = [
  {
    id: 'APR001',
    username: 'somkid.approve',
    email: 'somkid.approve@dtam.moph.go.th',
    fullName: 'สมคิด อนุมัติ',
    role: UserRole.APPROVER,
    employeeId: 'EMP-APR-001',
    department: 'แผนกอนุมัติและรับรอง',
    approvalLevel: 3,
    phone: '02-149-7003',
    pendingApprovals: 0,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// แอดมิน 1 คน
export const admins: Admin[] = [
  {
    id: 'ADM001',
    username: 'admin',
    email: 'admin@dtam.moph.go.th',
    fullName: 'ผู้ดูแลระบบ',
    role: UserRole.ADMIN,
    employeeId: 'EMP-ADM-001',
    phone: '02-149-7000',
    permissions: ['ALL'],
    canManageRoles: true,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// รวมผู้ใช้ทั้งหมด
export const allUsers = [...farmers, ...documentCheckers, ...inspectors, ...approvers, ...admins];

// ข้อมูล credentials สำหรับ login (สำหรับ demo)
export const userCredentials = allUsers.map(user => ({
  username: user.username,
  password: 'password123', // ในระบบจริงต้อง hash
  userId: user.id,
  role: user.role
}));
