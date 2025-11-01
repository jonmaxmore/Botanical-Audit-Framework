/**
 * Certificate Routes
 * Public and admin routes for certificate management
 */

const express = require('express');
const router = express.Router();

const Certificate = require('../models/Certificate');
const Application = require('../models/Application');
const GACPCertificateService = require('../services/gacp-certificate');
const { authenticate, authorize } = require('../middleware/auth');
const { handleAsync } = require('../middleware/error-handler');

// === PUBLIC ROUTES ===

/**
 * GET /api/certificates/search
 * Search for certificates by number or holder ID
 * @access Public
 */
router.get(
  '/search',
  handleAsync(async (req, res) => {
    const { q, type = 'number' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเลขที่ใบรับรองหรือเลขบัตรประชาชน'
      });
    }

    let query = {};

    if (type === 'number') {
      query.certificateNumber = { $regex: q, $options: 'i' };
    } else if (type === 'nationalId') {
      query['holderInfo.nationalId'] = q;
    } else if (type === 'taxId') {
      query['holderInfo.taxId'] = q;
    }

    const certificates = await Certificate.find(query)
      .select(
        'certificateNumber holderInfo.fullName holderInfo.organizationName siteInfo.farmName status issuanceDate expiryDate'
      )
      .limit(10)
      .sort({ issuanceDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  })
);

/**
 * GET /api/certificates/:certificateNumber
 * Get certificate details by certificate number
 * @access Public
 */
router.get(
  '/:certificateNumber',
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      certificateNumber
    }).populate('application', 'applicationNumber submissionDate');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบรับรองนี้'
      });
    }

    // Public view - hide sensitive data
    const publicData = {
      certificateNumber: certificate.certificateNumber,
      certificateType: certificate.certificateType,
      holderInfo: {
        holderType: certificate.holderInfo.holderType,
        fullName: certificate.holderInfo.fullName,
        organizationName: certificate.holderInfo.organizationName,
        province: certificate.holderInfo.address?.province
      },
      siteInfo: {
        farmName: certificate.siteInfo.farmName,
        totalArea: certificate.siteInfo.totalArea,
        location: {
          province: certificate.siteInfo.location?.province,
          district: certificate.siteInfo.location?.district
        }
      },
      issuanceDate: certificate.issuanceDate,
      expiryDate: certificate.expiryDate,
      status: certificate.status,
      scope: certificate.scope,
      standardsComplied: certificate.standardsComplied,
      qrCode: certificate.qrCode,
      verificationUrl: certificate.verificationUrl,
      isValid: certificate.isValid(),
      daysUntilExpiry: certificate.getDaysUntilExpiry()
    };

    res.json({
      success: true,
      data: publicData
    });
  })
);

/**
 * GET /api/certificates/verify/:certificateNumber
 * Verify certificate authenticity
 * @access Public
 */
router.get(
  '/verify/:certificateNumber',
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber });

    if (!certificate) {
      return res.json({
        success: false,
        valid: false,
        message: 'ไม่พบใบรับรองนี้ในระบบ'
      });
    }

    const isValid = certificate.isValid();
    const daysUntilExpiry = certificate.getDaysUntilExpiry();

    let message = '';
    if (certificate.status === 'revoked') {
      message = 'ใบรับรองนี้ถูกเพิกถอนแล้ว';
    } else if (certificate.status === 'suspended') {
      message = 'ใบรับรองนี้ถูกระงับชั่วคราว';
    } else if (certificate.status === 'expired') {
      message = 'ใบรับรองนี้หมดอายุแล้ว';
    } else if (!isValid) {
      message = 'ใบรับรองนี้ไม่ถูกต้องหรือหมดอายุ';
    } else if (daysUntilExpiry && daysUntilExpiry <= 30) {
      message = `ใบรับรองนี้ถูกต้อง แต่จะหมดอายุในอีก ${daysUntilExpiry} วัน`;
    } else {
      message = 'ใบรับรองนี้ถูกต้องและมีผลบังคับใช้';
    }

    res.json({
      success: true,
      valid: isValid,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        holderName: certificate.holderInfo.organizationName || certificate.holderInfo.fullName,
        farmName: certificate.siteInfo.farmName,
        issuanceDate: certificate.issuanceDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status
      },
      daysUntilExpiry,
      message
    });
  })
);

/**
 * GET /api/certificates/pdf/:certificateNumber
 * Download certificate PDF
 * @access Public
 */
router.get(
  '/pdf/:certificateNumber',
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบรับรองนี้'
      });
    }

    // Generate PDF if not exists
    if (!certificate.pdfUrl || !certificate.pdfGeneratedAt) {
      await GACPCertificateService.generateCertificate(certificate.application, 'system');
    }

    // Serve PDF file
    const pdfPath = require('path').join(
      process.cwd(),
      'storage',
      'certificates',
      `${certificateNumber}.pdf`
    );

    res.download(pdfPath, `${certificateNumber}.pdf`, err => {
      if (err) {
        res.status(404).json({
          success: false,
          message: 'ไม่พบไฟล์ PDF'
        });
      }
    });
  })
);

