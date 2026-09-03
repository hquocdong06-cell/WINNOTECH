const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');

async function seedMonitorSpecs() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('⚡ Connected to MongoDB Atlas for Monitor Specs Seeding...');

    // 1. Ensure Monitor Spec Attributes Exist
    const attrNames = [
      // Thông tin chung
      'Thương hiệu',
      'Bảo hành',
      'Tên',
      'Series',
      'Màu sắc',
      'Nhu cầu',
      // Cấu hình chi tiết
      'Kích thước',
      'Tần số quét',
      'Thời gian phản hồi',
      'Tỉ lệ',
      'Độ tương phản tĩnh',
      'Độ sáng',
      'Góc nhìn',
      'Độ phủ màu',
      'Số lượng màu',
      'Tấm nền',
      'Công nghệ đồng bộ',
      'Độ phân giải',
      'Công suất',
      'Kiểu màn hình',
      'Kết nối',
      'Chuẩn gắn ARM',
      'Phụ kiện đi kèm',
      // Kích thước - Khối lượng
      'Kích thước (có chân)',
      'Kích thước (không chân)',
      'Khối lượng (có chân)',
      'Khối lượng (không chân)'
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

    // 2. Find Monitor Category and Products
    const monitorCats = await Category.find({
      $or: [
        { name: { $regex: /màn\s*hình/i } },
        { slug: { $regex: /man-hinh|monitor/i } }
      ]
    });
    const monitorCatIds = monitorCats.map(c => c._id);

    const monitorProducts = await Product.find({
      $or: [
        { cat_id: { $in: monitorCatIds } },
        { name: { $regex: /màn\s*hình\s*máy\s*tính/i } }
      ]
    }).populate('brand_id cat_id');

    console.log(`Found ${monitorProducts.length} monitor products to update specs.`);

    // Find any unwanted attributes like "Phiên bản / Dung lượng" or "Bản ép xung" to remove from monitor variants
    const unwantedAttrs = await Attribute.find({
      name: { $regex: /phiên\s*bản\s*\/\s*dung\s*lượng|phiên\s*bản/i }
    });
    const unwantedAttrIds = unwantedAttrs.map(a => a._id);
    const unwantedValues = await AttributeValue.find({
      $or: [
        { id_attribute: { $in: unwantedAttrIds } },
        { value: { $regex: /bản\s*ép\s*xung/i } }
      ]
    });
    const unwantedValueIds = unwantedValues.map(v => v._id);

    let totalLinked = 0;
    let totalCleaned = 0;

    for (let i = 0; i < monitorProducts.length; i++) {
      const p = monitorProducts[i];
      const pName = (p.name || '').toUpperCase();
      const brandRaw = p.brand_id?.name || (
        pName.includes('GIGABYTE') ? 'Gigabyte' :
        pName.includes('DELL') ? 'Dell' :
        pName.includes('LG') ? 'LG' :
        pName.includes('ASUS') ? 'ASUS' :
        pName.includes('SAMSUNG') ? 'Samsung' :
        pName.includes('MSI') ? 'MSI' : 'LG'
      );

      // Kích thước
      let sizeInch = '27"';
      let sizeNum = 27;
      if (pName.includes('24 INCH') || pName.includes('24"')) {
        sizeInch = '24"';
        sizeNum = 24;
      } else if (pName.includes('27 INCH') || pName.includes('27"')) {
        sizeInch = '27"';
        sizeNum = 27;
      } else if (pName.includes('32 INCH') || pName.includes('32"')) {
        sizeInch = '32"';
        sizeNum = 32;
      } else if (pName.includes('34 INCH') || pName.includes('34"')) {
        sizeInch = '34"';
        sizeNum = 34;
      }

      // Tấm nền (Panel)
      let panel = 'Fast IPS LED';
      let isOLED = false;
      if (pName.includes('OLED')) {
        panel = 'QD-OLED';
        isOLED = true;
      } else if (pName.includes('FAST IPS')) {
        panel = 'Fast IPS';
      } else if (pName.includes('IPS')) {
        panel = 'IPS';
      }

      // Kiểu màn hình & Tỉ lệ
      const isCurved = pName.includes('CONG') || sizeNum === 34;
      let screenType = isCurved ? (sizeNum === 34 ? 'Màn hình cong 1500R' : 'Màn hình cong 1000R') : 'Màn hình phẳng';
      let aspectRatio = (sizeNum === 34 && isCurved) ? '21:9' : '16:9';

      // Tần số quét (Refresh Rate)
      let refreshRate = '144Hz';
      if (pName.includes('360HZ')) refreshRate = '360Hz';
      else if (pName.includes('240HZ')) refreshRate = '240Hz';
      else if (pName.includes('180HZ')) refreshRate = '180Hz';
      else if (pName.includes('144HZ')) refreshRate = '144Hz';
      else if (pName.includes('100HZ')) refreshRate = '100Hz';

      // Độ phân giải (Resolution)
      let resolution = 'FHD ( 1920 x 1080 )';
      if (sizeNum === 34) {
        if (pName.includes('4K') || pName.includes('OLED')) {
          resolution = 'UWQHD ( 3440 x 1440 )';
        } else if (pName.includes('2K')) {
          resolution = 'UWQHD ( 3440 x 1440 )';
        } else {
          resolution = 'WFHD ( 2560 x 1080 )';
        }
      } else {
        if (pName.includes('4K UHD') || pName.includes('4K')) {
          resolution = '4K UHD ( 3840 x 2160 )';
        } else if (pName.includes('2K QHD') || pName.includes('2K')) {
          resolution = '2K QHD ( 2560 x 1440 )';
        } else {
          resolution = 'FHD ( 1920 x 1080 )';
        }
      }

      // Thời gian phản hồi
      let responseTime = '1 ms (GTG)';
      if (isOLED) {
        responseTime = '0.03 ms (GTG)';
      } else if (refreshRate === '360Hz' || refreshRate === '240Hz') {
        responseTime = '0.3 ms (MPRT)';
      } else if (refreshRate === '180Hz') {
        responseTime = '0.5 ms (MPRT)';
      }

      // Độ tương phản tĩnh & Độ sáng & Màu sắc
      let contrast = '1,000:1';
      let brightness = '300 cd/m2';
      let colorCount = '16.7 triệu màu';
      let colorCoverage = '99% sRGB';
      if (isOLED) {
        contrast = '1,500,000:1';
        brightness = '450 cd/m2 (Peak 1000 cd/m2 HDR)';
        colorCount = '1.07 tỷ màu (10-bit)';
        colorCoverage = '99% DCI-P3, 135% sRGB';
      } else if (resolution.includes('4K') || resolution.includes('2K')) {
        brightness = '350 cd/m2 (HDR400)';
        colorCount = '1.07 tỷ màu (8-bit + FRC)';
        colorCoverage = '98% DCI-P3, 100% sRGB';
      } else if (refreshRate === '100Hz') {
        brightness = '250 cd/m2';
        colorCoverage = '99% sRGB';
      }

      // Công nghệ đồng bộ
      let syncTech = 'Adaptive Sync';
      if (brandRaw === 'ASUS') {
        syncTech = 'Adaptive Sync, G-Sync Compatible, Extreme Low Motion Blur (ELMB)';
      } else if (brandRaw === 'Dell') {
        syncTech = isOLED ? 'NVIDIA G-Sync Ultimate, AMD FreeSync Premium Pro' : 'NVIDIA G-Sync Compatible, AMD FreeSync Premium';
      } else if (brandRaw === 'LG') {
        syncTech = 'AMD FreeSync Premium, NVIDIA G-Sync Compatible';
      } else if (brandRaw === 'Gigabyte') {
        syncTech = 'AMD FreeSync Premium, Adaptive Sync';
      } else if (brandRaw === 'Samsung') {
        syncTech = 'AMD FreeSync Premium Pro, G-Sync Compatible';
      } else if (brandRaw === 'MSI') {
        syncTech = 'Adaptive Sync, MSI Gaming Intelligence';
      }

      // Series & Model Name
      let series = 'Gaming';
      let modelCode = '';
      if (brandRaw === 'ASUS') {
        series = isOLED || refreshRate === '360Hz' ? 'ROG Swift' : 'TUF Gaming';
        modelCode = `${series} VG${sizeNum}9QM${i + 1}A`;
      } else if (brandRaw === 'Dell') {
        series = isOLED || refreshRate === '360Hz' ? 'Alienware Gaming' : 'UltraSharp / Gaming';
        modelCode = isOLED ? `Alienware AW${sizeNum}25QF` : `Dell Gaming G${sizeNum}24D`;
      } else if (brandRaw === 'LG') {
        series = 'UltraGear';
        modelCode = `LG UltraGear ${sizeNum}GR${70 + (i % 25)}Q-B`;
      } else if (brandRaw === 'Gigabyte') {
        series = isOLED ? 'AORUS' : 'G-Series';
        modelCode = isOLED ? `AORUS FO${sizeNum}U2` : `Gigabyte G${sizeNum}F 2`;
      } else if (brandRaw === 'Samsung') {
        series = isOLED ? 'Odyssey OLED G8' : 'Odyssey G5';
        modelCode = `Odyssey ${sizeNum}" LS${sizeNum}BG${50 + (i % 30)}`;
      } else if (brandRaw === 'MSI') {
        series = isOLED ? 'MPG OLED' : 'MAG Gaming';
        modelCode = `MSI MAG ${sizeNum}4QRF-QD V${i + 1}`;
      }

      // Nhu cầu
      let usage = isOLED || resolution.includes('4K') ? 'Gaming & Đồ họa chuyên nghiệp' : (refreshRate === '360Hz' || refreshRate === '240Hz' ? 'Gaming eSports' : 'Gaming & Văn phòng');

      // Màu sắc
      let color = 'Đen';
      if (pName.includes('WHITE') || pName.includes('TRẮNG')) color = 'Trắng';
      else if (pName.includes('SILVER') || pName.includes('BẠC')) color = 'Bạc Titanium';

      // Bảo hành
      let warranty = '36 tháng';
      if (brandRaw === 'Samsung' && !isOLED) warranty = '24 tháng';

      // Cổng kết nối (Ports)
      let ports = '2 x HDMI 2.0, 1 x DisplayPort 1.4, 1 x 3.5 mm Audio';
      if (isOLED || resolution.includes('4K')) {
        ports = '2 x HDMI 2.1, 1 x DisplayPort 1.4 (DSC), 1 x USB Type-C (90W PD), 2 x USB 3.2, 1 x 3.5 mm';
      } else if (refreshRate === '360Hz') {
        ports = '2 x HDMI 2.0, 1 x DisplayPort 1.4 DSC, 2 x USB 3.0, 1 x 3.5 mm';
      } else if (refreshRate === '100Hz') {
        ports = '1 x HDMI 1.4, 1 x DisplayPort 1.2, 1 x 3.5 mm';
      }

      // Công suất tiêu thụ
      let power = '22W';
      if (sizeNum === 24) power = refreshRate === '360Hz' ? '28W' : '18W';
      else if (sizeNum === 27) power = isOLED ? '38W' : (resolution.includes('2K') ? '26W' : '22W');
      else if (sizeNum === 32) power = isOLED ? '52W' : '36W';
      else if (sizeNum === 34) power = isOLED ? '68W' : '48W';

      // Chuẩn gắn ARM & Phụ kiện
      let armMount = 'VESA mount 100 x 100 mm';
      let accessories = isOLED || resolution.includes('4K') 
        ? 'Cáp nguồn, Cáp DisplayPort 1.4, Cáp HDMI 2.1, Cáp Type-C, Báo cáo cân màu chuẩn từ nhà máy'
        : 'Cáp nguồn, Cáp DisplayPort (hoặc Cáp HDMI tùy đợt), Chân đế công thái học, Hướng dẫn sử dụng';

      // Kích thước & Khối lượng
      let dimsWithStand = '61.50 x 45.30 x 19.30 cm';
      let dimsWithoutStand = '61.50 x 36.90 x 5.90 cm';
      let weightWithStand = '4.5 kg';
      let weightWithoutStand = '3.7 kg';

      if (sizeNum === 24) {
        dimsWithStand = '54.10 x 41.20 x 18.00 cm';
        dimsWithoutStand = '54.10 x 32.20 x 5.20 cm';
        weightWithStand = '3.8 kg';
        weightWithoutStand = '3.1 kg';
      } else if (sizeNum === 27) {
        dimsWithStand = '61.50 x 45.30 x 19.30 cm';
        dimsWithoutStand = '61.50 x 36.90 x 5.90 cm';
        weightWithStand = '4.5 kg';
        weightWithoutStand = '3.7 kg';
      } else if (sizeNum === 32) {
        dimsWithStand = '71.40 x 52.00 x 24.50 cm';
        dimsWithoutStand = '71.40 x 42.50 x 6.80 cm';
        weightWithStand = '6.2 kg';
        weightWithoutStand = '5.1 kg';
      } else if (sizeNum === 34) {
        dimsWithStand = '81.40 x 46.00 x 26.00 cm';
        dimsWithoutStand = '81.40 x 36.00 x 11.50 cm';
        weightWithStand = '7.8 kg';
        weightWithoutStand = '6.3 kg';
      }

      const specsToApply = [
        // Thông tin chung
        { name: 'Thương hiệu', val: brandRaw },
        { name: 'Bảo hành', val: warranty },
        { name: 'Tên', val: modelCode || p.name },
        { name: 'Series', val: series },
        { name: 'Màu sắc', val: color },
        { name: 'Nhu cầu', val: usage },
        // Cấu hình chi tiết
        { name: 'Kích thước', val: sizeInch },
        { name: 'Tần số quét', val: refreshRate },
        { name: 'Thời gian phản hồi', val: responseTime },
        { name: 'Tỉ lệ', val: aspectRatio },
        { name: 'Độ tương phản tĩnh', val: contrast },
        { name: 'Độ sáng', val: brightness },
        { name: 'Góc nhìn', val: '178° (H) / 178° (V)' },
        { name: 'Độ phủ màu', val: colorCoverage },
        { name: 'Số lượng màu', val: colorCount },
        { name: 'Tấm nền', val: panel },
        { name: 'Công nghệ đồng bộ', val: syncTech },
        { name: 'Độ phân giải', val: resolution },
        { name: 'Công suất', val: power },
        { name: 'Kiểu màn hình', val: screenType },
        { name: 'Kết nối', val: ports },
        { name: 'Chuẩn gắn ARM', val: armMount },
        { name: 'Phụ kiện đi kèm', val: accessories },
        // Kích thước - Khối lượng
        { name: 'Kích thước (có chân)', val: dimsWithStand },
        { name: 'Kích thước (không chân)', val: dimsWithoutStand },
        { name: 'Khối lượng (có chân)', val: weightWithStand },
        { name: 'Khối lượng (không chân)', val: weightWithoutStand }
      ];

      const variants = await ProductVariant.find({ p_id: p._id });
      for (const variant of variants) {
        // Clean unwanted placeholder attributes
        if (unwantedValueIds.length > 0) {
          const delRes = await VariantAttribute.deleteMany({
            id_variants: variant._id,
            id_attribute_value: { $in: unwantedValueIds }
          });
          totalCleaned += delRes.deletedCount || 0;
        }

        // Apply all specs
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

    console.log(`\n✅ Seeding hoàn tất!`);
    console.log(`- Đã làm sạch ${totalCleaned} thuộc tính sai lệch (Bản ép xung OC Edition) khỏi màn hình.`);
    console.log(`- Đã tạo/gán ${totalLinked} liên kết thông số kỹ thuật chi tiết vào các biến thể màn hình máy tính.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi seeding monitor specs:', err);
  }
}

seedMonitorSpecs();
