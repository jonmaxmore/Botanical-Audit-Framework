#!/usr/bin/env node

/**
 * 🎯 10-Year Database Population Script
 * จำลองข้อมูล 10 ปี สำหรับการทดสอบระยะยาว
 * 
 * Scenario:
 * - 1,000 users/day (weekdays only)
 * - 50 staff members
 * - Working hours: 09:00-17:00
 * - 250 working days/year
 * - Total 10 years = 2.5 million users
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../../apps/backend/models/User');
const Application = require('../../apps/backend/models/Application');
const Certificate = require('../../apps/backend/models/Certificate');
const Inspection = require('../../apps/backend/models/Inspection');
const Payment = require('../../apps/backend/models/Payment');

// Configuration
const CONFIG = {
  START_DATE: new Date('2015-01-01'),
  END_DATE: new Date('2024-12-31'),
  USERS_PER_DAY: 1000,
  STAFF_COUNT: 50,
  WORKING_HOURS: { start: 9, end: 17 },
  BATCH_SIZE: 100,
  
  // Conversion rates (realistic)
  APPLICATION_RATE: 0.4,        // 40% of users apply
  APPROVAL_RATE: 0.75,           // 75% approved
  CERTIFICATE_RENEWAL_RATE: 0.8, // 80% renew
  INSPECTION_PASS_RATE: 0.85,    // 85% pass inspection
};

// Thai provinces for realistic data
const PROVINCES = [
  'กรุงเทพมหานคร', 'เชียงใหม่', 'ขอนแก่น', 'ภูเก็ต', 'นครราชสีมา',
  'ชลบุรี', 'เชียงราย', 'อุบลราชธานี', 'นครสวรรค์', 'สงขลา',
  'สุพรรณบุรี', 'พิษณุโลก', 'นครปฐม', 'อุดรธานี', 'ลำปาง'
];

const CROP_TYPES = ['กัญชา', 'กัญชง', 'สมุนไพร', 'พืชสมุนไพร'];

/**
 * Generate working dates (Monday-Friday) between two dates
 */
function getWorkingDates(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // 1-5 = Monday to Friday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Generate random time within working hours
 */
function getRandomWorkingHourTime(date) {
  const hour = CONFIG.WORKING_HOURS.start + 
    Math.floor(Math.random() * (CONFIG.WORKING_HOURS.end - CONFIG.WORKING_HOURS.start));
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  
  const timestamp = new Date(date);
  timestamp.setHours(hour, minute, second);
  return timestamp;
}

/**
 * Generate staff members (officers, inspectors)
 */
async function generateStaff() {
  console.log('📋 Generating 50 staff members...');
  
  const staff = [];
  const roles = ['officer', 'inspector', 'admin'];
  
  for (let i = 0; i < CONFIG.STAFF_COUNT; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const email = `${role}${i + 1}@dtam.go.th`;
    
    staff.push({
      email,
      name: faker.person.fullName({ locale: 'th' }),
      role,
      department: 'DTAM',
      createdAt: CONFIG.START_DATE
    });
  }
  
  await User.insertMany(staff, { ordered: false }).catch(() => {});
  console.log(`✅ Created ${staff.length} staff members`);
  
  return staff;
}

/**
 * Generate users for a specific date
 */
function generateUsersForDate(date, count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = getRandomWorkingHourTime(date);
    const farmName = `ฟาร์ม${faker.word.noun({ locale: 'th' })}`;
    
    users.push({
      email: faker.internet.email(),
      name: faker.person.fullName({ locale: 'th' }),
      role: 'farmer',
      phone: `0${Math.floor(Math.random() * 900000000 + 100000000)}`,
      farmName,
      province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)],
      createdAt
    });
  }
  
  return users;
}

/**
 * Generate application for a user
 */
function generateApplication(user, staff, date) {
  const officer = staff.find(s => s.role === 'officer');
  const submittedAt = getRandomWorkingHourTime(date);
  
  // Random status based on conversion rates
  let status = 'DRAFT';
  const rand = Math.random();
  
  if (rand < CONFIG.APPLICATION_RATE) {
    status = 'SUBMITTED';
    
    if (Math.random() < CONFIG.APPROVAL_RATE) {
      status = 'APPROVED';
    } else if (Math.random() < 0.2) {
      status = 'REJECTED';
    }
  }
  
  return {
    userId: user._id,
    applicationNumber: `APP-${date.getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    status,
    applicantType: 'individual',
    farmInformation: {
      farmName: user.farmName,
      farmSize: Math.floor(Math.random() * 50) + 1,
      location: {
        province: user.province,
        district: `อำเภอ${faker.location.city({ locale: 'th' })}`,
        subdistrict: `ตำบล${faker.location.city({ locale: 'th' })}`
      },
      crops: [
        {
          cropType: CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)],
          plantingArea: Math.floor(Math.random() * 20) + 1
        }
      ]
    },
    reviewData: status !== 'DRAFT' ? {
      officerId: officer?._id,
      officerName: officer?.name,
      completenessScore: Math.floor(Math.random() * 3) + 3,
      accuracyScore: Math.floor(Math.random() * 3) + 3,
      decision: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      reviewedAt: new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000)
    } : undefined,
    submittedAt: status !== 'DRAFT' ? submittedAt : undefined,
    createdAt: submittedAt
  };
}

/**
 * Generate inspection for approved application
 */
function generateInspection(application, staff, date) {
  const inspector = staff.find(s => s.role === 'inspector');
  const scheduledDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const passed = Math.random() < CONFIG.INSPECTION_PASS_RATE;
  
  return {
    applicationId: application._id,
    inspectorId: inspector?._id,
    inspectorName: inspector?.name,
    type: Math.random() < 0.6 ? 'VDO_CALL' : 'ON_SITE',
    scheduledDate,
    status: 'COMPLETED',
    result: passed ? 'PASS' : 'FAIL',
    score: passed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50,
    completedAt: scheduledDate,
    createdAt: date
  };
}

/**
 * Generate certificate for passed inspection
 */
function generateCertificate(application, inspection, date) {
  const issueDate = new Date(inspection.completedAt);
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  
  return {
    certificateNumber: `GACP-${date.getFullYear()}-${PROVINCES.indexOf(application.farmInformation.location.province)}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    applicationId: application._id,
    userId: application.userId,
    farmName: application.farmInformation.farmName,
    farmerName: application.applicantType === 'individual' ? 'เกษตรกร' : 'บริษัท',
    province: application.farmInformation.location.province,
    cropType: application.farmInformation.crops[0].cropType,
    issueDate,
    expiryDate,
    status: new Date() < expiryDate ? 'ACTIVE' : 'EXPIRED',
    qrCode: `https://gacp.dtam.go.th/verify/${Math.random().toString(36).substring(7)}`,
    createdAt: issueDate
  };
}

