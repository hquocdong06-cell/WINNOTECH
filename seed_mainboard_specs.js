const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedMainboardSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for Mainboard Specs Seeding...');

    // 1. Ensure Mainboard Spec Attributes Exist
    const attrNames = [
      'Thương hiệu',
      'Bảo hành',
      'Nhu cầu',
      'Chipset',
      'Socket',
      'Kích thước',
      'Khe RAM tối đa',
      'Kiểu RAM hỗ trợ',
      'Hỗ trợ bộ nhớ tối đa',
      'Bus RAM hỗ trợ',
      'Lưu trữ',
      'Kiểu khe M.2 hỗ trợ',
      'Cổng xuất hình',
      'Khe PCI',
      'Số cổng USB',
      'LAN',
      'Âm thanh'
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

    // 2. Find Mainboard Category & Products
    const mbCat = await Category.findOne({ slug: 'mainboard' });
    const mbProducts = await Product.find({
      $or: [
        { cat_id: mbCat?._id },
        { name: { $regex: /mainboard|z790|b760|b650|x670|a520|h610/i } }
      ]
    }).populate('brand_id cat_id');

    // Exclude PC Prebuilts
    const filteredMbProducts = mbProducts.filter(p => !p.name.includes('PC Gaming') && !p.name.includes('PC Văn Phòng') && !p.name.includes('PC Đồ Họa'));

    console.log(`Found ${filteredMbProducts.length} Mainboard products to update specs.`);

    let totalLinked = 0;
    for (const p of filteredMbProducts) {
      const pName = (p.name || '').toUpperCase();

      let brandName = p.brand_id?.name || (
        pName.includes('ASUS') || pName.includes('ROG') || pName.includes('TUF') ? 'ASUS' :
        pName.includes('MSI') ? 'MSI' :
        pName.includes('GIGABYTE') || pName.includes('AORUS') ? 'Gigabyte' : 'Gigabyte'
      );

      let warranty = '36 tháng';
      let usage = pName.includes('ROG') || pName.includes('AORUS') || pName.includes('MORTAR') ? 'Gaming' : 'Văn phòng';

      let chipset = 'B760';
      if (pName.includes('Z790')) chipset = 'Z790';
      else if (pName.includes('B650')) chipset = 'B650';
      else if (pName.includes('X670')) chipset = 'X670';
      else if (pName.includes('A520')) chipset = 'A520';
      else if (pName.includes('H610')) chipset = 'H610';

      let socket = 'LGA 1700';
      if (chipset === 'B650' || chipset === 'X670') socket = 'AM5';
      else if (chipset === 'A520') socket = 'AM4';

      let sizeForm = 'Micro-ATX';
      if (pName.includes('MAXIMUS') || pName.includes('ELITE AX') || pName.includes('Z790-A')) sizeForm = 'ATX';

      let ramSlots = '4 khe';
      if (pName.includes('A520') || pName.includes('H610')) ramSlots = '2 khe';

      let ramType = 'DDR5';
      if (pName.includes('A520') || pName.includes('DDR4')) ramType = 'DDR4';

      let maxRam = '192GB';
      if (ramType === 'DDR4') maxRam = '64GB';
      else if (ramSlots === '4 khe') maxRam = '192GB';

      let ramBus = ramType === 'DDR5' 
        ? '7800(O.C.), 7600(O.C.), 7200(O.C.), 6800(O.C.), 6400(O.C.), 6000(O.C.), 5600(O.C.)'
        : '5100(O.C.), 4800(O.C.), 4600(O.C.), 4400(O.C.), 4266(O.C.), 4133(O.C.), 4000(O.C.), 3866(O.C.), 3733(O.C.), 3600(O.C.)';

      let storage = '2 x M.2 PCIe NVMe, 4 x SATA 3 6Gb/s';
      if (chipset === 'A520') storage = '1 x M.2 SATA/NVMe, 4 x SATA 3 6Gb/s';
      else if (chipset === 'Z790' || chipset === 'X670') storage = '4 x M.2 PCIe 4.0/5.0 NVMe, 6 x SATA 3 6Gb/s';

      let m2Type = 'M.2 SATA/NVMe';

      let displayPorts = '1 x HDMI 2.1, 1 x DisplayPort 1.4';
      if (chipset === 'A520') displayPorts = '1 x HDMI, 1 x VGA/D-sub';

      let pciSlots = '1 x PCI Express x16, 1 x PCI Express x1';
      if (sizeForm === 'ATX') pciSlots = '2 x PCI Express x16, 2 x PCI Express x1';

      let usbPorts = '4 x USB 3.2 (tối đa 6), 2 x USB 2.0 (tối đa 6)';

      let lan = '1 x LAN 2.5 Gb/s';
      if (chipset === 'A520') lan = '1 x LAN 1 Gb/s';

      let audio = '- Realtek® Audio CODEC\n- High Definition Audio\n- 2/4/5.1/7.1-channel';

      const specsToApply = [
        { name: 'Thương hiệu', val: brandName },
        { name: 'Bảo hành', val: warranty },
        { name: 'Nhu cầu', val: usage },
        { name: 'Chipset', val: chipset },
        { name: 'Socket', val: socket },
        { name: 'Kích thước', val: sizeForm },
        { name: 'Khe RAM tối đa', val: ramSlots },
        { name: 'Kiểu RAM hỗ trợ', val: ramType },
        { name: 'Hỗ trợ bộ nhớ tối đa', val: maxRam },
        { name: 'Bus RAM hỗ trợ', val: ramBus },
        { name: 'Lưu trữ', val: storage },
        { name: 'Kiểu khe M.2 hỗ trợ', val: m2Type },
        { name: 'Cổng xuất hình', val: displayPorts },
        { name: 'Khe PCI', val: pciSlots },
        { name: 'Số cổng USB', val: usbPorts },
        { name: 'LAN', val: lan },
        { name: 'Âm thanh', val: audio },
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

    console.log(`✅ Successfully seeded full specs for all Mainboard products! Created ${totalLinked} variant attribute links.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding Mainboard specs:', err);
  }
}

seedMainboardSpecs();
