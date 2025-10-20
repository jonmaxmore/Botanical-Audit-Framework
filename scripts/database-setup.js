/**
 * Database Setup and Clone Script for GACP Certification System
 * Creates sample data and initializes database collections
 */

const { MongoClient } = require('mongodb');
const path = require('path');

// Database configuration
const DATABASE_URI = process.env.MONGODB_URI_SIMPLE || 'mongodb://localhost:27017/gacp_production';
const DATABASE_NAME = 'gacp_production';

console.log('🔄 GACP Database Setup & Clone Utility');
console.log('=====================================');

class GACPDatabaseSetup {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      console.log(`📡 Connecting to MongoDB: ${DATABASE_URI}`);
      this.client = new MongoClient(DATABASE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);

      // Test the connection
      await this.db.admin().ping();
      console.log('✅ Successfully connected to MongoDB');

      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async checkExistingData() {
    console.log('\n🔍 Checking existing collections...');

    const collections = await this.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    console.log('📊 Found collections:', collectionNames.length > 0 ? collectionNames : 'None');

    // Check document counts
    for (const name of collectionNames) {
      const count = await this.db.collection(name).countDocuments();
      console.log(`   📄 ${name}: ${count} documents`);
    }

    return collectionNames;
  }

  async createIndexes() {
    console.log('\n🗂️  Creating database indexes...');

    // Users collection indexes
    await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await this.db.collection('users').createIndex({ farmId: 1 });
    await this.db.collection('users').createIndex({ createdAt: -1 });

    // Certificates collection indexes
    await this.db.collection('certificates').createIndex({ certificateId: 1 }, { unique: true });
    await this.db.collection('certificates').createIndex({ farmId: 1 });
    await this.db.collection('certificates').createIndex({ status: 1 });
    await this.db.collection('certificates').createIndex({ expiryDate: 1 });

    // Track & Trace indexes
    await this.db.collection('tracktraces').createIndex({ traceId: 1 }, { unique: true });
    await this.db.collection('tracktraces').createIndex({ farmId: 1 });
    await this.db.collection('tracktraces').createIndex({ productType: 1 });

    // Applications indexes
    await this.db.collection('applications').createIndex({ applicationId: 1 }, { unique: true });
    await this.db.collection('applications').createIndex({ farmId: 1 });
    await this.db.collection('applications').createIndex({ status: 1 });

    // Farms indexes
    await this.db.collection('farms').createIndex({ farmId: 1 }, { unique: true });
    await this.db.collection('farms').createIndex({ ownerId: 1 });
    await this.db.collection('farms').createIndex({ location: '2dsphere' });

    // Audit logs indexes
    await this.db.collection('auditlogs').createIndex({ userId: 1 });
    await this.db.collection('auditlogs').createIndex({ action: 1 });
    await this.db.collection('auditlogs').createIndex({ timestamp: -1 });

    console.log('✅ Database indexes created successfully');
  }

