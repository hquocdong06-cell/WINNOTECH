const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WINNOTECH');

  const Attribute = mongoose.model('Attribute', new mongoose.Schema({}, { strict: false }), 'Attribute');
  const AttributeValue = mongoose.model('AttributeValue', new mongoose.Schema({}, { strict: false }), 'AttributeValue');
  const VariantAttribute = mongoose.model('VariantAttribute', new mongoose.Schema({}, { strict: false }), 'VariantAttribute');

  const ramAttr = await Attribute.findOne({ name: 'Dung lượng RAM' });
  console.log('RAM Attr:', ramAttr);
  if (ramAttr) {
    const vals = await AttributeValue.find({ id_attribute: ramAttr._id });
    console.log('RAM Attr Values:', vals);
  }

  const v1 = '6a3ea04fd27f601bd29ea057';
  const va1 = await VariantAttribute.find({ id_variants: v1 });
  console.log(`\nVariant 1 (${v1}) attributes:`);
  for (const va of va1) {
    const val = await AttributeValue.findById(va.id_attribute_value);
    console.log('  VA link:', va, 'Val:', val);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
