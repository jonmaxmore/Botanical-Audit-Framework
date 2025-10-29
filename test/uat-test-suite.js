/**
 * GACP Platform - User Acceptance Testing (UAT) Suite
 * ระบบทดสอบการยอมรับจากผู้ใช้งานจริง (UAT)
 *
 * UAT Coverage:
 * - 5 User Roles
 * - 6 Main Systems
 * - 4 Supporting Systems
 * - Real-world scenarios
 * - Business acceptance criteria
 *
 * @version 1.0.0
 * @date October 21, 2025
 */

const axios = require('axios');

class GACPUATTester {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.uatResults = {
      roles: {
        farmer: { scenarios: [], passed: 0, failed: 0 },
        documentReviewer: { scenarios: [], passed: 0, failed: 0 },
        inspector: { scenarios: [], passed: 0, failed: 0 },
        approver: { scenarios: [], passed: 0, failed: 0 },
        admin: { scenarios: [], passed: 0, failed: 0 }
      },
      systems: {
        auth: { scenarios: [], passed: 0, failed: 0 },
        gacpApplication: { scenarios: [], passed: 0, failed: 0 },
        farmManagement: { scenarios: [], passed: 0, failed: 0 },
        trackTrace: { scenarios: [], passed: 0, failed: 0 },
        survey: { scenarios: [], passed: 0, failed: 0 },
        standardsComparison: { scenarios: [], passed: 0, failed: 0 },
        documentManagement: { scenarios: [], passed: 0, failed: 0 },
        notification: { scenarios: [], passed: 0, failed: 0 },
        certificate: { scenarios: [], passed: 0, failed: 0 },
        reporting: { scenarios: [], passed: 0, failed: 0 }
      }
    };
    this.tokens = {};
    this.testData = {};
  }

  /**
   * Main UAT Runner
   */
  async runAllUAT() {
    console.log('\n🎯 GACP Platform - User Acceptance Testing (UAT)');
    console.log('═'.repeat(80));
    console.log(`Base URL: ${this.baseURL}`);
    console.log(`Start Time: ${new Date().toISOString()}\n`);

    try {
      // User Role UAT
      await this.uatFarmerRole();
      await this.uatDocumentReviewerRole();
      await this.uatInspectorRole();
      await this.uatApproverRole();
      await this.uatAdminRole();

      // System UAT
      await this.uatAuthSystem();
      await this.uatGACPApplicationSystem();
      await this.uatFarmManagementSystem();
      await this.uatTrackTraceSystem();
      await this.uatSurveySystem();
      await this.uatStandardsComparisonSystem();
      await this.uatDocumentManagementSystem();
      await this.uatNotificationSystem();
      await this.uatCertificateGenerationSystem();
      await this.uatReportingSystem();

      // Generate UAT Report
      this.generateUATReport();
    } catch (error) {
      console.error('\n❌ Critical UAT Error:', error.message);
      console.error(error.stack);
    }
  }

  /**
   * UAT: เกษตรกร (Farmer Role)
   */
  async uatFarmerRole() {
    console.log('\n👨‍🌾 UAT: เกษตรกร (Farmer Role)');
    console.log('─'.repeat(80));

    // Scenario 1: New Farmer Registration Journey
    await this.uatScenario(
      'roles',
      'farmer',
      'UAT-F-001: เกษตรกรใหม่สมัครสมาชิกและยื่นขอรับรองครั้งแรก',
      async () => {
        // Step 1: Register
        const userData = {
          email: `farmer_uat_${Date.now()}@test.com`,
          password: 'FarmerTest123!',
          firstName: 'สมชาย',
          lastName: 'เกษตรกร',
          phoneNumber: '0891234567',
          role: 'farmer',
          province: 'เชียงใหม่'
        };

        const registerResponse = await axios.post(`${this.baseURL}/api/auth/register`, userData);
        if (registerResponse.status !== 201) throw new Error('Registration failed');

        this.testData.farmerEmail = userData.email;
        this.testData.farmerPassword = userData.password;

        // Step 2: Login
        const loginResponse = await axios.post(`${this.baseURL}/api/auth/login`, {
          email: userData.email,
          password: userData.password
        });

        this.tokens.farmer = loginResponse.data.token;

        // Step 3: View Dashboard
        const dashboardResponse = await axios.get(`${this.baseURL}/api/farmer/dashboard`, {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        });

        // Step 4: Register Farm
        const farmData = {
          farmName: 'ฟาร์มกัญชาทดสอบ UAT',
          location: {
            province: 'เชียงใหม่',
            district: 'แม่ริม',
            subdistrict: 'ริมใต้',
            address: '123 ถนนทดสอบ UAT',
            latitude: 18.8832,
            longitude: 98.9847
          },
          area: 10.5,
          cropType: 'กัญชา',
          varieties: ['พันธุ์ไทย', 'พันธุ์ลูกผสม']
        };

        const farmResponse = await axios.post(
          `${this.baseURL}/api/farm-management/farms`,
          farmData,
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        this.testData.farmId = farmResponse.data.data.farmId;

        // Step 5: Create GACP Application
        const applicationData = {
          farmId: this.testData.farmId,
          applicationType: 'new',
          cropDetails: {
            strain: 'พันธุ์ไทยต้านทาน',
            plantingDate: new Date().toISOString(),
            expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
            cultivationMethod: 'organic',
            estimatedYield: 500
          }
        };

        const appResponse = await axios.post(
          `${this.baseURL}/api/applications/create`,
          applicationData,
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        this.testData.applicationId = appResponse.data.data.applicationId;

        // Acceptance Criteria
        return (
          registerResponse.status === 201 &&
          loginResponse.data.token &&
          dashboardResponse.status === 200 &&
          farmResponse.status === 201 &&
          appResponse.status === 201
        );
      }
    );

    // Scenario 2: Document Upload and Submission
    await this.uatScenario(
      'roles',
      'farmer',
      'UAT-F-002: เกษตรกรอัปโหลดเอกสารและส่งคำขอรับรอง',
      async () => {
        const documents = [
          { type: 'land_ownership', name: 'โฉนดที่ดิน.pdf' },
          { type: 'farm_plan', name: 'แผนผังฟาร์ม.pdf' },
          { type: 'id_card', name: 'บัตรประชาชน.pdf' },
          { type: 'water_test', name: 'ผลตรวจน้ำ.pdf' },
          { type: 'soil_test', name: 'ผลตรวจดิน.pdf' }
        ];

        for (const doc of documents) {
          await axios.post(
            `${this.baseURL}/api/documents/upload`,
            {
              applicationId: this.testData.applicationId,
              documentType: doc.type,
              fileName: doc.name,
              fileSize: 2048000
            },
            {
              headers: { Authorization: `Bearer ${this.tokens.farmer}` }
            }
          );
        }

        // Submit application
        const submitResponse = await axios.post(
          `${this.baseURL}/api/applications/${this.testData.applicationId}/submit`,
          {},
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return submitResponse.status === 200;
      }
    );

    // Scenario 3: Survey and Standards Comparison
    await this.uatScenario(
      'roles',
      'farmer',
      'UAT-F-003: เกษตรกรทำแบบสอบถามและเปรียบเทียบมาตรฐาน',
      async () => {
        // Complete survey
        const surveyResponse = await axios.post(
          `${this.baseURL}/api/survey/submit`,
          {
            surveyId: 'gacp-farmer-survey',
            responses: {
              experience_years: '5',
              cultivation_type: 'organic',
              farm_size: '10-20 rai',
              previous_certification: 'no'
            },
            region: 'เหนือ'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        // Compare standards
        const comparisonResponse = await axios.post(
          `${this.baseURL}/api/standards-comparison/compare`,
          {
            standards: ['GACP', 'GAP', 'Organic'],
            farmId: this.testData.farmId
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return surveyResponse.status === 201 && comparisonResponse.status === 200;
      }
    );

    // Scenario 4: Track Application Status
    await this.uatScenario(
      'roles',
      'farmer',
      'UAT-F-004: เกษตรกรติดตามสถานะคำขอและรับการแจ้งเตือน',
      async () => {
        const statusResponse = await axios.get(
          `${this.baseURL}/api/applications/${this.testData.applicationId}/status`,
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        const notificationsResponse = await axios.get(`${this.baseURL}/api/notifications`, {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        });

        return statusResponse.status === 200 && notificationsResponse.status === 200;
      }
    );
  }

  /**
   * UAT: พนักงานตรวจเอกสาร (Document Reviewer Role)
   */
  async uatDocumentReviewerRole() {
    console.log('\n📄 UAT: พนักงานตรวจเอกสาร (Document Reviewer Role)');
    console.log('─'.repeat(80));

    // Login as Document Reviewer
    const loginResponse = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
      email: 'reviewer@dtam.go.th',
      password: 'DTAM123456!'
    });
    this.tokens.reviewer = loginResponse.data.token;

    // Scenario 1: Review Application Documents
    await this.uatScenario(
      'roles',
      'documentReviewer',
      'UAT-DR-001: พนักงานตรวจสอบเอกสารคำขอรับรอง',
      async () => {
        const pendingResponse = await axios.get(`${this.baseURL}/api/dtam/applications/pending`, {
          headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
        });

        const detailsResponse = await axios.get(
          `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}`,
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        const documentsResponse = await axios.get(
          `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/documents`,
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        return (
          pendingResponse.status === 200 &&
          detailsResponse.status === 200 &&
          documentsResponse.status === 200
        );
      }
    );

    // Scenario 2: Approve and Request Revisions
    await this.uatScenario(
      'roles',
      'documentReviewer',
      'UAT-DR-002: พนักงานอนุมัติและขอแก้ไขเอกสาร',
      async () => {
        // Approve some documents
        await axios.post(
          `${this.baseURL}/api/dtam/documents/review`,
          {
            documentId: 'doc-001',
            status: 'approved',
            comments: 'เอกสารครบถ้วนถูกต้อง'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        // Request revision for others
        await axios.post(
          `${this.baseURL}/api/dtam/documents/request-revision`,
          {
            documentId: 'doc-002',
            status: 'revision_required',
            comments: 'กรุณาส่งเอกสารใหม่ที่ชัดเจนกว่า'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        // Complete review
        const completeResponse = await axios.post(
          `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/document-review-complete`,
          {
            overallStatus: 'approved',
            notes: 'เอกสารผ่านการตรวจสอบ'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        return completeResponse.status === 200;
      }
    );
  }

  /**
   * UAT: พนักงานตรวจสอบฟาร์ม (Farm Inspector Role)
   */
  async uatInspectorRole() {
    console.log('\n🔍 UAT: พนักงานตรวจสอบฟาร์ม (Farm Inspector Role)');
    console.log('─'.repeat(80));

    // Login as Inspector
    const loginResponse = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
      email: 'inspector@dtam.go.th',
      password: 'DTAM123456!'
    });
    this.tokens.inspector = loginResponse.data.token;

    // Scenario 1: Conduct Farm Inspection
    await this.uatScenario(
      'roles',
      'inspector',
      'UAT-I-001: พนักงานตรวจสอบฟาร์มแบบออนไลน์',
      async () => {
        // Start inspection
        const startResponse = await axios.post(
          `${this.baseURL}/api/dtam/inspections/start`,
          {
            farmId: this.testData.farmId,
            applicationId: this.testData.applicationId,
            inspectionType: 'online',
            scheduledDate: new Date().toISOString()
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.inspector}` }
          }
        );

        this.testData.inspectionId = startResponse.data.data.inspectionId;

        // Record findings
        await axios.post(
          `${this.baseURL}/api/dtam/inspections/record-findings`,
          {
            inspectionId: this.testData.inspectionId,
            findings: [
              {
                category: 'soil_management',
                status: 'compliant',
                notes: 'การจัดการดินเป็นไปตามมาตรฐาน GACP'
              },
              {
                category: 'water_management',
                status: 'compliant',
                notes: 'ระบบน้ำดี มีแหล่งน้ำสะอาด'
              },
              {
                category: 'pest_management',
                status: 'compliant',
                notes: 'ใช้วิธีป้องกันศัตรูพืชแบบชีววิธี'
              }
            ]
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.inspector}` }
          }
        );

        // Check compliance
        await axios.post(
          `${this.baseURL}/api/dtam/inspections/check-compliance`,
          {
            inspectionId: this.testData.inspectionId,
            criteria: [
              { code: 'GACP-01', compliant: true },
              { code: 'GACP-02', compliant: true },
              { code: 'GACP-03', compliant: true }
            ]
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.inspector}` }
          }
        );

        // Complete inspection
        const completeResponse = await axios.post(
          `${this.baseURL}/api/dtam/inspections/complete`,
          {
            inspectionId: this.testData.inspectionId,
            overallResult: 'pass',
            recommendations: ['ควรปรับปรุงระบบจัดเก็บบันทึก']
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.inspector}` }
          }
        );

        return startResponse.status === 201 && completeResponse.status === 200;
      }
    );
  }

  /**
   * UAT: พนักงานอนุมัติ (Approver Role)
   */
  async uatApproverRole() {
    console.log('\n✅ UAT: พนักงานอนุมัติ (Approver Role)');
    console.log('─'.repeat(80));

    // Login as Approver
    const loginResponse = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
      email: 'approver@dtam.go.th',
      password: 'DTAM123456!'
    });
    this.tokens.approver = loginResponse.data.token;

    // Scenario 1: Review and Approve Application
    await this.uatScenario(
      'roles',
      'approver',
      'UAT-A-001: พนักงานอนุมัติคำขอและออกใบรับรอง',
      async () => {
        // Review summary
        await axios.get(
          `${this.baseURL}/api/dtam/applications/${this.testData.applicationId}/summary`,
          {
            headers: { Authorization: `Bearer ${this.tokens.approver}` }
          }
        );

        // Approve
        await axios.post(
          `${this.baseURL}/api/dtam/approvals/approve`,
          {
            applicationId: this.testData.applicationId,
            decision: 'approved',
            comments: 'อนุมัติการรับรอง GACP',
            certificateValidity: '3_years'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.approver}` }
          }
        );

        // Generate certificate
        const certResponse = await axios.post(
          `${this.baseURL}/api/certificates/generate`,
          {
            applicationId: this.testData.applicationId,
            farmId: this.testData.farmId,
            validityPeriod: 3
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.approver}` }
          }
        );

        this.testData.certificateId = certResponse.data.data.certificateId;

        return certResponse.status === 201;
      }
    );
  }

  /**
   * UAT: ผู้ดูแลระบบ (Admin Role)
   */
  async uatAdminRole() {
    console.log('\n⚙️ UAT: ผู้ดูแลระบบ (Admin Role)');
    console.log('─'.repeat(80));

    // Login as Admin
    const loginResponse = await axios.post(`${this.baseURL}/api/auth/dtam/login`, {
      email: 'admin@dtam.go.th',
      password: 'Admin123456!'
    });
    this.tokens.admin = loginResponse.data.token;

    // Scenario 1: System Management
    await this.uatScenario(
      'roles',
      'admin',
      'UAT-ADM-001: ผู้ดูแลระบบจัดการผู้ใช้และตั้งค่า',
      async () => {
        // View dashboard
        await axios.get(`${this.baseURL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${this.tokens.admin}` }
        });

        // Create staff
        await axios.post(
          `${this.baseURL}/api/admin/staff/create`,
          {
            email: `staff_${Date.now()}@dtam.go.th`,
            firstName: 'สมหญิง',
            lastName: 'ทดสอบ',
            role: 'reviewer'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.admin}` }
          }
        );

        // Update settings
        await axios.put(
          `${this.baseURL}/api/admin/settings`,
          {
            maintenance_mode: false,
            max_applications_per_month: 100
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.admin}` }
          }
        );

        // Generate reports
        const reportResponse = await axios.post(
          `${this.baseURL}/api/admin/reports/generate`,
          {
            reportType: 'monthly_summary'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.admin}` }
          }
        );

        return reportResponse.status === 200;
      }
    );
  }

  /**
   * UAT: Auth/SSO System
   */
  async uatAuthSystem() {
    console.log('\n🔐 UAT: Auth/SSO System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'auth',
      'UAT-AUTH-001: ระบบ Authentication ทำงานถูกต้อง',
      async () => {
        // Test registration
        const regResponse = await axios.post(`${this.baseURL}/api/auth/register`, {
          email: `auth_test_${Date.now()}@test.com`,
          password: 'Test123456!',
          firstName: 'Test',
          lastName: 'Auth',
          role: 'farmer'
        });

        // Test login
        const loginResponse = await axios.post(`${this.baseURL}/api/auth/login`, {
          email: regResponse.data.data.email || `auth_test_${Date.now()}@test.com`,
          password: 'Test123456!'
        });

        // Test token validation
        const token = loginResponse.data.token;
        const validateResponse = await axios.get(`${this.baseURL}/api/farmer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return (
          regResponse.status === 201 &&
          loginResponse.status === 200 &&
          validateResponse.status === 200
        );
      }
    );
  }

  /**
   * UAT: GACP Application System
   */
  async uatGACPApplicationSystem() {
    console.log('\n📋 UAT: GACP Application System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'gacpApplication',
      'UAT-GACP-001: ระบบยื่นขอรับรอง GACP ครบวงจร',
      async () => {
        // Create, submit, track application
        const createResponse = await axios.post(
          `${this.baseURL}/api/applications/create`,
          {
            farmId: this.testData.farmId,
            applicationType: 'new'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        const appId = createResponse.data.data.applicationId;

        await axios.post(
          `${this.baseURL}/api/applications/${appId}/submit`,
          {},
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        const statusResponse = await axios.get(`${this.baseURL}/api/applications/${appId}/status`, {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        });

        return createResponse.status === 201 && statusResponse.status === 200;
      }
    );
  }

  /**
   * UAT: Farm Management System
   */
  async uatFarmManagementSystem() {
    console.log('\n🌾 UAT: Farm Management System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'farmManagement',
      'UAT-FARM-001: ระบบจัดการฟาร์มครบวงจร (CRUD)',
      async () => {
        // Create farm
        const createResponse = await axios.post(
          `${this.baseURL}/api/farm-management/farms`,
          {
            farmName: 'ฟาร์ม UAT Test',
            location: { province: 'กรุงเทพ', district: 'บางแค' },
            area: 5.0
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        const farmId = createResponse.data.data.farmId;

        // Read farm
        await axios.get(`${this.baseURL}/api/farm-management/farms/${farmId}`, {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        });

        // Update farm
        await axios.put(
          `${this.baseURL}/api/farm-management/farms/${farmId}`,
          { area: 6.0 },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        // Delete farm (with validation)
        const deleteResponse = await axios.delete(
          `${this.baseURL}/api/farm-management/farms/${farmId}`,
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return (
          createResponse.status === 201 &&
          (deleteResponse.status === 200 || deleteResponse.status === 403)
        );
      }
    );
  }

  /**
   * UAT: Track & Trace System
   */
  async uatTrackTraceSystem() {
    console.log('\n📍 UAT: Track & Trace System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'trackTrace',
      'UAT-TRACK-001: ระบบติดตามสถานะครบวงจร',
      async () => {
        const statusResponse = await axios.get(
          `${this.baseURL}/api/applications/${this.testData.applicationId}/status`,
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return statusResponse.status === 200 && statusResponse.data.data.status;
      }
    );
  }

  /**
   * UAT: Survey System (Standalone)
   */
  async uatSurveySystem() {
    console.log('\n📊 UAT: Survey System (Standalone)');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'survey',
      'UAT-SURVEY-001: ระบบแบบสอบถาม Standalone',
      async () => {
        const surveyResponse = await axios.post(
          `${this.baseURL}/api/survey/submit`,
          {
            surveyId: 'uat-survey',
            responses: { q1: 'answer1', q2: 'answer2' },
            region: 'กลาง'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return surveyResponse.status === 201;
      }
    );
  }

  /**
   * UAT: Standards Comparison System (Standalone)
   */
  async uatStandardsComparisonSystem() {
    console.log('\n⚖️ UAT: Standards Comparison System (Standalone)');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'standardsComparison',
      'UAT-STD-001: ระบบเปรียบเทียบมาตรฐาน Standalone',
      async () => {
        const comparisonResponse = await axios.post(
          `${this.baseURL}/api/standards-comparison/compare`,
          {
            standards: ['GACP', 'GAP', 'Organic', 'EU-GMP'],
            farmId: this.testData.farmId
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        return comparisonResponse.status === 200 && comparisonResponse.data.data.results;
      }
    );
  }

  /**
   * UAT: Document Management System
   */
  async uatDocumentManagementSystem() {
    console.log('\n📁 UAT: Document Management System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'documentManagement',
      'UAT-DOC-001: ระบบจัดการเอกสารครบวงจร',
      async () => {
        // Upload
        const uploadResponse = await axios.post(
          `${this.baseURL}/api/documents/upload`,
          {
            applicationId: this.testData.applicationId,
            documentType: 'uat_test_doc',
            fileName: 'uat_test.pdf'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.farmer}` }
          }
        );

        // Review
        await axios.post(
          `${this.baseURL}/api/dtam/documents/review`,
          {
            documentId: 'uat-doc-001',
            status: 'approved'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.reviewer}` }
          }
        );

        return uploadResponse.status === 201;
      }
    );
  }

  /**
   * UAT: Notification System
   */
  async uatNotificationSystem() {
    console.log('\n🔔 UAT: Notification System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'notification',
      'UAT-NOTIF-001: ระบบการแจ้งเตือนทำงานถูกต้อง',
      async () => {
        // Get notifications
        const notifResponse = await axios.get(`${this.baseURL}/api/notifications`, {
          headers: { Authorization: `Bearer ${this.tokens.farmer}` }
        });

        // Send notification (admin)
        await axios.post(
          `${this.baseURL}/api/admin/notifications/send`,
          {
            type: 'uat_test',
            message: 'UAT Test Notification'
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.admin}` }
          }
        );

        return notifResponse.status === 200;
      }
    );
  }

  /**
   * UAT: Certificate Generation System
   */
  async uatCertificateGenerationSystem() {
    console.log('\n🎓 UAT: Certificate Generation System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'certificate',
      'UAT-CERT-001: ระบบออกใบรับรองทำงานถูกต้อง',
      async () => {
        const certResponse = await axios.post(
          `${this.baseURL}/api/certificates/generate`,
          {
            applicationId: this.testData.applicationId,
            farmId: this.testData.farmId,
            validityPeriod: 3
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.approver}` }
          }
        );

        return certResponse.status === 201 && certResponse.data.data.certificateId;
      }
    );
  }

  /**
   * UAT: Reporting System
   */
  async uatReportingSystem() {
    console.log('\n📈 UAT: Reporting System');
    console.log('─'.repeat(80));

    await this.uatScenario(
      'systems',
      'reporting',
      'UAT-RPT-001: ระบบรายงานครบทุกประเภท',
      async () => {
        const reportResponse = await axios.post(
          `${this.baseURL}/api/admin/reports/generate`,
          {
            reportType: 'uat_monthly_summary',
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          },
          {
            headers: { Authorization: `Bearer ${this.tokens.admin}` }
          }
        );

        return reportResponse.status === 200 && reportResponse.data.data.reportId;
      }
    );
  }

  /**
   * UAT Scenario Helper
   */
  async uatScenario(category, type, name, testFunction) {
    const startTime = Date.now();
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      if (result) {
        this.uatResults[category][type].scenarios.push({
          name,
          status: 'PASS',
          duration: `${duration}ms`
        });
        this.uatResults[category][type].passed++;
        console.log(`  ✓ ${name} (${duration}ms)`);
      } else {
        throw new Error('Scenario returned false');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.uatResults[category][type].scenarios.push({
        name,
        status: 'FAIL',
        error: error.message,
        duration: `${duration}ms`
      });
      this.uatResults[category][type].failed++;
      console.log(`  ✗ ${name} (${error.message})`);
    }
  }

  /**
   * Generate UAT Report
   */
  generateUATReport() {
    console.log('\n\n📊 UAT FINAL REPORT');
    console.log('═'.repeat(80));

    // User Roles Report
    console.log('\n👥 USER ROLES UAT RESULTS:\n');
    Object.entries(this.uatResults.roles).forEach(([role, results]) => {
      const total = results.passed + results.failed;
      const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      console.log(`${this.getRoleIcon(role)} ${this.getRoleName(role)}`);
      console.log(
        `  ✓ Passed: ${results.passed} | ✗ Failed: ${results.failed} | Success: ${percentage}%`
      );
    });

    // Systems Report
    console.log('\n🔧 SYSTEMS UAT RESULTS:\n');
    Object.entries(this.uatResults.systems).forEach(([system, results]) => {
      const total = results.passed + results.failed;
      const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      console.log(`${this.getSystemIcon(system)} ${this.getSystemName(system)}`);
      console.log(
        `  ✓ Passed: ${results.passed} | ✗ Failed: ${results.failed} | Success: ${percentage}%`
      );
    });

    // Overall Summary
    let totalPassed = 0;
    let totalFailed = 0;

    Object.values(this.uatResults.roles).forEach(r => {
      totalPassed += r.passed;
      totalFailed += r.failed;
    });

    Object.values(this.uatResults.systems).forEach(r => {
      totalPassed += r.passed;
      totalFailed += r.failed;
    });

    const grandTotal = totalPassed + totalFailed;
    const overallPercentage = grandTotal > 0 ? ((totalPassed / grandTotal) * 100).toFixed(1) : 0;

    console.log('\n' + '─'.repeat(80));
    console.log('\n📈 OVERALL UAT RESULTS:');
    console.log(`  ✓ Total Passed: ${totalPassed}`);
    console.log(`  ✗ Total Failed: ${totalFailed}`);
    console.log(`  📊 Success Rate: ${overallPercentage}%`);
    console.log(`  📝 Total Scenarios: ${grandTotal}`);

    if (overallPercentage >= 90) {
      console.log('\n🎉 ✅ UAT PASSED! System ready for production!');
    } else if (overallPercentage >= 75) {
      console.log('\n⚠️  UAT NEEDS ATTENTION! Some scenarios require fixes.');
    } else {
      console.log('\n❌ UAT FAILED! Critical issues found.');
    }

    console.log(`\nEnd Time: ${new Date().toISOString()}`);
    console.log('═'.repeat(80) + '\n');
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
      admin: 'ผู้ดูแลระบบ (Admin)'
    };
    return names[role] || role;
  }

  getSystemIcon(system) {
    const icons = {
      auth: '🔐',
      gacpApplication: '📋',
      farmManagement: '🌾',
      trackTrace: '📍',
      survey: '📊',
      standardsComparison: '⚖️',
      documentManagement: '📁',
      notification: '🔔',
      certificate: '🎓',
      reporting: '📈'
    };
    return icons[system] || '🔧';
  }

  getSystemName(system) {
    const names = {
      auth: 'Auth/SSO System',
      gacpApplication: 'GACP Application System',
      farmManagement: 'Farm Management System',
      trackTrace: 'Track & Trace System',
      survey: 'Survey System (Standalone)',
      standardsComparison: 'Standards Comparison (Standalone)',
      documentManagement: 'Document Management',
      notification: 'Notification System',
      certificate: 'Certificate Generation',
      reporting: 'Reporting System'
    };
    return names[system] || system;
  }
}

// Export
module.exports = { GACPUATTester };

// Run if executed directly
if (require.main === module) {
  const tester = new GACPUATTester();
  tester.runAllUAT().catch(console.error);
}
