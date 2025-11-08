/**
 * Dashboard Module Entry Point
 *
 * Main entry point for the Dashboard module.
 * Exports container, controller, routes, and use cases.
 *
 * Part of Clean Architecture - Integration Layer
 */

const DashboardModuleContainer = require('./integration/container');

/**
 * Initialize Dashboard Module
 *
 * @param {Object} repositories - Repository instances
 * @param {FarmRepository} repositories.farmRepository
 * @param {CertificateRepository} repositories.certificateRepository
 * @param {SurveyRepository} repositories.surveyRepository
 * @param {TrainingCourseRepository} repositories.trainingCourseRepository
 * @param {TrainingEnrollmentRepository} repositories.trainingEnrollmentRepository
 * @param {DocumentRepository} repositories.documentRepository
 * @param {NotificationRepository} repositories.notificationRepository
 * @param {AuditRepository} repositories.auditRepository
 * @returns {DashboardModuleContainer}
 */
function initializeDashboardModule(repositories) {
  return new DashboardModuleContainer(
    repositories.farmRepository,
    repositories.certificateRepository,
    repositories.surveyRepository,
    repositories.trainingCourseRepository,
    repositories.trainingEnrollmentRepository,
    repositories.documentRepository,
    repositories.notificationRepository,
    repositories.auditRepository
  );
}

// Export for use in other modules
module.exports = {
  initializeDashboardModule,
  DashboardModuleContainer,

  // Use Cases
  GetFarmerDashboardUseCase: require('./application/use-cases/get-farmer-dashboard-usecase'),
  GetDTAMDashboardUseCase: require('./application/use-cases/get-dtam-dashboard-usecase'),
  GetSystemStatisticsUseCase: require('./application/use-cases/get-system-stats-usecase'),

  // Controller
  DashboardController: require('./presentation/controllers/dashboard-controller'),

  // Routes
  initializeDashboardFarmerRoutes: require('./presentation/routes/dashboard.farmer.routes')
    .initializeDashboardFarmerRoutes,
  initializeDashboardDTAMRoutes: require('./presentation/routes/dashboard.dtam.routes')
    .initializeDashboardDTAMRoutes,

  // DTOs
  DashboardDTO: require('./presentation/dto/DashboardDTO').DashboardDTO
};
