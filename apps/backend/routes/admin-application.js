/**
 * Admin Application Management Routes
 * Routes for admin to manage GACP applications, verify payments, and update statuses
 */

const express = require('express');
const router = express.Router();

const Application = require('../models/Application');
const { authenticate, authorize } = require('../middleware/auth');
const { handleAsync } = require('../middleware/error-handler');

// === PAYMENT VERIFICATION ROUTES ===

/**
 * GET /api/admin/applications/pending-payment
 * Get all applications with pending payment verification
 * @access Admin only
 */
router.get(
  '/pending-payment',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const applications = await Application.find({
      status: 'PENDING_PAYMENT',
      'payment.status': 'pending',
      'payment.slipUrl': { $exists: true, $ne: null }
    })
      .select('applicationNumber farmerInfo farmInfo payment status createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  })
);

/**
 * GET /api/admin/applications/:id/payment
 * Get payment details for specific application
 * @access Admin only
 */
router.get(
  '/:id/payment',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id).select(
      'applicationNumber farmerInfo farmInfo payment status'
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอนี้'
      });
    }

    res.json({
      success: true,
      data: {
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        farmerInfo: application.farmerInfo,
        farmInfo: application.farmInfo,
        payment: application.payment,
        status: application.status
      }
    });
  })
);

/**
 * POST /api/admin/applications/:id/verify-payment
 * Verify payment and update application status
 * @access Admin only
 */
router.post(
  '/:id/verify-payment',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ action (approve หรือ reject)'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอนี้'
      });
    }

    if (application.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: 'สถานะคำขอไม่ถูกต้องสำหรับการตรวจสอบการชำระเงิน'
      });
    }

    if (!application.payment || !application.payment.slipUrl) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบหลักฐานการชำระเงิน'
      });
    }

    if (action === 'approve') {
      // Approve payment
      application.payment.status = 'paid';
      application.payment.verifiedAt = new Date();
      application.payment.verifiedBy = req.user.id;
      application.payment.paidAt = new Date();
      if (notes) {
        application.payment.notes = notes;
      }

      // Update application status to PAYMENT_CONFIRMED
      application.status = 'PAYMENT_CONFIRMED';
      application.statusHistory.push({
        status: 'PAYMENT_CONFIRMED',
        timestamp: new Date(),
        note: 'การชำระเงินได้รับการยืนยันโดยเจ้าหน้าที่',
        updatedBy: req.user.id
      });

      await application.save();

      res.json({
        success: true,
        message: 'ยืนยันการชำระเงินเรียบร้อยแล้ว',
        data: {
          applicationId: application._id,
          status: application.status,
          payment: application.payment
        }
      });
    } else {
      // Reject payment
      application.payment.status = 'pending';
      application.payment.notes = notes || 'หลักฐานการชำระเงินไม่ถูกต้อง กรุณาอัพโหลดใหม่';

      application.statusHistory.push({
        status: 'PENDING_PAYMENT',
        timestamp: new Date(),
        note: `การชำระเงินถูกปฏิเสธ: ${notes || 'กรุณาตรวจสอบและอัพโหลดหลักฐานใหม่'}`,
        updatedBy: req.user.id
      });

      await application.save();

      res.json({
        success: true,
        message: 'ปฏิเสธการชำระเงิน เกษตรกรจะต้องอัพโหลดหลักฐานใหม่',
        data: {
          applicationId: application._id,
          status: application.status,
          payment: application.payment
        }
      });
    }
  })
);

// === APPLICATION MANAGEMENT ROUTES ===

/**
 * GET /api/admin/applications
 * Get all applications with filtering and pagination
 * @access Admin only
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const {
      status,
      applicantType,
      receivingOffice,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (applicantType) {
      filter.applicantType = applicantType;
    }

    if (receivingOffice) {
      filter.receivingOffice = receivingOffice;
    }

    if (search) {
      filter.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { 'farmerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'farmerInfo.idCard': { $regex: search, $options: 'i' } },
        { 'organizationInfo.organizationName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .select(
          'applicationNumber farmerInfo organizationInfo farmInfo status applicantType receivingOffice payment createdAt updatedAt'
        )
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  })
);

/**
 * GET /api/admin/applications/:id
 * Get application details by ID
 * @access Admin only
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอนี้'
      });
    }

    res.json({
      success: true,
      data: application
    });
  })
);

/**
 * PUT /api/admin/applications/:id/status
 * Update application status
 * @access Admin only
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะใหม่'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอนี้'
      });
    }

    // Validate status transition
    const validTransitions = application.getValidStatusTransitions();
    if (!validTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถเปลี่ยนสถานะจาก ${application.status} เป็น ${status} ได้`,
        validTransitions
      });
    }

    // Update status
    application.status = status;
    application.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `เจ้าหน้าที่เปลี่ยนสถานะเป็น ${status}`,
      updatedBy: req.user.id
    });

    await application.save();

    res.json({
      success: true,
      message: 'อัพเดทสถานะเรียบร้อยแล้ว',
      data: {
        applicationId: application._id,
        status: application.status,
        validNextTransitions: application.getValidStatusTransitions()
      }
    });
  })
);

/**
 * GET /api/admin/applications/stats/summary
 * Get application statistics summary
 * @access Admin only
 */
router.get(
  '/stats/summary',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      summary.byStatus[stat._id] = stat.count;
      summary.total += stat.count;
    });

    // Count pending payments
    const pendingPayments = await Application.countDocuments({
      status: 'PENDING_PAYMENT',
      'payment.slipUrl': { $exists: true, $ne: null },
      'payment.status': 'pending'
    });

    summary.pendingPaymentVerification = pendingPayments;

    res.json({
      success: true,
      data: summary
    });
  })
);

module.exports = router;
