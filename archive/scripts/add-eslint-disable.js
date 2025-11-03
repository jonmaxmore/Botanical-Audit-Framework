const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ไฟล์ interface ที่มี unused parameters เป็นส่วนหนึ่งของ API definition
const interfaceFiles = [
  'apps/backend/modules/audit/domain/interfaces/IAuditLogRepository.js',
  'apps/backend/modules/auth-dtam/domain/interfaces/IDTAMStaffRepository.js',
  'apps/backend/modules/cannabis-survey/domain/interfaces/ISurveyRepository.js',
  'apps/backend/modules/farm-management/domain/interfaces/IFarmRepository.js',
  'apps/backend/modules/notification/domain/interfaces/INotificationRepository.js',
  'apps/backend/modules/report/domain/interfaces/IDataAggregationService.js',
  'apps/backend/modules/report/domain/interfaces/IReportGeneratorService.js',
  'apps/backend/modules/report/domain/interfaces/IReportRepository.js',
  'apps/backend/modules/training/domain/interfaces/ICourseRepository.js',
  'apps/backend/modules/training/domain/interfaces/IEnrollmentRepository.js'
];

console.log('📝 กำลังเพิ่ม eslint-disable comments สำหรับ interface files...\n');

let fixed = 0;

interfaceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ไม่พบไฟล์: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // เพิ่ม eslint-disable comment ที่ด้านบนของไฟล์ถ้ายังไม่มี
    if (!content.includes('/* eslint-disable no-unused-vars */')) {
      content = '/* eslint-disable no-unused-vars */\n' + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file}`);
      fixed++;
    }
  } catch (error) {
    console.log(`❌ Error in ${file}: ${error.message}`);
  }
});

console.log(`\n📊 เพิ่ม eslint-disable ใน ${fixed} ไฟล์`);

// ตรวจสอบ warnings ที่เหลือ
console.log('\n🔍 ตรวจสอบ warnings ที่เหลือ...');
try {
  execSync('cd apps/backend && npx eslint . --ext .js 2>&1 | findstr /C:"problem"', {
    stdio: 'inherit',
    shell: true
  });
} catch (e) {
  // Ignore error
}
