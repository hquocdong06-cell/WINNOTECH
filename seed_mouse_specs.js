const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedMouseSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for Mouse Specs Seeding...');

    // 1. Ensure Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Nhu cầu',
      'Kiểu kết nối',
      'Màu sắc',
      'Kết nối',
      'Kiểu cầm',
      'Switch',
      'Độ phân giải (CPI/DPI)',
      'Tên cảm biến',
      'Số nút bấm',
      'Kích thước',
      'Khối lượng'
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

    // Helper to get or create AttributeValue
    const getVal = async (attrName, valStr) => {
      const attr = attrMap[attrName];
      let v = await AttributeValue.findOne({ value: valStr, id_attribute: attr._id });
      if (!v) {
        v = await AttributeValue.create({ value: valStr, id_attribute: attr._id });
      }
      return v;
    };

    // 2. Find Mouse Category & Mouse Products
    const mouseCats = await Category.find({
      $or: [
        { name: { $regex: /chuột/i } },
        { slug: { $regex: /chuot/i } }
      ]
    });
    const mouseCatIds = mouseCats.map(c => c._id);

    const mouseProducts = await Product.find({
      $or: [
        { cat_id: { $in: mouseCatIds } },
        { name: { $regex: /chuột|mouse/i } }
      ]
    }).populate('brand_id cat_id');

    console.log(`Found ${mouseProducts.length} mouse products to update specs.`);

    let totalLinked = 0;
    for (const p of mouseProducts) {
      const pName = (p.name || '').toUpperCase();
      const brandName = p.brand_id?.name || (pName.includes('LOGITECH') ? 'Logitech' : pName.includes('RAZER') ? 'Razer' : pName.includes('ASUS') ? 'ASUS' : pName.includes('ATK') ? 'ATK' : 'ATK');

      // Spec determination based on product name
      let warranty = '12 tháng';
      if (pName.includes('LOGITECH') || pName.includes('RAZER') || pName.includes('ASUS')) warranty = '24 tháng';

      let usage = 'Gaming';

      let connectionType = 'Chuột không dây';
      if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) connectionType = 'Chuột có dây';
      else if (pName.includes('DUAL') || pName.includes('HYBRID')) connectionType = 'Chuột không dây & Có dây';

      let color = 'Shadow White';
      if (pName.includes('BLACK') || pName.includes('ĐEN')) color = 'Shadow Black';
      else if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Shadow White';
      else if (pName.includes('PINK') || pName.includes('HỒNG')) color = 'Pink';
      else if (pName.includes('RED') || pName.includes('ĐỎ')) color = 'Crimson Red';

      let connectivity = 'USB Type C, 2.4 GHz Wireless';
      if (connectionType === 'Chuột có dây') connectivity = 'USB Type-C';
      else if (pName.includes('BLUETOOTH')) connectivity = 'USB Type C, 2.4 GHz Wireless, Bluetooth 5.1';

      let gripStyle = 'Ambidextrous / Đối xứng';
      if (pName.includes('G502') || pName.includes('HARPE') || pName.includes('ERGO')) gripStyle = 'Ergonomic / Công thái học';

      let switchName = 'ATK Swiftlight Switches';
      if (pName.includes('SUPERLIGHT 2') || pName.includes('G502 X')) switchName = 'LIGHTFORCE Hybrid Optical-Mechanical Switches';
      else if (pName.includes('VIPER V3') || pName.includes('RAZER')) switchName = 'Razer™ Optical Mouse Switches Gen-3';
      else if (pName.includes('ROG HARPE') || pName.includes('ASUS')) switchName = 'ROG Micro Switches (70M Click)';

      let dpi = '4000DPI';
      if (pName.includes('SUPERLIGHT 2')) dpi = '32000 DPI';
      else if (pName.includes('VIPER V3')) dpi = '30000 DPI';
      else if (pName.includes('HARPE ACE')) dpi = '36000 DPI';
      else if (pName.includes('G502')) dpi = '25600 DPI';

      let sensor = 'PAW3955 Master';
      if (pName.includes('SUPERLIGHT 2') || pName.includes('G502')) sensor = 'HERO 2 Sensor';
      else if (pName.includes('VIPER V3')) sensor = 'Focus Pro 30K Optical Sensor';
      else if (pName.includes('HARPE ACE')) sensor = 'AimPoint Optical Sensor';

      let buttons = '6';
      if (pName.includes('G502')) buttons = '13';
      else if (pName.includes('VIPER V3') || pName.includes('SUPERLIGHT 2')) buttons = '5';

      let dimensions = '12.7 x 6.4 x 4 cm';
      if (pName.includes('SUPERLIGHT 2')) dimensions = '12.5 x 6.35 x 4.0 cm';
      else if (pName.includes('VIPER V3')) dimensions = '12.7 x 6.4 x 3.9 cm';
      else if (pName.includes('G502')) dimensions = '13.1 x 7.9 x 4.1 cm';

      let weight = '55g±3g';
      if (pName.includes('SUPERLIGHT 2')) weight = '60g';
      else if (pName.includes('VIPER V3')) weight = '54g';
      else if (pName.includes('HARPE ACE')) weight = '54g';
      else if (pName.includes('G502')) weight = '89g';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Nhu cầu', val: usage },
        { name: 'Kiểu kết nối', val: connectionType },
        { name: 'Màu sắc', val: color },
        { name: 'Kết nối', val: connectivity },
        { name: 'Kiểu cầm', val: gripStyle },
        { name: 'Switch', val: switchName },
        { name: 'Độ phân giải (CPI/DPI)', val: dpi },
        { name: 'Tên cảm biến', val: sensor },
        { name: 'Số nút bấm', val: buttons },
        { name: 'Kích thước', val: dimensions },
        { name: 'Khối lượng', val: weight },
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

    console.log(`✅ Successfully seeded full specs for all mouse products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding mouse specs:', err);
  }
}

seedMouseSpecs();
