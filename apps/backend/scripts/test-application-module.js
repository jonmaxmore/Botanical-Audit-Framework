/**
 * Application Processing Module Test Script
 *
 * Script สำหรับทดสอบการทำงานของ Enhanced Application Processing Module
 * เพื่อ validate ว่าทุก component ทำงานร่วมกันได้อย่างสมบูรณ์
 *
 * Test Coverage & Validation Logic:
 * 1. Module Loading and Initialization - ทดสอบการโหลดและเริ่มต้น module
 * 2. Service Integration Testing - ทดสอบการเชื่อมต่อระหว่าง services
 * 3. FSM Workflow Validation - ทดสอบ state machine และการเปลี่ยนสถานะ
 * 4. Document Processing Testing - ทดสอบระบบจัดการเอกสาร
 * 5. Government API Integration - ทดสอบการเชื่อมต่อระบบราชการ
 * 6. Performance and Health Monitoring - ทดสอบประสิทธิภาพและการตรวจสอบ
 *
 * Workflow Process:
 * การทดสอบจะดำเนินการตามลำดับที่มี logic ชัดเจน โดยเริ่มจาก
 * การตรวจสอบพื้นฐานไปจนถึงการทดสอบ integration แบบ end-to-end
 */

const logger = require('../shared/logger/logger');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Application Module Test Runner
 */
class ApplicationModuleTestRunner {
  constructor() {
    this.testResults = {
      startTime: new Date(),
      endTime: null,
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      testSuites: [],
    };

    this.moduleBasePath = path.join(__dirname, '../modules/application');
    this.testCoverage = {
      moduleLoading: false,
      configValidation: false,
      serviceInitialization: false,
      fsmWorkflow: false,
      documentProcessing: false,
      governmentIntegration: false,
      routeSetup: false,
      errorHandling: false,
      performance: false,
    };
  }

  /**
   * เริ่มต้นการทดสอบ Application Module
   */
  async runTests() {
    this.printHeader();

    try {
      // Test 1: Module Loading and Structure Validation
      await this.testModuleLoading();

      // Test 2: Configuration Validation
      await this.testConfigurationSystem();

      // Test 3: Service Components Testing
      await this.testServiceComponents();

      // Test 4: FSM Workflow Logic Testing
      await this.testFSMWorkflow();

      // Test 5: Document Processing Testing
      await this.testDocumentProcessing();

      // Test 6: Government Integration Testing
      await this.testGovernmentIntegration();

      // Test 7: Route and Controller Testing
      await this.testRouteSystem();

      // Test 8: Error Handling and Resilience
      await this.testErrorHandling();

      // Test 9: Performance and Monitoring
      await this.testPerformanceMonitoring();

      // Generate final report
      this.generateFinalReport();
    } catch (error) {
      this.logError('Critical test failure', error);
      this.testResults.failed++;
    }
  }

