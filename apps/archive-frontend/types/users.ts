export enum UserRole {
  FARMER = 'farmer',
  DOCUMENT_CHECKER = 'document_checker',
  INSPECTOR = 'inspector',
  APPROVER = 'approver',
  TRAINING_MANAGER = 'training_manager',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Farmer extends User {
  role: UserRole.FARMER;
  farmId?: string;
  address: string;
  idCardNumber: string;
  farmingExperience: number; // ปีที่มีประสบการณ์
}

export interface Staff extends User {
  role:
    | UserRole.DOCUMENT_CHECKER
    | UserRole.INSPECTOR
    | UserRole.APPROVER
    | UserRole.TRAINING_MANAGER;
  employeeId: string;
  department: string;
  position: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}
