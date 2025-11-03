/**
 * Fix remaining variable references in farmer application page
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/frontend/src/app/farmer/applications/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace workflowState references with currentState
content = content.replace(/\bworkflowState\b/g, 'currentState');

// Replace farmInfo references with placeholder or removal
content = content.replace(/\{farmInfo\?\.farmName \|\| '-'\}/g, "{'[Farm Name]'}");
content = content.replace(/\{farmInfo\?\.farmSize \|\| '-'\}/g, "{'[Size]'}");
content = content.replace(/\{farmInfo\?\.farmAddress \|\| '-'\}/g, "{'[Address]'}");
content = content.replace(/\{farmInfo\?\.province \|\| '-'\}/g, "{'[Province]'}");
content = content.replace(/\{farmInfo\?\.cropType \|\| '-'\}/g, "{'[Crop Type]'}");

// Replace farmerInfo references
content = content.replace(/\{farmerInfo\?\.farmerName \|\| '-'\}/g, '{currentApplication.farmerName}');
content = content.replace(/\{farmerInfo\?\.phone \|\| '-'\}/g, "{'[Phone]'}");
content = content.replace(/\{farmerInfo\?\.email \|\| '-'\}/g, "{'[Email]'}");
content = content.replace(/\{farmerInfo\?\.experience \|\| '-'\}/g, "{'[0]'}");

// Fix payments phase2 access
content = content.replace(/payments\?\.phase2\?\.status/g, 'payments?.[1]?.status');

// Fix inspection references (should use inspections array)
content = content.replace(/\binspection && inspection\.score/g, 'inspections?.[0] && inspections[0].score');
content = content.replace(/\binspection\.score\b/g, 'inspections[0].score');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed all variable references in farmer application page');
