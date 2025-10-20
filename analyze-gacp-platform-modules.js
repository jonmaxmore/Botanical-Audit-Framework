/**
 * GACP Platform Complete Module Status Analyzer
 *
 * Analyzes all 6 core services of the GACP Platform:
 * 1) ระบบสมาชิก (User Management System)
 * 2) ระบบยื่นเอกสารขอใบรับรองการปลูก (Application Processing System)
 * 3) ระบบบริหารจัดการฟาร์ม (Farm Management System)
 * 4) ระบบตรวจสอบย้อนกลับ (Track & Trace System)
 * 5) ระบบตอบแบบสอบถาม (Survey System)
 * 6) ระบบเปรียบเทียบมาตรฐาน GACP (Standards Comparison System)
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./apps/backend/shared');
const appLogger = logger.createLogger('gacp-analyzer');

class GACPPlatformModuleAnalyzer {
  constructor() {
    this.moduleMapping = {
      'user-management': {
        name: '1) ระบบสมาชิก (User Management)',
        description: 'จัดการสมาชิก, การเข้าสู่ระบบ, สิทธิการใช้งาน',
        expectedComponents: ['authentication', 'authorization', 'user-profile', 'role-management'],
      },
      application: {
        name: '2) ระบบยื่นเอกสารขอใบรับรองการปลูก (Application Processing)',
        description: 'รับคำขอ, ตรวจสอบเอกสาร, อนุมัติใบรับรอง',
        expectedComponents: [
          'application-submission',
          'document-verification',
          'approval-workflow',
          'certificate-generation',
        ],
      },
      'farm-management': {
        name: '3) ระบบบริหารจัดการฟาร์ม (Farm Management)',
        description: 'จัดการข้อมูลฟาร์ม, แปลงปลูก, การผลิต',
        expectedComponents: [
          'farm-registration',
          'plot-management',
          'production-tracking',
          'inventory-management',
        ],
      },
      'track-trace': {
        name: '4) ระบบตรวจสอบย้อนกลับ (Track & Trace)',
        description: 'ติดตามการปลูก, การเก็บเกี่ยว, การขนส่ง',
        expectedComponents: [
          'seed-tracking',
          'growth-monitoring',
          'harvest-tracking',
          'supply-chain',
        ],
      },
      'survey-system': {
        name: '5) ระบบตอบแบบสอบถาม (Survey System)',
        description: 'สร้างแบบสอบถาม, เก็บข้อมูล, วิเคราะห์ผล',
        expectedComponents: ['survey-builder', 'response-collection', 'data-analysis', 'reporting'],
      },
      'standards-comparison': {
        name: '6) ระบบเปรียบเทียบมาตรฐาน GACP (Standards Comparison)',
        description: 'เปรียบเทียบมาตรฐาน, ประเมินคุณภาพ, แนะนำการปรับปรุง',
        expectedComponents: [
          'standards-database',
          'comparison-engine',
          'assessment-tools',
          'recommendations',
        ],
      },
    };

    this.moduleStatus = {};
    this.basePath = path.join(process.cwd(), 'apps', 'backend', 'modules');
  }

  /**
   * Analyze all GACP Platform modules
   */
  async analyzeAllModules() {
    appLogger.info('🔍 GACP PLATFORM MODULE STATUS ANALYSIS');
    appLogger.info('============================================================\n');

    // Check each core module
    for (const [moduleKey, moduleInfo] of Object.entries(this.moduleMapping)) {
      appLogger.info(`📋 Analyzing: ${moduleInfo.name}`);
      const status = await this.analyzeModule(moduleKey, moduleInfo);
      this.moduleStatus[moduleKey] = status;

      appLogger.info(`   📊 Status: ${status.overallStatus}`);
      appLogger.info(`   📁 Files: ${status.fileCount} files (${status.totalSize}KB)`);
      appLogger.info(`   🎯 Completion: ${status.completionPercentage}%`);
      appLogger.info(`   ⚠️  Issues: ${status.issues.length}`);
      appLogger.info('');
    }

    // Generate summary report
    this.generateSummaryReport();

    // Save detailed report
    await this.saveDetailedReport();
  }

  /**
   * Analyze individual module
   */
  async analyzeModule(moduleKey, moduleInfo) {
    const modulePath = path.join(this.basePath, moduleKey);

    const status = {
      name: moduleInfo.name,
      description: moduleInfo.description,
      exists: false,
      fileCount: 0,
      totalSize: 0,
      components: {
        domain: { exists: false, files: [] },
        application: { exists: false, files: [] },
        infrastructure: { exists: false, files: [] },
        presentation: { exists: false, files: [] },
        services: { exists: false, files: [] },
      },
      businessLogic: {
        implemented: false,
        coverage: 0,
        details: [],
      },
      apiEndpoints: {
        implemented: false,
        count: 0,
        routes: [],
      },
      completionPercentage: 0,
      overallStatus: 'NOT_IMPLEMENTED',
      issues: [],
      recommendations: [],
    };

    try {
      // Check if module directory exists
      if (fs.existsSync(modulePath)) {
        status.exists = true;

        // Analyze module structure
        await this.analyzeModuleStructure(modulePath, status);

        // Calculate completion percentage
        status.completionPercentage = this.calculateCompletionPercentage(status);

        // Determine overall status
        status.overallStatus = this.determineOverallStatus(status.completionPercentage);

        // Identify issues and recommendations
        status.issues = this.identifyIssues(status);
        status.recommendations = this.generateRecommendations(status);
      } else {
        status.issues.push('Module directory not found');
        status.recommendations.push('Create module directory structure');
      }
    } catch (error) {
      status.issues.push(`Analysis error: ${error.message}`);
    }

    return status;
  }

  /**
   * Analyze module directory structure
   */
  async analyzeModuleStructure(modulePath, status) {
    const components = ['domain', 'application', 'infrastructure', 'presentation', 'services'];

    for (const component of components) {
      const componentPath = path.join(modulePath, component);

      if (fs.existsSync(componentPath)) {
        status.components[component].exists = true;
        status.components[component].files = await this.getFilesInDirectory(componentPath);

        // Count files and calculate size
        for (const file of status.components[component].files) {
          const filePath = path.join(componentPath, file);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            status.fileCount++;
            status.totalSize += Math.round((fs.statSync(filePath).size / 1024) * 10) / 10;
          }
        }
      }
    }

    // Check for business logic implementation
    status.businessLogic = this.analyzeBusinessLogic(status.components);

    // Check for API endpoints
    status.apiEndpoints = this.analyzeApiEndpoints(status.components);
  }

  /**
   * Get all files in directory recursively
   */
  async getFilesInDirectory(dirPath) {
    const files = [];

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile() && item.endsWith('.js')) {
          files.push(item);
        } else if (stat.isDirectory()) {
          const subFiles = await this.getFilesInDirectory(itemPath);
          files.push(...subFiles.map(f => `${item}/${f}`));
        }
      }
    } catch (error) {
      // Directory access error
    }

    return files;
  }

  /**
   * Analyze business logic implementation
   */
  analyzeBusinessLogic(components) {
    const businessLogic = {
      implemented: false,
      coverage: 0,
      details: [],
    };

    let totalComponents = 0;
    let implementedComponents = 0;

    // Check domain layer
    if (components.domain.exists && components.domain.files.length > 0) {
      totalComponents++;
      implementedComponents++;
      businessLogic.details.push('Domain entities implemented');
    } else {
      businessLogic.details.push('Missing domain entities');
    }

    // Check application layer
    if (components.application.exists && components.application.files.length > 0) {
      totalComponents++;
      implementedComponents++;
      businessLogic.details.push('Use cases implemented');
    } else {
      businessLogic.details.push('Missing use cases');
    }

    // Check services
    if (components.services.exists && components.services.files.length > 0) {
      totalComponents++;
      implementedComponents++;
      businessLogic.details.push('Services implemented');
    } else {
      businessLogic.details.push('Missing services');
    }

    businessLogic.coverage =
      totalComponents > 0 ? Math.round((implementedComponents / totalComponents) * 100) : 0;
    businessLogic.implemented = businessLogic.coverage >= 60;

    return businessLogic;
  }

  /**
   * Analyze API endpoints implementation
   */
  analyzeApiEndpoints(components) {
    const apiEndpoints = {
      implemented: false,
      count: 0,
      routes: [],
    };

    if (components.presentation.exists) {
      const routeFiles = components.presentation.files.filter(
        f => f.includes('route') || f.includes('controller')
      );

      apiEndpoints.count = routeFiles.length;
      apiEndpoints.routes = routeFiles;
      apiEndpoints.implemented = routeFiles.length > 0;
    }

    return apiEndpoints;
  }

  /**
   * Calculate module completion percentage
   */
  calculateCompletionPercentage(status) {
    let score = 0;
    let maxScore = 100;

    // Module exists (20 points)
    if (status.exists) score += 20;

    // Component structure (40 points)
    const componentTypes = ['domain', 'application', 'infrastructure', 'presentation'];
    const componentScore = componentTypes.filter(
      type => status.components[type].exists && status.components[type].files.length > 0
    ).length;
    score += (componentScore / componentTypes.length) * 40;

    // Business logic (25 points)
    score += (status.businessLogic.coverage / 100) * 25;

    // API endpoints (15 points)
    if (status.apiEndpoints.implemented) score += 15;

    return Math.round(score);
  }

  /**
   * Determine overall status based on completion
   */
  determineOverallStatus(completionPercentage) {
    if (completionPercentage >= 90) return 'COMPLETE';
    if (completionPercentage >= 70) return 'MOSTLY_COMPLETE';
    if (completionPercentage >= 40) return 'IN_PROGRESS';
    if (completionPercentage >= 10) return 'STARTED';
    return 'NOT_IMPLEMENTED';
  }

  /**
   * Identify issues in module implementation
   */
  identifyIssues(status) {
    const issues = [];

    if (!status.exists) {
      issues.push('Module directory not found');
      return issues;
    }

    if (!status.components.domain.exists) {
      issues.push('Missing domain layer');
    }

    if (!status.components.application.exists) {
      issues.push('Missing application layer');
    }

    if (!status.businessLogic.implemented) {
      issues.push('Insufficient business logic implementation');
    }

    if (!status.apiEndpoints.implemented) {
      issues.push('No API endpoints found');
    }

    if (status.fileCount < 3) {
      issues.push('Very few implementation files');
    }

    return issues;
  }

  /**
   * Generate recommendations for module improvement
   */
  generateRecommendations(status) {
    const recommendations = [];

    if (!status.exists) {
      recommendations.push('Create module directory structure');
      recommendations.push('Implement Clean Architecture layers');
      return recommendations;
    }

    if (status.completionPercentage < 50) {
      recommendations.push('Focus on core business logic implementation');
      recommendations.push('Create essential domain entities and use cases');
    }

    if (!status.components.domain.exists) {
      recommendations.push('Implement domain entities and business rules');
    }

    if (!status.apiEndpoints.implemented) {
      recommendations.push('Create REST API endpoints and controllers');
    }

    if (status.issues.length > 2) {
      recommendations.push('Comprehensive module restructuring needed');
    } else if (status.completionPercentage >= 70) {
      recommendations.push('Focus on testing and optimization');
      recommendations.push('Ready for integration testing');
    }

    return recommendations;
  }

  /**
   * Generate summary report of all modules
   */
  generateSummaryReport() {
    appLogger.info('\n📊 GACP PLATFORM MODULE SUMMARY');
    appLogger.info('============================================================\n');

    const moduleEntries = Object.entries(this.moduleStatus);
    const totalModules = moduleEntries.length;
    const implementedModules = moduleEntries.filter(([key, status]) => status.exists).length;
    const completeModules = moduleEntries.filter(
      ([key, status]) => status.overallStatus === 'COMPLETE'
    ).length;

    appLogger.info(`🎯 Platform Overview:`);
    appLogger.info(`   📋 Total Modules: ${totalModules}`);
    appLogger.info(`   ✅ Implemented: ${implementedModules}/${totalModules}`);
    appLogger.info(`   🎖️ Complete: ${completeModules}/${totalModules}`);
    appLogger.info(
      `   📊 Platform Completion: ${Math.round((completeModules / totalModules) * 100)}%\n`
    );

    appLogger.info('📈 Module Status Breakdown:');
    for (const [key, status] of moduleEntries) {
      const statusIcon = this.getStatusIcon(status.overallStatus);
      appLogger.info(`   ${statusIcon} ${status.name}`);
      appLogger.info(`      Status: ${status.overallStatus} (${status.completionPercentage}%)`);
      appLogger.info(`      Files: ${status.fileCount} files (${status.totalSize}KB)`);
      if (status.issues.length > 0) {
        appLogger.info(
          `      Issues: ${status.issues.slice(0, 2).join(', ')}${status.issues.length > 2 ? '...' : ''}`
        );
      }
      appLogger.info('');
    }

    // Priority recommendations
    appLogger.info('🎯 Priority Actions:');
    const notImplemented = moduleEntries.filter(([key, status]) => !status.exists);
    const needWork = moduleEntries.filter(
      ([key, status]) => status.exists && status.completionPercentage < 70
    );

    if (notImplemented.length > 0) {
      appLogger.info(
        `   🚨 Implement missing modules: ${notImplemented.map(([key, status]) => key).join(', ')}`
      );
    }

    if (needWork.length > 0) {
      appLogger.info(
        `   ⚠️  Complete modules needing work: ${needWork.map(([key, status]) => key).join(', ')}`
      );
    }

    appLogger.info('\n============================================================');
  }

  /**
   * Get status icon for display
   */
  getStatusIcon(status) {
    switch (status) {
      case 'COMPLETE':
        return '✅';
      case 'MOSTLY_COMPLETE':
        return '🟡';
      case 'IN_PROGRESS':
        return '🟠';
      case 'STARTED':
        return '🔵';
      case 'NOT_IMPLEMENTED':
        return '❌';
      default:
        return '⚪';
    }
  }

  /**
   * Save detailed analysis report to file
   */
  async saveDetailedReport() {
    const reportPath = path.join(process.cwd(), 'GACP_PLATFORM_MODULE_ANALYSIS.json');

    const report = {
      analysisDate: new Date().toISOString(),
      platformSummary: {
        totalModules: Object.keys(this.moduleStatus).length,
        implementedModules: Object.values(this.moduleStatus).filter(s => s.exists).length,
        completeModules: Object.values(this.moduleStatus).filter(
          s => s.overallStatus === 'COMPLETE'
        ).length,
        overallCompletion: Math.round(
          Object.values(this.moduleStatus).reduce((sum, s) => sum + s.completionPercentage, 0) /
            Object.keys(this.moduleStatus).length
        ),
      },
      modules: this.moduleStatus,
      recommendations: this.generatePlatformRecommendations(),
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    appLogger.info(`📄 Detailed analysis saved to: ${reportPath}`);
  }

  /**
   * Generate platform-wide recommendations
   */
  generatePlatformRecommendations() {
    const moduleEntries = Object.entries(this.moduleStatus);
    const recommendations = [];

    const notImplemented = moduleEntries.filter(([key, status]) => !status.exists);
    const inProgress = moduleEntries.filter(
      ([key, status]) => status.exists && status.completionPercentage < 70
    );
    const complete = moduleEntries.filter(([key, status]) => status.overallStatus === 'COMPLETE');

    if (notImplemented.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Implement missing core modules',
        modules: notImplemented.map(([key]) => key),
        description: 'These modules are essential for GACP Platform functionality',
      });
    }

    if (inProgress.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Complete modules in progress',
        modules: inProgress.map(([key]) => key),
        description: 'Focus on business logic and API implementation',
      });
    }

    if (complete.length >= 3) {
      recommendations.push({
        priority: 'LOW',
        action: 'Integration testing and optimization',
        modules: complete.map(([key]) => key),
        description: 'Test module interactions and optimize performance',
      });
    }

    return recommendations;
  }
}

// Run analysis
const analyzer = new GACPPlatformModuleAnalyzer();
analyzer.analyzeAllModules().catch(console.error);
