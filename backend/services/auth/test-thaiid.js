function validateThaiID(id) {
  if (!/^\d{13}$/.test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12));
}

// Test IDs
const testIds = ['1234567890121', '3101234567894'];

testIds.forEach(id => {
  let sum = 0;
  const digits = [];
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(id.charAt(i));
    const weight = 13 - i;
    const product = digit * weight;
    digits.push(`${digit} x ${weight} = ${product}`);
    sum += product;
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  const actualLast = parseInt(id.charAt(12));

  console.log(`\nTesting: ${id}`);
  console.log('Calculation:');
  digits.forEach((d, i) => console.log(`  Position ${i}: ${d}`));
  console.log(`Sum: ${sum}`);
  console.log(`Checksum formula: (11 - (${sum} % 11)) % 10 = ${checkDigit}`);
  console.log(`Last digit: ${actualLast}`);
  console.log(`Valid: ${checkDigit === actualLast ? '✓' : '✗'}`);
});
