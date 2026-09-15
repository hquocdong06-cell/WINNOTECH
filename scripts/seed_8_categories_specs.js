/**
 * SEED SPECIFICATIONS CHO 8 DANH MỤC KHÔNG DÙNG HARDCODE:
 * 1. PC Gaming (pc-gaming)
 * 2. PC Đồ Họa (pc-do-hoa)
 * 3. PC Văn Phòng (pc-van-phong)
 * 4. Màn hình máy tính (man-hinh)
 * 5. Bàn phím cơ (ban-phim)
 * 6. Chuột Gaming (chuot-gaming)
 * 7. Tai nghe Gaming (tai-nghe)
 * 8. Phụ kiện khác (extra)
 *
 * Lưu ý:
 * - Chuẩn hóa các danh mục thuộc tính categories_attribute & Attribute
 * - Tạo các giá trị thuộc tính thật attribute_value & AttributeValue
 * - Gán trực tiếp vào bảng Specifications theo chuẩn ERD (p_id, id_attribute_value)
 * - Dọn dẹp các giá trị rác như "Bản ép xung (OC Edition)" trên các thiết bị ngoại vi
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { CategoryAttribute, AttributeValue } = require('../models/Attribute');
const { Specification } = require('../models/Specification');

async function runSeed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WINNOTech';
  console.log('⚡ Kết nối MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  // 1. Dọn dẹp bản ghi rác "Bản ép xung (OC Edition)" khỏi Specifications của gear & phụ kiện & PC
  console.log('\n🧹 Dọn dẹp giá trị rác "Bản ép xung (OC Edition)" khỏi Specifications...');
  const ocVal = await db.collection('attribute_value').findOne({ value: /Bản ép xung/i }) 
    || await db.collection('AttributeValue').findOne({ value: /Bản ép xung/i });

  if (ocVal) {
    const gearCats = await Category.find({
      slug: { $in: ['ban-phim', 'chuot-gaming', 'tai-nghe', 'extra', 'man-hinh', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong'] }
    });
    const gearCatIds = gearCats.map(c => c._id);
    const gearProducts = await Product.find({ cat_id: { $in: gearCatIds } }).select('_id');
    const gearPids = gearProducts.map(p => p._id);

    const delRes = await Specification.deleteMany({
      p_id: { $in: gearPids },
      id_attribute_value: ocVal._id
    });
    console.log(`✔ Đã xóa ${delRes.deletedCount} bản ghi rác "Bản ép xung (OC Edition)" khỏi các danh mục trên.`);
  }

  // 2. Danh mục thuộc tính cần đảm bảo có trong Admin
  const requiredCategoriesAttributes = [
    // Chung
    'Thương hiệu',
    'Bảo hành',
    'Nhu cầu',
    'Màu sắc',
    'Tên',
    'Part-number',
    // PC Nguyên Bộ
    'Vi xử lý (CPU)',
    'Card đồ họa (VGA)',
    'Bo mạch chủ (Mainboard)',
    'Dung lượng RAM',
    'Ổ cứng lưu trữ (SSD)',
    'Nguồn máy tính (PSU)',
    'Vỏ Case',
    'Hệ thống Tản nhiệt',
    'Hệ điều hành',
    'Kết nối mạng',
    'Gói Bảo Hành',
    // Màn hình
    'Kích thước màn hình',
    'Tần số quét',
    'Thời gian phản hồi',
    'Độ phân giải',
    'Tấm nền',
    'Độ sáng',
    'Độ tương phản tĩnh',
    'Độ phủ màu',
    'Góc nhìn',
    'Công nghệ đồng bộ',
    'Kiểu màn hình',
    'Chuẩn gắn ARM',
    'Kết nối',
    'Kích thước (có chân)',
    'Kích thước (không chân)',
    'Khối lượng (có chân)',
    'Khối lượng (không chân)',
    // Bàn phím cơ
    'Kết nối bàn phím',
    'Loại bàn phím',
    'Kiểu switch',
    'Layout bàn phím',
    'Chất liệu Keycap',
    'Đèn LED',
    'Tính năng Hotswap',
    'Dung lượng pin',
    // Chuột Gaming
    'Kiểu kết nối',
    'Cảm biến (Sensor)',
    'Độ phân giải (DPI)',
    'Switch chuột',
    'Số nút bấm',
    'Thiết kế chuột',
    'Trọng lượng',
    // Tai nghe Gaming
    'Kiểu kết nối tai nghe',
    'Công nghệ âm thanh',
    'Kích thước Driver',
    'Tần số phản hồi',
    'Microphone',
    'Chất liệu đệm tai',
    // Phụ kiện khác
    'Loại phụ kiện',
    'Kích thước',
    'Tốc độ quạt & Lưu lượng gió',
    'Tính năng nổi bật'
  ];

  console.log('\n📁 Đảm bảo các Danh mục thuộc tính trong Admin...');
  const catAttrMap = {};

  for (const name of requiredCategoriesAttributes) {
    let cat = await CategoryAttribute.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!cat) {
      cat = await CategoryAttribute.create({ name, status: 'active' });
      console.log(`  + Tạo mới categories_attribute: "${name}"`);
    }
    // Đồng bộ sang Attribute
    await db.collection('Attribute').updateOne(
      { _id: cat._id },
      { $set: { name: cat.name, status: 'active', updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    catAttrMap[name] = cat;
  }

  // Helper lấy hoặc tạo AttributeValue (đồng bộ cả attribute_value & AttributeValue)
  const valCache = {};
  async function getValDoc(catName, valStr) {
    if (!valStr) return null;
    const cat = catAttrMap[catName];
    if (!cat) return null;
    const key = `${cat._id.toString()}:::${valStr.trim()}`;
    if (valCache[key]) return valCache[key];

    let vDoc = await AttributeValue.findOne({
      $or: [
        { id_categories_attribute: cat._id, value: valStr.trim() },
        { id_attribute: cat._id, value: valStr.trim() }
      ]
    });

    if (!vDoc) {
      vDoc = await AttributeValue.create({
        id_categories_attribute: cat._id,
        id_attribute: cat._id,
        value: valStr.trim(),
        status: 'active'
      });
    }

    // Đồng bộ sang AttributeValue (PascalCase)
    await db.collection('AttributeValue').updateOne(
      { _id: vDoc._id },
      {
        $set: {
          value: vDoc.value,
          id_categories_attribute: cat._id,
          id_attribute: cat._id,
          status: 'active',
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    valCache[key] = vDoc;
    return vDoc;
  }

  // Helper gán thông số vào bảng Specifications
  let totalLinked = 0;
  async function attachSpecs(productId, specsList) {
    for (const item of specsList) {
      if (!item.val) continue;
      const vDoc = await getValDoc(item.cat, item.val);
      if (!vDoc) continue;

      await Specification.updateOne(
        { p_id: productId, id_attribute_value: vDoc._id },
        {
          $setOnInsert: {
            p_id: productId,
            id_attribute_value: vDoc._id,
            status: 'active',
            is_deleted: false
          }
        },
        { upsert: true }
      );
      totalLinked++;
    }
  }

  // ============================================================
  // 3. SEED CHO DANH MỤC 1, 2, 3: PC NGUYÊN BỘ
  // ============================================================
  console.log('\n🖥 Đang xử lý 3 danh mục PC Nguyên Bộ...');
  const pcSlugs = ['pc-gaming', 'pc-do-hoa', 'pc-van-phong'];
  for (const slug of pcSlugs) {
    const cat = await Category.findOne({ slug });
    if (!cat) continue;
    const prods = await Product.find({ cat_id: cat._id });
    console.log(`  -> Danh mục [${cat.name}]: ${prods.length} sản phẩm`);

    for (const p of prods) {
      const name = p.name;
      const shortDesc = p.short_desc || '';

      let cpu = 'Intel Core i5-13400F';
      if (name.includes('14900K')) cpu = 'Intel Core i9-14900K (24 Nhân 32 Luồng, Up to 6.0GHz)';
      else if (name.includes('14700K')) cpu = 'Intel Core i7-14700K (20 Nhân 28 Luồng, Up to 5.6GHz)';
      else if (name.includes('14700F')) cpu = 'Intel Core i7-14700F (20 Nhân 28 Luồng, Up to 5.4GHz)';
      else if (name.includes('14600K')) cpu = 'Intel Core i5-14600K (14 Nhân 20 Luồng, Up to 5.3GHz)';
      else if (name.includes('13400F')) cpu = 'Intel Core i5-13400F (10 Nhân 16 Luồng, Up to 4.6GHz)';
      else if (name.includes('14400F')) cpu = 'Intel Core i5-14400F (10 Nhân 16 Luồng, Up to 4.7GHz)';
      else if (name.includes('14100')) cpu = 'Intel Core i3-14100 (4 Nhân 8 Luồng, Up to 4.7GHz)';
      else if (name.includes('12100')) cpu = 'Intel Core i3-12100 (4 Nhân 8 Luồng, Up to 4.3GHz)';
      else if (name.includes('12400')) cpu = 'Intel Core i5-12400 (6 Nhân 12 Luồng, Up to 4.4GHz)';
      else if (name.includes('7800X3D')) cpu = 'AMD Ryzen 7 7800X3D (8 Nhân 16 Luồng, 3D V-Cache, Up to 5.0GHz)';
      else if (name.includes('7950X3D')) cpu = 'AMD Ryzen 9 7950X3D (16 Nhân 32 Luồng, 3D V-Cache, Up to 5.7GHz)';
      else if (name.includes('7950X')) cpu = 'AMD Ryzen 9 7950X (16 Nhân 32 Luồng, Up to 5.7GHz)';
      else if (name.includes('7900X')) cpu = 'AMD Ryzen 9 7900X (12 Nhân 24 Luồng, Up to 5.6GHz)';
      else if (name.includes('7600X')) cpu = 'AMD Ryzen 5 7600X (6 Nhân 12 Luồng, Up to 5.3GHz)';
      else if (name.includes('7600')) cpu = 'AMD Ryzen 5 7600 (6 Nhân 12 Luồng, Up to 5.1GHz)';
      else if (name.includes('5600G')) cpu = 'AMD Ryzen 5 5600G (6 Nhân 12 Luồng, Radeon Graphics, Up to 4.4GHz)';
      else if (name.includes('5600X')) cpu = 'AMD Ryzen 5 5600X (6 Nhân 12 Luồng, Up to 4.6GHz)';

      let vga = 'NVIDIA GeForce RTX 4060 8GB GDDR6';
      if (name.includes('4090')) vga = 'NVIDIA GeForce RTX 4090 24GB GDDR6X (Ray Tracing & DLSS 3.5)';
      else if (name.includes('4080 Super')) vga = 'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X';
      else if (name.includes('4080')) vga = 'NVIDIA GeForce RTX 4080 16GB GDDR6X';
      else if (name.includes('4070 Ti Super')) vga = 'NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X';
      else if (name.includes('4070 Super')) vga = 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X';
      else if (name.includes('4070 Ti')) vga = 'NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X';
      else if (name.includes('4070')) vga = 'NVIDIA GeForce RTX 4070 12GB GDDR6X';
      else if (name.includes('4060 Ti 16GB')) vga = 'NVIDIA GeForce RTX 4060 Ti 16GB GDDR6';
      else if (name.includes('4060 Ti')) vga = 'NVIDIA GeForce RTX 4060 Ti 8GB GDDR6';
      else if (name.includes('4060')) vga = 'NVIDIA GeForce RTX 4060 8GB GDDR6';
      else if (name.includes('UHD 730') || name.includes('UHD 770') || slug === 'pc-van-phong') {
        vga = name.includes('5600G') ? 'Đồ họa tích hợp AMD Radeon Vega 7 Graphics' : 'Đồ họa tích hợp Intel UHD Graphics 730 / 770';
      }

      let mb = 'B760M Gaming Wifi DDR5';
      if (name.includes('Z790')) mb = 'Intel Z790 Chipset cao cấp (Hỗ trợ ép xung & PCIe 5.0)';
      else if (name.includes('X670E') || name.includes('X670')) mb = 'AMD X670E / X670 Socket AM5 DDR5';
      else if (name.includes('B650')) mb = 'AMD B650M Gaming Wifi Socket AM5 DDR5';
      else if (name.includes('B760')) mb = 'Intel B760M Gaming Wifi DDR5';
      else if (name.includes('H610')) mb = 'Intel H610M Socket LGA1700';
      else if (name.includes('B550')) mb = 'AMD B550M Socket AM4';

      let ram = '16GB DDR5 5600MHz (Dual Channel)';
      if (slug === 'pc-do-hoa' || name.includes('4080') || name.includes('4090')) ram = '64GB DDR5 6000MHz Cao cấp (Hỗ trợ nâng cấp 128GB)';
      else if (name.includes('4070') || name.includes('Titan')) ram = '32GB DDR5 5600MHz (Dual Channel)';
      else if (slug === 'pc-van-phong') ram = name.includes('Eco') ? '8GB DDR4 3200MHz' : '16GB DDR4/DDR5 Tốc độ cao';

      let ssd = '500GB SSD M.2 NVMe PCIe 4.0 (Read 3500MB/s)';
      if (slug === 'pc-do-hoa' || name.includes('4090')) ssd = '2TB SSD M.2 NVMe PCIe Gen4x4 Siêu tốc (Read 7400MB/s)';
      else if (name.includes('4070') || name.includes('4080')) ssd = '1TB SSD M.2 NVMe PCIe Gen4x4 (Read 5000MB/s)';
      else if (slug === 'pc-van-phong') ssd = name.includes('Eco') ? '256GB SSD M.2 NVMe' : '512GB SSD M.2 NVMe Tốc độ cao';

      let psu = '650W 80 Plus Bronze chuẩn Active PFC';
      if (name.includes('4090')) psu = '1200W 80 Plus Platinum Chuẩn PCIe 5.0 ATX 3.0';
      else if (name.includes('4080')) psu = '850W - 1000W 80 Plus Gold ATX 3.0';
      else if (name.includes('4070')) psu = '750W 80 Plus Gold';
      else if (slug === 'pc-van-phong') psu = '450W - 550W 80 Plus chuẩn êm ái';

      let cooling = 'Tản nhiệt nước AIO 240mm ARGB';
      if (slug === 'pc-do-hoa' || name.includes('14900K') || name.includes('4090')) cooling = 'Tản nhiệt nước AIO 360mm Màn hình LCD hiển thị nhiệt độ';
      else if (slug === 'pc-van-phong') cooling = 'Tản nhiệt khí Tower Fan siêu êm';

      let casePc = 'Case Bể Cá Panoramic kính cường lực 2 mặt cao cấp';
      if (slug === 'pc-van-phong') casePc = 'Vỏ Case Văn Phòng Mini/Mid Tower Đen thanh lịch, nhỏ gọn';

      let os = 'Windows 11 Pro 64-bit bản quyền';
      let network = 'Wi-Fi 6E, Bluetooth 5.3 & LAN 2.5Gbps';
      let warranty = '36 Tháng 1 đổi 1 tận nơi';
      let usage = slug === 'pc-gaming' ? 'Chơi Game eSports & Game AAA Đỉnh Cao' : (slug === 'pc-do-hoa' ? 'Render 3D, Đồ Họa Kỹ Thuật, Dựng Phim 4K/8K & AI' : 'Văn phòng, Kế toán, Học tập & Doanh nghiệp');

      const specs = [
        { cat: 'Thương hiệu', val: 'WINNOTech' },
        { cat: 'Bảo hành', val: warranty },
        { cat: 'Gói Bảo Hành', val: 'Bảo hành 36 Tháng 1 đổi 1' },
        { cat: 'Nhu cầu', val: usage },
        { cat: 'Vi xử lý (CPU)', val: cpu },
        { cat: 'Card đồ họa (VGA)', val: vga },
        { cat: 'Bo mạch chủ (Mainboard)', val: mb },
        { cat: 'Dung lượng RAM', val: ram },
        { cat: 'Ổ cứng lưu trữ (SSD)', val: ssd },
        { cat: 'Nguồn máy tính (PSU)', val: psu },
        { cat: 'Vỏ Case', val: casePc },
        { cat: 'Hệ thống Tản nhiệt', val: cooling },
        { cat: 'Hệ điều hành', val: os },
        { cat: 'Kết nối mạng', val: network },
      ];

      await attachSpecs(p._id, specs);
    }
  }

  // ============================================================
  // 4. SEED CHO DANH MỤC 4: MÀN HÌNH MÁY TÍNH
  // ============================================================
  console.log('\n🖥 Đang xử lý Danh mục Màn hình máy tính...');
  const monitorCat = await Category.findOne({ slug: 'man-hinh' });
  if (monitorCat) {
    const monitorProds = await Product.find({ cat_id: monitorCat._id }).populate('brand_id');
    console.log(`  -> Tìm thấy ${monitorProds.length} màn hình`);

    for (const p of monitorProds) {
      const name = p.name;
      let brand = p.brand_id?.name || (name.includes('Dell') ? 'Dell' : (name.includes('LG') ? 'LG' : (name.includes('ASUS') ? 'ASUS' : (name.includes('Gigabyte') ? 'Gigabyte' : 'Samsung'))));

      let size = '24 inch';
      if (name.includes('27 inch')) size = '27 inch';
      else if (name.includes('32 inch')) size = '32 inch';
      else if (name.includes('34 inch')) size = '34 inch Cong Ultrawide';

      let hz = '100Hz';
      if (name.includes('360Hz')) hz = '360Hz Siêu Tốc';
      else if (name.includes('240Hz')) hz = '240Hz';
      else if (name.includes('180Hz')) hz = '180Hz';
      else if (name.includes('144Hz')) hz = '144Hz';
      else if (name.includes('100Hz')) hz = '100Hz';

      let res = 'Full HD (1920 x 1080)';
      if (name.includes('4K')) res = '4K UHD (3840 x 2160)';
      else if (name.includes('2K')) res = '2K QHD (2560 x 1440)';

      let panel = 'Fast IPS';
      if (name.includes('OLED')) panel = 'QD-OLED Vô Cực';
      else if (name.includes('VA')) panel = 'Fast VA';

      let response = '1ms (GTG)';
      let colorCoverage = '99% sRGB, 95% DCI-P3';
      let brightness = name.includes('4K') || name.includes('OLED') ? '400 cd/m² (HDR 400)' : '300 cd/m²';
      let ports = '2x HDMI 2.1, 1x DisplayPort 1.4, 1x Jack 3.5mm';
      let sync = 'NVIDIA G-Sync Compatible & AMD FreeSync Premium';
      let vesa = 'VESA 100 x 100 mm';

      const specs = [
        { cat: 'Thương hiệu', val: brand },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Nhu cầu', val: 'Gaming & Đồ Họa Chuyên Nghiệp' },
        { cat: 'Kích thước màn hình', val: size },
        { cat: 'Tần số quét', val: hz },
        { cat: 'Độ phân giải', val: res },
        { cat: 'Tấm nền', val: panel },
        { cat: 'Thời gian phản hồi', val: response },
        { cat: 'Độ sáng', val: brightness },
        { cat: 'Độ phủ màu', val: colorCoverage },
        { cat: 'Công nghệ đồng bộ', val: sync },
        { cat: 'Chuẩn gắn ARM', val: vesa },
        { cat: 'Kết nối', val: ports },
        { cat: 'Kích thước (có chân)', val: size.includes('24') ? '54.1 x 41.2 x 18.0 cm' : (size.includes('27') ? '61.4 x 46.5 x 20.5 cm' : '71.5 x 52.0 x 23.0 cm') },
        { cat: 'Khối lượng (có chân)', val: size.includes('24') ? '3.8 kg' : (size.includes('27') ? '5.2 kg' : '7.1 kg') },
      ];

      await attachSpecs(p._id, specs);
    }
  }

  // ============================================================
  // 5. SEED CHO DANH MỤC 5: BÀN PHÍM CƠ
  // ============================================================
  console.log('\n⌨ Đang xử lý Danh mục Bàn phím cơ...');
  const kbCat = await Category.findOne({ slug: 'ban-phim' });
  if (kbCat) {
    const kbProds = await Product.find({ cat_id: kbCat._id }).populate('brand_id');
    console.log(`  -> Tìm thấy ${kbProds.length} bàn phím`);

    for (const p of kbProds) {
      const name = p.name;
      let brand = p.brand_id?.name || (name.includes('Corsair') ? 'Corsair' : (name.includes('Razer') ? 'Razer' : (name.includes('Logitech') ? 'Logitech' : (name.includes('Akko') ? 'Akko' : 'ASUS'))));

      let conn = 'Không Dây Tri-Mode (2.4GHz Wireless / Bluetooth 5.1 / Type-C có dây)';
      if (name.includes('Có Dây') || (!name.includes('Không Dây') && !name.includes('Tri-Mode'))) {
        conn = 'Có Dây Type-C tháo rời (Bọc dù chống đứt)';
      }

      let switchType = 'Switch Cơ Linear Siêu Mượt (Lubed sẵn từ nhà máy)';
      if (name.includes('Quang Học')) switchType = 'Razer / Corsair Optical Mechanical Switch (Độ trễ 0.2ms)';
      else if (name.includes('Hotswap')) switchType = 'Custom Hotswap 5-Pin TTC / Gateron Pro Switch';
      else if (name.includes('Silent')) switchType = 'Silent Mechanical Switch Êm ái tuyệt đối không gây ồn';

      let layout = 'Layout TKL 87 Phím (Gọn gàng tối ưu chuột)';
      if (name.includes('Full') || name.includes('K70') || name.includes('K71')) layout = 'Layout Fullsize 104 Phím Đầy Đủ Numpad';
      else if (name.includes('Mini') || name.includes('60%')) layout = 'Layout 60% Siêu Nhỏ Gọn';
      else if (name.includes('75%')) layout = 'Layout 75% Tiện Dụng';

      let keycap = 'PBT Double-shot Cao Cấp (Chống bóng, chống mờ ký tự)';
      let led = 'LED RGB 16.8 Triệu Màu (Từng phím Per-key RGB Sync)';
      let hotswap = 'Hotswap 5-Pin (Thay thế switch dễ dàng không cần hàn)';
      let battery = conn.includes('Không Dây') ? '4000mAh (Thời lượng dùng tới 200 giờ)' : 'Không dùng pin (Cấp nguồn Type-C)';

      const specs = [
        { cat: 'Thương hiệu', val: brand },
        { cat: 'Bảo hành', val: '24 tháng 1 đổi 1' },
        { cat: 'Nhu cầu', val: 'Gaming eSports & Làm Việc Lập Trình' },
        { cat: 'Kết nối bàn phím', val: conn },
        { cat: 'Loại bàn phím', val: 'Bàn phím cơ cao cấp' },
        { cat: 'Kiểu switch', val: switchType },
        { cat: 'Layout bàn phím', val: layout },
        { cat: 'Chất liệu Keycap', val: keycap },
        { cat: 'Đèn LED', val: led },
        { cat: 'Tính năng Hotswap', val: hotswap },
        { cat: 'Dung lượng pin', val: battery },
        { cat: 'Kích thước', val: layout.includes('Fullsize') ? '440 x 135 x 40 mm' : '360 x 135 x 38 mm' },
        { cat: 'Trọng lượng', val: layout.includes('Fullsize') ? '1100g' : '880g' },
      ];

      await attachSpecs(p._id, specs);
    }
  }

  // ============================================================
  // 6. SEED CHO DANH MỤC 6: CHUỘT GAMING
  // ============================================================
  console.log('\n🖱 Đang xử lý Danh mục Chuột Gaming...');
  const mouseCat = await Category.findOne({ slug: 'chuot-gaming' });
  if (mouseCat) {
    const mouseProds = await Product.find({ cat_id: mouseCat._id }).populate('brand_id');
    console.log(`  -> Tìm thấy ${mouseProds.length} chuột gaming`);

    for (const p of mouseProds) {
      const name = p.name;
      let brand = p.brand_id?.name || (name.includes('Logitech') ? 'Logitech' : (name.includes('Razer') ? 'Razer' : (name.includes('Corsair') ? 'Corsair' : 'SteelSeries')));

      let conn = 'Không Dây Siêu Tốc 2.4GHz Wireless & Bluetooth & Type-C';
      let sensor = 'Cảm biến Quang học Hero 25K (Chuẩn xác từng micromet)';
      if (name.includes('Focus Pro 30K')) sensor = 'Cảm biến Focus Pro 30K Optical Sensor (Đỉnh cao thế giới)';
      else if (name.includes('PAW3395')) sensor = 'Cảm biến PixArt PAW3395 Siêu Tiết Kiệm & Siêu Nhạy';
      else if (name.includes('TrueMove')) sensor = 'Cảm biến TrueMove Core Gaming Sensor';

      let dpi = '100 - 26.000 DPI (Tùy chỉnh linh hoạt qua phần mềm)';
      if (name.includes('30K')) dpi = '100 - 30.000 DPI Tối Đa';

      let sw = 'Optical Mouse Switch Gen-3 (Tuổi thọ 90 triệu lần nhấn, không bị double-click)';
      let btn = '6 Nút Lập Trình Độc Lập';
      let weight = 'Siêu Nhẹ Chỉ 55g - 58g (Không khoan lỗ, đầm tay lướt êm)';
      let battery = 'Pin sạc Lithium-ion lên đến 90 Giờ liên tục';
      let design = 'Thiết kế Công thái học chuẩn tay cầm eSports';

      const specs = [
        { cat: 'Thương hiệu', val: brand },
        { cat: 'Bảo hành', val: '24 tháng' },
        { cat: 'Nhu cầu', val: 'Gaming eSports FPS & MOBA Chuyên Nghiệp' },
        { cat: 'Kiểu kết nối', val: conn },
        { cat: 'Cảm biến (Sensor)', val: sensor },
        { cat: 'Độ phân giải (DPI)', val: dpi },
        { cat: 'Switch chuột', val: sw },
        { cat: 'Số nút bấm', val: btn },
        { cat: 'Thiết kế chuột', val: design },
        { cat: 'Trọng lượng', val: weight },
        { cat: 'Dung lượng pin', val: battery },
        { cat: 'Đèn LED', val: 'RGB Sync hoặc Tối giản tiết kiệm pin' },
      ];

      await attachSpecs(p._id, specs);
    }
  }

  // ============================================================
  // 7. SEED CHO DANH MỤC 7: TAI NGHE GAMING
  // ============================================================
  console.log('\n🎧 Đang xử lý Danh mục Tai nghe Gaming...');
  const headphoneCat = await Category.findOne({ slug: 'tai-nghe' });
  if (headphoneCat) {
    const hpProds = await Product.find({ cat_id: headphoneCat._id }).populate('brand_id');
    console.log(`  -> Tìm thấy ${hpProds.length} tai nghe gaming`);

    for (const p of hpProds) {
      const name = p.name;
      let brand = p.brand_id?.name || (name.includes('Logitech') ? 'Logitech' : (name.includes('Razer') ? 'Razer' : (name.includes('Corsair') ? 'Corsair' : (name.includes('MSI') ? 'MSI' : 'HyperX'))));

      let soundTech = 'Âm Thanh Vòm 7.1 Virtual Surround (Nghe rõ tiếng bước chân đối thủ)';
      if (name.includes('Hi-Res')) soundTech = 'Chuẩn Âm Thanh Hi-Res Audio 24-bit/96kHz Đỉnh Cao';
      else if (name.includes('Spatial')) soundTech = 'Spatial 3D Audio Không Gian 360 Độ';
      else if (name.includes('Chống Ồn') || name.includes('ANC')) soundTech = 'Chống Ồn Chủ Động ANC & Âm Thanh Vòm Cao Cấp';

      let driver = 'Driver 50mm Neodymium Màng Loa Titanium Siêu Cấp';
      let freq = '20Hz - 20.000Hz (Bass sâu, Mid trong, Treble sắc nét)';
      let mic = 'Microphone Thu Âm Rời Lọc Tạp Âm ENC Siêu Nét';
      let cushion = 'Đệm mút hoạt tính Memory Foam bọc da thoáng khí không bí tai';
      let conn = 'Jack 3.5mm & USB Type-C (Tương thích PC, Laptop, PS5, Switch, Mobile)';
      if (name.includes('Không Dây') || name.includes('Spatial')) conn = 'Không Dây 2.4GHz Độ Trễ Siêu Thấp & Bluetooth & Type-C';

      const specs = [
        { cat: 'Thương hiệu', val: brand },
        { cat: 'Bảo hành', val: '24 tháng' },
        { cat: 'Nhu cầu', val: 'Gaming eSports, Xem Phim & Thưởng Thức Âm Nhạc' },
        { cat: 'Kiểu kết nối tai nghe', val: conn },
        { cat: 'Công nghệ âm thanh', val: soundTech },
        { cat: 'Kích thước Driver', val: driver },
        { cat: 'Tần số phản hồi', val: freq },
        { cat: 'Microphone', val: mic },
        { cat: 'Chất liệu đệm tai', val: cushion },
        { cat: 'Trọng lượng', val: '275g (Siêu nhẹ đeo lâu không mỏi cổ)' },
      ];

      await attachSpecs(p._id, specs);
    }
  }

  // ============================================================
  // 8. SEED CHO DANH MỤC 8: PHỤ KIỆN KHÁC
  // ============================================================
  console.log('\n🔌 Đang xử lý Danh mục Phụ kiện khác...');
  const extraCat = await Category.findOne({ slug: 'extra' });
  if (extraCat) {
    const extraProds = await Product.find({ cat_id: extraCat._id }).populate('brand_id');
    console.log(`  -> Tìm thấy ${extraProds.length} phụ kiện khác`);

    for (const p of extraProds) {
      const name = p.name;
      let brand = p.brand_id?.name || (name.includes('Corsair') ? 'Corsair' : (name.includes('Lian Li') ? 'Lian Li' : (name.includes('ASUS') ? 'ASUS' : (name.includes('Thermal Grizzly') ? 'Thermal Grizzly' : (name.includes('Razer') ? 'Razer' : 'WINNOTech')))));

      let accessoryType = 'Phụ kiện máy tính cao cấp';
      let specs = [];

      if (name.includes('Quạt') || name.includes('Fan')) {
        accessoryType = 'Quạt Tản Nhiệt Case ARGB';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '24 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Kích thước', val: '120 x 120 x 25 mm (Bộ 3 Fan)' },
          { cat: 'Tốc độ quạt & Lưu lượng gió', val: '550 - 2100 RPM | Lưu lượng 65.57 CFM | Áp suất 2.68 mmH2O' },
          { cat: 'Đèn LED', val: 'ARGB 5V 3-Pin Aura Sync / Mystic Light / RGB Fusion' },
          { cat: 'Kết nối', val: 'PWM 4-Pin & ARGB 3-Pin' },
          { cat: 'Tính năng nổi bật', val: 'Vòng bi đệm từ tính Magnetic Levitation siêu bền, êm ái' }
        ];
      } else if (name.includes('Dây Nguồn') || name.includes('Strimer')) {
        accessoryType = 'Dây Nguồn Nối Dài ARGB';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '12 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Kích thước', val: 'Chiều dài 30cm (Bọc dù mềm cao cấp)' },
          { cat: 'Đèn LED', val: 'LED ARGB Silicon mềm dẻo 16.8 triệu màu' },
          { cat: 'Kết nối', val: 'Chuẩn 24-Pin Mainboard / 2x8-Pin VGA' },
          { cat: 'Tính năng nổi bật', val: 'Hiệu ứng ánh sáng dòng chảy Fluid Lighting đỉnh cao' }
        ];
      } else if (name.includes('Giá Đỡ') || name.includes('Holder')) {
        accessoryType = 'Giá Đỡ Card Màn Hình VGA Chống Xệ';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '12 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Kích thước', val: 'Tùy chỉnh chiều cao từ 72mm đến 128mm' },
          { cat: 'Đèn LED', val: 'AURA Sync ARGB 3-Pin' },
          { cat: 'Tính năng nổi bật', val: 'Đế hít nam châm từ tính siêu chắc chắn, chịu tải VGA nặng' }
        ];
      } else if (name.includes('Keo Tản Nhiệt')) {
        accessoryType = 'Keo Tản Nhiệt Hiệu Năng Cao';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '12 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Kích thước', val: 'Trọng lượng 2g kèm que quét chuyên dụng' },
          { cat: 'Tính năng nổi bật', val: 'Độ dẫn nhiệt cực cao 14.2 W/mK, không dẫn điện an toàn 100%' }
        ];
      } else if (name.includes('Hub') || name.includes('Controller')) {
        accessoryType = 'Bộ Hub Điều Khiển Quạt & LED ARGB';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '24 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Kết nối', val: 'Hỗ trợ 6 cổng Fan PWM 4-Pin & 6 cổng ARGB 3-Pin 5V' },
          { cat: 'Tính năng nổi bật', val: 'Cấp nguồn trực tiếp qua SATA Power, đồng bộ Mainboard hoặc điều khiển từ xa' }
        ];
      } else {
        accessoryType = 'Phụ kiện PC & Gaming Gear';
        specs = [
          { cat: 'Thương hiệu', val: brand },
          { cat: 'Bảo hành', val: '12 tháng' },
          { cat: 'Loại phụ kiện', val: accessoryType },
          { cat: 'Tính năng nổi bật', val: 'Chất liệu cao cấp, độ bền tối đa, hỗ trợ tối ưu hệ thống máy tính' }
        ];
      }

      await attachSpecs(p._id, specs);
    }
  }

  console.log(`\n🎉 HOÀN THÀNH TẤT CẢ 8 DANH MỤC!`);
  console.log(`- Tổng số liên kết thông số kỹ thuật mới được ghi vào Specifications: ${totalLinked}`);

  // Kiểm tra tổng kết 8 danh mục
  console.log('\n📊 THỐNG KÊ SAU KHI SEEDING:');
  const all8Slugs = ['pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'man-hinh', 'ban-phim', 'chuot-gaming', 'tai-nghe', 'extra'];
  for (const slug of all8Slugs) {
    const cat = await Category.findOne({ slug });
    if (!cat) continue;
    const prods = await Product.find({ cat_id: cat._id }).select('_id');
    const pids = prods.map(p => p._id);
    const specsCount = await Specification.countDocuments({ p_id: { $in: pids }, status: 'active', is_deleted: false });
    const distinctProductsWithSpecs = await Specification.distinct('p_id', { p_id: { $in: pids }, status: 'active', is_deleted: false });
    console.log(`  ✓ [${cat.name}]: ${distinctProductsWithSpecs.length}/${prods.length} sản phẩm có thông số (Tổng ${specsCount} specs trong DB)`);
  }

  await mongoose.disconnect();
  console.log('\n⚡ Đã ngắt kết nối MongoDB. Hoàn tất!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
