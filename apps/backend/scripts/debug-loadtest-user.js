require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');

async function debugUser() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Try to find the test user
    console.log('🔍 Looking for user: loadtest@gacp.dtam.go.th');
    const user = await User.findOne({
      email: 'loadtest@gacp.dtam.go.th'
    }).select('+password');

    if (!user) {
      console.log('❌ User NOT found in database!');

      // Check if any loadtest users exist
      const count = await User.countDocuments({
        email: { $regex: /^loadtest/i }
      });
      console.log(`Found ${count} users with email starting with "loadtest"`);

      if (count > 0) {
        const users = await User.find({
          email: { $regex: /^loadtest/i }
        }).limit(3);
        console.log('\nFirst 3 loadtest users:');
        users.forEach(u => {
          console.log(`  - ${u.email} (${u.role})`);
        });
      }
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('\n📋 User Details:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Active: ${user.isActive}`);
    console.log(`  Email Verified: ${user.isEmailVerified}`);
    console.log(`  Locked: ${user.isLocked || false}`);

    console.log('\n🔐 Password Field:');
    console.log(`  Exists: ${!!user.password}`);
    console.log(`  Type: ${typeof user.password}`);
    console.log(`  Length: ${user.password?.length || 0}`);
    console.log(`  Starts with $2a$ or $2b$: ${user.password?.startsWith('$2')}`);
    console.log(`  First 10 chars: ${user.password?.substring(0, 10)}`);

    // Test password comparison
    console.log('\n🧪 Testing Password Comparison:');
    const testPassword = 'LoadTest123456!';
    console.log(`  Test password: "${testPassword}"`);

    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`  ✅ bcrypt.compare result: ${isMatch}`);

      if (!isMatch) {
        console.log('\n❌ PASSWORD DOES NOT MATCH!');
        console.log('This is why login is failing.');

        // Try comparing with plain text (shouldn't match, but let's check)
        const plainMatch = testPassword === user.password;
        console.log(`\nIs password stored as plain text? ${plainMatch}`);

        if (plainMatch) {
          console.log('🚨 PASSWORD IS STORED AS PLAIN TEXT!');
          console.log('The pre-save hook is not working.');
        }
      } else {
        console.log('\n✅ PASSWORD MATCHES!');
        console.log('This user should be able to login.');
      }
    } catch (error) {
      console.log(`  ❌ Error during comparison: ${error.message}`);
    }

    // Test the user model's comparePassword method
    console.log('\n🧪 Testing User.comparePassword method:');
    try {
      const methodResult = await user.comparePassword(testPassword);
      console.log(`  ✅ user.comparePassword result: ${methodResult}`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

debugUser();
