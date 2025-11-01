/**
 * PromptPay QR Code Generator
 * Generate QR codes for PromptPay payment system
 *
 * PromptPay Format:
 * - National ID (13 digits): 00201300{13-digit-id}
 * - Mobile Number (10 digits): 00201300{10-digit-mobile}
 * - Tax ID (13 digits): 00201300{13-digit-tax-id}
 *
 * Reference: https://qr-generator.readthedocs.io/en/latest/promptpay.html
 */

const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate PromptPay CRC checksum
 * @param {string} data - The data to calculate CRC for
 * @returns {string} 4-character hex CRC
 */
function calculateCRC(data) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if ((c & 1) === 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[i] = c;
  }

  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  crc = crc ^ 0xffff;
  const hex = crc.toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

/**
 * Format PromptPay payload
 * @param {string} identifier - National ID or Mobile Number (no dashes)
 * @param {number} amount - Payment amount (optional)
 * @returns {string} PromptPay payload string
 */
function formatPromptPayPayload(identifier, amount = null) {
  // Remove dashes and spaces from identifier
  const cleanId = identifier.replace(/[- ]/g, '');

  // Build EMV QR Code payload
  let payload = '';

  // Payload Format Indicator
  payload += '000201';

  // Point of Initiation Method (Static QR)
  payload += '010212';

  // Merchant Account Information - PromptPay
  let merchantInfo = '';
  merchantInfo += '0016A000000677010111'; // AID: PromptPay
  merchantInfo += `01${cleanId.length.toString().padStart(2, '0')}${cleanId}`; // ID

  payload += `29${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;

  // Transaction Currency (764 = THB)
  payload += '5303764';

  // Transaction Amount (if specified)
  if (amount && amount > 0) {
    const amountStr = amount.toFixed(2);
    payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  }

  // Country Code (TH)
  payload += '5802TH';

  // CRC Checksum (will be calculated)
  payload += '6304';

  // Calculate and append CRC
  const crc = calculateCRC(payload);
  payload += crc;

  return payload;
}

/**
 * Generate PromptPay QR Code
 * @param {Object} options - QR generation options
 * @param {string} options.identifier - National ID or Mobile Number
 * @param {number} [options.amount] - Payment amount (optional)
 * @param {string} [options.format='data_url'] - Output format ('data_url', 'buffer', 'base64')
 * @returns {Promise<string|Buffer>} QR code in specified format
 */
async function generatePromptPayQR(options) {
  const { identifier, amount, format = 'data_url' } = options;

  if (!identifier) {
    throw new Error('Identifier (National ID or Mobile Number) is required');
  }

  // Generate PromptPay payload
  const payload = formatPromptPayPayload(identifier, amount);

  // QR Code options
  const qrOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  // Generate QR code based on format
  switch (format) {
    case 'data_url':
      return await QRCode.toDataURL(payload, qrOptions);

    case 'buffer':
      return await QRCode.toBuffer(payload, qrOptions);

    case 'base64': {
      const buffer = await QRCode.toBuffer(payload, qrOptions);
      return buffer.toString('base64');
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Generate unique payment reference number
 * @param {string} applicationNumber - Application number
 * @returns {string} Reference number
 */
function generatePaymentReference(applicationNumber) {
  const timestamp = Date.now().toString().slice(-8);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  const appNum = applicationNumber.replace(/[^0-9]/g, '').slice(-4);

  return `GACP${appNum}${timestamp}${random}`;
}

/**
 * Validate Thai National ID
 * @param {string} id - National ID
 * @returns {boolean} Is valid
 */
function validateThaiNationalID(id) {
  const cleanId = id.replace(/[- ]/g, '');

  if (cleanId.length !== 13 || !/^\d+$/.test(cleanId)) {
    return false;
  }

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId[i]) * (13 - i);
  }

  const checksum = (11 - (sum % 11)) % 10;
  return checksum === parseInt(cleanId[12]);
}

/**
 * Validate Thai Mobile Number
 * @param {string} mobile - Mobile number
 * @returns {boolean} Is valid
 */
function validateThaiMobile(mobile) {
  const cleanMobile = mobile.replace(/[- ]/g, '');

  // Thai mobile numbers: 06X, 08X, 09X (10 digits)
  return /^(06|08|09)\d{8}$/.test(cleanMobile);
}

module.exports = {
  generatePromptPayQR,
  formatPromptPayPayload,
  generatePaymentReference,
  validateThaiNationalID,
  validateThaiMobile,
  calculateCRC
};
