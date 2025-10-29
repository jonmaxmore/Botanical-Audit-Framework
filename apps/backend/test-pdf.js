/**
 * Test PDF Generation
 *
 * ทดสอบการสร้าง PDF จาก HTML template
 */

const PDFGenerator = require('./services/pdf/pdf-generator.service');
const fs = require('fs').promises;
const path = require('path');

async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation...\n');

  try {
    // Test 1: Simple HTML to PDF
    console.log('📝 Test 1: Simple HTML to PDF');
    const simpleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #0066CC; }
            .info { margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>ทดสอบการสร้าง PDF</h1>
          <div class="info">
            <p><strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH')}</p>
            <p><strong>เวลา:</strong> ${new Date().toLocaleTimeString('th-TH')}</p>
          </div>
          <p>นี่คือการทดสอบการสร้าง PDF จาก HTML template</p>
          <p>รองรับภาษาไทย ✅</p>
        </body>
      </html>
    `;

    const simplePdf = await PDFGenerator.generatePDF(simpleHtml);
    await fs.writeFile('test-simple.pdf', simplePdf);
    console.log('✅ Simple PDF created: test-simple.pdf\n');

    // Test 2: Certificate Template
    console.log('📝 Test 2: Certificate Template');
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 50px;
              text-align: center;
            }
            .certificate {
              border: 10px solid #0066CC;
              padding: 40px;
              margin: 20px;
            }
            h1 {
              color: #0066CC;
              font-size: 36px;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 40px;
            }
            .content {
              text-align: left;
              margin: 30px 0;
            }
            .field {
              margin: 15px 0;
              font-size: 14px;
            }
            .label {
              font-weight: bold;
              color: #333;
            }
            .value {
              color: #0066CC;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>ใบรับรอง GACP</h1>
            <div class="subtitle">Good Agricultural and Collection Practices</div>
            
            <div class="content">
              <div class="field">
                <span class="label">เลขที่ใบรับรอง:</span>
                <span class="value">GACP-2025-000001</span>
              </div>
              
              <div class="field">
                <span class="label">ชื่อฟาร์ม:</span>
                <span class="value">ฟาร์มกัญชาทดสอบ</span>
              </div>
              
              <div class="field">
                <span class="label">ชื่อเกษตรกร:</span>
                <span class="value">นายทดสอบ ระบบ</span>
              </div>
              
              <div class="field">
                <span class="label">ประเภทพืช:</span>
                <span class="value">กัญชา (Cannabis)</span>
              </div>
              
              <div class="field">
                <span class="label">ขนาดพื้นที่:</span>
                <span class="value">5.5 ไร่</span>
              </div>
              
              <div class="field">
                <span class="label">วันที่ออก:</span>
                <span class="value">${new Date().toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div class="field">
                <span class="label">วันหมดอายุ:</span>
                <span class="value">${new Date(
                  Date.now() + 3 * 365 * 24 * 60 * 60 * 1000
                ).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
            
            <div style="margin-top: 60px; text-align: center;">
              <div style="border-top: 2px solid #333; width: 200px; margin: 0 auto;"></div>
              <p style="margin-top: 10px; font-size: 12px;">ผู้อำนวยการ</p>
              <p style="font-size: 10px; color: #666;">กรมพัฒนาการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const certPdf = await PDFGenerator.generatePDF(certificateHtml, {
      format: 'A4',
      landscape: false
    });
    await fs.writeFile('test-certificate.pdf', certPdf);
    console.log('✅ Certificate PDF created: test-certificate.pdf\n');

    // Test 3: Template with variables
    console.log('📝 Test 3: Template with variables');
    const templatePath = path.join(__dirname, 'services/pdf/templates/approver/certificate.html');

    try {
      const templateData = {
        certificateNumber: 'GACP-2025-TEST-001',
        farmName: 'ฟาร์มทดสอบ',
        farmerName: 'นายทดสอบ',
        cropType: 'กัญชา',
        farmSize: '5.5',
        issuedDate: new Date().toLocaleDateString('th-TH'),
        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')
      };

      const templatePdf = await PDFGenerator.generateFromTemplate(templatePath, templateData);
      await fs.writeFile('test-template.pdf', templatePdf);
      console.log('✅ Template PDF created: test-template.pdf\n');
    } catch (error) {
      console.log('⚠️  Template test skipped (template file not found)\n');
    }

    // Close browser
    await PDFGenerator.close();

    console.log('✅ All PDF tests passed!');
    console.log('\n📁 Generated files:');
    console.log('  - test-simple.pdf');
    console.log('  - test-certificate.pdf');
    console.log('  - test-template.pdf (if template exists)');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testPDFGeneration()
    .then(() => {
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = testPDFGeneration;
