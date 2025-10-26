/**
 * Setup Test Users for Load Testing
 * Creates test user accounts in the database
 *
 * Run from backend directory: node scripts/setup-loadtest-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp';

// Import User model
const User = require('../src/models/User');

// Test users to create (using correct User model fields)
const testUsers = [
  {
    email: 'loadtest@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test',
    role: 'farmer',
    status: 'active',
    nationalId: '1000000000001',
  },
  {
    email: 'loadtest1@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 1',
    role: 'farmer',
    status: 'active',
    nationalId: '1000000000002',
  },
  {
    email: 'loadtest2@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 2',
    role: 'farmer',
    status: 'active',
    nationalId: '1000000000003',
  },
  {
    email: 'loadtest3@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 3',
    role: 'farmer',
    status: 'active',
    nationalId: '1000000000004',
  },
  {
    email: 'loadtest4@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 4',
    role: 'farmer',
    status: 'active',
    nationalId: '1000000000005',
  },
  {
    email: 'loadtest5@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 5',
    role: 'inspector',
    status: 'active',
    nationalId: '1000000000006',
  },
  {
    email: 'loadtest6@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 6',
    role: 'inspector',
    status: 'active',
    nationalId: '1000000000007',
  },
  {
    email: 'loadtest7@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 7',
    role: 'auditor',
    status: 'active',
    nationalId: '1000000000008',
  },
  {
    email: 'loadtest8@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 8',
    role: 'auditor',
    status: 'active',
    nationalId: '1000000000009',
  },
  {
    email: 'loadtest9@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 9',
    role: 'admin',
    status: 'active',
    nationalId: '1000000000010',
  },
  {
    email: 'loadtest10@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 10',
    role: 'admin',
    status: 'active',
    nationalId: '1000000000011',
  },
];

async function setupTestUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('👤 Creating test users...\n');

    let created = 0;
    let skipped = 0;

    for (const testUser of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: testUser.email });

        if (existingUser) {
          // eslint-disable-next-line no-console
          console.log(`⏭️  Skipped: ${testUser.email} (already exists)`);
          skipped++;
          continue;
        }

        // Create user (password will be hashed by pre-save middleware)
        await User.create({
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
          status: testUser.status,
          nationalId: testUser.nationalId,
          isEmailVerified: true, // Skip verification for test users
        });

        // eslint-disable-next-line no-console
        console.log(`✅ Created: ${testUser.email} (${testUser.role})`);
        created++;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to create ${testUser.email}:`, error.message);
      }
    }

    // eslint-disable-next-line no-console
    console.log('\n' + '='.repeat(60));
    // eslint-disable-next-line no-console
    console.log('Summary');
    // eslint-disable-next-line no-console
    console.log('='.repeat(60));
    // eslint-disable-next-line no-console
    console.log(`✅ Created: ${created} users`);
    // eslint-disable-next-line no-console
    console.log(`⏭️  Skipped: ${skipped} users (already exist)`);
    // eslint-disable-next-line no-console
    console.log(`📊 Total: ${testUsers.length} users`);
    // eslint-disable-next-line no-console
    console.log('='.repeat(60) + '\n');

    // eslint-disable-next-line no-console
    console.log('Test Credentials:');
    // eslint-disable-next-line no-console
    console.log('  Email: loadtest@gacp.dtam.go.th');
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
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run setup
setupTestUsers();