/**
 * Generate payment for application
 */
function generatePayment(application, date) {
  return {
    applicationId: application._id,
    userId: application.userId,
    amount: 5000,
    type: 'APPLICATION_FEE',
    method: Math.random() < 0.7 ? 'PROMPTPAY' : 'BANK_TRANSFER',
    status: 'CONFIRMED',
    paidAt: date,
    createdAt: date
  };
}

/**
 * Main population function
 */
async function populate() {
  console.log('🚀 Starting 10-year database population...\n');
  console.log(`📅 Date Range: ${CONFIG.START_DATE.toISOString().split('T')[0]} to ${CONFIG.END_DATE.toISOString().split('T')[0]}`);
  
  // Connect to database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-platform');
  console.log('✅ Connected to MongoDB\n');
  
  // Generate staff first
  const staff = await generateStaff();
  
  // Get all working dates
  const workingDates = getWorkingDates(CONFIG.START_DATE, CONFIG.END_DATE);
  console.log(`📆 Total working days: ${workingDates.length}`);
  console.log(`👥 Expected total users: ${workingDates.length * CONFIG.USERS_PER_DAY}\n`);
  
  let totalUsers = 0;
  let totalApplications = 0;
  let totalCertificates = 0;
  
  // Process in batches by date
  for (let i = 0; i < workingDates.length; i += 30) {
    const batchDates = workingDates.slice(i, i + 30);
    console.log(`\n📦 Processing batch: ${batchDates[0].toISOString().split('T')[0]} to ${batchDates[batchDates.length - 1].toISOString().split('T')[0]}`);
    
    for (const date of batchDates) {
      // Generate users
      const users = generateUsersForDate(date, CONFIG.USERS_PER_DAY);
      const savedUsers = await User.insertMany(users, { ordered: false }).catch(() => []);
      totalUsers += savedUsers.length;
      
      // Generate applications (40% of users)
      const applications = [];
      const inspections = [];
      const certificates = [];
      const payments = [];
      
      for (const user of savedUsers) {
        if (Math.random() < CONFIG.APPLICATION_RATE) {
          const app = generateApplication(user, staff, date);
          applications.push(app);
          
          // If approved, generate inspection and possibly certificate
          if (app.status === 'APPROVED') {
            const inspection = generateInspection(app, staff, date);
            inspections.push(inspection);
            
            if (inspection.result === 'PASS') {
              const cert = generateCertificate(app, inspection, date);
              certificates.push(cert);
            }
          }
          
          // Generate payment
          if (app.status !== 'DRAFT') {
            payments.push(generatePayment(app, date));
          }
        }
      }
      
      // Save to database
      if (applications.length > 0) {
        await Application.insertMany(applications, { ordered: false }).catch(() => {});
        totalApplications += applications.length;
      }
      
      if (inspections.length > 0) {
        await Inspection.insertMany(inspections, { ordered: false }).catch(() => {});
      }
      
      if (certificates.length > 0) {
        await Certificate.insertMany(certificates, { ordered: false }).catch(() => {});
        totalCertificates += certificates.length;
      }
      
      if (payments.length > 0) {
        await Payment.insertMany(payments, { ordered: false }).catch(() => {});
      }
    }
    
    console.log(`✅ Batch complete - Users: ${totalUsers}, Apps: ${totalApplications}, Certs: ${totalCertificates}`);
  }
  
  console.log('\n\n🎉 Population complete!');
  console.log('=' .repeat(50));
  console.log(`👥 Total Users: ${totalUsers.toLocaleString()}`);
  console.log(`📝 Total Applications: ${totalApplications.toLocaleString()}`);
  console.log(`🏆 Total Certificates: ${totalCertificates.toLocaleString()}`);
  console.log('=' .repeat(50));
  
  await mongoose.disconnect();
}

// Run
if (require.main === module) {
  populate().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { populate };
