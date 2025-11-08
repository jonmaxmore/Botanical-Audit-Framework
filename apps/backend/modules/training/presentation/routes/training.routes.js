/**
 * Training Routes
 *
 * Defines HTTP routes for training system.
 * Separate routes for Farmer and DTAM staff with appropriate permissions.
 */

const express = require('express');

function createTrainingRoutes(controller, authMiddleware) {
  const { authenticateFarmer, authenticateDTAMStaff, requireAnyPermission } = authMiddleware;

  // ============ FARMER ROUTES ============
  const farmerRouter = express.Router();

  // Course browsing
  farmerRouter.get('/courses', authenticateFarmer, controller.listCourses);
  farmerRouter.get('/courses/:id', authenticateFarmer, controller.getCourseDetails);

  // Enrollment
  farmerRouter.post('/enroll', authenticateFarmer, controller.enrollInCourse);
  farmerRouter.get('/enrollments', authenticateFarmer, controller.getMyEnrollments);
  farmerRouter.put('/enrollments/:id/progress', authenticateFarmer, controller.updateProgress);
  farmerRouter.post(
    '/enrollments/:id/submit',
    authenticateFarmer,
    controller.submitFinalAssessment,
  );

  // ============ DTAM ROUTES ============
  const dtamRouter = express.Router();

  // Course management
  dtamRouter.get(
    '/courses',
    authenticateDTAMStaff,
    requireAnyPermission(['view_training', 'manage_training']),
    controller.listCourses,
  );

  dtamRouter.get(
    '/courses/:id',
    authenticateDTAMStaff,
    requireAnyPermission(['view_training', 'manage_training']),
    controller.getCourseDetails,
  );

  dtamRouter.post(
    '/courses',
    authenticateDTAMStaff,
    requireAnyPermission(['manage_training', 'create_course']),
    controller.createCourse,
  );

  dtamRouter.put(
    '/courses/:id',
    authenticateDTAMStaff,
    requireAnyPermission(['manage_training', 'update_course']),
    controller.updateCourse,
  );

  dtamRouter.post(
    '/courses/:id/publish',
    authenticateDTAMStaff,
    requireAnyPermission(['manage_training', 'publish_course']),
    controller.publishCourse,
  );

  // Statistics
  dtamRouter.get(
    '/statistics',
    authenticateDTAMStaff,
    requireAnyPermission(['view_training', 'manage_training', 'view_reports']),
    controller.getStatistics,
  );

  return { farmerRouter, dtamRouter };
}

module.exports = createTrainingRoutes;
