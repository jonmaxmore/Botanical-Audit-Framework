/**
 * Report Module Container
 *
 * Dependency Injection configuration for Report Module.
 * Wires all dependencies and exports module interface.
 * Part of Clean Architecture - Integration Layer
 */

// Domain
const Report = require('../domain/entities/Report');

// Infrastructure
const MongoDBReportRepository = require('../infrastructure/repositories/report-repository');
const SimpleReportGeneratorService = require('../infrastructure/services/generator-service');
const SimpleDataAggregationService = require('../infrastructure/services/aggregator-service');
const mongoose = require('mongoose');

// Application Use Cases
const RequestReportUseCase = require('../application/use-cases/request-report-usecase');
const GenerateReportUseCase = require('../application/use-cases/generate-report-usecase');
const GetReportUseCase = require('../application/use-cases/get-report-usecase');
const DownloadReportUseCase = require('../application/use-cases/download-report-usecase');
const ListReportsUseCase = require('../application/use-cases/list-reports-usecase');
const DeleteReportUseCase = require('../application/use-cases/delete-report-usecase');
const GetReportStatisticsUseCase = require('../application/use-cases/get-report-statistics-usecase');
const ProcessScheduledReportsUseCase = require('../application/use-cases/process-scheduled-reports-usecase');
const RetryFailedReportUseCase = require('../application/use-cases/retry-failed-report-usecase');

// Presentation
const ReportController = require('../presentation/controllers/report-controller');
const farmerRoutes = require('../presentation/routes/report.farmer.routes');
const dtamRoutes = require('../presentation/routes/report.dtam.routes');

class ReportModuleContainer {
  constructor(config = {}) {
    this.database = config.database || mongoose;
    this.otherRepositories = config.otherRepositories || {};
    this._setupDependencies();
  }

  _setupDependencies() {
    // Infrastructure Layer
    this.reportRepository = new MongoDBReportRepository(this.database);
    this.reportGeneratorService = new SimpleReportGeneratorService();

    // Data Aggregation Service (needs repositories from other modules)
    this.dataAggregationService = new SimpleDataAggregationService(
      this.otherRepositories.farmRepository,
      this.otherRepositories.certificateRepository,
      this.otherRepositories.surveyRepository,
      this.otherRepositories.trainingEnrollmentRepository,
      this.otherRepositories.documentRepository,
      this.otherRepositories.auditRepository
    );

    // Application Layer - Use Cases
    this.requestReportUseCase = new RequestReportUseCase(this.reportRepository);

    this.generateReportUseCase = new GenerateReportUseCase(
      this.reportRepository,
      this.dataAggregationService,
      this.reportGeneratorService
    );

    this.getReportUseCase = new GetReportUseCase(this.reportRepository);

    this.downloadReportUseCase = new DownloadReportUseCase(this.reportRepository);

    this.listReportsUseCase = new ListReportsUseCase(this.reportRepository);

    this.deleteReportUseCase = new DeleteReportUseCase(
      this.reportRepository,
      this.reportGeneratorService
    );

    this.getReportStatisticsUseCase = new GetReportStatisticsUseCase(this.reportRepository);

    this.processScheduledReportsUseCase = new ProcessScheduledReportsUseCase(
      this.reportRepository,
      this.generateReportUseCase
    );

    this.retryFailedReportUseCase = new RetryFailedReportUseCase(
      this.reportRepository,
      this.generateReportUseCase
    );

    // Presentation Layer - Controller
    this.reportController = new ReportController(
      this.requestReportUseCase,
      this.generateReportUseCase,
      this.getReportUseCase,
      this.downloadReportUseCase,
      this.listReportsUseCase,
      this.deleteReportUseCase,
      this.getReportStatisticsUseCase,
      this.retryFailedReportUseCase
    );
  }

  // Get Router for Farmers
  getFarmerRoutes(authenticateFarmer) {
    return farmerRoutes(this.reportController, authenticateFarmer);
  }

  // Get Router for DTAM Staff
  getDTAMRoutes(authenticateDTAM) {
    return dtamRoutes(this.reportController, authenticateDTAM);
  }

  // Expose services for other modules or background jobs
  getReportRepository() {
    return this.reportRepository;
  }

  getReportGeneratorService() {
    return this.reportGeneratorService;
  }

  getDataAggregationService() {
    return this.dataAggregationService;
  }

  // Expose use cases for direct access
  getRequestReportUseCase() {
    return this.requestReportUseCase;
  }

  getGenerateReportUseCase() {
    return this.generateReportUseCase;
  }

  getProcessScheduledReportsUseCase() {
    return this.processScheduledReportsUseCase;
  }

  getRetryFailedReportUseCase() {
    return this.retryFailedReportUseCase;
  }

  // Domain Entity for other modules
  getReportEntity() {
    return Report;
  }
}

// Singleton instance
let containerInstance = null;

function getReportModuleContainer(config = {}) {
  if (!containerInstance) {
    containerInstance = new ReportModuleContainer(config);
  }
  return containerInstance;
}

module.exports = {
  ReportModuleContainer,
  getReportModuleContainer
};
