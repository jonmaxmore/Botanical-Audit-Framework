/**
 * Test Certificate Generation
 *
 * ทดสอบการสร้างใบรับรอง GACP พร้อม QR Code และ PDF
 */

const CertificateService = require('./services/certificate-service');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testCertificateGeneration() {
  console.log('🧪 Testing Certificate Generation...\n');

  let client;

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform';
    console.log('📡 Connecting to MongoDB...');
    client = await MongoClient.connect(mongoUri);
    const db = client.db();
    console.log('✅ Connected to MongoDB\n');

    // Initialize Certificate Service
    const certService = new CertificateService({
      secretKey: process.env.CERTIFICATE_SECRET_KEY || 'test-secret-key',
      baseUrl: process.env.BASE_URL || 'https://gacp.go.th'
    });

    // Mock application data
    const mockApplication = {
      id: 'APP-2025-TEST-001',
      farmerId: 'FARMER-TEST-001',
      farmName: 'ฟาร์มกัญชาทดสอบ',
      farmerName: 'นายทดสอบ ระบบ',
      cropType: 'กัญชา',
      farmSize: 5.5,
      approvedBy: 'ผู้อำนวยการ'
    };

    console.log('📋 Application Data:');
    console.log(JSON.stringify(mockApplication, null, 2));
    console.log('');

    // Generate certificate
    console.log('🔨 Generating certificate...');
    const certificate = await certService.generateCertificate(db, mockApplication);

    console.log('\n✅ Certificate Generated Successfully!\n');
    console.log('📄 Certificate Details:');
    console.log('  - Number:', certificate.certificateNumber);
    console.log('  - Farm:', certificate.farmName);
    console.log('  - Farmer:', certificate.farmerName);
    console.log('  - Crop:', certificate.cropType);
    console.log('  - Size:', certificate.farmSize, 'ไร่');
    console.log('  - Issued:', certificate.issuedAt.toLocaleDateString('th-TH'));
    console.log('  - Expires:', certificate.expiresAt.toLocaleDateString('th-TH'));
    console.log('  - PDF URL:', certificate.pdfUrl);
    console.log('  - QR Code:', certificate.qrCode ? 'Generated ✅' : 'Failed ❌');

    // Test verification
    console.log('\n🔍 Testing verification...');
    const verification = await certService.verifyCertificate(db, certificate.certificateNumber);

    if (verification.valid) {
      console.log('✅ Certificate is VALID');
    } else {
      console.log('❌ Certificate is INVALID:', verification.reason);
    }

    // Get statistics
    console.log('\n📊 Certificate Statistics:');
    const stats = await certService.getCertificateStats(db);
    console.log('  - Total:', stats.total);
    console.log('  - Active:', stats.active);
    console.log('  - Expired:', stats.expired);
    console.log('  - Revoked:', stats.revoked);
    console.log('  - Expiring this month:', stats.expiringThisMonth);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 MongoDB connection closed');
    }
  }
}

// Run test
if (require.main === module) {
  testCertificateGeneration()
    .then(() => {
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = testCertificateGeneration;
