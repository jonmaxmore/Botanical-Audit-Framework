/**
 * Clean and Setup Test Users
 * Remove existing loadtest users and create fresh ones
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp';
const User = require('../src/models/User');

async function cleanAndSetup() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ Connected\n');

    // Delete all existing loadtest users
    // eslint-disable-next-line no-console
    console.log('🗑️  Deleting existing loadtest users...');
    const deleteResult = await User.deleteMany({ 
      email: { $regex: /^loadtest.*@gacp\.dtam\.go\.th$/ } 
    });
    // eslint-disable-next-line no-console
    console.log(`✅ Deleted ${deleteResult.deletedCount} users\n`);

    // Create fresh test users
    // eslint-disable-next-line no-console
    console.log('👤 Creating test users...\n');
    
    const testUsers = [];
    
    for (let i = 0; i <= 10; i++) {
      testUsers.push({
        email: i === 0 ? 'loadtest@gacp.dtam.go.th' : `loadtest${i}@gacp.dtam.go.th`,
        password: 'LoadTest123456!',
        firstName: 'Load',
        lastName: i === 0 ? 'Test' : `Test ${i}`,
        role: i < 5 ? 'farmer' : i < 7 ? 'inspector' : i < 9 ? 'auditor' : 'admin',
        status: 'active',
        isEmailVerified: true
      });
    }

    for (const testUser of testUsers) {
      try {
        await User.create(testUser);
        // eslint-disable-next-line no-console
        console.log(`✅ Created: ${testUser.email} (${testUser.role})`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to create ${testUser.email}:`, error.message);
      }
    }

    // eslint-disable-next-line no-console
    console.log('\n' + '='.repeat(60));
    // eslint-disable-next-line no-console
    console.log(`✅ Successfully created ${testUsers.length} test users`);
    // eslint-disable-next-line no-console
    console.log('='.repeat(60) + '\n');
    
    // eslint-disable-next-line no-console
    console.log('Test Credentials:');
    // eslint-disable-next-line no-console
    console.log('  Email: loadtest@gacp.dtam.go.th (or loadtest1-10@gacp.dtam.go.th)');
    // eslint-disable-next-line no-console
    console.log('  Password: LoadTest123456!');
    // eslint-disable-next-line no-console
    console.log('  (Same password for all test users)\n');

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('👋 Disconnected');
  }
}

cleanAndSetup();
