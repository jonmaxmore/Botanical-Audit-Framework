/**
 * Fix Typography children type errors - replace comment placeholders with actual values
 */

const fs = require('fs');
const path = require('path');

const files = [
  'app/frontend/src/app/inspector/inspections/[id]/on-site/page.tsx',
  'app/frontend/src/app/inspector/inspections/[id]/vdo-call/page.tsx',
  'app/frontend/src/app/officer/applications/[id]/review/page.tsx',
];

files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all comment placeholders with actual placeholders
  content = content.replace(/\{application\/\* farmInfo removed \*\/\} ไร่/g, "{'[Farm Size]'} ไร่");
  content = content.replace(/\{application\/\* farmInfo removed \*\/\}/g, "{'[Farm Info]'}");
  content = content.replace(/\{application\/\* farmerInfo removed \*\/\} ปี/g, "{'[Experience]'} ปี");
  content = content.replace(/\{application\/\* farmerInfo removed \*\/\}/g, '{application.farmerName}');
  content = content.replace(/\{application\/\* farmerInfo removed \*\/ \|\| '-'\}/g, '{application.farmerName || "-"}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed Typography children in ${file}`);
});

console.log('\n✅ All Typography children fixes complete');
