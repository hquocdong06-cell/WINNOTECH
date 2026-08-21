const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedSsdSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for SSD Specs Seeding...');

    // 1. Ensure SSD Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Kiểu ổ cứng',
      'Màu sắc của ổ cứng',
      'Dung lượng',
      'Kết nối',
      'Kích thước',
      'Tốc độ vòng quay',
      'Tốc độ đọc',
      'Tốc độ ghi'
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

    // 2. Find SSD Category & Products
    const ssdCat = await Category.findOne({ slug: 'storage' });
    const ssdProducts = await Product.find({
      $or: [
        { cat_id: ssdCat?._id },
        { name: { $regex: /ssd|nvme|sata|ổ cứng/i } }
      ]
    }).populate('brand_id cat_id');

    console.log(`Found ${ssdProducts.length} SSD products to update specs.`);

    let totalLinked = 0;
    for (const p of ssdProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('SAMSUNG') ? 'Samsung' :
        pName.includes('WESTERN') || pName.includes('WD') ? 'WD' :
        pName.includes('KINGSTON') ? 'Kingston' :
        pName.includes('CRUCIAL') ? 'Crucial' :
        pName.includes('LEXAR') ? 'Lexar' : 'WD'
      );

      let warranty = '36 tháng';
      if (pName.includes('990 PRO') || pName.includes('SN850X')) warranty = '60 tháng';

      let diskType = 'SSD';
      if (pName.includes('HDD')) diskType = 'HDD';

      let diskColor = 'Xanh lá';
      if (pName.includes('SN850X') || pName.includes('BLACK') || pName.includes('990 PRO')) diskColor = 'Đen';
      else if (pName.includes('BLUE')) diskColor = 'Xanh dương';
      else if (pName.includes('GREEN') || pName.includes('NV2')) diskColor = 'Xanh lá';

      let capacity = '1TB';
      if (pName.includes('2TB')) capacity = '2TB';
      else if (pName.includes('512GB') || pName.includes('500GB')) capacity = '500GB';
      else if (pName.includes('256GB')) capacity = '256GB';
      else if (pName.includes('4TB')) capacity = '4TB';

      let connection = 'M.2 NVMe';
      if (pName.includes('SATA')) connection = 'SATA3 6Gbps';
      else if (pName.includes('PCIE 4.0') || pName.includes('NVME 4.0') || pName.includes('990 PRO')) connection = 'PCIe Gen4 x4 M.2 NVMe';

      let formFactor = 'M.2 2280';
      if (pName.includes('2.5') || pName.includes('SATA')) formFactor = '2.5 inch';

      let endurance = '100 TB';
      if (capacity === '2TB') endurance = '1200 TBW';
      else if (capacity === '1TB') endurance = '600 TBW';
      else if (capacity === '500GB') endurance = '300 TBW';

      let readSpeed = '3200MB/s';
      if (pName.includes('990 PRO')) readSpeed = '7450MB/s';
      else if (pName.includes('SN850X')) readSpeed = '7300MB/s';
      else if (pName.includes('NV2')) readSpeed = '3500MB/s';

      let writeSpeed = '2500MB/s';
      if (pName.includes('990 PRO')) writeSpeed = '6900MB/s';
      else if (pName.includes('SN850X')) writeSpeed = '6600MB/s';
      else if (pName.includes('NV2')) writeSpeed = '2800MB/s';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Kiểu ổ cứng', val: diskType },
        { name: 'Màu sắc của ổ cứng', val: diskColor },
        { name: 'Dung lượng', val: capacity },
        { name: 'Kết nối', val: connection },
        { name: 'Kích thước', val: formFactor },
        { name: 'Tốc độ vòng quay', val: endurance },
        { name: 'Tốc độ đọc', val: readSpeed },
        { name: 'Tốc độ ghi', val: writeSpeed },
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

    console.log(`✅ Successfully seeded full specs for all SSD products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding SSD specs:', err);
  }
}

seedSsdSpecs();
