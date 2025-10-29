/**
 * GACP Platform - Mock API Server for QA/QC Testing
 * เซิร์ฟเวอร์ API จำลองสำหรับการทดสอบ QA/QC
 *
 * @version 1.0.0
 * @date October 21, 2025
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.TEST_PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage
const storage = {
  users: [],
  farms: [],
  applications: [],
  inspections: [],
  certificates: [],
  surveys: [],
  comparisons: [],
  logs: []
};

// Helper: Generate JWT Token (Mock)
const generateToken = (userId, role) => {
  return Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 3600000 })).toString(
    'base64'
  );
};

// Helper: Verify Token (Mock)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const userId = uuidv4();
  const user = {
    userId,
    email,
    firstName,
    lastName,
    phoneNumber,
    role: role || 'farmer',
    createdAt: new Date().toISOString()
  };

  storage.users.push(user);
  storage.logs.push({ action: 'register', userId, timestamp: new Date().toISOString() });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { userId, email }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = storage.users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user.userId, user.role);
  storage.logs.push({ action: 'login', userId: user.userId, timestamp: new Date().toISOString() });

  res.json({
    success: true,
    token,
    user: { userId: user.userId, email: user.email, role: user.role }
  });
});

// DTAM Login
app.post('/api/auth/dtam/login', (req, res) => {
  const { email, password } = req.body;

  // Mock DTAM users
  const dtamUsers = {
    'document_reviewer@dtam.go.th': { role: 'document_reviewer', userId: 'dtam-reviewer-001' },
    'inspector@dtam.go.th': { role: 'inspector', userId: 'dtam-inspector-001' },
    'approver@dtam.go.th': { role: 'approver', userId: 'dtam-approver-001' },
    'admin@dtam.go.th': { role: 'admin', userId: 'dtam-admin-001' }
  };

  const user = dtamUsers[email];

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid DTAM credentials' });
  }

  const token = generateToken(user.userId, user.role);
  storage.logs.push({
    action: 'dtam_login',
    userId: user.userId,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    token,
    user: { userId: user.userId, email, role: user.role }
  });
});

// Logout
app.post('/api/auth/logout', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'logout',
    userId: req.user.userId,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================================================
// FARMER ENDPOINTS
// ============================================================================

// Farmer Dashboard
app.get('/api/farmer/dashboard', verifyToken, (req, res) => {
  const userFarms = storage.farms.filter(f => f.ownerId === req.user.userId);
  const userApplications = storage.applications.filter(a => a.userId === req.user.userId);

  res.json({
    success: true,
    data: {
      farms: userFarms.length,
      applications: userApplications.length,
      pendingApplications: userApplications.filter(a => a.status === 'pending').length
    }
  });
});

// ============================================================================
// FARM MANAGEMENT ENDPOINTS
// ============================================================================

// Create Farm
app.post('/api/farm-management/farms', verifyToken, (req, res) => {
  const { farmName, location, area, cropType } = req.body;

  const farmId = uuidv4();
  const farm = {
    farmId,
    ownerId: req.user.userId,
    farmName,
    location,
    area,
    cropType,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  storage.farms.push(farm);
  storage.logs.push({
    action: 'create_farm',
    farmId,
    userId: req.user.userId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({ success: true, data: { farmId }, message: 'Farm created successfully' });
});

// Get Farm Details
app.get('/api/farm-management/farms/:farmId', verifyToken, (req, res) => {
  const farm = storage.farms.find(f => f.farmId === req.params.farmId);

  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  res.json({ success: true, data: farm });
});

// Update Farm
app.put('/api/farm-management/farms/:farmId', verifyToken, (req, res) => {
  const farmIndex = storage.farms.findIndex(f => f.farmId === req.params.farmId);

  if (farmIndex === -1) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  storage.farms[farmIndex] = {
    ...storage.farms[farmIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  storage.logs.push({
    action: 'update_farm',
    farmId: req.params.farmId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: storage.farms[farmIndex], message: 'Farm updated successfully' });
});

// Delete Farm
app.delete('/api/farm-management/farms/:farmId', verifyToken, (req, res) => {
  const farmIndex = storage.farms.findIndex(f => f.farmId === req.params.farmId);

  if (farmIndex === -1) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  // Check active applications
  const activeApps = storage.applications.filter(
    a => a.farmId === req.params.farmId && a.status !== 'cancelled'
  );

  if (activeApps.length > 0) {
    return res
      .status(403)
      .json({ success: false, message: 'Cannot delete farm with active applications' });
  }

  storage.farms.splice(farmIndex, 1);
  storage.logs.push({
    action: 'delete_farm',
    farmId: req.params.farmId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Farm deleted successfully' });
});

// ============================================================================
// APPLICATION ENDPOINTS
// ============================================================================

// Create Application
app.post('/api/applications/create', verifyToken, (req, res) => {
  const { farmId, applicationType, cropDetails } = req.body;

  const applicationId = uuidv4();
  const application = {
    applicationId,
    userId: req.user.userId,
    farmId,
    applicationType,
    cropDetails,
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  storage.applications.push(application);
  storage.logs.push({
    action: 'create_application',
    applicationId,
    timestamp: new Date().toISOString()
  });

  res
    .status(201)
    .json({ success: true, data: { applicationId }, message: 'Application created successfully' });
});

// Submit Application
app.post('/api/applications/:applicationId/submit', verifyToken, (req, res) => {
  const appIndex = storage.applications.findIndex(
    a => a.applicationId === req.params.applicationId
  );

  if (appIndex === -1) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  storage.applications[appIndex].status = 'submitted';
  storage.applications[appIndex].submittedAt = new Date().toISOString();
  storage.logs.push({
    action: 'submit_application',
    applicationId: req.params.applicationId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Application submitted successfully' });
});

// Get Application Status
app.get('/api/applications/:applicationId/status', verifyToken, (req, res) => {
  const application = storage.applications.find(a => a.applicationId === req.params.applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.json({
    success: true,
    data: { status: application.status, applicationId: application.applicationId }
  });
});

// Cancel Application
app.post('/api/applications/:applicationId/cancel', verifyToken, (req, res) => {
  const appIndex = storage.applications.findIndex(
    a => a.applicationId === req.params.applicationId
  );

  if (appIndex === -1) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  storage.applications[appIndex].status = 'cancelled';
  storage.applications[appIndex].cancelledAt = new Date().toISOString();
  storage.applications[appIndex].cancelReason = req.body.reason;
  storage.logs.push({
    action: 'cancel_application',
    applicationId: req.params.applicationId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Application cancelled successfully' });
});

// ============================================================================
// DOCUMENT ENDPOINTS
// ============================================================================

// Upload Document
app.post('/api/documents/upload', verifyToken, (req, res) => {
  const documentId = uuidv4();
  const document = {
    documentId,
    ...req.body,
    uploadedBy: req.user.userId,
    uploadedAt: new Date().toISOString()
  };

  storage.logs.push({ action: 'upload_document', documentId, timestamp: new Date().toISOString() });

  res
    .status(201)
    .json({ success: true, data: { documentId }, message: 'Document uploaded successfully' });
});

// ============================================================================
// SURVEY ENDPOINTS (Standalone)
// ============================================================================

// Submit Survey
app.post('/api/survey/submit', verifyToken, (req, res) => {
  const surveyId = uuidv4();
  const survey = {
    surveyId,
    userId: req.user.userId,
    ...req.body,
    submittedAt: new Date().toISOString()
  };

  storage.surveys.push(survey);
  storage.logs.push({ action: 'submit_survey', surveyId, timestamp: new Date().toISOString() });

  res
    .status(201)
    .json({ success: true, data: { surveyId }, message: 'Survey submitted successfully' });
});

// ============================================================================
// STANDARDS COMPARISON ENDPOINTS (Standalone)
// ============================================================================

// Compare Standards
app.post('/api/standards-comparison/compare', verifyToken, (req, res) => {
  const comparisonId = uuidv4();
  const comparison = {
    comparisonId,
    userId: req.user.userId,
    ...req.body,
    comparedAt: new Date().toISOString(),
    results: {
      GACP: { score: 85, compliant: true },
      GAP: { score: 78, compliant: true },
      Organic: { score: 72, compliant: false }
    }
  };

  storage.comparisons.push(comparison);
  storage.logs.push({
    action: 'compare_standards',
    comparisonId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: comparison, message: 'Standards comparison completed' });
});

// ============================================================================
// DTAM - DOCUMENT REVIEWER ENDPOINTS
// ============================================================================

// Get Pending Applications
app.get('/api/dtam/applications/pending', verifyToken, (req, res) => {
  const pending = storage.applications.filter(a => a.status === 'submitted');
  res.json({ success: true, data: pending, count: pending.length });
});

// Get Application Details
app.get('/api/dtam/applications/:applicationId', verifyToken, (req, res) => {
  const application = storage.applications.find(a => a.applicationId === req.params.applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.json({ success: true, data: application });
});

// Get Application Documents
app.get('/api/dtam/applications/:applicationId/documents', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { documentId: 'doc-001', type: 'land_ownership', status: 'pending' },
      { documentId: 'doc-002', type: 'farm_plan', status: 'pending' }
    ]
  });
});

// Review Document
app.post('/api/dtam/documents/review', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'review_document',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Document reviewed successfully' });
});

// Request Document Revision
app.post('/api/dtam/documents/request-revision', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'request_revision',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Revision requested successfully' });
});

// Complete Document Review
app.post(
  '/api/dtam/applications/:applicationId/document-review-complete',
  verifyToken,
  (req, res) => {
    const appIndex = storage.applications.findIndex(
      a => a.applicationId === req.params.applicationId
    );

    if (appIndex !== -1) {
      storage.applications[appIndex].documentReviewStatus = 'completed';
      storage.applications[appIndex].documentReviewCompletedAt = new Date().toISOString();
    }

    storage.logs.push({
      action: 'complete_document_review',
      applicationId: req.params.applicationId,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Document review completed' });
  }
);

// Get Review History
app.get('/api/dtam/reviews/history', verifyToken, (req, res) => {
  const reviews = storage.logs.filter(l => l.action.includes('review'));
  res.json({ success: true, data: reviews, count: reviews.length });
});

// Get Review Report
app.get('/api/dtam/applications/:applicationId/review-report', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      applicationId: req.params.applicationId,
      reportType: 'document_review',
      generatedAt: new Date().toISOString()
    }
  });
});

// Revert Document Approval
app.post('/api/dtam/documents/revert-approval', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'revert_approval',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Document approval reverted' });
});

// ============================================================================
// DTAM - FARM INSPECTOR ENDPOINTS
// ============================================================================

// Get Assigned Inspections
app.get('/api/dtam/inspections/assigned', verifyToken, (req, res) => {
  const assigned = storage.inspections.filter(i => i.inspectorId === req.user.userId);
  res.json({ success: true, data: assigned, count: assigned.length });
});

// Get Farm Inspection Details
app.get('/api/dtam/farms/:farmId/inspection-details', verifyToken, (req, res) => {
  const farm = storage.farms.find(f => f.farmId === req.params.farmId);

  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  res.json({ success: true, data: { ...farm, inspectionReady: true } });
});

// Start Inspection
app.post('/api/dtam/inspections/start', verifyToken, (req, res) => {
  const inspectionId = uuidv4();
  const inspection = {
    inspectionId,
    inspectorId: req.user.userId,
    ...req.body,
    status: 'in_progress',
    startedAt: new Date().toISOString()
  };

  storage.inspections.push(inspection);
  storage.logs.push({
    action: 'start_inspection',
    inspectionId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({ success: true, data: { inspectionId }, message: 'Inspection started' });
});

// Record Findings
app.post('/api/dtam/inspections/record-findings', verifyToken, (req, res) => {
  const inspectionIndex = storage.inspections.findIndex(
    i => i.inspectionId === req.body.inspectionId
  );

  if (inspectionIndex !== -1) {
    storage.inspections[inspectionIndex].findings = req.body.findings;
    storage.inspections[inspectionIndex].findingsRecordedAt = new Date().toISOString();
  }

  storage.logs.push({
    action: 'record_findings',
    inspectionId: req.body.inspectionId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Findings recorded successfully' });
});

// Check Compliance
app.post('/api/dtam/inspections/check-compliance', verifyToken, (req, res) => {
  const inspectionIndex = storage.inspections.findIndex(
    i => i.inspectionId === req.body.inspectionId
  );

  if (inspectionIndex !== -1) {
    storage.inspections[inspectionIndex].complianceCriteria = req.body.criteria;
  }

  storage.logs.push({
    action: 'check_compliance',
    inspectionId: req.body.inspectionId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Compliance checked successfully' });
});

// Upload Photos
app.post('/api/dtam/inspections/upload-photos', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'upload_photos',
    inspectionId: req.body.inspectionId,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Photos uploaded successfully' });
});

// Complete Inspection
app.post('/api/dtam/inspections/complete', verifyToken, (req, res) => {
  const inspectionIndex = storage.inspections.findIndex(
    i => i.inspectionId === req.body.inspectionId
  );

  if (inspectionIndex !== -1) {
    storage.inspections[inspectionIndex].status = 'completed';
    storage.inspections[inspectionIndex].completedAt = new Date().toISOString();
    storage.inspections[inspectionIndex].result = req.body.overallResult;
  }

  storage.logs.push({
    action: 'complete_inspection',
    inspectionId: req.body.inspectionId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Inspection completed successfully' });
});

// Get Inspection Report
app.get('/api/dtam/inspections/:inspectionId/report', verifyToken, (req, res) => {
  const inspection = storage.inspections.find(i => i.inspectionId === req.params.inspectionId);

  res.json({
    success: true,
    data: {
      inspectionId: req.params.inspectionId,
      inspection,
      generatedAt: new Date().toISOString()
    }
  });
});

// Get Inspection History
app.get('/api/dtam/inspections/history', verifyToken, (req, res) => {
  const history = storage.inspections.filter(i => i.inspectorId === req.user.userId);
  res.json({ success: true, data: history, count: history.length });
});

// Edit Finding
app.put('/api/dtam/inspections/edit-finding', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'edit_finding',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Finding updated successfully' });
});

// Reopen Inspection
app.post('/api/dtam/inspections/:inspectionId/reopen', verifyToken, (req, res) => {
  const inspectionIndex = storage.inspections.findIndex(
    i => i.inspectionId === req.params.inspectionId
  );

  if (inspectionIndex !== -1) {
    storage.inspections[inspectionIndex].status = 'reopened';
    storage.inspections[inspectionIndex].reopenedAt = new Date().toISOString();
  }

  storage.logs.push({
    action: 'reopen_inspection',
    inspectionId: req.params.inspectionId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Inspection reopened successfully' });
});

// ============================================================================
// DTAM - APPROVER ENDPOINTS
// ============================================================================

// Get Pending Approvals
app.get('/api/dtam/approvals/pending', verifyToken, (req, res) => {
  const pending = storage.applications.filter(
    a => a.status === 'submitted' || a.documentReviewStatus === 'completed'
  );
  res.json({ success: true, data: pending, count: pending.length });
});

// Get Application Summary
app.get('/api/dtam/applications/:applicationId/summary', verifyToken, (req, res) => {
  const application = storage.applications.find(a => a.applicationId === req.params.applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  res.json({
    success: true,
    data: {
      application,
      documentsReviewed: true,
      inspectionCompleted: true,
      readyForApproval: true
    }
  });
});

// Get All Documents
app.get('/api/dtam/applications/:applicationId/all-documents', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: [
      { type: 'application', status: 'complete' },
      { type: 'documents', status: 'approved' },
      { type: 'inspection', status: 'completed' }
    ]
  });
});

// Get Full Inspection Report
app.get('/api/dtam/inspections/:inspectionId/full-report', verifyToken, (req, res) => {
  const inspection = storage.inspections.find(i => i.inspectionId === req.params.inspectionId);

  res.json({
    success: true,
    data: {
      inspectionId: req.params.inspectionId,
      inspection,
      fullReport: true,
      generatedAt: new Date().toISOString()
    }
  });
});

// Approve Application
app.post('/api/dtam/approvals/approve', verifyToken, (req, res) => {
  const appIndex = storage.applications.findIndex(a => a.applicationId === req.body.applicationId);

  if (appIndex !== -1) {
    storage.applications[appIndex].status = 'approved';
    storage.applications[appIndex].approvedAt = new Date().toISOString();
    storage.applications[appIndex].approvedBy = req.user.userId;
  }

  storage.logs.push({
    action: 'approve_application',
    applicationId: req.body.applicationId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Application approved successfully' });
});

// Reject Application
app.post('/api/dtam/approvals/reject', verifyToken, (req, res) => {
  const appIndex = storage.applications.findIndex(a => a.applicationId === req.body.applicationId);

  if (appIndex !== -1) {
    storage.applications[appIndex].status = 'rejected';
    storage.applications[appIndex].rejectedAt = new Date().toISOString();
    storage.applications[appIndex].rejectedBy = req.user.userId;
    storage.applications[appIndex].rejectionReasons = req.body.reasons;
  }

  storage.logs.push({
    action: 'reject_application',
    applicationId: req.body.applicationId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Application rejected' });
});

// Get Approval History
app.get('/api/dtam/approvals/history', verifyToken, (req, res) => {
  const history = storage.logs.filter(
    l => l.action.includes('approve') || l.action.includes('reject')
  );
  res.json({ success: true, data: history, count: history.length });
});

// ============================================================================
// CERTIFICATE ENDPOINTS
// ============================================================================

// Generate Certificate
app.post('/api/certificates/generate', verifyToken, (req, res) => {
  const certificateId = uuidv4();
  const certificate = {
    certificateId,
    ...req.body,
    generatedBy: req.user.userId,
    generatedAt: new Date().toISOString(),
    status: 'active'
  };

  storage.certificates.push(certificate);
  storage.logs.push({
    action: 'generate_certificate',
    certificateId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    data: { certificateId },
    message: 'Certificate generated successfully'
  });
});

// Revoke Certificate
app.post('/api/certificates/revoke', verifyToken, (req, res) => {
  const certIndex = storage.certificates.findIndex(c => c.certificateId === req.body.certificateId);

  if (certIndex !== -1) {
    storage.certificates[certIndex].status = 'revoked';
    storage.certificates[certIndex].revokedAt = new Date().toISOString();
    storage.certificates[certIndex].revokeReason = req.body.reason;
  }

  storage.logs.push({
    action: 'revoke_certificate',
    certificateId: req.body.certificateId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Certificate revoked successfully' });
});

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

// Get Notifications
app.get('/api/notifications', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        message: 'แอปพลิเคชันของคุณได้รับการอนุมัติแล้ว',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Admin Dashboard
app.get('/api/admin/dashboard', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: storage.users.length,
      totalFarms: storage.farms.length,
      totalApplications: storage.applications.length,
      totalInspections: storage.inspections.length,
      totalCertificates: storage.certificates.length
    }
  });
});

// Get All Users
app.get('/api/admin/users', verifyToken, (req, res) => {
  res.json({ success: true, data: storage.users, count: storage.users.length });
});

// Create Staff
app.post('/api/admin/staff/create', verifyToken, (req, res) => {
  const staffId = uuidv4();
  const staff = {
    staffId,
    ...req.body,
    createdBy: req.user.userId,
    createdAt: new Date().toISOString()
  };

  storage.users.push(staff);
  storage.logs.push({ action: 'create_staff', staffId, timestamp: new Date().toISOString() });

  res.status(201).json({ success: true, data: { staffId }, message: 'Staff created successfully' });
});

// Update User Permissions
app.put('/api/admin/users/permissions', verifyToken, (req, res) => {
  const userIndex = storage.users.findIndex(u => u.userId === req.body.userId);

  if (userIndex !== -1) {
    storage.users[userIndex].permissions = req.body.permissions;
    storage.users[userIndex].role = req.body.role;
  }

  storage.logs.push({
    action: 'update_permissions',
    userId: req.body.userId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Permissions updated successfully' });
});

// Get System Statistics
app.get('/api/admin/statistics', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      users: storage.users.length,
      farms: storage.farms.length,
      applications: storage.applications.length,
      approvedApplications: storage.applications.filter(a => a.status === 'approved').length,
      certificates: storage.certificates.length,
      activeCertificates: storage.certificates.filter(c => c.status === 'active').length
    }
  });
});

// Get All Applications
app.get('/api/admin/applications/all', verifyToken, (req, res) => {
  res.json({ success: true, data: storage.applications, count: storage.applications.length });
});

// Generate Reports
app.post('/api/admin/reports/generate', verifyToken, (req, res) => {
  const reportId = uuidv4();
  storage.logs.push({ action: 'generate_report', reportId, timestamp: new Date().toISOString() });

  res.json({
    success: true,
    data: {
      reportId,
      reportType: req.body.reportType,
      generatedAt: new Date().toISOString()
    }
  });
});

// Update System Settings
app.put('/api/admin/settings', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'update_settings',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Settings updated successfully' });
});

// Manage Survey Templates
app.post('/api/admin/survey/templates', verifyToken, (req, res) => {
  const templateId = uuidv4();
  storage.logs.push({
    action: 'create_survey_template',
    templateId,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    data: { templateId },
    message: 'Survey template created successfully'
  });
});

// Update Standards
app.put('/api/admin/standards/update', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'update_standards',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Standards updated successfully' });
});

// Get System Logs
app.get('/api/admin/logs', verifyToken, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = storage.logs.slice(-limit);
  res.json({ success: true, data: logs, count: logs.length });
});

// Send Notification
app.post('/api/admin/notifications/send', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'send_notification',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Notification sent successfully' });
});

// Create Backup
app.post('/api/admin/backup/create', verifyToken, (req, res) => {
  const backupId = uuidv4();
  storage.logs.push({ action: 'create_backup', backupId, timestamp: new Date().toISOString() });

  res.json({
    success: true,
    data: { backupId, createdAt: new Date().toISOString() },
    message: 'Backup created successfully'
  });
});

// Update Theme
app.put('/api/admin/theme/update', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'update_theme',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Theme updated successfully' });
});

// Deactivate User
app.put('/api/admin/users/:userId/deactivate', verifyToken, (req, res) => {
  const userIndex = storage.users.findIndex(u => u.userId === req.params.userId);

  if (userIndex !== -1) {
    storage.users[userIndex].status = 'inactive';
  }

  storage.logs.push({
    action: 'deactivate_user',
    userId: req.params.userId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'User deactivated successfully' });
});

// Activate User
app.put('/api/admin/users/:userId/activate', verifyToken, (req, res) => {
  const userIndex = storage.users.findIndex(u => u.userId === req.params.userId);

  if (userIndex !== -1) {
    storage.users[userIndex].status = 'active';
  }

  storage.logs.push({
    action: 'activate_user',
    userId: req.params.userId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'User activated successfully' });
});

// Rollback Settings
app.post('/api/admin/settings/rollback', verifyToken, (req, res) => {
  storage.logs.push({
    action: 'rollback_settings',
    data: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: 'Settings rolled back successfully' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📝 Ready for QA/QC Testing`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});

module.exports = app;
