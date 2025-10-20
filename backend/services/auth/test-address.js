const Joi = require('joi');

const addressSchema = Joi.object({
  address: Joi.object({
    houseNumber: Joi.string().required(),
    subDistrict: Joi.string().required(),
    district: Joi.string().required(),
    province: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
});

const testData = {
  address: {
    houseNumber: '123',
    // subDistrict missing
    district: 'เขต',
    province: 'กรุงเทพฯ',
    postalCode: '10110',
  },
};

const { error } = addressSchema.validate(testData, { abortEarly: false });

console.log('Error details:');
if (error) {
  error.details.forEach((detail, i) => {
    console.log(`\n${i + 1}. Message: ${detail.message}`);
    console.log(`   Path: [${detail.path.join(', ')}]`);
    console.log(`   Includes 'subDistrict'?: ${detail.path.includes('subDistrict')}`);
  });
}
