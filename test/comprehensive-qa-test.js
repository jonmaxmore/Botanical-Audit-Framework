/**
 * GACP Platform - Comprehensive QA/QC Testing Suite
 * ระบบทดสอบ QA/QC แบบครอบคลุมทุกบทบาทผู้ใช้งาน
 *
 * Test Roles:
 * 1. เกษตรกร (Farmer)
 * 2. พนักงานตรวจเอกสาร (Document Reviewer)
 * 3. พนักงานตรวจสอบฟาร์ม (Farm Inspector)
 * 4. พนักงานอนุมัติ (Approver)
 * 5. ผู้ดูแลระบบ (Admin/System Manager)
 *
 * @version 2.0.0
 * @date October 21, 2025
 */

const axios = require('axios');
const chalk = require('chalk');

class GACPQATester {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.testResults = {
      farmer: { passed: 0, failed: 0, tests: [] },
      documentReviewer: { passed: 0, failed: 0, tests: [] },
      inspector: { passed: 0, failed: 0, tests: [] },
      approver: { passed: 0, failed: 0, tests: [] },
      admin: { passed: 0, failed: 0, tests: [] }
    };
    this.tokens = {};
    this.testData = {};
  }

  /**
   * Main Test Runner - Auto Start to End
   */
  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 GACP Platform - Comprehensive QA/QC Testing'));
    console.log(chalk.blue('═'.repeat(80)));
    console.log(chalk.gray(`Base URL: ${this.baseURL}`));
    console.log(chalk.gray(`Start Time: ${new Date().toISOString()}\n`));

    try {
      // Test 1: Farmer Role (เกษตรกร)
      await this.testFarmerRole();

      // Test 2: Document Reviewer Role (พนักงานตรวจเอกสาร)
      await this.testDocumentReviewerRole();

      // Test 3: Farm Inspector Role (พนักงานตรวจสอบฟาร์ม)
      await this.testFarmInspectorRole();

      // Test 4: Approver Role (พนักงานอนุมัติ)
      await this.testApproverRole();

      // Test 5: Admin Role (ผู้ดูแลระบบ)
      await this.testAdminRole();

      // Generate Final Report
      this.generateFinalReport();
    } catch (error) {
      console.error(chalk.red('\n❌ Critical Error:'), error.message);
      console.error(error.stack);
    }
  }

  /**
   * Test 1: Farmer Role (เกษตรกร)
   */
  async testFarmerRole() {
    console.log(chalk.yellow.bold('\n👨‍🌾 TEST 1: เกษตรกร (Farmer Role)'));
    console.log(chalk.yellow('─'.repeat(80)));

    const role = 'farmer';

    // 1.1 Register
    await this.test(role, 'Register New Farmer', async () => {
      const userData = {
        email: `farmer_${Date.now()}@test.com`,
        password: 'Test123456!',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        phoneNumber: '0812345678',
        role: 'farmer'
      };
      this.testData.farmerEmail = userData.email;
      this.testData.farmerPassword = userData.password;

      const response = await axios.post(`${this.baseURL}/api/auth/register`, userData);
      return response.status === 201 && response.data.success;
    });

    // 1.2 Login
    await this.test(role, 'Login as Farmer', async () => {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: this.testData.farmerEmail,
        password: this.testData.farmerPassword
      });
      this.tokens.farmer = response.data.token;
      return response.status === 200 && response.data.token;
    });

    // 1.3 View Dashboard
    await this.test(role, 'View Farmer Dashboard', async () => {
      const response = await axios.get(`${this.baseURL}/api/farmer/dashboard`, {
        headers: { Authorization: `Bearer ${this.tokens.farmer}` }
      });
      return response.status === 200;
    });

    // 1.4 Register Farm
    await this.test(role, 'Register Farm', async () => {
      const farmData = {
        farmName: 'ฟาร์มกัญชาทดสอบ',
        location: {
          province: 'เชียงใหม่',
          district: 'แม่ริม',
          subdistrict: 'ริมใต้',
          address: '123 ถนนทดสอบ'
        },
        area: 5.5,
        cropType: 'กัญชา'
      };
      const response = await axios.post(`${this.baseURL}/api/farm-management/farms`, farmData, {
        headers: { Authorization: `Bearer ${this.tokens.farmer}` }
      });
      this.testData.farmId = response.data.data.farmId;
      return response.status === 201;
    });

    // 1.5 View Farm Details
    await this.test(role, 'View Farm Details', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/farm-management/farms/${this.testData.farmId}`,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    // 1.6 Update Farm
    await this.test(role, 'Update Farm Information', async () => {
      const updateData = {
        area: 6.0,
        notes: 'อัปเดตข้อมูลพื้นที่ฟาร์ม'
      };
      const response = await axios.put(
        `${this.baseURL}/api/farm-management/farms/${this.testData.farmId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    // 1.7 Create GACP Application
    await this.test(role, 'Create GACP Certification Application', async () => {
      const applicationData = {
        farmId: this.testData.farmId,
        applicationType: 'new',
        cropDetails: {
          strain: 'พันธุ์ทดสอบ',
          plantingDate: new Date().toISOString(),
          expectedHarvest: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      const response = await axios.post(
        `${this.baseURL}/api/applications/create`,
        applicationData,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      this.testData.applicationId = response.data.data.applicationId;
      return response.status === 201;
    });

    // 1.8 Upload Documents
    await this.test(role, 'Upload Required Documents', async () => {
      const documentData = {
        applicationId: this.testData.applicationId,
        documentType: 'land_ownership',
        fileName: 'เอกสารสิทธิ์ที่ดิน.pdf',
        fileSize: 1024000,
        uploadDate: new Date().toISOString()
      };
      const response = await axios.post(`${this.baseURL}/api/documents/upload`, documentData, {
        headers: { Authorization: `Bearer ${this.tokens.farmer}` }
      });
      return response.status === 201;
    });

    // 1.9 Submit Application
    await this.test(role, 'Submit Application for Review', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/applications/${this.testData.applicationId}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    // 1.10 Track Application Status
    await this.test(role, 'Track Application Status', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/applications/${this.testData.applicationId}/status`,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200 && response.data.data.status === 'submitted';
    });

    // 1.11 View Notifications
    await this.test(role, 'View Notifications', async () => {
      const response = await axios.get(`${this.baseURL}/api/notifications`, {
        headers: { Authorization: `Bearer ${this.tokens.farmer}` }
      });
      return response.status === 200;
    });

    // 1.12 Use Survey System (Standalone)
    await this.test(role, 'Complete Survey (Standalone System)', async () => {
      const surveyData = {
        surveyId: 'gacp-basic-survey',
        responses: {
          question1: 'มีประสบการณ์ปลูกกัญชา 5 ปี',
          question2: 'ใช้ปุ๋ยอินทรีย์'
        },
        region: 'เหนือ'
      };
      const response = await axios.post(`${this.baseURL}/api/survey/submit`, surveyData, {
        headers: { Authorization: `Bearer ${this.tokens.farmer}` }
      });
      return response.status === 201;
    });

    // 1.13 Use Standards Comparison (Standalone)
    await this.test(role, 'Compare GACP Standards (Standalone System)', async () => {
      const comparisonData = {
        standards: ['GACP', 'GAP', 'Organic'],
        farmId: this.testData.farmId
      };
      const response = await axios.post(
        `${this.baseURL}/api/standards-comparison/compare`,
        comparisonData,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    // 1.14 Logout
    await this.test(role, 'Logout', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    // Reverse Tests (ทดสอบย้อนกลับ)
    console.log(chalk.cyan('\n🔄 Reverse Tests (ทดสอบย้อนกลับ):'));

    await this.test(role, 'REVERSE: Cancel Application', async () => {
      // Login again
      const loginResponse = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: this.testData.farmerEmail,
        password: this.testData.farmerPassword
      });
      this.tokens.farmer = loginResponse.data.token;

      const response = await axios.post(
        `${this.baseURL}/api/applications/${this.testData.applicationId}/cancel`,
        { reason: 'ทดสอบการยกเลิก' },
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200;
    });

    await this.test(role, 'REVERSE: Delete Farm (if no active applications)', async () => {
      const response = await axios.delete(
        `${this.baseURL}/api/farm-management/farms/${this.testData.farmId}`,
        {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        }
      );
      return response.status === 200 || response.status === 403; // 403 if has active applications
    });
  }

  /**
   * Test 2: Document Reviewer Role (พนักงานตรวจเอกสาร)
   */
  async testDocumentReviewerRole() {
    console.log(chalk.yellow.bold('\n📄 TEST 2: พนักงานตรวจเอกสาร (Document Reviewer Role)'));
    console.log(chalk.yellow('─'.repeat(80)));

    const role = 'documentReviewer';

    // 2.1 Login as Document Reviewer
    await this.test(role, 'Login as Document Reviewer', async () => {
      const response = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
        email: 'document_reviewer@dtam.go.th',
        password: 'DTAM123456!'
      });
      this.tokens.documentReviewer = response.data.token;
      return response.status === 200 && response.data.token;
    });

    // 2.2 View Pending Applications
    await this.test(role, 'View Pending Applications for Review', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/applications/pending`, {
        headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
      });
      return response.status === 200;
    });

    // 2.3 Get Application Details
    await this.test(role, 'Get Application Details', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}`,
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });

    // 2.4 Review Documents
    await this.test(role, 'Review Uploaded Documents', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/documents`,
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });

    // 2.5 Approve Document
    await this.test(role, 'Approve Document', async () => {
      const reviewData = {
        documentId: 'doc-001',
        status: 'approved',
        comments: 'เอกสารครบถ้วนและถูกต้อง'
      };
      const response = await axios.post(`${this.baseURL}/api/dtam/documents/review`, reviewData, {
        headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
      });
      return response.status === 200;
    });

    // 2.6 Request Document Revision
    await this.test(role, 'Request Document Revision', async () => {
      const revisionData = {
        documentId: 'doc-002',
        status: 'revision_required',
        comments: 'กรุณาส่งเอกสารใหม่ที่ชัดเจนกว่านี้',
        requiredChanges: ['ภาพถ่ายไม่ชัด', 'ขาดข้อมูลสำคัญ']
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/documents/request-revision`,
        revisionData,
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });

    // 2.7 Complete Document Review
    await this.test(role, 'Complete Document Review Phase', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/document-review-complete`,
        { overallStatus: 'approved', notes: 'เอกสารผ่านการตรวจสอบแล้ว' },
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });

    // 2.8 View Review History
    await this.test(role, 'View Review History', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/reviews/history`, {
        headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
      });
      return response.status === 200;
    });

    // 2.9 Generate Review Report
    await this.test(role, 'Generate Review Report', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/review-report`,
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });

    // Reverse Tests
    console.log(chalk.cyan('\n🔄 Reverse Tests:'));

    await this.test(role, 'REVERSE: Revert Document Approval', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/dtam/documents/revert-approval`,
        {
          documentId: 'doc-001',
          reason: 'พบข้อผิดพลาดในการตรวจสอบ'
        },
        {
          headers: { Authorization: `Bearer ${this.tokens.documentReviewer}` }
        }
      );
      return response.status === 200;
    });
  }

  /**
   * Test 3: Farm Inspector Role (พนักงานตรวจสอบฟาร์ม)
   */
  async testFarmInspectorRole() {
    console.log(chalk.yellow.bold('\n🔍 TEST 3: พนักงานตรวจสอบฟาร์ม (Farm Inspector Role)'));
    console.log(chalk.yellow('─'.repeat(80)));

    const role = 'inspector';

    // 3.1 Login as Inspector
    await this.test(role, 'Login as Farm Inspector', async () => {
      const response = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
        email: 'inspector@dtam.go.th',
        password: 'DTAM123456!'
      });
      this.tokens.inspector = response.data.token;
      return response.status === 200 && response.data.token;
    });

    // 3.2 View Assigned Inspections
    await this.test(role, 'View Assigned Farm Inspections', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/inspections/assigned`, {
        headers: { Authorization: `Bearer ${this.tokens.inspector}` }
      });
      return response.status === 200;
    });

    // 3.3 Get Farm Details for Inspection
    await this.test(role, 'Get Farm Details for Inspection', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/farms/${this.testData.farmId}/inspection-details`,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.4 Start Online Inspection Session
    await this.test(role, 'Start Online Inspection Session', async () => {
      const inspectionData = {
        farmId: this.testData.farmId,
        applicationId: this.testData.applicationId,
        inspectionType: 'online',
        scheduledDate: new Date().toISOString()
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/start`,
        inspectionData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      this.testData.inspectionId = response.data.data.inspectionId;
      return response.status === 201;
    });

    // 3.5 Record Inspection Findings (Online)
    await this.test(role, 'Record Online Inspection Findings', async () => {
      const findingsData = {
        inspectionId: this.testData.inspectionId,
        findings: [
          {
            category: 'soil_management',
            status: 'compliant',
            notes: 'การจัดการดินเป็นไปตามมาตรฐาน GACP',
            photos: ['photo1.jpg', 'photo2.jpg']
          },
          {
            category: 'water_management',
            status: 'compliant',
            notes: 'ระบบน้ำและการจัดการน้ำดี',
            photos: ['water1.jpg']
          }
        ]
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/record-findings`,
        findingsData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.6 Check GACP Compliance
    await this.test(role, 'Check GACP Compliance Criteria', async () => {
      const complianceData = {
        inspectionId: this.testData.inspectionId,
        criteria: [
          { code: 'GACP-01', compliant: true, evidence: 'มีเอกสารครบถ้วน' },
          { code: 'GACP-02', compliant: true, evidence: 'พื้นที่ปลอดสารเคมี' },
          { code: 'GACP-03', compliant: true, evidence: 'มีระบบติดตามผลผลิต' }
        ]
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/check-compliance`,
        complianceData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.7 Upload Inspection Photos
    await this.test(role, 'Upload Inspection Photos', async () => {
      const photoData = {
        inspectionId: this.testData.inspectionId,
        photos: [
          { fileName: 'farm_overview.jpg', category: 'general' },
          { fileName: 'soil_sample.jpg', category: 'soil' }
        ]
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/upload-photos`,
        photoData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.8 Complete Inspection
    await this.test(role, 'Complete Inspection and Submit Report', async () => {
      const completionData = {
        inspectionId: this.testData.inspectionId,
        overallResult: 'pass',
        recommendations: ['ควรปรับปรุงระบบจัดเก็บบันทึก', 'แนะนำให้มีการฝึกอบรม GAP เพิ่มเติม'],
        nextSteps: 'พร้อมสำหรับขั้นตอนการอนุมัติ'
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/complete`,
        completionData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.9 Generate Inspection Report
    await this.test(role, 'Generate Inspection Report', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/inspections/${this.testData.inspectionId}/report`,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    // 3.10 View Inspection History
    await this.test(role, 'View Inspection History', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/inspections/history`, {
        headers: { Authorization: `Bearer ${this.tokens.inspector}` }
      });
      return response.status === 200;
    });

    // Reverse Tests
    console.log(chalk.cyan('\n🔄 Reverse Tests:'));

    await this.test(role, 'REVERSE: Edit Inspection Findings', async () => {
      const editData = {
        inspectionId: this.testData.inspectionId,
        findingId: 'finding-001',
        updates: {
          status: 'non_compliant',
          notes: 'พบข้อบกพร่องเพิ่มเติม'
        }
      };
      const response = await axios.put(
        `${this.baseURL}/api/dtam/inspections/edit-finding`,
        editData,
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });

    await this.test(role, 'REVERSE: Reopen Completed Inspection', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/dtam/inspections/${this.testData.inspectionId}/reopen`,
        { reason: 'พบข้อมูลเพิ่มเติมที่ต้องตรวจสอบ' },
        {
          headers: { Authorization: `Bearer ${this.tokens.inspector}` }
        }
      );
      return response.status === 200;
    });
  }

  /**
   * Test 4: Approver Role (พนักงานอนุมัติ)
   */
  async testApproverRole() {
    console.log(chalk.yellow.bold('\n✅ TEST 4: พนักงานอนุมัติ (Approver Role)'));
    console.log(chalk.yellow('─'.repeat(80)));

    const role = 'approver';

    // 4.1 Login as Approver
    await this.test(role, 'Login as Approver', async () => {
      const response = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
        email: 'approver@dtam.go.th',
        password: 'DTAM123456!'
      });
      this.tokens.approver = response.data.token;
      return response.status === 200 && response.data.token;
    });

    // 4.2 View Pending Approvals
    await this.test(role, 'View Pending Approvals', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/approvals/pending`, {
        headers: { Authorization: `Bearer ${this.tokens.approver}` }
      });
      return response.status === 200;
    });

    // 4.3 Review Application Summary
    await this.test(role, 'Review Application Summary', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/summary`,
        {
          headers: { Authorization: `Bearer ${this.tokens.approver}` }
        }
      );
      return response.status === 200;
    });

    // 4.4 Review All Documents and Reports
    await this.test(role, 'Review All Documents and Reports', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/all-documents`,
        {
          headers: { Authorization: `Bearer ${this.tokens.approver}` }
        }
      );
      return response.status === 200;
    });

    // 4.5 Review Inspection Report
    await this.test(role, 'Review Inspection Report', async () => {
      const response = await axios.get(
        `${this.baseURL}/api/dtam/inspections/${this.testData.inspectionId}/full-report`,
        {
          headers: { Authorization: `Bearer ${this.tokens.approver}` }
        }
      );
      return response.status === 200;
    });

    // 4.6 Approve Application
    await this.test(role, 'Approve GACP Application', async () => {
      const approvalData = {
        applicationId: this.testData.applicationId,
        decision: 'approved',
        comments: 'อนุมัติการรับรอง GACP',
        certificateValidity: '3_years',
        conditions: ['ต้องมีการตรวจสอบประจำปี', 'รักษามาตรฐานตามที่กำหนด']
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/approvals/approve`,
        approvalData,
        {
          headers: { Authorization: `Bearer ${this.tokens.approver}` }
        }
      );
      return response.status === 200;
    });

    // 4.7 Generate Certificate
    await this.test(role, 'Generate GACP Certificate', async () => {
      const certData = {
        applicationId: this.testData.applicationId,
        farmId: this.testData.farmId,
        validityPeriod: 3,
        issueDate: new Date().toISOString()
      };
      const response = await axios.post(`${this.baseURL}/api/certificates/generate`, certData, {
        headers: { Authorization: `Bearer ${this.tokens.approver}` }
      });
      this.testData.certificateId = response.data.data.certificateId;
      return response.status === 201;
    });

    // 4.8 View Approval History
    await this.test(role, 'View Approval History', async () => {
      const response = await axios.get(`${this.baseURL}/api/dtam/approvals/history`, {
        headers: { Authorization: `Bearer ${this.tokens.approver}` }
      });
      return response.status === 200;
    });

    // Reverse Tests
    console.log(chalk.cyan('\n🔄 Reverse Tests:'));

    await this.test(role, 'REVERSE: Reject Application (Alternative Flow)', async () => {
      // Create test scenario for rejection
      const rejectionData = {
        applicationId: 'test-app-002',
        decision: 'rejected',
        reasons: ['เอกสารไม่ครบถ้วน', 'ไม่ผ่านการตรวจสอบฟาร์ม'],
        recommendations: ['ปรับปรุงเอกสาร', 'แก้ไขข้อบกพร่องในฟาร์ม']
      };
      const response = await axios.post(
        `${this.baseURL}/api/dtam/approvals/reject`,
        rejectionData,
        {
          headers: { Authorization: `Bearer ${this.tokens.approver}` }
        }
      );
      return response.status === 200;
    });

    await this.test(role, 'REVERSE: Revoke Certificate', async () => {
      const revokeData = {
        certificateId: 'cert-test-001',
        reason: 'พบการละเมิดมาตรฐาน',
        effectiveDate: new Date().toISOString()
      };
      const response = await axios.post(`${this.baseURL}/api/certificates/revoke`, revokeData, {
        headers: { Authorization: `Bearer ${this.tokens.approver}` }
      });
      return response.status === 200;
    });
  }

  /**
   * Test 5: Admin Role (ผู้ดูแลระบบ)
   */
  async testAdminRole() {
    console.log(chalk.yellow.bold('\n⚙️  TEST 5: ผู้ดูแลระบบ (Admin/System Manager Role)'));
    console.log(chalk.yellow('─'.repeat(80)));

    const role = 'admin';

    // 5.1 Login as Admin
    await this.test(role, 'Login as System Admin', async () => {
      const response = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
        email: 'admin@dtam.go.th',
        password: 'Admin123456!'
      });
      this.tokens.admin = response.data.token;
      return response.status === 200 && response.data.token;
    });

    // 5.2 View System Dashboard
    await this.test(role, 'View System Dashboard', async () => {
      const response = await axios.get(`${this.baseURL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.3 View All Users
    await this.test(role, 'View All Users', async () => {
      const response = await axios.get(`${this.baseURL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.4 Create New DTAM Staff
    await this.test(role, 'Create New DTAM Staff', async () => {
      const staffData = {
        email: `staff_${Date.now()}@dtam.go.th`,
        firstName: 'สมหญิง',
        lastName: 'ทดสอบ',
        role: 'document_reviewer',
        department: 'Document Review'
      };
      const response = await axios.post(`${this.baseURL}/api/admin/staff/create`, staffData, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      this.testData.staffId = response.data.data.staffId;
      return response.status === 201;
    });

    // 5.5 Update User Permissions
    await this.test(role, 'Update User Permissions', async () => {
      const permissionData = {
        userId: this.testData.staffId,
        permissions: ['read', 'write', 'review', 'approve'],
        role: 'senior_reviewer'
      };
      const response = await axios.put(
        `${this.baseURL}/api/admin/users/permissions`,
        permissionData,
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });

    // 5.6 View System Statistics
    await this.test(role, 'View System Statistics', async () => {
      const response = await axios.get(`${this.baseURL}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.7 View All Applications (All Statuses)
    await this.test(role, 'View All Applications', async () => {
      const response = await axios.get(`${this.baseURL}/api/admin/applications/all`, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.8 Generate System Reports
    await this.test(role, 'Generate System Reports', async () => {
      const reportData = {
        reportType: 'monthly_summary',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };
      const response = await axios.post(`${this.baseURL}/api/admin/reports/generate`, reportData, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.9 Manage System Settings
    await this.test(role, 'Update System Settings', async () => {
      const settingsData = {
        maintenance_mode: false,
        max_applications_per_month: 100,
        certificate_validity_years: 3,
        notification_email: 'noreply@dtam.go.th'
      };
      const response = await axios.put(`${this.baseURL}/api/admin/settings`, settingsData, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.10 Manage Survey System (Standalone)
    await this.test(role, 'Manage Survey Templates', async () => {
      const templateData = {
        templateName: 'GACP Survey 2025',
        questions: [
          { id: 1, question: 'ประสบการณ์การปลูก', type: 'text' },
          { id: 2, question: 'ประเภทปุ๋ย', type: 'multiple_choice' }
        ],
        region: 'ทุกภูมิภาค'
      };
      const response = await axios.post(
        `${this.baseURL}/api/admin/survey/templates`,
        templateData,
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 201;
    });

    // 5.11 Manage Standards Comparison (Standalone)
    await this.test(role, 'Update GACP Standards Database', async () => {
      const standardsData = {
        standardCode: 'GACP',
        version: '2025',
        criteria: [
          { code: 'GACP-01', description: 'การจัดการดิน', mandatory: true },
          { code: 'GACP-02', description: 'การจัดการน้ำ', mandatory: true }
        ]
      };
      const response = await axios.put(
        `${this.baseURL}/api/admin/standards/update`,
        standardsData,
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });

    // 5.12 View System Logs
    await this.test(role, 'View System Logs', async () => {
      const response = await axios.get(`${this.baseURL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` },
        params: { limit: 100, level: 'info' }
      });
      return response.status === 200;
    });

    // 5.13 Manage Notifications
    await this.test(role, 'Send System Notification', async () => {
      const notificationData = {
        type: 'system_announcement',
        title: 'ประกาศปรับปรุงระบบ',
        message: 'ระบบจะปิดปรับปรุงในวันที่ 1 พฤศจิกายน 2025',
        recipients: 'all'
      };
      const response = await axios.post(
        `${this.baseURL}/api/admin/notifications/send`,
        notificationData,
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });

    // 5.14 Backup System
    await this.test(role, 'Create System Backup', async () => {
      const backupData = {
        backupType: 'full',
        includeDatabase: true,
        includeFiles: true
      };
      const response = await axios.post(`${this.baseURL}/api/admin/backup/create`, backupData, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // 5.15 Customize UI/CSS
    await this.test(role, 'Update System Theme/CSS', async () => {
      const themeData = {
        primaryColor: '#2E7D32',
        secondaryColor: '#66BB6A',
        fontFamily: 'Prompt, sans-serif',
        customCSS: '.btn-primary { background-color: #2E7D32; }'
      };
      const response = await axios.put(`${this.baseURL}/api/admin/theme/update`, themeData, {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      });
      return response.status === 200;
    });

    // Reverse Tests
    console.log(chalk.cyan('\n🔄 Reverse Tests:'));

    await this.test(role, 'REVERSE: Deactivate User', async () => {
      const response = await axios.put(
        `${this.baseURL}/api/admin/users/${this.testData.staffId}/deactivate`,
        { reason: 'ทดสอบการปิดใช้งาน' },
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });

    await this.test(role, 'REVERSE: Restore User', async () => {
      const response = await axios.put(
        `${this.baseURL}/api/admin/users/${this.testData.staffId}/activate`,
        {},
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });

    await this.test(role, 'REVERSE: Rollback System Settings', async () => {
      const response = await axios.post(
        `${this.baseURL}/api/admin/settings/rollback`,
        { version: 'previous' },
        {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        }
      );
      return response.status === 200;
    });
  }

  /**
   * Test Helper Function
   */
  async test(role, testName, testFunction) {
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;

      if (result) {
        this.testResults[role].passed++;
        this.testResults[role].tests.push({
          name: testName,
          status: 'PASS',
          duration: `${duration}ms`
        });
        console.log(chalk.green(`  ✓ ${testName}`), chalk.gray(`(${duration}ms)`));
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults[role].failed++;
      this.testResults[role].tests.push({
        name: testName,
        status: 'FAIL',
        error: error.message
      });
      console.log(chalk.red(`  ✗ ${testName}`), chalk.gray(`(${error.message})`));
    }
  }

  /**
   * Generate Final Report
   */
  generateFinalReport() {
    console.log(chalk.blue.bold('\n\n📊 FINAL QA/QC TEST REPORT'));
    console.log(chalk.blue('═'.repeat(80)));

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.testResults).forEach(([role, results]) => {
      totalPassed += results.passed;
      totalFailed += results.failed;

      const total = results.passed + results.failed;
      const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

      console.log(chalk.yellow(`\n${this.getRoleIcon(role)} ${this.getRoleName(role)}`));
      console.log(
        chalk.green(`  ✓ Passed: ${results.passed}`) +
          chalk.red(` | ✗ Failed: ${results.failed}`) +
          chalk.cyan(` | Success Rate: ${percentage}%`)
      );
    });

    const grandTotal = totalPassed + totalFailed;
    const overallPercentage = grandTotal > 0 ? ((totalPassed / grandTotal) * 100).toFixed(1) : 0;

    console.log(chalk.blue('\n' + '─'.repeat(80)));
    console.log(
      chalk.white.bold('\n📈 Overall Results:') +
        chalk.green(`\n  ✓ Total Passed: ${totalPassed}`) +
        chalk.red(`\n  ✗ Total Failed: ${totalFailed}`) +
        chalk.cyan(`\n  📊 Success Rate: ${overallPercentage}%`) +
        chalk.white(`\n  📝 Total Tests: ${grandTotal}`)
    );

    if (overallPercentage >= 90) {
      console.log(chalk.green.bold('\n🎉 ✅ EXCELLENT! All systems are production ready!'));
    } else if (overallPercentage >= 75) {
      console.log(chalk.yellow.bold('\n⚠️  GOOD! Some areas need attention.'));
    } else {
      console.log(chalk.red.bold('\n❌ WARNING! Critical issues found. Review required.'));
    }

    console.log(chalk.gray(`\nEnd Time: ${new Date().toISOString()}`));
    console.log(chalk.blue('═'.repeat(80) + '\n'));
  }

  getRoleIcon(role) {
    const icons = {
      farmer: '👨‍🌾',
      documentReviewer: '📄',
      inspector: '🔍',
      approver: '✅',
      admin: '⚙️'
    };
    return icons[role] || '👤';
  }

  getRoleName(role) {
    const names = {
      farmer: 'เกษตรกร (Farmer)',
      documentReviewer: 'พนักงานตรวจเอกสาร (Document Reviewer)',
      inspector: 'พนักงานตรวจสอบฟาร์ม (Farm Inspector)',
      approver: 'พนักงานอนุมัติ (Approver)',
      admin: 'ผู้ดูแลระบบ (Admin/System Manager)'
    };
    return names[role] || role;
  }
}

// Export
module.exports = { GACPQATester };

// Run if executed directly
if (require.main === module) {
  const tester = new GACPQATester();
  tester.runAllTests().catch(console.error);
}
