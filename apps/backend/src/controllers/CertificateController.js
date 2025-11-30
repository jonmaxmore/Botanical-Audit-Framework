/**
 * Certificate Controller
 * Handles requests for certificate management
 */

const GACPCertificateService = require('../../services/gacp-certificate');
const certificateService = new GACPCertificateService();
const { handleAsync, sendError, sendSuccess } = require('../utils/error-handler-utils');

/**
 * Get all certificates
 */
exports.getAllCertificates = handleAsync(async (req, res) => {
  const filters = req.query;
  const certificates = await certificateService.certificateRepository.findAll(filters);
  sendSuccess(res, certificates);
});

/**
 * Get certificate by ID
 */
exports.getCertificateById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const certificate = await certificateService.certificateRepository.findById(id);
  if (!certificate) {
    return sendError(res, 'RESOURCE_NOT_FOUND', 'Certificate not found', null, 404);
  }
  sendSuccess(res, certificate);
});

/**
 * Create new certificate
 */
exports.createCertificate = handleAsync(async (req, res) => {
  const { applicationId } = req.body;
  const approvedBy = req.user.id; // Assuming user ID is in req.user

  const result = await certificateService.generateCertificate(applicationId, approvedBy);
  sendSuccess(res, result, 'Certificate generation initiated', 201);
});

/**
 * Update certificate
 */
exports.updateCertificate = handleAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const certificate = await certificateService.certificateRepository.update(id, updateData);
  if (!certificate) {
    return sendError(res, 'RESOURCE_NOT_FOUND', 'Certificate not found', null, 404);
  }
  sendSuccess(res, certificate);
});

/**
 * Delete certificate
 */
exports.deleteCertificate = handleAsync(async (req, res) => {
  const { id } = req.params;
  const result = await certificateService.certificateRepository.delete(id);
  if (!result) {
    return sendError(res, 'RESOURCE_NOT_FOUND', 'Certificate not found', null, 404);
  }
  sendSuccess(res, null, 'Certificate deleted successfully');
});

/**
 * Download certificate PDF
 */
exports.downloadCertificate = handleAsync(async (req, res) => {
  const { certificateNumber } = req.params;
  const certificate = await certificateService.certificateRepository.findByCertificateNumber(certificateNumber);

  if (!certificate || !certificate.pdfUrl) {
    return sendError(res, 'RESOURCE_NOT_FOUND', 'Certificate PDF not found', null, 404);
  }

  // Assuming pdfUrl is a file path, we can send it
  res.download(certificate.pdfUrl);
});

/**
 * Verify certificate
 */
exports.verifyCertificate = handleAsync(async (req, res) => {
  const { certificateNumber } = req.params;
  const { code } = req.query;

  const result = await certificateService.verifyCertificate(certificateNumber, code);
  sendSuccess(res, result);
});

/**
 * Renew certificate
 */
exports.renewCertificate = handleAsync(async (req, res) => {
  const { id } = req.params; // Certificate ID or Number? Route says :id
  // Service expects certificateNumber for renewal, let's fetch it first if id is ObjectId
  let certificateNumber = id;

  // Check if id is ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
     const cert = await certificateService.certificateRepository.findById(id);
     if (cert) certificateNumber = cert.certificateNumber;
  }

  const renewedBy = req.user.id;
  const renewalData = req.body;

  const result = await certificateService.renewCertificate(certificateNumber, renewedBy, renewalData);
  sendSuccess(res, result, 'Certificate renewed successfully');
});

/**
 * Get certificate statistics
 */
exports.getCertificateStats = handleAsync(async (req, res) => {
  // Implement stats logic or call service method if available
  // For now, return basic counts
  const total = await certificateService.certificateRepository.count({});
  const active = await certificateService.certificateRepository.count({ status: 'active' });

  sendSuccess(res, { total, active });
});
