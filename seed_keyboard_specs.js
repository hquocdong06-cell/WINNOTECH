const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedKeyboardSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for Keyboard Specs Seeding...');

    // 1. Ensure Keyboard Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Tên',
      'Part-number',
      'Màu sắc',
      'Kết nối',
      'Kết nối bàn phím',
      'Kích thước',
      'Loại bàn phím',
      'Nhu cầu',
      'Đèn',
      'Kiểu switch'
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

    // 2. Find Keyboard Category & Keyboard Products
    const kbCats = await Category.find({
      $or: [
        { name: { $regex: /bàn phím/i } },
        { slug: { $regex: /ban-phim/i } }
      ]
    });
    const kbCatIds = kbCats.map(c => c._id);

    const kbProducts = await Product.find({
      $or: [
        { cat_id: { $in: kbCatIds } },
        { name: { $regex: /bàn phím|keyboard/i } }
      ]
    }).populate('brand_id cat_id');

    console.log(`Found ${kbProducts.length} keyboard products to update specs.`);

    let totalLinked = 0;
    for (const p of kbProducts) {
      const pName = (p.name || '').toUpperCase();
      const brandName = p.brand_id?.name || (
        pName.includes('CORSAIR') ? 'Corsair' :
        pName.includes('LOGITECH') ? 'Logitech' :
        pName.includes('RAZER') ? 'Razer' :
        pName.includes('AKKO') ? 'Akko' :
        pName.includes('KEYCHRON') ? 'Keychron' :
        pName.includes('ASUS') ? 'ASUS' :
        pName.includes('STEELSERIES') ? 'SteelSeries' : 'Corsair'
      );

      let warranty = '24 tháng';
      if (pName.includes('DAREU') || pName.includes('AKKO')) warranty = '12 tháng';

      let modelName = p.name;
      let partNumber = `CH-${Math.floor(100000 + Math.random() * 899999)}J-NA`;

      let color = 'Trắng';
      if (pName.includes('BLACK') || pName.includes('ĐEN')) color = 'Đen';
      else if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';
      else if (pName.includes('RETRO') || pName.includes('GRAY')) color = 'Xám Retro';
      else if (pName.includes('PINK') || pName.includes('HỒNG')) color = 'Hồng';

      let connectionType = 'Bàn phím không dây';
      if (pName.includes('CÓ DÂY') || pName.includes('WIRED')) connectionType = 'Bàn phím có dây';
      else if (pName.includes('DUAL') || pName.includes('3 MODE') || pName.includes('TRIPLE')) connectionType = 'Bàn phím Không dây & Có dây';

      let keyboardConn = 'USB Type-C, 2.4GHz Wireless, Bluetooth 5.1';
      if (connectionType === 'Bàn phím có dây') keyboardConn = 'USB';

      let sizeLayout = 'Layout TKL 87';
      if (pName.includes('MINI') || pName.includes('60%') || pName.includes('60')) sizeLayout = 'Layout 60';
      else if (pName.includes('FULL') || pName.includes('108') || pName.includes('104')) sizeLayout = 'Layout Fullsize 108';
      else if (pName.includes('75%') || pName.includes('75')) sizeLayout = 'Layout 75%';

      let kbType = 'Bàn phím cơ';
      if (pName.includes('GIẢ CƠ') || pName.includes('MEMBRANE')) kbType = 'Bàn phím giả cơ';

      let usage = 'Gaming';

      let led = 'RGB';
      if (pName.includes('MONO') || pName.includes('WHITE LED')) led = 'Đơn sắc White';
      else if (pName.includes('NO LED') || pName.includes('KHÔNG LED')) led = 'Không LED';

      let switchType = 'CORSAIR MGX Hyperdrive Core';
      if (pName.includes('AKKO')) switchType = 'Akko CS Switches (Linear/Tactile)';
      else if (pName.includes('LOGITECH') || pName.includes('G PRO')) switchType = 'GX Blue / Red Linear Mechanical Switches';
      else if (pName.includes('RAZER')) switchName = 'Razer™ Optical Mechanical Switches';
      else if (pName.includes('CHERRY')) switchType = 'Cherry MX Red Switches';
      else if (pName.includes('KEYCHRON')) switchType = 'Gateron G Pro Mechanical Switches';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Tên', val: modelName },
        { name: 'Part-number', val: partNumber },
        { name: 'Màu sắc', val: color },
        { name: 'Kết nối', val: connectionType },
        { name: 'Kết nối bàn phím', val: keyboardConn },
        { name: 'Kích thước', val: sizeLayout },
        { name: 'Loại bàn phím', val: kbType },
        { name: 'Nhu cầu', val: usage },
        { name: 'Đèn', val: led },
        { name: 'Kiểu switch', val: switchType },
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

    console.log(`✅ Successfully seeded full specs for all Keyboard products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding keyboard specs:', err);
  }
}

seedKeyboardSpecs();
