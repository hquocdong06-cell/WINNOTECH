const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedRamSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for RAM Specs Seeding...');

    // 1. Ensure RAM Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Loại hàng',
      'Part-number',
      'Màu sắc',
      'Đèn LED',
      'Nhu cầu',
      'Dung lượng',
      'Thế hệ',
      'Bus',
      'Timing',
      'Voltage'
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

    // 2. Find RAM Category & Products
    const ramCat = await Category.findOne({ slug: 'ram' });
    const ramProducts = await Product.find({
      $or: [
        { cat_id: ramCat?._id },
        { name: { $regex: /\b(RAM|DDR4|DDR5)\b/i } }
      ]
    }).populate('brand_id cat_id');

    // Exclude PC Prebuilts
    const filteredRamProducts = ramProducts.filter(p => !p.name.includes('PC Văn Phòng') && !p.name.includes('PC Gaming'));

    console.log(`Found ${filteredRamProducts.length} RAM products to update specs.`);

    let totalLinked = 0;
    for (const p of filteredRamProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('CORSAIR') ? 'Corsair' :
        pName.includes('G.SKILL') || pName.includes('GSKILL') ? 'G.Skill' :
        pName.includes('KINGSTON') ? 'Kingston' :
        pName.includes('APACER') ? 'Apacer' :
        pName.includes('CRUCIAL') ? 'Crucial' :
        pName.includes('TEAMGROUP') || pName.includes('T-FORCE') ? 'TeamGroup' : 'Corsair'
      );

      let warranty = '36 tháng';
      if (pName.includes('DOMINATOR') || pName.includes('TRIDENT Z5')) warranty = '60 tháng';

      let productType = 'Hàng thông thường';
      if (pName.includes('RGB') || pName.includes('TITANIUM') || pName.includes('TRIDENT')) productType = 'Hàng cao cấp chính hãng';

      let partNumber = `AH5U${Math.floor(10 + Math.random() * 90)}G${Math.floor(50 + Math.random() * 40)}C622NWAA-1`;

      let color = 'Bạc';
      if (pName.includes('BLACK') || pName.includes('ĐEN')) color = 'Đen';
      else if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';
      else if (pName.includes('SILVER') || pName.includes('BẠC')) color = 'Bạc';

      let led = 'RGB';
      if (pName.includes('NO LED') || pName.includes('RIPJAWS S5')) led = 'Không LED';
      else if (pName.includes('ARGB')) led = 'ARGB';

      let usage = 'Gaming & Đồ họa';

      let capacity = '2 x 16GB';
      if (pName.includes('64G') || pName.includes('2X32GB')) capacity = '2 x 32GB';
      else if (pName.includes('16GB (1X16GB)') || pName.includes('1X16GB')) capacity = '1 x 16GB';
      else if (pName.includes('16GB') && !pName.includes('2X16GB')) capacity = '2 x 8GB';
      else if (pName.includes('8GB')) capacity = '1 x 8GB';

      let generation = 'DDR5';
      if (pName.includes('DDR4')) generation = 'DDR4';

      let bus = '6000MHz';
      if (pName.includes('6600') || pName.includes('6600MHZ')) bus = '6600MHz';
      else if (pName.includes('5600') || pName.includes('5600MHZ')) bus = '5600MHz';
      else if (pName.includes('5200') || pName.includes('5200MHZ')) bus = '5200MHz';
      else if (pName.includes('3600') || pName.includes('3600MHZ')) bus = '3600MHz';
      else if (pName.includes('3200') || pName.includes('3200MHZ')) bus = '3200MHz';

      let timing = '38';
      if (generation === 'DDR5') {
        if (bus.includes('6000')) timing = '30';
        else if (bus.includes('6600')) timing = '32';
        else if (bus.includes('5600')) timing = '36';
      } else {
        timing = '16';
      }

      let voltage = '1.35V';
      if (generation === 'DDR4') voltage = '1.2V';
      else if (bus.includes('6600')) voltage = '1.4V';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Loại hàng', val: productType },
        { name: 'Part-number', val: partNumber },
        { name: 'Màu sắc', val: color },
        { name: 'Đèn LED', val: led },
        { name: 'Nhu cầu', val: usage },
        { name: 'Dung lượng', val: capacity },
        { name: 'Thế hệ', val: generation },
        { name: 'Bus', val: bus },
        { name: 'Timing', val: timing },
        { name: 'Voltage', val: voltage },
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

    console.log(`✅ Successfully seeded full specs for all RAM products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding RAM specs:', err);
  }
}

seedRamSpecs();
