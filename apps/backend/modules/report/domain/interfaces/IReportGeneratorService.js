/**
 * Report Generator Service Interface
 *
 * Contract for generating reports in various formats.
 * Part of Clean Architecture - Domain Layer
 */

class IReportGeneratorService {
  /**
   * Generate a PDF report
   * @param {Object} data - Report data
   * @param {Object} options - PDF generation options (template, layout, etc.)
   * @returns {Promise<Buffer>} - PDF file buffer
   */
  async generatePDF(data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate an Excel report
   * @param {Object} data - Report data
   * @param {Object} options - Excel generation options (sheets, columns, etc.)
   * @returns {Promise<Buffer>} - Excel file buffer
   */
  async generateExcel(data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate a CSV report
   * @param {Object} data - Report data
   * @param {Object} options - CSV generation options (delimiter, headers, etc.)
   * @returns {Promise<string>} - CSV content
   */
  async generateCSV(data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate an HTML report
   * @param {Object} data - Report data
   * @param {Object} options - HTML generation options (template, style, etc.)
   * @returns {Promise<string>} - HTML content
   */
  async generateHTML(data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate JSON report
   * @param {Object} data - Report data
   * @param {Object} options - JSON generation options (pretty print, etc.)
   * @returns {Promise<string>} - JSON content
   */
  async generateJSON(data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate report by format
   * @param {string} format - Report format (PDF, EXCEL, CSV, HTML, JSON)
   * @param {Object} data - Report data
   * @param {Object} options - Format-specific options
   * @returns {Promise<Buffer|string>} - Generated report
   */
  async generate(format, data, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Save generated report to file system
   * @param {Buffer|string} content - Report content
   * @param {string} fileName - File name
   * @param {string} format - Report format
   * @returns {Promise<{filePath: string, fileSize: number}>}
   */
  async saveToFile(_content, _fileName, _format) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete report file
   * @param {string} filePath - Path to the report file
   * @returns {Promise<boolean>}
   */
  async deleteFile(_filePath) {
    throw new Error('Method not implemented');
  }
}

module.exports = IReportGeneratorService;
