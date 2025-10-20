/**
 * MongoDB Atlas Collection Setup Script
 * Purpose: Auto-create collections and indexes for GACP Platform
 * Environment: Cloud (MongoDB Atlas)
 * Created: October 15, 2025
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const collections = [
  {
    name: 'users',
    indexes: [
      { key: { email: 1 }, unique: true },
      { key: { nationalId: 1 }, unique: true, sparse: true },
      { key: { phoneNumber: 1 } },
      { key: { role: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'applications',
    indexes: [
      { key: { applicationNumber: 1 }, unique: true },
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { farmerId: 1, status: 1 } },
    ],
  },
  {
    name: 'jobTickets',
    indexes: [
      { key: { ticketNumber: 1 }, unique: true },
      { key: { applicationId: 1 } },
      { key: { assignedTo: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'payments',
    indexes: [
      { key: { paymentNumber: 1 }, unique: true },
      { key: { applicationId: 1 } },
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'certificates',
    indexes: [
      { key: { certificateNumber: 1 }, unique: true },
      { key: { applicationId: 1 } },
      { key: { farmerId: 1 } },
      { key: { status: 1 } },
      { key: { expiryDate: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'farms',
    indexes: [
      { key: { farmCode: 1 }, unique: true, sparse: true },
      { key: { ownerId: 1 } },
      { key: { location: '2dsphere' } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'crops',
    indexes: [
      { key: { farmId: 1 } },
      { key: { cropType: 1 } },
      { key: { plantingDate: -1 } },
      { key: { status: 1 } },
    ],
  },
  {
    name: 'sopRecords',
    indexes: [
      { key: { farmId: 1 } },
      { key: { cropId: 1 } },
      { key: { recordDate: -1 } },
      { key: { activityType: 1 } },
    ],
  },
  {
    name: 'chemicalRegistry',
    indexes: [
      { key: { farmId: 1 } },
      { key: { chemicalName: 1 } },
      { key: { usageDate: -1 } },
      { key: { cropId: 1 } },
    ],
  },
  {
    name: 'qrCodes',
    indexes: [
      { key: { qrCode: 1 }, unique: true },
      { key: { certificateId: 1 } },
      { key: { farmId: 1 } },
      { key: { createdAt: -1 } },
    ],
  },
  {
    name: 'notifications',
    indexes: [
      { key: { userId: 1 } },
      { key: { read: 1 } },
      { key: { createdAt: -1 } },
      { key: { userId: 1, read: 1 } },
    ],
  },
  {
    name: 'auditLogs',
    indexes: [
      { key: { userId: 1 } },
      { key: { action: 1 } },
      { key: { timestamp: -1 } },
      { key: { entityType: 1, entityId: 1 } },
    ],
  },
  {
    name: 'sessions',
    indexes: [
      { key: { sessionId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ],
  },
  {
    name: 'otpRecords',
    indexes: [
      { key: { phoneNumber: 1 } },
      { key: { email: 1 } },
      { key: { createdAt: 1 }, expireAfterSeconds: 600 },
      { key: { verified: 1 } },
    ],
  },
  {
    name: 'surveyResponses',
    indexes: [{ key: { surveyId: 1 } }, { key: { respondentId: 1 } }, { key: { submittedAt: -1 } }],
  },
  {
    name: 'fileUploads',
    indexes: [
      { key: { uploadedBy: 1 } },
      { key: { entityType: 1, entityId: 1 } },
      { key: { fileType: 1 } },
      { key: { uploadedAt: -1 } },
    ],
  },
];

async function setupCollections() {
  let client;

  try {
    console.log('🚀 Starting MongoDB Atlas collection setup...\n');

    // Connect to MongoDB Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    const db = client.db(process.env.MONGODB_DATABASE || 'gacp_production');
    console.log(`📂 Using database: ${db.databaseName}\n`);

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    console.log('📋 Setting up collections and indexes...\n');

    let created = 0;
    let skipped = 0;
    let indexesCreated = 0;

    for (const collectionDef of collections) {
      const { name, indexes } = collectionDef;

      try {
        // Create collection if it doesn't exist
        if (!existingNames.includes(name)) {
          await db.createCollection(name);
          console.log(`  ✅ Created collection: ${name}`);
          created++;
        } else {
          console.log(`  ℹ️  Collection exists: ${name}`);
          skipped++;
        }

        // Create indexes
        const collection = db.collection(name);

        for (const indexDef of indexes) {
          try {
            const options = {};
            if (indexDef.unique) options.unique = true;
            if (indexDef.sparse) options.sparse = true;
            if (indexDef.expireAfterSeconds !== undefined) {
              options.expireAfterSeconds = indexDef.expireAfterSeconds;
            }

            await collection.createIndex(indexDef.key, options);
            indexesCreated++;
          } catch (err) {
            if (err.code !== 85 && err.code !== 86) {
              // Ignore "index already exists" errors
              console.warn(`     ⚠️  Index creation warning for ${name}:`, err.message);
            }
          }
        }

        console.log(`     📊 Created ${indexes.length} indexes for ${name}`);
      } catch (err) {
        console.error(`  ❌ Error with collection ${name}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Setup completed successfully!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   Collections created: ${created}`);
    console.log(`   Collections skipped: ${skipped}`);
    console.log(`   Total indexes created: ${indexesCreated}`);
    console.log(`   Total collections: ${collections.length}`);

    // Create sample admin user if users collection is empty
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();

    if (userCount === 0) {
      console.log('\n👤 Creating sample admin user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin@2025', 12);

      await usersCollection.insertOne({
        email: 'admin@gacp-platform.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phoneNumber: '+66812345678',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Sample admin user created:');
      console.log('   Email: admin@gacp-platform.com');
      console.log('   Password: Admin@2025');
      console.log('   ⚠️  Please change this password after first login!');
    }

    console.log('\n✨ Your MongoDB Atlas database is ready!');
    console.log('🚀 You can now start the application with: pnpm dev\n');
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Verify your database credentials');
    console.error('   4. Check your internet connection\n');
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('👋 Connection closed.\n');
    }
  }
}

// Run the setup
setupCollections();
