// MongoDB Connection Test
// Run this file to test MongoDB Atlas connection

require('dotenv').config();

const testConnection = async () => {
  console.info('🔄 Testing MongoDB Connection...');
  console.info('📍 MongoDB URI:', process.env.MONGODB_URI_SIMPLE?.replace(/:[^:]*@/, ':****@'));

  try {
    const mongoose = require('mongoose');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI_SIMPLE, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.info('✅ MongoDB Atlas connected successfully!');
    console.info('📊 Connection details:');
    console.info('   - Database:', mongoose.connection.db.databaseName);
    console.info('   - Host:', mongoose.connection.host);
    console.info('   - Port:', mongoose.connection.port);
    console.info('   - Ready State:', mongoose.connection.readyState);

    // Test basic operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.info('📦 Available collections:', collections.length);

    await mongoose.disconnect();
    console.info('🔌 Disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('📋 Error details:');
    console.error('   - Message:', error.message);
    console.error('   - Code:', error.code);

    if (error.message.includes('ECONNREFUSED')) {
      console.info('\n💡 Solution:');
      console.info('   This error means MongoDB server is not running.');
      console.info('   ✅ Good news: Your .env is now configured for MongoDB Atlas!');
      console.info('   🔧 Please install Node.js to run this test:');
      console.info('      winget install OpenJS.NodeJS');
    }

    if (error.message.includes('authentication failed')) {
      console.info('\n💡 Solution:');
      console.info('   Check your MongoDB Atlas credentials in .env file');
    }

    process.exit(1);
  }
};

testConnection();
