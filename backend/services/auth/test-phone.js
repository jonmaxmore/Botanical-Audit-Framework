const Joi = require('joi');

const schema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^0\d{9}$/)
    .required(),
});

const testPhones = [
  '123', // Too short
  '081234567', // Too short (9 digits)
  '08123456789', // Too long (11 digits)
  '1812345678', // Doesn't start with 0
  '0112345678', // Valid format
  '0812345678', // Valid
];

console.log('Testing phone validation:\n');
testPhones.forEach(phone => {
  const result = schema.validate({ phoneNumber: phone });
  console.log(`${phone.padEnd(15)} : ${result.error ? 'REJECT ✗' : 'ACCEPT ✓'}`);
  if (result.error) {
    console.log(`  -> ${result.error.message}`);
  }
});
