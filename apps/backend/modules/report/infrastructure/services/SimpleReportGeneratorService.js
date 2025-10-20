/**
 * Simple Report Generator Service
 *
 * Generates reports in various formats.
 * Simplified implementation - can be upgraded with puppeteer/exceljs.
 * Part of Clean Architecture - Infrastructure Layer
 */

const fs = require('fs').promises;
const path = require('path');

class SimpleReportGeneratorService {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this._ensureReportsDirectory();
  }

  async _ensureReportsDirectory() {
    try {
      await fs.access(this.reportsDir);
    } catch {
      await fs.mkdir(this.reportsDir, { recursive: true });
    }
  }

  async generate(format, data, options = {}) {
    switch (format) {
    case 'PDF':
      return await this.generatePDF(data, options);
    case 'EXCEL':
      return await this.generateExcel(data, options);
    case 'CSV':
      return await this.generateCSV(data, options);
    case 'HTML':
      return await this.generateHTML(data, options);
    case 'JSON':
      return await this.generateJSON(data, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  async generatePDF(data, options = {}) {
    // TODO: Implement with puppeteer or PDFKit
    // For now, generate HTML and note that it should be converted to PDF
    const html = await this.generateHTML(data, options);
    return Buffer.from(html, 'utf-8');
  }

  async generateExcel(data, options = {}) {
    // TODO: Implement with exceljs
    // For now, generate CSV
    const csv = await this.generateCSV(data, options);
    return Buffer.from(csv, 'utf-8');
  }

  async generateCSV(data, options = {}) {
    const { title, parameters } = options;

    let csv = '';

    // Add title
    if (title) {
      csv += `"${title}"\n\n`;
    }

    // Add parameters info
    if (parameters) {
      csv += '"Parameters:"\n';
      for (const [key, value] of Object.entries(parameters)) {
        csv += `"${key}","${value}"\n`;
      }
      csv += '\n';
    }

    // Process data
    if (Array.isArray(data) && data.length > 0) {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      csv += headers.map(h => `"${h}"`).join(',') + '\n';

      // Add rows
      for (const row of data) {
        csv +=
          headers
            .map(h => {
              const value = row[h];
              if (value === null || value === undefined) return '""';
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',') + '\n';
      }
    } else if (typeof data === 'object') {
      // Single object - create key-value pairs
      for (const [key, value] of Object.entries(data)) {
        csv += `"${key}","${value}"\n`;
      }
    }

    return csv;
  }

  async generateHTML(data, options = {}) {
    const { title, parameters, filters } = options;

    let html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Report'}</title>
  <style>
    body {
      font-family: 'Sarabun', Arial, sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .info {
      background: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-label {
      font-weight: bold;
      color: #34495e;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-value {
      font-size: 2em;
      font-weight: bold;
    }
    .summary-label {
      font-size: 0.9em;
      opacity: 0.9;
    }
    .timestamp {
      text-align: right;
      color: #7f8c8d;
      font-size: 0.9em;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title || 'Report'}</h1>
    
    <div class="info">
      <p><span class="info-label">Generated:</span> ${new Date().toLocaleString('th-TH')}</p>`;

    if (parameters && Object.keys(parameters).length > 0) {
      html += '\n      <p><span class="info-label">Parameters:</span></p>\n      <ul>\n';
      for (const [key, value] of Object.entries(parameters)) {
        html += `        <li><strong>${key}:</strong> ${value}</li>\n`;
      }
      html += '      </ul>\n';
    }

    html += '    </div>\n\n';

    // Render data
    if (Array.isArray(data) && data.length > 0) {
      // Table format
      html += '    <table>\n      <thead>\n        <tr>\n';

      const headers = Object.keys(data[0]);
      for (const header of headers) {
        html += `          <th>${header}</th>\n`;
      }

      html += '        </tr>\n      </thead>\n      <tbody>\n';

      for (const row of data) {
        html += '        <tr>\n';
        for (const header of headers) {
          html += `          <td>${row[header] ?? '-'}</td>\n`;
        }
        html += '        </tr>\n';
      }

      html += '      </tbody>\n    </table>\n';
    } else if (typeof data === 'object' && data !== null) {
      // Object format - show as summary cards if has numeric values
      const entries = Object.entries(data);
      const hasNumbers = entries.some(([_, value]) => typeof value === 'number');

      if (hasNumbers) {
        html += '    <div class="summary">\n';
        for (const [key, value] of entries) {
          if (typeof value === 'number') {
            html += `      <div class="summary-card">
        <div class="summary-value">${value.toLocaleString()}</div>
        <div class="summary-label">${key}</div>
      </div>\n`;
          }
        }
        html += '    </div>\n';
      } else {
        // Regular key-value pairs
        html += '    <div class="info">\n';
        for (const [key, value] of entries) {
          html += `      <p><span class="info-label">${key}:</span> ${JSON.stringify(value)}</p>\n`;
        }
        html += '    </div>\n';
      }
    }

    html += `    <div class="timestamp">
      Report generated by GACP Certification System
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  async generateJSON(data, options = {}) {
    const output = {
      title: options.title,
      generated: new Date().toISOString(),
      parameters: options.parameters,
      filters: options.filters,
      data: data
    };

    return JSON.stringify(output, null, 2);
  }

  async saveToFile(content, fileName, format) {
    await this._ensureReportsDirectory();

    const filePath = path.join(this.reportsDir, fileName);

    if (Buffer.isBuffer(content)) {
      await fs.writeFile(filePath, content);
    } else {
      await fs.writeFile(filePath, content, 'utf-8');
    }

    const stats = await fs.stat(filePath);

    return {
      filePath,
      fileSize: stats.size
    };
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }
}

module.exports = SimpleReportGeneratorService;
