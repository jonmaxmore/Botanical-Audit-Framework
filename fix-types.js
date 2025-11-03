const fs = require('fs');
const path = require('path');

const filePaths = [
  'app/frontend/src/app/inspector/inspections/[id]/on-site/page.tsx',
  'app/frontend/src/app/inspector/inspections/[id]/vdo-call/page.tsx',
  'app/frontend/src/app/officer/applications/[id]/review/page.tsx',
  'app/frontend/src/app/farmer/applications/[id]/page.tsx',
  'app/frontend/src/app/admin/applications/[id]/approve/page.tsx',
  'app/frontend/src/app/farmer/documents/page-new.tsx'
];

filePaths.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix imports
  if (content.includes("import { withAuth } from '@/components/auth/withAuth';")) {
    content = content.replace(/import { withAuth } from '@\/components\/auth\/withAuth';\r?\n/g, '');
    modified = true;
  }

  if (content.includes('useApplicationContext')) {
    content = content.replace(/useApplicationContext/g, 'useApplication');
    modified = true;
  }

  // Fix export
  if (content.match(/export default withAuth\((\w+)[^\)]*\);/)) {
    content = content.replace(/export default withAuth\((\w+)[^\)]*\);/g, 'export default $1;');
    modified = true;
  }

  // Fix property names
  content = content.replace(/\.workflowState/g, '.currentState');
  content = content.replace(/application\.farmInfo\?\.name/g, "application.farmerName + \"'s Farm\"");
  content = content.replace(/app\.farmInfo\?\.name/g, "app.farmerName + \"'s Farm\"");
  content = content.replace(/\.farmInfo\?\.(\w+)/g, '/* farmInfo removed */');
  content = content.replace(/application\.farmerInfo\?\.name/g, 'application.farmerName');
  content = content.replace(/app\.farmerInfo\?\.name/g, 'app.farmerName');
  content = content.replace(/\.farmerInfo\?\.(\w+)/g, '/* farmerInfo removed */');

  // Fix inspectionData
  content = content.replace(/const inspectionData = application\.inspectionData;/g, 'const latestInspection = application.inspections[application.inspections.length - 1];');
  content = content.replace(/inspectionData\?/g, 'latestInspection?');
  content = content.replace(/inspectionData\./g, 'latestInspection?.');
  content = content.replace(/inspectionData/g, 'latestInspection');

  // Fix payments access
  content = content.replace(/payments\.phase1/g, 'payments.find(p => p.phase === 1)');
  content = content.replace(/payments\.phase2/g, 'payments.find(p => p.phase === 2)');

  // Fix inspection singular to plural
  content = content.replace(/application\.inspection(?!s)/g, 'application.inspections[0]');

  // Fix approvalData
  content = content.replace(/approvalData: {[^}]+},\s*/g, '');

  if (content !== fs.readFileSync(fullPath, 'utf8')) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  } else if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  }
});

console.log('\nDone!');
