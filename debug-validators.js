const { validateThaiID, validateLaserCode } = require('./apps/backend/utils/validators');

const generateThaiID = () => {
  let id = '';
  for (let i = 0; i < 12; i++) id += Math.floor(Math.random() * 10);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(id.charAt(i)) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return id + check;
};

const id = generateThaiID();
console.log(`Generated ID: ${id}`);
console.log(`Valid ID? ${validateThaiID(id)}`);

const laser = 'ME0123456789';
console.log(`Laser: ${laser}`);
console.log(`Valid Laser? ${validateLaserCode(laser)}`);