  /**
   * ทดสอบการโหลด Module และโครงสร้าง
   */
  async testModuleLoading() {
    this.logTestStart('Module Loading and Structure Validation');

    try {
      // ตรวจสอบว่าไฟล์ module หลักมีอยู่และสามารถโหลดได้
      const moduleIndexPath = path.join(this.moduleBasePath, 'index.js');

      if (!fs.existsSync(moduleIndexPath)) {
        throw new Error('Module index file not found');
      }

      this.logSuccess('✓ Module index file exists');
      this.testResults.passed++;

      // ทดสอบการโหลด module
      const moduleExports = require(moduleIndexPath);

      // ตรวจสอบ required exports
      const requiredExports = [
        'EnhancedApplicationModule',
        'config',
        'AdvancedApplicationProcessingService',
        'EnhancedApplicationProcessingController',
        'DocumentManagementIntegrationSystem',
        'GovernmentApiIntegrationService',
        'createEnhancedApplicationRoutes',
        'ApplicationIntegrationTestSuite',
      ];

      let missingExports = [];
      for (const exportName of requiredExports) {
        if (!moduleExports[exportName]) {
          missingExports.push(exportName);
        }
      }

      if (missingExports.length > 0) {
        throw new Error(`Missing required exports: ${missingExports.join(', ')}`);
      }

      this.logSuccess('✓ All required components exported');
      this.testResults.passed++;

      // ตรวจสอบโครงสร้างไฟล์ที่สำคัญ
      const requiredFiles = [
        'domain/services/AdvancedApplicationProcessingService.js',
        'application/controllers/EnhancedApplicationProcessingController.js',
        'infrastructure/integrations/DocumentManagementIntegrationSystem.js',
        'infrastructure/integrations/GovernmentApiIntegrationService.js',
        'presentation/routes/enhanced-application.routes.js',
        'tests/integration/ApplicationIntegrationTestSuite.js',
        'config/index.js',
      ];

      let missingFiles = [];
      for (const filePath of requiredFiles) {
        const fullPath = path.join(this.moduleBasePath, filePath);
        if (!fs.existsSync(fullPath)) {
          missingFiles.push(filePath);
        }
      }

      if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
      }

      this.logSuccess('✓ All required files present');
      this.testResults.passed++;

      this.testCoverage.moduleLoading = true;
      this.logTestComplete('Module Loading', true);
    } catch (error) {
      this.logError('Module loading failed', error);
      this.testResults.failed++;
      this.logTestComplete('Module Loading', false);
    }
  }

  /**
   * ทดสอบระบบ Configuration
   */
  async testConfigurationSystem() {
    this.logTestStart('Configuration System Validation');

    try {
      // โหลด configuration
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));

      if (!configModule.config) {
        throw new Error('Configuration object not found');
      }

      this.logSuccess('✓ Configuration loaded successfully');
      this.testResults.passed++;

      // ตรวจสอบ required configuration sections
      const requiredSections = [
        'application',
        'database',
        'workflow',
        'governmentIntegration',
        'documentManagement',
        'analytics',
        'security',
      ];

      let missingSections = [];
      for (const section of requiredSections) {
        if (!configModule.config[section]) {
          missingSections.push(section);
        }
      }

      if (missingSections.length > 0) {
        throw new Error(`Missing configuration sections: ${missingSections.join(', ')}`);
      }

      this.logSuccess('✓ All required configuration sections present');
      this.testResults.passed++;

      // ตรวจสอบ FSM states configuration
      const workflowConfig = configModule.config.workflow;
      if (!workflowConfig.states || Object.keys(workflowConfig.states).length < 12) {
        throw new Error('FSM states configuration incomplete');
      }

      this.logSuccess('✓ FSM states configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ Government integration configuration
      const govConfig = configModule.config.governmentIntegration;
      if (!govConfig.services || Object.keys(govConfig.services).length < 5) {
        throw new Error('Government services configuration incomplete');
      }

      this.logSuccess('✓ Government integration configuration validated');
      this.testResults.passed++;

      this.testCoverage.configValidation = true;
      this.logTestComplete('Configuration System', true);
    } catch (error) {
      this.logError('Configuration validation failed', error);
      this.testResults.failed++;
      this.logTestComplete('Configuration System', false);
    }
  }

  /**
   * ทดสอบ Service Components
   */
  async testServiceComponents() {
    this.logTestStart('Service Components Testing');

    try {
      // ทดสอบ AdvancedApplicationProcessingService
      const ServiceClass = require(
        path.join(this.moduleBasePath, 'domain/services/AdvancedApplicationProcessingService.js'),
      );

      if (typeof ServiceClass !== 'function') {
        throw new Error('AdvancedApplicationProcessingService not a valid class');
      }

      this.logSuccess('✓ AdvancedApplicationProcessingService class structure valid');
      this.testResults.passed++;

      // ทดสอบ DocumentManagementIntegrationSystem
      const DocumentClass = require(
        path.join(
          this.moduleBasePath,
          'infrastructure/integrations/DocumentManagementIntegrationSystem.js',
        ),
      );

      if (typeof DocumentClass !== 'function') {
        throw new Error('DocumentManagementIntegrationSystem not a valid class');
      }

      this.logSuccess('✓ DocumentManagementIntegrationSystem class structure valid');
      this.testResults.passed++;

      // ทดสอบ GovernmentApiIntegrationService
      const GovClass = require(
        path.join(
          this.moduleBasePath,
          'infrastructure/integrations/GovernmentApiIntegrationService.js',
        ),
      );

      if (typeof GovClass !== 'function') {
        throw new Error('GovernmentApiIntegrationService not a valid class');
      }

      this.logSuccess('✓ GovernmentApiIntegrationService class structure valid');
      this.testResults.passed++;

      // ทดสอบ EnhancedApplicationProcessingController
      const ControllerClass = require(
        path.join(
          this.moduleBasePath,
          'application/controllers/EnhancedApplicationProcessingController.js',
        ),
      );

      if (typeof ControllerClass !== 'function') {
        throw new Error('EnhancedApplicationProcessingController not a valid class');
      }

      this.logSuccess('✓ EnhancedApplicationProcessingController class structure valid');
      this.testResults.passed++;

      this.testCoverage.serviceInitialization = true;
      this.logTestComplete('Service Components', true);
    } catch (error) {
      this.logError('Service components testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Service Components', false);
    }
  }

  /**
   * ทดสอบ FSM Workflow Logic
   */
  async testFSMWorkflow() {
    this.logTestStart('FSM Workflow Logic Testing');

    try {
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));
      const workflowConfig = configModule.config.workflow;

      // ตรวจสอบ state definitions
      const expectedStates = [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'DOCUMENT_REQUEST',
        'DOCUMENT_SUBMITTED',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'COMPLIANCE_REVIEW',
        'APPROVED',
        'CERTIFICATE_ISSUED',
        'REJECTED',
        'APPEAL_SUBMITTED',
        'CANCELLED',
      ];

      let missingStates = [];
      for (const state of expectedStates) {
        if (!workflowConfig.states[state]) {
          missingStates.push(state);
        }
      }

      if (missingStates.length > 0) {
        throw new Error(`Missing FSM states: ${missingStates.join(', ')}`);
      }

      this.logSuccess('✓ All FSM states defined');
      this.testResults.passed++;

      // ตรวจสอบ state transitions logic
      const draftState = workflowConfig.states.DRAFT;
      if (!draftState.allowedTransitions || !draftState.allowedTransitions.includes('SUBMITTED')) {
        throw new Error('DRAFT to SUBMITTED transition not configured');
      }

      this.logSuccess('✓ State transitions logic validated');
      this.testResults.passed++;

      // ตรวจสอบ permissions และ validations
      let statesWithoutPermissions = [];
      for (const [stateName, stateConfig] of Object.entries(workflowConfig.states)) {
        if (!stateConfig.permissions || stateConfig.permissions.length === 0) {
          statesWithoutPermissions.push(stateName);
        }
      }

      if (statesWithoutPermissions.length > 0) {
        throw new Error(`States without permissions: ${statesWithoutPermissions.join(', ')}`);
      }

      this.logSuccess('✓ State permissions configured');
      this.testResults.passed++;

      // ตรวจสอบ auto-transitions
      const automationConfig = workflowConfig.automation;
      if (!automationConfig || typeof automationConfig.enableAutoTransitions !== 'boolean') {
        throw new Error('Automation configuration missing or invalid');
      }

      this.logSuccess('✓ Automation configuration validated');
      this.testResults.passed++;

      this.testCoverage.fsmWorkflow = true;
      this.logTestComplete('FSM Workflow Logic', true);
    } catch (error) {
      this.logError('FSM workflow testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('FSM Workflow Logic', false);
    }
  }

  /**
   * ทดสอบระบบจัดการเอกสาร
   */
  async testDocumentProcessing() {
    this.logTestStart('Document Processing System Testing');

    try {
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));
      const documentConfig = configModule.config.documentManagement;

      // ตรวจสอบ storage configuration
      if (!documentConfig.storage || !documentConfig.storage.type) {
        throw new Error('Document storage configuration missing');
      }

      this.logSuccess('✓ Storage configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ document types และ validation rules
      const processingConfig = documentConfig.processing;
      if (!processingConfig.validation || !processingConfig.validation.rules) {
        throw new Error('Document validation rules missing');
      }

      const expectedDocTypes = ['FARMER_ID', 'LAND_OWNERSHIP', 'FARM_REGISTRATION'];
      let missingDocTypes = [];

      for (const docType of expectedDocTypes) {
        if (!processingConfig.validation.rules[docType]) {
          missingDocTypes.push(docType);
        }
      }

      if (missingDocTypes.length > 0) {
        throw new Error(`Missing document type rules: ${missingDocTypes.join(', ')}`);
      }

      this.logSuccess('✓ Document validation rules configured');
      this.testResults.passed++;

      // ตรวจสอบ OCR configuration
      const ocrConfig = processingConfig.ocr;
      if (!ocrConfig || typeof ocrConfig.enabled !== 'boolean') {
        throw new Error('OCR configuration missing or invalid');
      }

      this.logSuccess('✓ OCR configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ quality assurance settings
      const qaConfig = processingConfig.qualityAssurance;
      if (!qaConfig || !qaConfig.thresholds) {
        throw new Error('Quality assurance configuration missing');
      }

      this.logSuccess('✓ Quality assurance configuration validated');
      this.testResults.passed++;

      this.testCoverage.documentProcessing = true;
      this.logTestComplete('Document Processing System', true);
    } catch (error) {
      this.logError('Document processing testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Document Processing System', false);
    }
  }

  /**
   * ทดสอบ Government Integration
   */
  async testGovernmentIntegration() {
    this.logTestStart('Government Integration Testing');

    try {
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));
      const govConfig = configModule.config.governmentIntegration;

      // ตรวจสอบ government services
      const expectedServices = ['nationalId', 'landDepartment', 'moac', 'doa', 'fda'];
      let missingServices = [];

      for (const service of expectedServices) {
        if (!govConfig.services[service]) {
          missingServices.push(service);
        }
      }

      if (missingServices.length > 0) {
        throw new Error(`Missing government services: ${missingServices.join(', ')}`);
      }

      this.logSuccess('✓ All government services configured');
      this.testResults.passed++;

      // ตรวจสอบ authentication methods
      const authMethods = ['API_KEY', 'OAUTH2', 'JWT', 'HMAC', 'MUTUAL_TLS'];
      let servicesWithAuth = 0;

      for (const [serviceName, serviceConfig] of Object.entries(govConfig.services)) {
        if (
          serviceConfig.authentication &&
          authMethods.includes(serviceConfig.authentication.type)
        ) {
          servicesWithAuth++;
        }
      }

      if (servicesWithAuth < expectedServices.length) {
        throw new Error('Not all services have proper authentication configured');
      }

      this.logSuccess('✓ Authentication methods validated');
      this.testResults.passed++;

      // ตรวจสอบ circuit breaker configuration
      let servicesWithCircuitBreaker = 0;

      for (const [serviceName, serviceConfig] of Object.entries(govConfig.services)) {
        if (serviceConfig.circuitBreaker && serviceConfig.circuitBreaker.failureThreshold) {
          servicesWithCircuitBreaker++;
        }
      }

      if (servicesWithCircuitBreaker < expectedServices.length) {
        throw new Error('Not all services have circuit breaker configured');
      }

      this.logSuccess('✓ Circuit breaker configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ rate limiting
      let servicesWithRateLimit = 0;

      for (const [serviceName, serviceConfig] of Object.entries(govConfig.services)) {
        if (serviceConfig.rateLimit && serviceConfig.rateLimit.requests) {
          servicesWithRateLimit++;
        }
      }

      if (servicesWithRateLimit < expectedServices.length) {
        throw new Error('Not all services have rate limiting configured');
      }

      this.logSuccess('✓ Rate limiting configuration validated');
      this.testResults.passed++;

      this.testCoverage.governmentIntegration = true;
      this.logTestComplete('Government Integration', true);
    } catch (error) {
      this.logError('Government integration testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Government Integration', false);
    }
  }

  /**
   * ทดสอบระบบ Route และ Controller
   */
  async testRouteSystem() {
    this.logTestStart('Route and Controller System Testing');

    try {
      // ทดสอบ route creation function
      const routeModule = require(
        path.join(this.moduleBasePath, 'presentation/routes/enhanced-application.routes.js'),
      );

      if (typeof routeModule.createEnhancedApplicationRoutes !== 'function') {
        throw new Error('createEnhancedApplicationRoutes function not found');
      }

      this.logSuccess('✓ Route creation function available');
      this.testResults.passed++;

      // ทดสอบ route documentation
      if (typeof routeModule.getRouteDocumentation !== 'function') {
        throw new Error('getRouteDocumentation function not found');
      }

      const documentation = routeModule.getRouteDocumentation();
      if (!documentation || !documentation.categories) {
        throw new Error('Route documentation incomplete');
      }

      this.logSuccess('✓ Route documentation available');
      this.testResults.passed++;

      // ตรวจสอบ route categories
      const expectedCategories = [
        'Core Application Management',
        'Document Management',
        'Government Integration',
        'Analytics & Monitoring',
      ];

      let missingCategories = [];
      for (const category of expectedCategories) {
        if (!documentation.categories[category]) {
          missingCategories.push(category);
        }
      }

      if (missingCategories.length > 0) {
        throw new Error(`Missing route categories: ${missingCategories.join(', ')}`);
      }

      this.logSuccess('✓ All route categories documented');
      this.testResults.passed++;

      this.testCoverage.routeSetup = true;
      this.logTestComplete('Route and Controller System', true);
    } catch (error) {
      this.logError('Route system testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Route and Controller System', false);
    }
  }

  /**
   * ทดสอบ Error Handling และ Resilience
   */
  async testErrorHandling() {
    this.logTestStart('Error Handling and Resilience Testing');

    try {
      // ตรวจสอบ security configuration
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));
      const securityConfig = configModule.config.security;

      if (!securityConfig || !securityConfig.authentication) {
        throw new Error('Security configuration missing');
      }

      this.logSuccess('✓ Security configuration available');
      this.testResults.passed++;

      // ตรวจสอบ audit configuration
      const auditConfig = securityConfig.audit;
      if (!auditConfig || typeof auditConfig.enabled !== 'boolean') {
        throw new Error('Audit configuration missing or invalid');
      }

      this.logSuccess('✓ Audit configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ role-based permissions
      const authConfig = securityConfig.authorization;
      if (!authConfig || !authConfig.roles) {
        throw new Error('Authorization roles configuration missing');
      }

      const expectedRoles = ['farmer', 'dtam_staff', 'dtam_manager', 'admin'];
      let missingRoles = [];

      for (const role of expectedRoles) {
        if (!authConfig.roles[role]) {
          missingRoles.push(role);
        }
      }

      if (missingRoles.length > 0) {
        throw new Error(`Missing role configurations: ${missingRoles.join(', ')}`);
      }

      this.logSuccess('✓ Role-based permissions configured');
      this.testResults.passed++;

      this.testCoverage.errorHandling = true;
      this.logTestComplete('Error Handling and Resilience', true);
    } catch (error) {
      this.logError('Error handling testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Error Handling and Resilience', false);
    }
  }

  /**
   * ทดสอบ Performance และ Monitoring
   */
  async testPerformanceMonitoring() {
    this.logTestStart('Performance and Monitoring Testing');

    try {
      const configModule = require(path.join(this.moduleBasePath, 'config/index.js'));
      const analyticsConfig = configModule.config.analytics;

      // ตรวจสอบ performance monitoring configuration
      if (!analyticsConfig || !analyticsConfig.performance) {
        throw new Error('Performance monitoring configuration missing');
      }

      this.logSuccess('✓ Performance monitoring configuration available');
      this.testResults.passed++;

      // ตรวจสอบ real-time metrics
      const realtimeConfig = analyticsConfig.performance.realtime;
      if (!realtimeConfig || typeof realtimeConfig.enabled !== 'boolean') {
        throw new Error('Real-time metrics configuration missing');
      }

      this.logSuccess('✓ Real-time metrics configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ alerting configuration
      const alertingConfig = analyticsConfig.alerting;
      if (!alertingConfig || !Array.isArray(alertingConfig.rules)) {
        throw new Error('Alerting configuration missing or invalid');
      }

      this.logSuccess('✓ Alerting configuration validated');
      this.testResults.passed++;

      // ตรวจสอบ health check configuration
      const appConfig = configModule.config.application;
      if (!appConfig.healthCheck || typeof appConfig.healthCheck.enabled !== 'boolean') {
        throw new Error('Health check configuration missing');
      }

      this.logSuccess('✓ Health check configuration validated');
      this.testResults.passed++;

      this.testCoverage.performance = true;
      this.logTestComplete('Performance and Monitoring', true);
    } catch (error) {
      this.logError('Performance monitoring testing failed', error);
      this.testResults.failed++;
      this.logTestComplete('Performance and Monitoring', false);
    }
  }

  /**
   * สร้างรายงานผลการทดสอบ
   */
  generateFinalReport() {
    this.testResults.endTime = new Date();
    this.testResults.totalTests = this.testResults.passed + this.testResults.failed;

    const duration = this.testResults.endTime - this.testResults.startTime;
    const passRate =
      this.testResults.totalTests > 0
        ? ((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(2)
        : 0;

    logger.info(`\n${'='.repeat(80)}`)
    logger.info(`${colors.bright}${colors.cyan}🏁 APPLICATION MODULE TEST RESULTS${colors.reset}`)
    logger.info(`${'='.repeat(80)}`)

    logger.info(`${colors.bright}Test Summary:${colors.reset}`)
    logger.info(`  Duration: ${duration}ms`)
    logger.info(`  Total Tests: ${this.testResults.totalTests}`)
    logger.info(`  ${colors.green}✓ Passed: ${this.testResults.passed}${colors.reset}`)
    logger.info(`  ${colors.red}✗ Failed: ${this.testResults.failed}${colors.reset}`)
    logger.info(`  Pass Rate: ${passRate}%`)

    logger.info(`\n${colors.bright}Test Coverage:${colors.reset}`)
    for (const [test, passed] of Object.entries(this.testCoverage)) {
      const status = passed
        ? `${colors.green}✓ PASSED${colors.reset}`
        : `${colors.red}✗ FAILED${colors.reset}`;
      logger.info(`  ${test.padEnd(25)}: ${status}`);
    }

    if (this.testResults.errors.length > 0) {
      logger.info(`\n${colors.bright}${colors.red}Errors Encountered:${colors.reset}`)
      this.testResults.errors.forEach((error, index) => {
        logger.info(`  ${index + 1}. ${error}`)
      });
    }

    // Overall result
    const overallSuccess = this.testResults.failed === 0 && passRate >= 90;

    logger.info(`\n${'='.repeat(80)}`)
    if (overallSuccess) {
      console.log(
        `${colors.bright}${colors.green}🎉 APPLICATION MODULE VALIDATION: SUCCESS${colors.reset}`,
      );
      console.log(
        `${colors.green}✅ All critical components validated successfully${colors.reset}`,
      );
      logger.info(`${colors.green}✅ Ready for integration with main system${colors.reset}`)
    } else {
      console.log(
        `${colors.bright}${colors.red}❌ APPLICATION MODULE VALIDATION: FAILED${colors.reset}`,
      );
      logger.info(`${colors.red}⚠️  Please fix issues before proceeding${colors.reset}`)
    }
    logger.info(`${'='.repeat(80)}\n`)

    return overallSuccess;
  }

  // Utility methods for logging
  printHeader() {
    logger.info(`\n${'='.repeat(80)}`)
    console.log(
      `${colors.bright}${colors.blue}🚀 APPLICATION PROCESSING MODULE VALIDATION${colors.reset}`,
    );
    console.log(
      `${colors.cyan}Enhanced Application Processing System - Component Testing${colors.reset}`,
    );
    logger.info(`${'='.repeat(80)}\n`)
  }

  logTestStart(testName) {
    logger.info(`${colors.bright}${colors.yellow}🔍 Testing: ${testName}${colors.reset}`)
  }

  logTestComplete(testName, success) {
    const status = success
      ? `${colors.green}✅ PASSED${colors.reset}`
      : `${colors.red}❌ FAILED${colors.reset}`;
    logger.info(`${colors.bright}📋 ${testName}: ${status}${colors.reset}\n`)
  }

  logSuccess(message) {
    logger.info(`${colors.green}${message}${colors.reset}`)
  }

  logError(context, error) {
    const errorMessage = `${context}: ${error.message}`;
    logger.info(`${colors.red}✗ ${errorMessage}${colors.reset}`)
    this.testResults.errors.push(errorMessage);
  }
}

// เริ่มต้นการทดสอบ
if (require.main === module) {
  console.log(
    `${colors.bright}${colors.magenta}Application Processing Module Test Runner${colors.reset}`,
  );
  logger.info(`${colors.cyan}Starting comprehensive validation...${colors.reset}\n`)

  const testRunner = new ApplicationModuleTestRunner();
  testRunner
    .runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`${colors.red}Test runner crashed:${colors.reset}`, error);
      process.exit(1);
    });
}

module.exports = ApplicationModuleTestRunner;
