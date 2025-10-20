export interface Certificate {
  id: string;
  certificateNumber: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNationalId: string;
  address: {
    houseNumber: string;
    village?: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  farmArea: number; // in Rai
  cropType: string;
  certificationStandard: 'GACP' | 'GAP' | 'Organic';
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
  issuedBy: string;
  issuedDate: string; // ISO date
  expiryDate: string; // ISO date
  qrCode?: string; // QR code data URL
  pdfUrl?: string;
  inspectionDate: string;
  inspectorName: string;
  inspectionReport?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateFormData {
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNationalId: string;
  address: {
    houseNumber: string;
    village?: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  farmArea: number;
  cropType: string;
  certificationStandard: 'GACP' | 'GAP' | 'Organic';
  inspectionDate: string;
  inspectorName: string;
  inspectionReport?: string;
  notes?: string;
}

export interface CertificateStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  expiringThisMonth: number;
  issuedThisMonth: number;
}

export interface CertificateFilters {
  status?: Certificate['status'];
  certificationStandard?: Certificate['certificationStandard'];
  province?: string;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type CertificateStatus = Certificate['status'];
export type CertificationStandard = Certificate['certificationStandard'];
