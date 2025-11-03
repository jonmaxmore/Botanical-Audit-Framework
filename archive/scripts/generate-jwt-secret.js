// Generate JWT Secret
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('base64');
console.log('\nGenerated JWT_SECRET (64 bytes):');
console.log(secret);
console.log('\nLength:', secret.length, 'characters');
console.log('\nAdd this to apps/backend/.env:');
console.log(`JWT_SECRET="${secret}"`);