  async createSampleData() {
    console.log('\n📦 Creating sample data...');

    // Sample farms data
    const farms = [
      {
        farmId: 'FARM001',
        farmName: 'ฟาร์มสมุนไพรเขียว',
        farmNameEN: 'Green Herbal Farm',
        ownerId: 'USER001',
        location: {
          type: 'Point',
          coordinates: [100.5018, 13.7563], // Bangkok coordinates
        },
        address: {
          district: 'บางรัก',
          province: 'กรุงเทพมหานคร',
          postalCode: '10500',
          coordinates: [100.5018, 13.7563],
        },
        farmSize: 50.5,
        cropTypes: ['herbal_medicine', 'vegetable'],
        organicCertified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        farmId: 'FARM002',
        farmName: 'สวนกัญชาการแพทย์เชียงใหม่',
        farmNameEN: 'Chiang Mai Medical Cannabis Garden',
        ownerId: 'USER002',
        location: {
          type: 'Point',
          coordinates: [98.9817, 18.7883], // Chiang Mai coordinates
        },
        address: {
          district: 'เมืองเชียงใหม่',
          province: 'เชียงใหม่',
          postalCode: '50000',
          coordinates: [98.9817, 18.7883],
        },
        farmSize: 25.0,
        cropTypes: ['cannabis'],
        organicCertified: true,
        medicalLicense: 'MED-CNB-2025-001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Sample users data
    const users = [
      {
        userId: 'USER001',
        email: 'farmer1@gacp.co.th',
        farmId: 'FARM001',
        profile: {
          firstName: 'สมชาย',
          lastName: 'เกษตรกร',
          firstNameEN: 'Somchai',
          lastNameEN: 'Farmer',
          phone: '+66812345678',
          idCard: '1234567890123',
        },
        role: 'farmer',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        userId: 'USER002',
        email: 'medical.farmer@gacp.co.th',
        farmId: 'FARM002',
        profile: {
          firstName: 'นพ. วิชัย',
          lastName: 'กัญชาการแพทย์',
          firstNameEN: 'Dr. Wichai',
          lastNameEN: 'Medical Cannabis',
          phone: '+66812345679',
          idCard: '9876543210987',
        },
        role: 'medical_farmer',
        medicalLicense: 'MED-DOC-2025-001',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        userId: 'USER003',
        email: 'inspector@gacp.co.th',
        profile: {
          firstName: 'สุรีย์',
          lastName: 'ผู้ตรวจสอบ',
          firstNameEN: 'Suree',
          lastNameEN: 'Inspector',
          phone: '+66812345680',
          idCard: '5555555555555',
        },
        role: 'inspector',
        department: 'DTAM',
        certificationLevel: 'senior',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
    ];

    // Sample applications
    const applications = [
      {
        applicationId: 'APP001',
        farmId: 'FARM001',
        applicantId: 'USER001',
        certificationType: 'GACP_BASIC',
        status: 'submitted',
        submittedAt: new Date(),
        documents: [
          { type: 'farm_registration', status: 'approved' },
          { type: 'land_ownership', status: 'approved' },
          { type: 'water_quality_test', status: 'pending' },
        ],
        inspectionScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Sample certificates
    const certificates = [
      {
        certificateId: 'CERT001',
        farmId: 'FARM002',
        farmerId: 'USER002',
        certificateType: 'GACP_CANNABIS',
        status: 'active',
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        inspectorId: 'USER003',
        score: 95.5,
        standards: {
          soilQuality: 'passed',
          waterQuality: 'passed',
          pesticides: 'passed',
          heavyMetals: 'passed',
          microbiology: 'passed',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Sample track & trace data
    const trackTraces = [
      {
        traceId: 'TRACE001',
        farmId: 'FARM001',
        productType: 'herbal_medicine',
        batchId: 'BATCH001',
        plantingDate: new Date('2024-01-15'),
        harvestDate: new Date('2024-04-15'),
        productName: 'ฟ้าทะลายโจร',
        productNameEN: 'Andrographis paniculata',
        quantity: 100,
        unit: 'kg',
        qualityGrade: 'A',
        certificationStatus: 'certified',
        status: 'completed',
        timeline: [
          { phase: 'planting', date: new Date('2024-01-15'), status: 'completed' },
          { phase: 'growing', date: new Date('2024-02-15'), status: 'completed' },
          { phase: 'harvesting', date: new Date('2024-04-15'), status: 'completed' },
          { phase: 'processing', date: new Date('2024-04-20'), status: 'completed' },
          { phase: 'packaging', date: new Date('2024-04-25'), status: 'completed' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert sample data
    try {
      await this.db.collection('farms').insertMany(farms);
      console.log(`✅ Inserted ${farms.length} sample farms`);

      await this.db.collection('users').insertMany(users);
      console.log(`✅ Inserted ${users.length} sample users`);

      await this.db.collection('applications').insertMany(applications);
      console.log(`✅ Inserted ${applications.length} sample applications`);

      await this.db.collection('certificates').insertMany(certificates);
      console.log(`✅ Inserted ${certificates.length} sample certificates`);

      await this.db.collection('tracktraces').insertMany(trackTraces);
      console.log(`✅ Inserted ${trackTraces.length} sample track & trace records`);

      // Create empty collections for other services
      await this.db.createCollection('auditlogs');
      await this.db.createCollection('system_test');
      await this.db.createCollection('integration_test');

      console.log('✅ Sample data creation completed');
    } catch (error) {
      console.error('❌ Error creating sample data:', error.message);
    }
  }

  async exportData() {
    console.log('\n📤 Exporting database data...');

    const collections = [
      'users',
      'farms',
      'applications',
      'certificates',
      'tracktraces',
      'auditlogs',
    ];
    const exportData = {};

    for (const collectionName of collections) {
      const data = await this.db.collection(collectionName).find({}).toArray();
      exportData[collectionName] = data;
      console.log(`📄 Exported ${data.length} documents from ${collectionName}`);
    }

    // Save to JSON file
    const fs = require('fs');
    const exportPath = path.join(__dirname, 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`💾 Database exported to: ${exportPath}`);

    return exportData;
  }

  async clearDatabase() {
    console.log('\n🗑️  Clearing existing data...');

    const collections = await this.db.listCollections().toArray();

    for (const collection of collections) {
      await this.db.collection(collection.name).deleteMany({});
      console.log(`🗑️  Cleared collection: ${collection.name}`);
    }

    console.log('✅ Database cleared');
  }

  async setupDatabase(options = {}) {
    const { clearFirst = false, createSample = true, createIndexes = true } = options;

    console.log('\n🚀 Starting database setup...');

    if (clearFirst) {
      await this.clearDatabase();
    }

    if (createIndexes) {
      await this.createIndexes();
    }

    if (createSample) {
      await this.createSampleData();
    }

    await this.checkExistingData();

    console.log('\n✅ Database setup completed successfully!');
  }
}

// Main execution
async function main() {
  const dbSetup = new GACPDatabaseSetup();

  try {
    const connected = await dbSetup.connect();
    if (!connected) {
      process.exit(1);
    }

    // Check current state
    await dbSetup.checkExistingData();

    // Setup database with sample data
    await dbSetup.setupDatabase({
      clearFirst: false, // Set to true to clear existing data
      createSample: true,
      createIndexes: true,
    });

    // Export data for backup
    await dbSetup.exportData();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await dbSetup.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = GACPDatabaseSetup;
