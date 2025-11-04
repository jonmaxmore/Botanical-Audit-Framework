/**
 * Automatic AI QC Trigger
 * Automatically runs AI QC when application is submitted
 */

const geminiService = require('../services/ai/geminiService');
const DTAMApplication = require('../models/DTAMApplication');
const logger = require('../utils/logger');

/**
 * Auto-trigger AI QC after application submission
 */
exports.autoTriggerAIQC = async (applicationId) => {
  try {
    logger.info(`Auto-triggering AI QC for application ${applicationId}`);

    const application = await DTAMApplication.findById(applicationId)
      .populate('documents')
      .populate('images');

    if (!application) {
      throw new Error('Application not found');
    }

    // Only run AI QC for newly submitted applications
    if (application.status !== 'SUBMITTED') {
      logger.warn(`Application ${applicationId} is not in SUBMITTED status, skipping AI QC`);
      return;
    }

    // Check if AI QC already completed
    if (application.aiQcCompletedAt) {
      logger.warn(`AI QC already completed for application ${applicationId}`);
      return;
    }

    // Run AI QC
    const qcResult = await geminiService.performAIQC({
      id: application._id,
      lotId: application.lotId,
      farmer: {
        name: application.farmer.name,
        idCard: application.farmer.idCard
      },
      farm: {
        name: application.farmer.farmName,
        location: application.farmer.farmLocation,
        area: application.farmArea
      },
      documents: application.documents || [],
      images: application.images || []
    });

    if (!qcResult.success) {
      logger.error(`AI QC failed for application ${applicationId}:`, qcResult.error);
      
      // Still update application to move forward even if AI QC fails
      application.status = 'IN_REVIEW';
      application.inspectionType = 'ONSITE'; // Default to safest option
      await application.save();
      return;
    }

    // Update application with AI QC results
    application.aiQc = {
      completedAt: new Date(),
      overallScore: qcResult.data.overallScore,
      scores: qcResult.data.scores,
      inspectionType: qcResult.data.inspectionType,
      issues: qcResult.data.issues,
      recommendations: qcResult.data.recommendations
    };

    application.inspectionType = qcResult.data.inspectionType;
    application.status = 'IN_REVIEW';
    application.aiQcCompletedAt = new Date();

    await application.save();

    logger.info(`AI QC completed successfully for application ${applicationId}`, {
      score: qcResult.data.overallScore,
      inspectionType: qcResult.data.inspectionType
    });

    // TODO: Send notification to reviewer
    // TODO: Add to review queue

  } catch (error) {
    logger.error(`Error in auto AI QC for application ${applicationId}:`, error);
    
    // Don't throw error - just log it and continue
    // Application will proceed without AI QC
  }
};

/**
 * Batch process multiple applications
 */
exports.batchProcessAIQC = async (applicationIds) => {
  const results = {
    total: applicationIds.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const appId of applicationIds) {
    try {
      await exports.autoTriggerAIQC(appId);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        applicationId: appId,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Check if AI QC is needed
 */
exports.isAIQCNeeded = (application) => {
  return (
    application.status === 'SUBMITTED' &&
    !application.aiQcCompletedAt &&
    process.env.ENABLE_AI_QC === 'true'
  );
};

/**
 * Get AI QC queue (applications waiting for AI QC)
 */
exports.getAIQCQueue = async () => {
  try {
    const applications = await DTAMApplication.find({
      status: 'SUBMITTED',
      aiQcCompletedAt: { $exists: false }
    })
      .select('applicationNumber lotId farmer.name submittedAt')
      .sort({ submittedAt: 1 })
      .limit(50);

    return {
      success: true,
      count: applications.length,
      applications
    };
  } catch (error) {
    logger.error('Error getting AI QC queue:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process AI QC queue (cron job)
 */
exports.processAIQCQueue = async () => {
  try {
    logger.info('Starting AI QC queue processing');

    const queue = await exports.getAIQCQueue();
    if (!queue.success || queue.count === 0) {
      logger.info('No applications in AI QC queue');
      return;
    }

    const applicationIds = queue.applications.map(app => app._id);
    const results = await exports.batchProcessAIQC(applicationIds);

    logger.info('AI QC queue processing completed', results);

    return results;
  } catch (error) {
    logger.error('Error processing AI QC queue:', error);
    throw error;
  }
};
