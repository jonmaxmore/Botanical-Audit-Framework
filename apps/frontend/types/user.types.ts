export enum UserRole {
  FARMER = 'farmer',
  DOCUMENT_CHECKER = 'document_checker',
  INSPECTOR = 'inspector',
  APPROVER = 'approver',
  ADMIN = 'admin',
}

export interface BaseUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Farmer extends BaseUser {
  role: UserRole.FARMER;
  idCardNumber: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  farmingExperience: number;
  totalFarmArea?: number;
}

export interface DocumentChecker extends BaseUser {
  role: UserRole.DOCUMENT_CHECKER;
  employeeId: string;
  department: string;
  assignedApplications: number;
}

export interface Inspector extends BaseUser {
  role: UserRole.INSPECTOR;
  employeeId: string;
  licenseNumber: string;
  certifications: string[];
  assignedInspections: number;
}

export interface Approver extends BaseUser {
  role: UserRole.APPROVER;
  employeeId: string;
  department: string;
  approvalLevel: number;
  pendingApprovals: number;
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN;
  employeeId: string;
  permissions: string[];
  canManageRoles: boolean;
}

export type User = Farmer | DocumentChecker | Inspector | Approver | Admin;
