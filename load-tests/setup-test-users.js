#!/usr/bin/env node

/**
 * Setup Test Users for Load Testing
 * Creates test user accounts in the database
 *
 * Run from project root: node load-tests/setup-test-users.js
 */

const path = require('path');
const mongoose = require('mongoose');

// Load environment from backend
require('dotenv').config({ path: path.join(__dirname, '../apps/backend/.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp';

// Import User model from backend
const User = require('../apps/backend/src/models/User');

// Test users to create (using correct User model fields)
const testUsers = [
  {
    email: 'loadtest@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test',
    role: 'farmer',
    status: 'active'
  },
  {
    email: 'loadtest1@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 1',
    role: 'farmer',
    status: 'active'
  },
  {
    email: 'loadtest2@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 2',
    role: 'farmer',
    status: 'active'
  },
  {
    email: 'loadtest3@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 3',
    role: 'farmer',
    status: 'active'
  },
  {
    email: 'loadtest4@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 4',
    role: 'farmer',
    status: 'active'
  },
  {
    email: 'loadtest5@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 5',
    role: 'inspector',
    status: 'active'
  },
  {
    email: 'loadtest6@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 6',
    role: 'inspector',
    status: 'active'
  },
  {
    email: 'loadtest7@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 7',
    role: 'auditor',
    status: 'active'
  },
  {
    email: 'loadtest8@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 8',
    role: 'auditor',
    status: 'active'
  },
  {
    email: 'loadtest9@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 9',
    role: 'admin',
    status: 'active'
  },
  {
    email: 'loadtest10@gacp.dtam.go.th',
    password: 'LoadTest123456!',
    firstName: 'Load',
    lastName: 'Test 10',
    role: 'admin',
    status: 'active'
  }
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
          isEmailVerified: true // Skip verification for test users
        });

        console.log(`✅ Created: ${testUser.email} (${testUser.role})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create ${testUser.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${created} users`);
    console.log(`⏭️  Skipped: ${skipped} users (already exist)`);
    console.log(`📊 Total: ${testUsers.length} users`);
    console.log('='.repeat(60) + '\n');

    console.log('Test Credentials:');
    console.log('  Email: loadtest@gacp.dtam.go.th');
    console.log('  Password: LoadTest123456!');
    console.log('  (Same password for all test users)\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run setup
setupTestUsers();
