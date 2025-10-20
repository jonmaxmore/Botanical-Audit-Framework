export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  DOCUMENT_CHECKING = 'document_checking',
  DOCUMENT_APPROVED = 'document_approved',
  DOCUMENT_REJECTED = 'document_rejected',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  INSPECTING = 'inspecting',
  INSPECTION_COMPLETED = 'inspection_completed',
  INSPECTION_PASSED = 'inspection_passed',
  INSPECTION_FAILED = 'inspection_failed',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CERTIFICATE_ISSUED = 'certificate_issued',
}

export interface GACPApplication {
  id: string;
  applicationNumber: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  farmAddress: string;
  farmArea: number;
  cropType: string;
  cropVariety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  status: ApplicationStatus;
  submittedAt?: Date;

  documentCheckerId?: string;
  documentCheckerName?: string;
  documentCheckedAt?: Date;
  documentCheckResult?: 'approved' | 'rejected';
  documentCheckNotes?: string;

  inspectorId?: string;
  inspectorName?: string;
  inspectionScheduledDate?: Date;
  inspectionCompletedDate?: Date;
  inspectionScore?: number;
  inspectionResult?: 'passed' | 'failed';
  inspectionNotes?: string;
  inspectionReport?: string;

  approverId?: string;
  approverName?: string;
  approvedAt?: Date;
  approvalResult?: 'approved' | 'rejected';
  approvalNotes?: string;

  certificateNumber?: string;
  certificateIssuedAt?: Date;
  certificateExpiryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWorkflow {
  applicationId: string;
  step: ApplicationStatus;
  assignedTo?: string;
  assignedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
}

export interface WorkflowHistory {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  notes?: string;
  timestamp: Date;
}
