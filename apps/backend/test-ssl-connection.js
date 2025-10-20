/**
 * MongoDB Atlas SSL/TLS Connection Test
 * Tests SSL configuration and troubleshoots TLS errors
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testSSLConnection() {
  console.info('🔒 Testing MongoDB Atlas SSL/TLS Connection...');
  console.info('================================================');

  // Get environment variables
  const mongoURI = process.env.MONGODB_URI_SIMPLE || process.env.MONGODB_URI;

  if (!mongoURI) {
    console.info('❌ ERROR: No MongoDB URI found in environment variables');
    process.exit(1);
  }

  // Display URI (hide password)
  const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.info('🔗 URI:', maskedURI);
  console.info('');

  // Test different SSL configurations
  const sslConfigurations = [
    {
      name: 'Standard Atlas SSL Configuration',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false
      }
    },
    {
      name: 'Simplified SSL Configuration',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 15000,
        ssl: true,
        tls: true
      }
    },
    {
      name: 'Basic Connection (no explicit SSL options)',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 20000
      }
    }
  ];

  for (let i = 0; i < sslConfigurations.length; i++) {
    const config = sslConfigurations[i];
    console.info(`🧪 Testing Configuration ${i + 1}: ${config.name}`);
    console.info('---------------------------------------------');

    try {
      // Close any existing connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.info('⏳ Attempting connection...');
      await mongoose.connect(mongoURI, config.options);

      console.info('✅ SUCCESS: SSL/TLS connection established!');
      console.info('📊 Connection Details:');
      console.info('   Database:', mongoose.connection.name || mongoose.connection.db.databaseName);
      console.info('   Host:', mongoose.connection.host);
      console.info('   Port:', mongoose.connection.port);
      console.info('   Ready State:', mongoose.connection.readyState);

      // Test basic database operation
      console.info('');
      console.info('🧪 Testing database operations...');
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.info('   Collections found:', collections.length);

      // Test ping
      const admin = mongoose.connection.db.admin();
      const pingResult = await admin.ping();
      console.info('   Database ping successful:', pingResult.ok === 1 ? 'YES' : 'NO');

      console.info('');
      console.info('🎉 SSL/TLS connection test PASSED!');
      console.info(`✅ Use Configuration: ${config.name}`);

      await mongoose.disconnect();
      return;
    } catch (error) {
      console.info('❌ FAILED:', error.message);

      // Analyze the error
      if (
        error.message.includes('TLSV1_ALERT_INTERNAL_ERROR') ||
        error.message.includes('SSL alert number 80')
      ) {
        console.info('');
        console.info('💡 SSL/TLS Alert 80 Error Analysis:');
        console.info('   This typically indicates:');
        console.info('   1. SSL/TLS version mismatch');
        console.info('   2. Certificate validation issues');
        console.info('   3. Network-level SSL blocking');
        console.info('   4. Windows SSL/TLS configuration problems');
      }

      if (error.message.includes('IP')) {
        console.info('');
        console.info('💡 IP Whitelist Issue:');
        console.info('   1. Go to https://cloud.mongodb.com');
        console.info('   2. Security → Network Access');
        console.info('   3. Add your current IP or 0.0.0.0/0');
      }

      console.info('');
      console.info('🔄 Trying next configuration...');
      console.info('');

      // Clean up connection
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }

  console.info('❌ All SSL configurations failed');
  console.info('');
  console.info('🛠️ Troubleshooting Steps:');
  console.info('1. Check Windows SSL/TLS settings');
  console.info('2. Update Node.js to latest LTS version');
  console.info('3. Check corporate firewall/proxy settings');
  console.info('4. Verify MongoDB Atlas cluster is running');
  console.info('5. Try connecting from a different network');
  console.info('');
  console.info('🌐 Network Diagnostic Commands:');
  console.info('   nslookup thai-gacp.re1651p.mongodb.net');
  console.info('   telnet thai-gacp.re1651p.mongodb.net 27017');

  process.exit(1);
}

// Run the test
testSSLConnection().catch(console.error);
