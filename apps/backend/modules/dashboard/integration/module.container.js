/**
 * Dashboard Module Container
 *
 * Dependency injection container for the Dashboard module.
 * Wires up use cases, controller, and routes.
 *
 * Part of Clean Architecture - Integration Layer
 */

const GetFarmerDashboardUseCase = require('../application/use-cases/GetFarmerDashboardUseCase');
const GetDTAMDashboardUseCase = require('../application/use-cases/GetDTAMDashboardUseCase');
const GetSystemStatisticsUseCase = require('../application/use-cases/GetSystemStatisticsUseCase');
const DashboardController = require('../presentation/controllers/DashboardController');
const {
  initializeDashboardFarmerRoutes
} = require('../presentation/routes/dashboard.farmer.routes');
const { initializeDashboardDTAMRoutes } = require('../presentation/routes/dashboard.dtam.routes');

class DashboardModuleContainer {
  constructor(
    farmRepository,
    certificateRepository,
    surveyRepository,
    trainingCourseRepository = null,
    trainingEnrollmentRepository = null,
    documentRepository = null,
    notificationRepository = null,
    auditRepository = null
  ) {
    // Store repositories
    this.farmRepository = farmRepository;
    this.certificateRepository = certificateRepository;
    this.surveyRepository = surveyRepository;
    this.trainingCourseRepository = trainingCourseRepository;
    this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    this.documentRepository = documentRepository;
    this.notificationRepository = notificationRepository;
    this.auditRepository = auditRepository;

    // Initialize use cases
    this._initializeUseCases();

    // Initialize controller
    this._initializeController();

    // Initialize routes
    this._initializeRoutes();
  }

  _initializeUseCases() {
    this.getFarmerDashboardUseCase = new GetFarmerDashboardUseCase(
      this.farmRepository,
      this.certificateRepository,
      this.surveyRepository,
      this.trainingEnrollmentRepository,
      this.documentRepository,
      this.notificationRepository
    );

    this.getDTAMDashboardUseCase = new GetDTAMDashboardUseCase(
      this.farmRepository,
      this.certificateRepository,
      this.surveyRepository,
      this.trainingCourseRepository,
      this.trainingEnrollmentRepository,
      this.documentRepository,
      this.auditRepository
    );

    this.getSystemStatisticsUseCase = new GetSystemStatisticsUseCase(
      this.farmRepository,
      this.certificateRepository,
      this.surveyRepository,
      this.trainingCourseRepository,
      this.trainingEnrollmentRepository,
      this.documentRepository,
      this.notificationRepository,
      this.auditRepository
    );
  }

  _initializeController() {
    this.dashboardController = new DashboardController(
      this.getFarmerDashboardUseCase,
      this.getDTAMDashboardUseCase,
      this.getSystemStatisticsUseCase
    );
  }

  _initializeRoutes() {
    this.farmerRoutes = initializeDashboardFarmerRoutes(this.dashboardController);
    this.dtamRoutes = initializeDashboardDTAMRoutes(this.dashboardController);
  }

  // Getters for external access
  getController() {
    return this.dashboardController;
  }

  getFarmerRoutes() {
    return this.farmerRoutes;
  }

  getDTAMRoutes() {
    return this.dtamRoutes;
  }

  getUseCases() {
    return {
      getFarmerDashboardUseCase: this.getFarmerDashboardUseCase,
      getDTAMDashboardUseCase: this.getDTAMDashboardUseCase,
      getSystemStatisticsUseCase: this.getSystemStatisticsUseCase
    };
  }
}

module.exports = DashboardModuleContainer;
