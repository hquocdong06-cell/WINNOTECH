const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedCoolerSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for CPU Cooler Specs Seeding...');

    // 1. Ensure CPU Cooler Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Dạng tản nhiệt',
      'Kích thước quạt (mm)',
      'Socket được hỗ trợ',
      'Đèn LED',
      'Chất liệu tản nhiệt',
      'Màu sắc',
      'Kích thước Radiator (cm)',
      'Chiều cao (cm)',
      'Số vòng quay của quạt (RPM)',
      'Lưu lượng không khí (CFM)',
      'Độ ồn (dBA)',
      'Khối lượng (kg)'
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

    // 2. Find CPU Cooler Products
    const coolerProducts = await Product.find({
      name: { $regex: /Tản nhiệt (nước|khí)/i }
    }).populate('brand_id cat_id');

    console.log(`Found ${coolerProducts.length} CPU Cooler products to update specs.`);

    let totalLinked = 0;
    for (const p of coolerProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('ASUS') || pName.includes('ROG') ? 'Asus' :
        pName.includes('NZXT') ? 'NZXT' :
        pName.includes('CORSAIR') ? 'Corsair' :
        pName.includes('MSI') ? 'MSI' :
        pName.includes('COOLER MASTER') ? 'Cooler Master' :
        pName.includes('DEEPCOOL') ? 'Deepcool' :
        pName.includes('THERMALRIGHT') ? 'Thermalright' : 'Asus'
      );

      let warranty = '72 tháng';
      if (pName.includes('COOLER MASTER') || pName.includes('THERMALRIGHT')) warranty = '24 tháng';
      else if (pName.includes('DEEPCOOL') || pName.includes('MSI')) warranty = '36 tháng';

      let coolerType = 'Tản nhiệt nước';
      if (pName.includes('TẢN NHIỆT KHÍ') || pName.includes('HYPER') || pName.includes('PEERLESS')) coolerType = 'Tản nhiệt khí';

      let fanSize = '3 x 120 mm';
      if (pName.includes('240')) fanSize = '2 x 120 mm';
      else if (coolerType === 'Tản nhiệt khí') fanSize = '2 x 120 mm';

      let supportedSockets = 'AMD AM5, AMD AM4, Intel LGA 1851, Intel LGA 1700';

      let led = 'ARGB';
      if (pName.includes('RGB')) led = 'RGB';
      else if (pName.includes('NO LED')) led = 'Không LED';

      let material = 'Nhôm';
      if (coolerType === 'Tản nhiệt khí') material = 'Đồng & Nhôm';

      let color = 'Đen';
      if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';

      let radSize = '394 x 140 x 32 mm';
      if (pName.includes('240')) radSize = '275 x 120 x 27 mm';
      else if (coolerType === 'Tản nhiệt khí') radSize = 'N/A (Tản Khí)';

      let height = '200 mm';
      if (coolerType === 'Tản nhiệt khí') height = '157 mm';

      let rpm = '800-2650 +/- 10% RPM';
      if (coolerType === 'Tản nhiệt khí') rpm = '500-1550 RPM';

      let airflow = '71.44 CFM';
      if (coolerType === 'Tản nhiệt khí') airflow = '66.17 CFM';

      let noise = '39.6 dB(A)';
      if (coolerType === 'Tản nhiệt khí') noise = '25.6 dB(A)';

      let weight = '4 kg';
      if (coolerType === 'Tản nhiệt khí') weight = '1.2 kg';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Dạng tản nhiệt', val: coolerType },
        { name: 'Kích thước quạt (mm)', val: fanSize },
        { name: 'Socket được hỗ trợ', val: supportedSockets },
        { name: 'Đèn LED', val: led },
        { name: 'Chất liệu tản nhiệt', val: material },
        { name: 'Màu sắc', val: color },
        { name: 'Kích thước Radiator (cm)', val: radSize },
        { name: 'Chiều cao (cm)', val: height },
        { name: 'Số vòng quay của quạt (RPM)', val: rpm },
        { name: 'Lưu lượng không khí (CFM)', val: airflow },
        { name: 'Độ ồn (dBA)', val: noise },
        { name: 'Khối lượng (kg)', val: weight },
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

    console.log(`✅ Successfully seeded full specs for all CPU Cooler products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding CPU Cooler specs:', err);
  }
}

seedCoolerSpecs();
