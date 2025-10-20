/**
 * UAT Test Data Seeder
 * Seeds database with comprehensive test data for all 5 roles and 6 modules
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.uat' });

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit-uat',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  nationalId: String,
  phone: String,
  staffId: String,
  region: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

// Test Users Data
const testUsers = {
  farmers: [
    {
      username: 'farmer001',
      password: 'Test@1234',
      email: 'somchai@farmer.test',
      name: 'Somchai Prasert',
      role: 'farmer',
      nationalId: '1234567890123',
      phone: '0812345678',
      region: 'Central',
    },
    {
      username: 'farmer002',
      password: 'Test@1234',
      email: 'somsri@farmer.test',
      name: 'Somsri Boonmee',
      role: 'farmer',
      nationalId: '1234567890124',
      phone: '0823456789',
      region: 'Northern',
    },
    {
      username: 'farmer003',
      password: 'Test@1234',
      email: 'wichai@farmer.test',
      name: 'Wichai Saengthong',
      role: 'farmer',
      nationalId: '1234567890125',
      phone: '0834567890',
      region: 'Southern',
    },
    {
      username: 'farmer004',
      password: 'Test@1234',
      email: 'nittaya@farmer.test',
      name: 'Nittaya Chaiyaporn',
      role: 'farmer',
      nationalId: '1234567890126',
      phone: '0845678901',
      region: 'Northeastern',
    },
    {
      username: 'farmer005',
      password: 'Test@1234',
      email: 'surachai@farmer.test',
      name: 'Surachai Thongchai',
      role: 'farmer',
      nationalId: '1234567890127',
      phone: '0856789012',
      region: 'Central',
    },
  ],
  reviewers: [
    {
      username: 'reviewer001',
      password: 'Rev@1234',
      email: 'panya@dtam.test',
      name: 'Panya Reviewer',
      role: 'reviewer',
      staffId: 'REV-001',
      phone: '0867890123',
    },
    {
      username: 'reviewer002',
      password: 'Rev@1234',
      email: 'sarawut@dtam.test',
      name: 'Sarawut Review',
      role: 'reviewer',
      staffId: 'REV-002',
      phone: '0878901234',
    },
  ],
  inspectors: [
    {
      username: 'inspector001',
      password: 'Insp@1234',
      email: 'krit@dtam.test',
      name: 'Krit Inspector',
      role: 'inspector',
      staffId: 'INS-001',
      phone: '0889012345',
    },
    {
      username: 'inspector002',
      password: 'Insp@1234',
      email: 'chatchai@dtam.test',
      name: 'Chatchai Inspect',
      role: 'inspector',
      staffId: 'INS-002',
      phone: '0890123456',
    },
    {
      username: 'inspector003',
      password: 'Insp@1234',
      email: 'preecha@dtam.test',
      name: 'Preecha Field',
      role: 'inspector',
      staffId: 'INS-003',
      phone: '0801234567',
    },
  ],
  approvers: [
    {
      username: 'approver001',
      password: 'App@1234',
      email: 'wichai@dtam.test',
      name: 'Wichai Approver',
      role: 'approver',
      staffId: 'APR-001',
      phone: '0812345670',
    },
    {
      username: 'approver002',
      password: 'App@1234',
      email: 'somkid@dtam.test',
      name: 'Somkid Approve',
      role: 'approver',
      staffId: 'APR-002',
      phone: '0823456781',
    },
  ],
  admins: [
    {
      username: 'admin001',
      password: 'Admin@1234',
      email: 'narong@dtam.test',
      name: 'Narong Admin',
      role: 'admin',
      staffId: 'ADM-001',
      phone: '0834567892',
    },
  ],
};

// Seed Users
const seedUsers = async () => {
  console.log('\n📝 Seeding Users...');

  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const allUsers = [
      ...testUsers.farmers,
      ...testUsers.reviewers,
      ...testUsers.inspectors,
      ...testUsers.approvers,
      ...testUsers.admins,
    ];

    // Hash passwords and insert
    for (const user of allUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword,
      });
      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log(
      `\n✅ Successfully seeded ${allUsers.length} users:
      - Farmers: ${testUsers.farmers.length}
      - Reviewers: ${testUsers.reviewers.length}
      - Inspectors: ${testUsers.inspectors.length}
      - Approvers: ${testUsers.approvers.length}
      - Admins: ${testUsers.admins.length}`,
    );
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Farm Schema
const FarmSchema = new mongoose.Schema({
  farmId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerName: String,
  location: {
    province: String,
    district: String,
    subDistrict: String,
    latitude: Number,
    longitude: Number,
  },
  region: String,
  size: Number, // in rai
  cropType: [String],
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const Farm = mongoose.model('Farm', FarmSchema);

// Seed Farms
const seedFarms = async () => {
  console.log('\n🌾 Seeding Farms...');

  try {
    await Farm.deleteMany({});
    console.log('🗑️  Cleared existing farms');

    const farmers = await User.find({ role: 'farmer' });

    const farmData = [
      // Central Region
      {
        farmId: 'FRM-C001',
        name: 'สวนกัญชาเมืองนนท์',
        ownerId: farmers[0]._id,
        ownerName: farmers[0].name,
        location: {
          province: 'นนทบุรี',
          district: 'เมืองนนทบุรี',
          subDistrict: 'บางกระสอ',
          latitude: 13.8661,
          longitude: 100.5182,
        },
        region: 'Central',
        size: 5,
        cropType: ['Cannabis Sativa', 'Cannabis Indica'],
        status: 'active',
      },
      {
        farmId: 'FRM-C002',
        name: 'ฟาร์มกัญชาปทุมธานี',
        ownerId: farmers[4]._id,
        ownerName: farmers[4].name,
        location: {
          province: 'ปทุมธานี',
          district: 'คลองหลวง',
          subDistrict: 'คลองสาม',
          latitude: 13.9621,
          longitude: 100.6622,
        },
        region: 'Central',
        size: 8,
        cropType: ['Cannabis Sativa'],
        status: 'active',
      },
      {
        farmId: 'FRM-C003',
        name: 'สวนแพทย์แผนไทยอยุธยา',
        ownerId: farmers[0]._id,
        ownerName: farmers[0].name,
        location: {
          province: 'พระนครศรีอยุธยา',
          district: 'บางปะอิน',
          subDistrict: 'บางกระสั้น',
          latitude: 14.2246,
          longitude: 100.5769,
        },
        region: 'Central',
        size: 3,
        cropType: ['Cannabis Indica'],
        status: 'active',
      },

      // Northern Region
      {
        farmId: 'FRM-N001',
        name: 'ฟาร์มกัญชาเชียงใหม่',
        ownerId: farmers[1]._id,
        ownerName: farmers[1].name,
        location: {
          province: 'เชียงใหม่',
          district: 'สันทราย',
          subDistrict: 'หนองหาร',
          latitude: 18.8844,
          longitude: 99.0078,
        },
        region: 'Northern',
        size: 10,
        cropType: ['Cannabis Sativa', 'CBD Hemp'],
        status: 'active',
      },
      {
        farmId: 'FRM-N002',
        name: 'สวนกัญชาอินทรีย์แม่ริม',
        ownerId: farmers[1]._id,
        ownerName: farmers[1].name,
        location: {
          province: 'เชียงใหม่',
          district: 'แม่ริม',
          subDistrict: 'ริมใต้',
          latitude: 18.9195,
          longitude: 98.9212,
        },
        region: 'Northern',
        size: 6,
        cropType: ['Cannabis Sativa'],
        status: 'active',
      },
      {
        farmId: 'FRM-N003',
        name: 'ฟาร์มกัญชาแพร่',
        ownerId: farmers[1]._id,
        ownerName: farmers[1].name,
        location: {
          province: 'แพร่',
          district: 'เมืองแพร่',
          subDistrict: 'ในเวียง',
          latitude: 18.1448,
          longitude: 100.1401,
        },
        region: 'Northern',
        size: 4,
        cropType: ['Cannabis Indica'],
        status: 'active',
      },

      // Southern Region
      {
        farmId: 'FRM-S001',
        name: 'สวนกัญชาภูเก็ต',
        ownerId: farmers[2]._id,
        ownerName: farmers[2].name,
        location: {
          province: 'ภูเก็ต',
          district: 'ถลาง',
          subDistrict: 'เทพกระษัตรี',
          latitude: 8.0255,
          longitude: 98.3181,
        },
        region: 'Southern',
        size: 7,
        cropType: ['Cannabis Sativa', 'CBD Hemp'],
        status: 'active',
      },
      {
        farmId: 'FRM-S002',
        name: 'ฟาร์มกัญชาสุราษฎร์ธานี',
        ownerId: farmers[2]._id,
        ownerName: farmers[2].name,
        location: {
          province: 'สุราษฎร์ธานี',
          district: 'เกาะสมุย',
          subDistrict: 'บ่อผุด',
          latitude: 9.5384,
          longitude: 100.0653,
        },
        region: 'Southern',
        size: 5,
        cropType: ['Cannabis Indica'],
        status: 'active',
      },

      // Northeastern Region
      {
        farmId: 'FRM-NE001',
        name: 'สวนกัญชาขอนแก่น',
        ownerId: farmers[3]._id,
        ownerName: farmers[3].name,
        location: {
          province: 'ขอนแก่น',
          district: 'เมืองขอนแก่น',
          subDistrict: 'ในเมือง',
          latitude: 16.4322,
          longitude: 102.8236,
        },
        region: 'Northeastern',
        size: 12,
        cropType: ['Cannabis Sativa', 'CBD Hemp'],
        status: 'active',
      },
      {
        farmId: 'FRM-NE002',
        name: 'ฟาร์มกัญชาอุดรธานี',
        ownerId: farmers[3]._id,
        ownerName: farmers[3].name,
        location: {
          province: 'อุดรธานี',
          district: 'เมืองอุดรธานี',
          subDistrict: 'หมากแข้ง',
          latitude: 17.3647,
          longitude: 102.816,
        },
        region: 'Northeastern',
        size: 9,
        cropType: ['Cannabis Sativa'],
        status: 'active',
      },
    ];

    await Farm.insertMany(farmData);
    console.log(`✅ Successfully seeded ${farmData.length} farms`);
  } catch (error) {
    console.error('❌ Error seeding farms:', error);
    throw error;
  }
};

// Application Schema
const ApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicantName: String,
  status: String,
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: Date,
  reviewedAt: Date,
  inspectedAt: Date,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const Application = mongoose.model('Application', ApplicationSchema);

// Seed Applications
const seedApplications = async () => {
  console.log('\n📋 Seeding Applications...');

  try {
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing applications');

    const farms = await Farm.find();
    const reviewers = await User.find({ role: 'reviewer' });
    const inspectors = await User.find({ role: 'inspector' });
    const approvers = await User.find({ role: 'approver' });

    const applicationData = [
      // Pending Review
      {
        applicationId: 'APP-2025-001',
        farmId: farms[0]._id,
        applicantId: farms[0].ownerId,
        applicantName: farms[0].ownerName,
        status: 'pending_review',
        submittedAt: new Date('2025-10-15'),
      },
      {
        applicationId: 'APP-2025-002',
        farmId: farms[1]._id,
        applicantId: farms[1].ownerId,
        applicantName: farms[1].ownerName,
        status: 'pending_review',
        submittedAt: new Date('2025-10-16'),
      },
      {
        applicationId: 'APP-2025-003',
        farmId: farms[2]._id,
        applicantId: farms[2].ownerId,
        applicantName: farms[2].ownerName,
        status: 'pending_review',
        submittedAt: new Date('2025-10-17'),
      },

      // Under Review
      {
        applicationId: 'APP-2025-004',
        farmId: farms[3]._id,
        applicantId: farms[3].ownerId,
        applicantName: farms[3].ownerName,
        status: 'under_review',
        reviewerId: reviewers[0]._id,
        submittedAt: new Date('2025-10-10'),
        reviewedAt: new Date('2025-10-12'),
      },
      {
        applicationId: 'APP-2025-005',
        farmId: farms[4]._id,
        applicantId: farms[4].ownerId,
        applicantName: farms[4].ownerName,
        status: 'under_review',
        reviewerId: reviewers[1]._id,
        submittedAt: new Date('2025-10-11'),
        reviewedAt: new Date('2025-10-13'),
      },

      // Assigned to Inspector
      {
        applicationId: 'APP-2025-006',
        farmId: farms[5]._id,
        applicantId: farms[5].ownerId,
        applicantName: farms[5].ownerName,
        status: 'assigned_inspector',
        reviewerId: reviewers[0]._id,
        inspectorId: inspectors[0]._id,
        submittedAt: new Date('2025-10-05'),
        reviewedAt: new Date('2025-10-08'),
      },
      {
        applicationId: 'APP-2025-007',
        farmId: farms[6]._id,
        applicantId: farms[6].ownerId,
        applicantName: farms[6].ownerName,
        status: 'assigned_inspector',
        reviewerId: reviewers[1]._id,
        inspectorId: inspectors[1]._id,
        submittedAt: new Date('2025-10-06'),
        reviewedAt: new Date('2025-10-09'),
      },

      // Under Inspection
      {
        applicationId: 'APP-2025-008',
        farmId: farms[7]._id,
        applicantId: farms[7].ownerId,
        applicantName: farms[7].ownerName,
        status: 'under_inspection',
        reviewerId: reviewers[0]._id,
        inspectorId: inspectors[2]._id,
        submittedAt: new Date('2025-10-01'),
        reviewedAt: new Date('2025-10-03'),
      },

      // Pending Approval
      {
        applicationId: 'APP-2025-009',
        farmId: farms[8]._id,
        applicantId: farms[8].ownerId,
        applicantName: farms[8].ownerName,
        status: 'pending_approval',
        reviewerId: reviewers[1]._id,
        inspectorId: inspectors[0]._id,
        submittedAt: new Date('2025-09-20'),
        reviewedAt: new Date('2025-09-22'),
        inspectedAt: new Date('2025-09-25'),
      },
      {
        applicationId: 'APP-2025-010',
        farmId: farms[9]._id,
        applicantId: farms[9].ownerId,
        applicantName: farms[9].ownerName,
        status: 'pending_approval',
        reviewerId: reviewers[0]._id,
        inspectorId: inspectors[1]._id,
        submittedAt: new Date('2025-09-21'),
        reviewedAt: new Date('2025-09-23'),
        inspectedAt: new Date('2025-09-26'),
      },

      // Approved
      {
        applicationId: 'APP-2025-011',
        farmId: farms[0]._id,
        applicantId: farms[0].ownerId,
        applicantName: farms[0].ownerName,
        status: 'approved',
        reviewerId: reviewers[0]._id,
        inspectorId: inspectors[0]._id,
        approverId: approvers[0]._id,
        submittedAt: new Date('2025-09-01'),
        reviewedAt: new Date('2025-09-03'),
        inspectedAt: new Date('2025-09-06'),
        approvedAt: new Date('2025-09-10'),
      },
      {
        applicationId: 'APP-2025-012',
        farmId: farms[1]._id,
        applicantId: farms[1].ownerId,
        applicantName: farms[1].ownerName,
        status: 'approved',
        reviewerId: reviewers[1]._id,
        inspectorId: inspectors[1]._id,
        approverId: approvers[1]._id,
        submittedAt: new Date('2025-09-05'),
        reviewedAt: new Date('2025-09-07'),
        inspectedAt: new Date('2025-09-10'),
        approvedAt: new Date('2025-09-15'),
      },

      // Rejected
      {
        applicationId: 'APP-2025-013',
        farmId: farms[2]._id,
        applicantId: farms[2].ownerId,
        applicantName: farms[2].ownerName,
        status: 'rejected',
        reviewerId: reviewers[0]._id,
        inspectorId: inspectors[2]._id,
        approverId: approvers[0]._id,
        submittedAt: new Date('2025-08-20'),
        reviewedAt: new Date('2025-08-22'),
        inspectedAt: new Date('2025-08-25'),
        approvedAt: new Date('2025-08-28'),
      },
    ];

    await Application.insertMany(applicationData);
    console.log(`✅ Successfully seeded ${applicationData.length} applications`);
  } catch (error) {
    console.error('❌ Error seeding applications:', error);
    throw error;
  }
};

// Main seeding function
const seedAll = async () => {
  console.log('🌱 Starting UAT Data Seeding...\n');

  try {
    await connectDB();
    await seedUsers();
    await seedFarms();
    await seedApplications();

    console.log('\n✅ ========================================');
    console.log('✅ UAT DATA SEEDING COMPLETED SUCCESSFULLY');
    console.log('✅ ========================================\n');

    console.log('📊 Summary:');
    const userCount = await User.countDocuments();
    const farmCount = await Farm.countDocuments();
    const appCount = await Application.countDocuments();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - Farms: ${farmCount}`);
    console.log(`   - Applications: ${appCount}`);

    console.log('\n🔑 Test Credentials:');
    console.log('   Farmer: farmer001 / Test@1234');
    console.log('   Reviewer: reviewer001 / Rev@1234');
    console.log('   Inspector: inspector001 / Insp@1234');
    console.log('   Approver: approver001 / App@1234');
    console.log('   Admin: admin001 / Admin@1234');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedAll();
