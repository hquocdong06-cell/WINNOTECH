const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedCaseSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for PC Case Specs Seeding...');

    // 1. Ensure Case Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Tên của case',
      'Nhu cầu',
      'Màu sắc',
      'Chất liệu',
      'Kích thước',
      'Loại case',
      'Hỗ trợ mainboard',
      'Số lượng ổ đĩa hỗ trợ',
      'Cổng kết nối',
      'Hỗ trợ tản nhiệt CPU cao',
      'Loại quạt hỗ trợ phía trên',
      'Loại quạt hỗ trợ phía sau',
      'Loại quạt hỗ trợ bên dưới'
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

    // 2. Find Case Category & Products
    const caseCat = await Category.findOne({ slug: 'case' });
    const caseProducts = await Product.find({
      $or: [
        { cat_id: caseCat?._id },
        { name: { $regex: /vỏ case|case/i } }
      ]
    }).populate('brand_id cat_id');

    // Exclude fan kits
    const filteredCaseProducts = caseProducts.filter(p => !p.name.includes('Bộ 3 Quạt') && !p.name.includes('Quạt Case'));

    console.log(`Found ${filteredCaseProducts.length} Case products to update specs.`);

    let totalLinked = 0;
    for (const p of filteredCaseProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('NZXT') ? 'NZXT' :
        pName.includes('CORSAIR') ? 'Corsair' :
        pName.includes('ASUS') || pName.includes('TUF') ? 'ASUS' :
        pName.includes('COOLER MASTER') ? 'Cooler Master' :
        pName.includes('JONSBO') ? 'Jonsbo' : 'NZXT'
      );

      let warranty = '24 tháng';
      if (pName.includes('JONSBO')) warranty = '12 tháng';

      let modelName = p.name.replace(/^Vỏ Case\s+/i, '');

      let usage = 'Gaming & Đồ họa';

      let color = 'Đen';
      if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';

      let material = 'SPCC, Nhựa, Kính cường lực';

      let dimensions = '46.6 x 29.0 x 49.5 cm';
      if (pName.includes('4000D')) dimensions = '45.3 x 23.0 x 46.6 cm';

      let caseType = 'Mid Tower';
      if (pName.includes('DUAL') || pName.includes('H9') || pName.includes('GT502')) caseType = 'Dual-Chamber Mid Tower';

      let mbSupport = 'Mini-ITX, Micro-ATX, ATX';
      if (pName.includes('GT502') || pName.includes('H9')) mbSupport = 'Mini-ITX, Micro-ATX, ATX, E-ATX';

      let driveBays = '2 x 3.5" , 2 x 2.5"';

      let ports = '2 x USB 3.0 , 1 x USB Type C, Audio/Mic 3.5mm';

      let cpuCoolerHeight = '175mm';
      if (pName.includes('4000D')) cpuCoolerHeight = '170mm';

      let topFans = '3 x 120mm / 2 x 140mm';

      let rearFan = '1 x 120 mm';

      let bottomFans = '3 x 120 mm';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Tên của case', val: modelName },
        { name: 'Nhu cầu', val: usage },
        { name: 'Màu sắc', val: color },
        { name: 'Chất liệu', val: material },
        { name: 'Kích thước', val: dimensions },
        { name: 'Loại case', val: caseType },
        { name: 'Hỗ trợ mainboard', val: mbSupport },
        { name: 'Số lượng ổ đĩa hỗ trợ', val: driveBays },
        { name: 'Cổng kết nối', val: ports },
        { name: 'Hỗ trợ tản nhiệt CPU cao', val: cpuCoolerHeight },
        { name: 'Loại quạt hỗ trợ phía trên', val: topFans },
        { name: 'Loại quạt hỗ trợ phía sau', val: rearFan },
        { name: 'Loại quạt hỗ trợ bên dưới', val: bottomFans },
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

    console.log(`✅ Successfully seeded full specs for all PC Case products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding Case specs:', err);
  }
}

seedCaseSpecs();