// === ADMIN ROUTES ===

/**
 * POST /api/admin/certificates/issue/:applicationId
 * Issue certificate for approved application
 * @access Admin only
 */
router.post(
  '/admin/issue/:applicationId',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const { applicationId } = req.params;
    const {
      officerName: _officerName,
      officerPosition: _officerPosition,
      certificateType: _certificateType,
      validityPeriod: _validityPeriod
    } = req.body;

    // Get application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอนี้'
      });
    }

    // Validate status
    if (application.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'คำขอต้องได้รับการอนุมัติก่อนออกใบรับรอง'
      });
    }

    // Check if certificate already exists
    if (application.certificate) {
      const existing = await Certificate.findById(application.certificate);
      if (existing && existing.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'คำขอนี้มีใบรับรองอยู่แล้ว',
          certificateNumber: existing.certificateNumber
        });
      }
    }

    // Issue certificate using service
    const certificate = await GACPCertificateService.generateCertificate(
      applicationId,
      req.user.id
    );

    res.json({
      success: true,
      message: 'ออกใบรับรองเรียบร้อยแล้ว',
      data: {
        certificateNumber: certificate.certificateNumber,
        certificateId: certificate._id,
        issuanceDate: certificate.issuanceDate,
        expiryDate: certificate.expiryDate,
        pdfUrl: certificate.pdfUrl
      }
    });
  })
);

/**
 * GET /api/admin/certificates
 * Get all certificates with filtering
 * @access Admin only
 */
router.get(
  '/admin',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'issuanceDate',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { 'holderInfo.fullName': { $regex: search, $options: 'i' } },
        {
          'holderInfo.organizationName': { $regex: search, $options: 'i' }
        },
        { 'siteInfo.farmName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .populate('application', 'applicationNumber')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Certificate.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: certificates,
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
 * PUT /api/admin/certificates/:certificateNumber/suspend
 * Suspend certificate
 * @access Admin only
 */
router.put(
  '/admin/:certificateNumber/suspend',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเหตุผลในการระงับใบรับรอง'
      });
    }

    const certificate = await Certificate.findOne({ certificateNumber });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบรับรองนี้'
      });
    }

    await certificate.suspend(req.user.id, reason);

    res.json({
      success: true,
      message: 'ระงับใบรับรองเรียบร้อยแล้ว',
      data: {
        certificateNumber: certificate.certificateNumber,
        status: certificate.status
      }
    });
  })
);

/**
 * PUT /api/admin/certificates/:certificateNumber/reinstate
 * Reinstate suspended certificate
 * @access Admin only
 */
router.put(
  '/admin/:certificateNumber/reinstate',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบรับรองนี้'
      });
    }

    if (certificate.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'ใบรับรองนี้ไม่ได้ถูกระงับ'
      });
    }

    await certificate.reinstate(req.user.id);

    res.json({
      success: true,
      message: 'เปิดใช้งานใบรับรองเรียบร้อยแล้ว',
      data: {
        certificateNumber: certificate.certificateNumber,
        status: certificate.status
      }
    });
  })
);

/**
 * PUT /api/admin/certificates/:certificateNumber/revoke
 * Revoke certificate
 * @access Admin only
 */
router.put(
  '/admin/:certificateNumber/revoke',
  authenticate,
  authorize(['admin']),
  handleAsync(async (req, res) => {
    const { certificateNumber } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเหตุผลในการเพิกถอนใบรับรอง'
      });
    }

    const certificate = await Certificate.findOne({ certificateNumber });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบใบรับรองนี้'
      });
    }

    await certificate.revoke(req.user.id, reason);

    res.json({
      success: true,
      message: 'เพิกถอนใบรับรองเรียบร้อยแล้ว',
      data: {
        certificateNumber: certificate.certificateNumber,
        status: certificate.status,
        appealDeadline: certificate.revocationInfo.appealDeadline
      }
    });
  })
);

/**
 * GET /api/admin/certificates/stats/summary
 * Get certificate statistics
 * @access Admin only
 */
router.get(
  '/admin/stats/summary',
  authenticate,
  authorize(['admin', 'officer']),
  handleAsync(async (req, res) => {
    const [total, active, expired, expiringSoon, suspended, revoked] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: 'active' }),
      Certificate.countDocuments({ status: 'expired' }),
      Certificate.findExpiring(60).countDocuments(),
      Certificate.countDocuments({ status: 'suspended' }),
      Certificate.countDocuments({ status: 'revoked' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        expiringSoon,
        suspended,
        revoked
      }
    });
  })
);

module.exports = router;
