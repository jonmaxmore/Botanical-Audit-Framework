/**
 * Script to fix userId format in auth.middleware.test.js
 * Changes all 'USR-2025-00001' to use User.generateUserId()
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tests', 'unit', 'auth.middleware.test.js');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern 1: Simple userId in User.create
const pattern1 = /userId: 'USR-2025-00001',/g;
const replacement1 = 'userId: await User.generateUserId(),';

// Count matches
const matches = content.match(pattern1);
console.log(`Found ${matches ? matches.length : 0} occurrences of USR-2025-00001`);

// Replace
content = content.replace(pattern1, replacement1);

// Save
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed all userId formats in auth.middleware.test.js');
