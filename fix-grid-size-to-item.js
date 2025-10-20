const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps', 'frontend', 'pages', 'index.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace size={{ xs: 12, md: 7 }} with item xs={12} md={7}
content = content.replace(/size=\{\{\s*xs:\s*(\d+)(?:,\s*sm:\s*(\d+))?(?:,\s*md:\s*(\d+))?(?:,\s*lg:\s*(\d+))?(?:,\s*xl:\s*(\d+))?\s*\}\}\s*/g, (match, xs, sm, md, lg, xl) => {
  let props = 'item';
  if (xs) props += ` xs={${xs}}`;
  if (sm) props += ` sm={${sm}}`;
  if (md) props += ` md={${md}}`;
  if (lg) props += ` lg={${lg}}`;
  if (xl) props += ` xl={${xl}}`;
  return props + ' ';
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Converted Grid size props back to item props');
