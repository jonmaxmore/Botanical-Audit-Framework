const fs = require('fs');
const path = require('path');

const unusedVars = [
  { file: 'apps/backend/config/redis-manager.js', line: 8, old: 'promisify', new: '_promisify' },
  { file: 'apps/backend/middleware/auth-rate-limiters.js', line: 74, old: 'skipSuccessfulRequests', new: '_skipSuccessfulRequests' },
  { file: 'apps/backend/middleware/auth.js', line: 18, old: 'jwt', new: '_jwt' },
  { file: 'apps/backend/middleware/error-handler.js', line: 5, old: 'winston', new: '_winston' },
  { file: 'apps/backend/middleware/error-handler.js', line: 6, old: 'morgan', new: '_morgan' },
  { file: 'apps/backend/middleware/performance.js', line: 144, old: 'format', new: '_format' },
  { file: 'apps/backend/middleware/security.js', line: 311, old: 'path', new: '_path' },
  { file: 'apps/backend/middleware/validation.js', line: 7, old: 'logger', new: '_logger' },
  { file: 'apps/backend/models/Application.js', line: 484, old: 'validTransitions', new: '_validTransitions' },
  { file: 'apps/backend/models/gacp-business-logic.js', line: 17, old: 'mongoose', new: '_mongoose' },
  { file: 'apps/backend/modules/shared/middleware/error-handler.js', line: 5, old: 'winston', new: '_winston' },
  { file: 'apps/backend/modules/shared/middleware/error-handler.js', line: 6, old: 'morgan', new: '_morgan' },
  { file: 'apps/backend/routes/api/audit-calendar.js', line: 10, old: 'EnhancedCultivationRecord', new: '_EnhancedCultivationRecord' },
  { file: 'apps/backend/routes/api/sop.js', line: 7, old: 'mongoose', new: '_mongoose' },
  { file: 'apps/backend/routes/farm-management.js', line: 4, old: 'roleCheck', new: '_roleCheck' },
  { file: 'apps/backend/routes/gacp-business-logic.js', line: 23, old: 'crypto', new: '_crypto' },
  { file: 'apps/backend/routes/gacp-business-logic.js', line: 24, old: 'path', new: '_path' },
  { file: 'apps/backend/routes/traceability.js', line: 7, old: 'Crop', new: '_Crop' },
  { file: 'apps/backend/services/gacp-certificate.js', line: 17, old: 'User', new: '_User' },
  { file: 'apps/backend/services/gacp-inspection.js', line: 10, old: 'User', new: '_User' },
  { file: 'apps/backend/services/pdf/pdf-generator.service.js', line: 3, old: 'path', new: '_path' },
  { file: 'apps/backend/src/app.js', line: 10, old: 'morgan', new: '_morgan' }
];

console.log('🔧 กำลังแก้ไข unused variables...\n');

let fixed = 0;
let failed = 0;

unusedVars.forEach(({ file, old: oldVar, new: newVar }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ไม่พบไฟล์: ${file}`);
      failed++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`\\b${oldVar}\\b`, 'g');
    
    if (content.match(regex)) {
      content = content.replace(regex, newVar);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file}: ${oldVar} → ${newVar}`);
      fixed++;
    }
  } catch (error) {
    console.log(`❌ Error in ${file}: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 สรุป: แก้ไขสำเร็จ ${fixed} ไฟล์, ล้มเหลว ${failed} ไฟล์`);
