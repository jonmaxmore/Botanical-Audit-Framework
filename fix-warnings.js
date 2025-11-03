#!/usr/bin/env node
/**
 * Auto-fix ESLint warnings script
 * Fixes common unused imports and missing dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting auto-fix for warnings...\n');

const fixes = [
  {
    file: 'apps/frontend/app/inspections/page.tsx',
    changes: [
      {
        find: /IconButton,\s*\n/,
        replace: ''
      },
      {
        find: /ListItemText,\s*\n/,
        replace: ''
      },
      {
        find: /WarningIcon,\s*\n/,
        replace: ''
      },
      {
        find: /isAfter,\s*isBefore,\s*addDays,?\s*/g,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/components/calendar/AvailabilityPicker.tsx',
    changes: [
      {
        find: /import\s*{\s*Button\s*}\s*from\s*'@mui\/material';\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/components/calendar/CalendarView.tsx',
    changes: [
      {
        find: /useEffect,\s*/,
        replace: ''
      },
      {
        find: /import\s*{\s*format\s*}\s*from\s*'date-fns';\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/components/calendar/CalendarWidget.tsx',
    changes: [
      {
        find: /ListItemText,\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/components/documents/DocumentList.tsx',
    changes: [
      {
        find: /Tooltip,\s*\n/,
        replace: ''
      },
      {
        find: /HistoryIcon,\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/components/farmer/DocumentUploadSection.tsx',
    changes: [
      {
        find: /ListItemSecondaryAction,\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/pages/admin/certificates.tsx',
    changes: [
      {
        find: /Paper,\s*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'apps/frontend/pages/documents/index.tsx',
    changes: [
      {
        find: /AddIcon,\s*\n/,
        replace: ''
      },
      {
        find: /FolderIcon,\s*\n/,
        replace: ''
      }
    ]
  }
];

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(({ file, changes }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skip: ${file} (not found)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    changes.forEach(({ find, replace }) => {
      if (content.match(find)) {
        content = content.replace(find, replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  Skip: ${file} (no changes needed)`);
    }
  } catch (error) {
    console.log(`❌ Error: ${file} - ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`\n✨ Done!`);
