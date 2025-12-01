console.log('Starting...');
try {
  const mongoose = require('mongoose');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const User = require('./models/User');
  const MongoDBUserRepository = require('./modules/auth-farmer/infrastructure/database/user-model');
} catch (e) {
  console.error('Require error:', e);
  process.exit(1);
}
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');
const MongoDBUserRepository = require('./modules/auth-farmer/infrastructure/database/user-model');

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  console.log('Connected to MongoDB');

  const userRepo = new MongoDBUserRepository(mongoose.connection);

  const userData = new User({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '0812345678',
    idCard: '1234567890123',
    laserCode: 'ME0123456789',
    role: 'farmer',
    status: 'pending_verification',
    verificationStatus: 'pending',
    farmerType: 'individual',
    farmingExperience: 5,
  });

  try {
    console.log('Saving user...');
    const savedUser = await userRepo.save(userData);
    console.log('User saved:', savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
  }

  await mongoose.disconnect();
  await mongoServer.stop();
}

run();
