const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedPsuSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for PSU Specs Seeding...');

    // 1. Ensure PSU Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Tên',
      'Màu sắc',
      'Công suất tối đa',
      'Hiệu suất',
      'Số cổng cắm',
      'Quạt làm mát',
      'Nguồn đầu vào'
    ];

    const attrMap = {};
    for (const name of attrNames) {
      let a = await Attribute.findOne({ name });
      if (!a) {
        a = await Attribute.create({ name });
        console.log(`Created Attribute: ${name}`);
      }
      attrMap[name] = a;
    }

    const getVal = async (attrName, valStr) => {
      const attr = attrMap[attrName];
      let v = await AttributeValue.findOne({ value: valStr, id_attribute: attr._id });
      if (!v) {
        v = await AttributeValue.create({ value: valStr, id_attribute: attr._id });
      }
      return v;
    };

    // 2. Find PSU Category & Products
    const psuCat = await Category.findOne({ slug: 'psu' });
    const psuProducts = await Product.find({
      $or: [
        { cat_id: psuCat?._id },
        { name: { $regex: /nguồn|psu|80 plus|850w|750w|1000w/i } }
      ]
    }).populate('brand_id cat_id');

    // Exclude cables
    const filteredPsuProducts = psuProducts.filter(p => !p.name.includes('Dây Nguồn') && !p.name.includes('Cáp'));

    console.log(`Found ${filteredPsuProducts.length} PSU products to update specs.`);

    let totalLinked = 0;
    for (const p of filteredPsuProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('CORSAIR') ? 'Corsair' :
        pName.includes('MSI') ? 'MSI' :
        pName.includes('ASUS') || pName.includes('TUF') ? 'ASUS' :
        pName.includes('COOLER MASTER') ? 'Cooler Master' :
        pName.includes('DARKFLASH') ? 'DarkFlash' : 'Corsair'
      );

      let warranty = '60 tháng';
      if (pName.includes('RM1000X') || pName.includes('RM850X')) warranty = '120 tháng';
      else if (pName.includes('BRONZE') || pName.includes('TUF')) warranty = '36 tháng';

      let modelName = p.name.replace(/^Nguồn\s+/i, '');

      let color = 'Đen';
      if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';

      let maxPower = '850W';
      if (pName.includes('1000W')) maxPower = '1000W';
      else if (pName.includes('750W')) maxPower = '750W';
      else if (pName.includes('650W')) maxPower = '650W';
      else if (pName.includes('1200W')) maxPower = '1200W';

      let efficiency = '80 Plus Gold';
      if (pName.includes('BRONZE')) efficiency = '80 Plus Bronze';
      else if (pName.includes('PLATINUM')) efficiency = '80 Plus Platinum';

      let connectors = '1 x 20+4 pin MB, 2 x 8-pin (4+4) CPU, 2 x 8-pin (6+2) PCIE, 1 x 16-pin PCIE 5.1, 7 x SATA, 3 x Peripheral (4-pin)';
      if (maxPower === '1000W') connectors = '1 x 20+4 pin MB, 2 x 8-pin (4+4) CPU, 4 x 8-pin (6+2) PCIE, 1 x 16-pin PCIE 5.1, 10 x SATA, 4 x Peripheral (4-pin)';

      let fanSize = '1 x 120 mm';
      if (pName.includes('RM850X') || pName.includes('RM1000X')) fanSize = '1 x 135 mm FDB Fan';

      let inputVoltage = '100 - 240VAC';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Tên', val: modelName },
        { name: 'Màu sắc', val: color },
        { name: 'Công suất tối đa', val: maxPower },
        { name: 'Hiệu suất', val: efficiency },
        { name: 'Số cổng cắm', val: connectors },
        { name: 'Quạt làm mát', val: fanSize },
        { name: 'Nguồn đầu vào', val: inputVoltage },
      ];

      const variants = await ProductVariant.find({ p_id: p._id });
      for (const variant of variants) {
        for (const spec of specsToApply) {
          const valDoc = await getVal(spec.name, spec.val);
          const existingVA = await VariantAttribute.findOne({
            id_variants: variant._id,
            id_attribute_value: valDoc._id
          });
          if (!existingVA) {
            await VariantAttribute.create({
              id_variants: variant._id,
              id_attribute_value: valDoc._id
            });
            totalLinked++;
          }
        }
      }
    }

    console.log(`✅ Successfully seeded full specs for all PSU products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding PSU specs:', err);
  }
}

seedPsuSpecs();
