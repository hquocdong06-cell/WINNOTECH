/**
 * SEED MASTER SCRIPT — WINNOTech
 * Yêu cầu:
 * 1. Danh mục:
 *    - PC gaming, PC văn phòng, PC đồ họa
 *    - Các danh mục linh kiện PC theo trang Build PC: CPU, Mainboard, RAM, GPU, Storage/SSD, PSU, Cooling, Case, Màn hình, Bàn phím, Chuột, Tai nghe, Phụ kiện khác
 *    - Danh mục nào đã có rồi thì giữ nguyên, không tạo trùng lặp
 * 2. Mỗi danh mục có ít nhất 20 sản phẩm
 * 3. Mỗi sản phẩm có ÍT NHẤT 3 hình ảnh (trong bảng Image) + 1 hoặc nhiều biến thể (bảng ProductVariant + VariantAttribute + AttributeValue)
 * 4. Tạo ít nhất 30 bài viết (bảng Post + PostCategory) với status: "published"
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CategoryModel = require('./models/Category');
const BrandModel = require('./models/Brand');
const ProductModel = require('./models/Product');
const { ProductVariant: ProductVariantModel, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');
const { Image: ImageModel } = require('./models/BannerPaymentImage');
const { PostCategory: PostCategoryModel, Post: PostModel } = require('./models/Post');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/WINNOTech';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runMasterSeed() {
  console.log('🚀 Bắt đầu thực thi Master Seed Data cho WINNOTech...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB:', MONGO_URI);

  // ═════════════════════════════════════════════════════════════
  // 1. ĐỒNG BỘ THƯƠNG HIỆU (BRANDS)
  // ═════════════════════════════════════════════════════════════
  console.log('\n🏷️  1. Đồng bộ Thương hiệu (Brands)...');
  const brandList = [
    { name: 'AMD', slug: 'amd', logo: '/public/images/logos/amd.png' },
    { name: 'Intel', slug: 'intel', logo: '/public/images/logos/intel.png' },
    { name: 'NVIDIA', slug: 'nvidia', logo: '/public/images/logos/nvidia.png' },
    { name: 'ASUS', slug: 'asus', logo: '/public/images/logos/asus.png' },
    { name: 'MSI', slug: 'msi', logo: '/public/images/logos/msi.png' },
    { name: 'Gigabyte', slug: 'gigabyte', logo: '/public/images/logos/gigabyte.png' },
    { name: 'Corsair', slug: 'corsair', logo: '/public/images/logos/corsair.png' },
    { name: 'Kingston', slug: 'kingston', logo: '/public/images/logos/kingston.png' },
    { name: 'G.Skill', slug: 'gskill', logo: '/public/images/logos/gskill.png' },
    { name: 'Samsung', slug: 'samsung', logo: '/public/images/logos/samsung.png' },
    { name: 'Western Digital', slug: 'western-digital', logo: '/public/images/logos/wd.png' },
    { name: 'NZXT', slug: 'nzxt', logo: '/public/images/logos/nzxt.png' },
    { name: 'Cooler Master', slug: 'cooler-master', logo: '/public/images/logos/coolermaster.png' },
    { name: 'Logitech', slug: 'logitech', logo: '/public/images/logos/logitech.png' },
    { name: 'Razer', slug: 'razer', logo: '/public/images/logos/razer.png' },
    { name: 'Dell', slug: 'dell', logo: '/public/images/logos/dell.png' },
    { name: 'LG', slug: 'lg', logo: '/public/images/logos/lg.png' },
    { name: 'WINNOTech', slug: 'winnotech', logo: '/public/images/logos/logo.png' }
  ];

  const brandDocs = {};
  for (const b of brandList) {
    const doc = await BrandModel.findOneAndUpdate(
      { slug: b.slug },
      { $set: b },
      { upsert: true, returnDocument: 'after' }
    );
    brandDocs[b.slug] = doc;
  }
  console.log(`✅ Đã đồng bộ ${Object.keys(brandDocs).length} Thương hiệu`);

  // ═════════════════════════════════════════════════════════════
  // 2. ĐỒNG BỘ DANH MỤC (CATEGORIES)
  // ═════════════════════════════════════════════════════════════
  console.log('\n📁 2. Đồng bộ Danh mục sản phẩm (Categories)...');
  const requiredCategories = [
    // 3 Nhóm PC nguyên bộ theo yêu cầu
    { name: 'PC gaming', slug: 'pc-gaming', image: 'http://localhost:3000/public/images/anh_case/image_41.png' },
    { name: 'PC văn phòng', slug: 'pc-van-phong', image: 'http://localhost:3000/public/images/anh_case/image_40.png' },
    { name: 'PC đồ họa', slug: 'pc-do-hoa', image: 'http://localhost:3000/public/images/anh_case/image_42.png' },

    // Các danh mục linh kiện theo trang Build PC
    { name: 'CPU', slug: 'cpu', image: 'http://localhost:3000/public/images/anh_cpu_amd/image_1.png' },
    { name: 'Mainboard', slug: 'mainboard', image: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
    { name: 'RAM', slug: 'ram', image: 'http://localhost:3000/public/images/anh_ram_kingston/image_15.png' },
    { name: 'GPU', slug: 'gpu', image: 'http://localhost:3000/public/images/anh_vga_asus/image_6.png' },
    { name: 'SSD', slug: 'storage', image: 'http://localhost:3000/public/images/anh_o_cung/image_22.png' },
    { name: 'PSU', slug: 'psu', image: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
    { name: 'Cooling', slug: 'cooling', image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_32.png' },
    { name: 'Case', slug: 'case', image: 'http://localhost:3000/public/images/anh_vo_case/image_40.png' },
    { name: 'Màn hình máy tính', slug: 'man-hinh', image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_33.png' },
    { name: 'Bàn phím cơ', slug: 'ban-phim', image: 'http://localhost:3000/public/images/anh_ram_corsair/image_15.png' },
    { name: 'Chuột Gaming', slug: 'chuot-gaming', image: 'http://localhost:3000/public/images/anh_ram_kingston/image_16.png' },
    { name: 'Tai nghe Gaming', slug: 'tai-nghe', image: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' },
    { name: 'Phụ kiện khác', slug: 'extra', image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_34.png' },
  ];

  const categoryDocs = {};
  for (const c of requiredCategories) {
    let doc = await CategoryModel.findOne({ slug: c.slug });
    if (!doc) {
      doc = await CategoryModel.create({
        name: c.name,
        slug: c.slug,
        image: c.image,
        status: 'active'
      });
      console.log(`   ➕ Tạo mới danh mục: [${c.slug}] ${c.name}`);
    } else {
      // Đã có rồi thì giữ nguyên, đảm bảo status active
      if (doc.status !== 'active') {
        doc.status = 'active';
        await doc.save();
      }
      console.log(`   ✓ Đã có danh mục: [${c.slug}] ${doc.name}`);
    }
    categoryDocs[c.slug] = doc;
  }

  // ═════════════════════════════════════════════════════════════
  // 3. THUỘC TÍNH & GIÁ TRỊ THUỘC TÍNH (ATTRIBUTES & VALUES)
  // ═════════════════════════════════════════════════════════════
  console.log('\n⚙️  3. Đồng bộ Bảng Attributes & AttributeValues...');
  const getOrCreateAttr = async (name) => {
    let a = await Attribute.findOne({ name });
    if (!a) a = await Attribute.create({ name });
    return a;
  };
  const getOrCreateVal = async (attrId, val) => {
    let v = await AttributeValue.findOne({ value: val, id_attribute: attrId });
    if (!v) v = await AttributeValue.create({ value: val, id_attribute: attrId });
    return v;
  };

  const attrColor = await getOrCreateAttr('Màu sắc');
  const attrVersion = await getOrCreateAttr('Phiên bản');
  const attrCapacity = await getOrCreateAttr('Dung lượng');
  const attrSocket = await getOrCreateAttr('Socket CPU');
  const attrWattage = await getOrCreateAttr('Công suất');
  const attrWarranty = await getOrCreateAttr('Bảo hành');

  const valColorBlack = await getOrCreateVal(attrColor._id, 'Đen (Black)');
  const valColorWhite = await getOrCreateVal(attrColor._id, 'Trắng (White)');
  const valColorSilver = await getOrCreateVal(attrColor._id, 'Bạc (Silver)');
  const valVerStd = await getOrCreateVal(attrVersion._id, 'Tiêu chuẩn (Standard)');
  const valVerOC = await getOrCreateVal(attrVersion._id, 'Bản ép xung (OC Edition)');
  const valVerBox = await getOrCreateVal(attrVersion._id, 'Box Chính Hãng');
  const valVerTray = await getOrCreateVal(attrVersion._id, 'Tray');
  const valCap16 = await getOrCreateVal(attrCapacity._id, '16GB');
  const valCap32 = await getOrCreateVal(attrCapacity._id, '32GB');
  const valCap64 = await getOrCreateVal(attrCapacity._id, '64GB');
  const valCap512 = await getOrCreateVal(attrCapacity._id, '512GB');
  const valCap1TB = await getOrCreateVal(attrCapacity._id, '1TB NVMe');
  const valCap2TB = await getOrCreateVal(attrCapacity._id, '2TB NVMe');
  const valSocketAM5 = await getOrCreateVal(attrSocket._id, 'AM5');
  const valSocketLGA1700 = await getOrCreateVal(attrSocket._id, 'LGA1700');
  const valSocketLGA1851 = await getOrCreateVal(attrSocket._id, 'LGA1851');
  const valWatt650 = await getOrCreateVal(attrWattage._id, '650W 80+ Bronze');
  const valWatt750 = await getOrCreateVal(attrWattage._id, '750W 80+ Gold');
  const valWatt850 = await getOrCreateVal(attrWattage._id, '850W 80+ Gold Modular');
  const valWatt1000 = await getOrCreateVal(attrWattage._id, '1000W 80+ Platinum');
  const valWarranty24 = await getOrCreateVal(attrWarranty._id, '24 Tháng');
  const valWarranty36 = await getOrCreateVal(attrWarranty._id, '36 Tháng');
  const valWarranty60 = await getOrCreateVal(attrWarranty._id, '60 Tháng');

  // ═════════════════════════════════════════════════════════════
  // 4. ĐẢM BẢO TẤT CẢ SẢN PHẨM HIỆN CÓ CÓ ÍT NHẤT 3 ẢNH & BIẾN THỂ
  // ═════════════════════════════════════════════════════════════
  console.log('\n🔍 4. Kiểm tra & Bổ sung Hình ảnh + Biến thể cho sản phẩm hiện có...');
  const allExistingProducts = await ProductModel.find();
  console.log(`   Tổng sản phẩm hiện có trong DB: ${allExistingProducts.length}`);

  let updatedImagesCount = 0;
  let updatedVariantsCount = 0;

  for (const p of allExistingProducts) {
    // 1. Kiểm tra hình ảnh
    const imgs = await ImageModel.find({ p_id: p._id });
    const fallbackBase = p.thumnail || 'http://localhost:3000/public/images/anh_case/image_40.png';

    if (imgs.length === 0) {
      await ImageModel.insertMany([
        { p_id: p._id, url: fallbackBase, alt: `${p.name} - Ảnh chính diện`, is_main: true },
        { p_id: p._id, url: fallbackBase, alt: `${p.name} - Góc nghiêng chi tiết`, is_main: false },
        { p_id: p._id, url: fallbackBase, alt: `${p.name} - Mặt sau & Cổng kết nối`, is_main: false },
      ]);
      updatedImagesCount += 3;
    } else if (imgs.length === 1) {
      await ImageModel.insertMany([
        { p_id: p._id, url: imgs[0].url || fallbackBase, alt: `${p.name} - Góc nghiêng chi tiết`, is_main: false },
        { p_id: p._id, url: imgs[0].url || fallbackBase, alt: `${p.name} - Mặt sau & Cổng kết nối`, is_main: false },
      ]);
      updatedImagesCount += 2;
    } else if (imgs.length === 2) {
      await ImageModel.create({
        p_id: p._id,
        url: imgs[0].url || fallbackBase,
        alt: `${p.name} - Mặt sau & Cổng kết nối`,
        is_main: false
      });
      updatedImagesCount += 1;
    }

    // Đảm bảo có đúng 1 ảnh is_main = true
    const currentImgs = await ImageModel.find({ p_id: p._id });
    if (!currentImgs.some(img => img.is_main)) {
      currentImgs[0].is_main = true;
      await currentImgs[0].save();
    }

    // 2. Kiểm tra biến thể
    const variants = await ProductVariantModel.find({ p_id: p._id });
    if (variants.length === 0) {
      const basePrice = 5000000;
      const v1 = await ProductVariantModel.create({
        variant_name: 'Tiêu chuẩn (Standard)',
        price: basePrice,
        sale_price: p.sale > 0 ? Math.round(basePrice * (100 - p.sale) / 100) : 0,
        sku: `SKU-${slugify(p.name).toUpperCase().slice(0, 8)}-STD`,
        stock_quantity: 25,
        status: 'active',
        p_id: p._id
      });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valColorBlack._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valWarranty36._id });
      updatedVariantsCount += 1;
    } else {
      // Đảm bảo các variant đã có đều có liên kết VariantAttribute
      for (const v of variants) {
        const vaCount = await VariantAttribute.countDocuments({ id_variants: v._id });
        if (vaCount === 0) {
          await VariantAttribute.create({ id_variants: v._id, id_attribute_value: valColorBlack._id });
          await VariantAttribute.create({ id_variants: v._id, id_attribute_value: valWarranty36._id });
        }
      }
    }
  }
  console.log(`✅ Đã bổ sung ${updatedImagesCount} ảnh & kiểm tra toàn bộ biến thể cho sản phẩm hiện có!`);

  // ═════════════════════════════════════════════════════════════
  // 5. TẠO THÊM SẢN PHẨM CHO CÁC DANH MỤC CHƯA ĐẠT ÍT NHẤT 20 SẢN PHẨM
  // ═════════════════════════════════════════════════════════════
  console.log('\n📦 5. Kiểm tra & Tạo mới sản phẩm đảm bảo MỖI DANH MỤC có ít nhất 20 sản phẩm...');

  // 5.1 Định nghĩa cấu hình tạo sản phẩm cho các danh mục
  const newCategoryDefinitions = {
    // --- PC ĐỒ HỌA (PC Đồ họa / Workstation) ---
    'pc-do-hoa': Array.from({ length: 25 }, (_, i) => {
      const ranks = ['Studio Master', 'Render Beast', 'Architect Pro', 'Vision Creator', 'Workstation Extreme', 'DeepLearning AI'];
      const rank = ranks[i % ranks.length];
      const configs = [
        { cpu: 'Intel Core i7-14700K', vga: 'RTX 4070 Super 12GB', ram: '32GB DDR5 6000MHz', ssd: '1TB NVMe Gen4', psu: '750W 80+ Gold', price: 34500000, socket: 'LGA1700', ram_type: 'DDR5', gpu_tier: 4 },
        { cpu: 'AMD Ryzen 9 7900X', vga: 'RTX 4070 Ti Super 16GB', ram: '64GB DDR5 6000MHz', ssd: '2TB NVMe Gen4', psu: '850W 80+ Gold', price: 46900000, socket: 'AM5', ram_type: 'DDR5', gpu_tier: 5 },
        { cpu: 'Intel Core i9-14900K', vga: 'RTX 4080 Super 16GB', ram: '64GB DDR5 6400MHz', ssd: '2TB NVMe Gen4', psu: '1000W 80+ Platinum', price: 62000000, socket: 'LGA1700', ram_type: 'DDR5', gpu_tier: 5 },
        { cpu: 'AMD Ryzen 9 7950X', vga: 'NVIDIA RTX A4000 16GB', ram: '64GB DDR5 ECC', ssd: '2TB PCIe Gen5', psu: '850W 80+ Gold', price: 58500000, socket: 'AM5', ram_type: 'DDR5', gpu_tier: 5 },
        { cpu: 'Intel Core i5-14600K', vga: 'RTX 4060 Ti 16GB', ram: '32GB DDR5', ssd: '1TB NVMe', psu: '650W 80+ Bronze', price: 26500000, socket: 'LGA1700', ram_type: 'DDR5', gpu_tier: 3 },
        { cpu: 'AMD Ryzen 7 7700X', vga: 'RTX 4070 12GB Dual', ram: '32GB DDR5', ssd: '1TB NVMe', psu: '750W 80+ Gold', price: 31900000, socket: 'AM5', ram_type: 'DDR5', gpu_tier: 4 }
      ];
      const cfg = configs[i % configs.length];
      const name = `PC Đồ Họa Render 3D WINNOTech ${rank} V${i + 1} (${cfg.cpu} / ${cfg.vga} / RAM ${cfg.ram} / SSD ${cfg.ssd})`;
      const imgIdx = (i % 6) + 40;
      return {
        name,
        brand_slug: 'winnotech',
        basePrice: cfg.price + (i % 3) * 500000,
        short_desc: `${cfg.cpu}, ${cfg.vga}, RAM ${cfg.ram}, SSD ${cfg.ssd}, Nguồn ${cfg.psu}`,
        desc: `Cấu hình PC Đồ Họa và Dựng Phim chuyên nghiệp được thiết kế tối ưu cho 3Ds Max, Maya, SketchUp, Blender, Adobe Premiere, After Effects, AutoCAD. Khả năng preview thời gian thực mượt mà, render siêu tốc và hoạt động ổn định 24/7.`,
        socket: cfg.socket,
        ram_type: cfg.ram_type,
        form_factor: 'ATX',
        supported_ff: ['ATX', 'mATX', 'ITX'],
        wattage: parseInt(cfg.psu),
        gpu_tier: cfg.gpu_tier,
        images: [
          `http://localhost:3000/public/images/anh_case/image_${imgIdx}.png`,
          `http://localhost:3000/public/images/anh_case/image_${((imgIdx + 1) % 43) + 1}.png`,
          `http://localhost:3000/public/images/anh_case/image_${((imgIdx + 2) % 43) + 1}.png`
        ]
      };
    }),

    // --- COOLING (Tản nhiệt PC - cần bổ sung lên >= 20 SP) ---
    cooling: Array.from({ length: 25 }, (_, i) => {
      const coolTypes = [
        { name: 'Tản nhiệt nước AIO NZXT Kraken Elite 360 RGB Màn Hình LCD', brand: 'nzxt', price: 6890000, tdp: 350 },
        { name: 'Tản nhiệt nước AIO Corsair iCUE LINK H150i RGB 360mm', brand: 'corsair', price: 5490000, tdp: 320 },
        { name: 'Tản nhiệt nước AIO ASUS ROG Ryujin III 360 ARGB Anime Matrix', brand: 'asus', price: 8990000, tdp: 380 },
        { name: 'Tản nhiệt nước AIO MSI MAG CoreLiquid E360 White ARGB', brand: 'msi', price: 3490000, tdp: 280 },
        { name: 'Tản nhiệt khí CPU Cooler Master Hyper 622 Halo Black Dual Tower', brand: 'cooler-master', price: 1390000, tdp: 220 },
        { name: 'Tản nhiệt nước AIO Deepcool LT720 360mm High Performance', brand: 'cooler-master', price: 2990000, tdp: 300 },
        { name: 'Tản nhiệt khí Thermalright Peerless Assassin 120 SE ARGB', brand: 'cooler-master', price: 950000, tdp: 200 },
        { name: 'Tản nhiệt nước AIO NZXT Kraken 240 RGB Infinity Mirror', brand: 'nzxt', price: 3990000, tdp: 250 },
      ];
      const base = coolTypes[i % coolTypes.length];
      const name = `${base.name} - Version ${i + 1}`;
      const imgIdx = (i % 6) + 10;
      return {
        name,
        brand_slug: base.brand,
        basePrice: base.price + (i % 4) * 100000,
        short_desc: `Tản nhiệt hiệu năng cao TDP ${base.tdp}W, Hỗ trợ Socket LGA1700/AM5, Quạt ARGB siêu êm`,
        desc: `Hệ thống tản nhiệt cao cấp với bơm công suất mạnh mẽ, rad nhôm tản nhiệt dày và quạt vòng bi FDB chống rung, giúp CPU luôn duy trì nhiệt độ mát mẻ dưới 65 độ C ngay cả khi full tải nặng.`,
        tdp: base.tdp,
        images: [
          `http://localhost:3000/public/images/anh_tan_nhiet/image_${imgIdx}.png`,
          `http://localhost:3000/public/images/anh_tan_nhiet/image_${imgIdx + 1}.png`,
          `http://localhost:3000/public/images/anh_tan_nhiet/image_${imgIdx + 2}.png`
        ]
      };
    }),

    // --- PHỤ KIỆN KHÁC (Extra / Phụ kiện PC) ---
    extra: Array.from({ length: 22 }, (_, i) => {
      const extraItems = [
        { name: 'Bộ 3 Quạt Case Corsair iCUE AF120 RGB ELITE 120mm PWM', brand: 'corsair', price: 1450000, type: 'Quạt case ARGB' },
        { name: 'Dây Nguồn Nối Dài Bọc Dù Cao Cấp Lian Li Strimer Plus V2 24-Pin ARGB', brand: 'corsair', price: 1390000, type: 'Dây nguồn RGB' },
        { name: 'Giá Đỡ Card Màn Hình Chống Xệ ASUS ROG Herculx Graphics Card Holder ARGB', brand: 'asus', price: 990000, type: 'Giá đỡ VGA' },
        { name: 'Keo Tản Nhiệt Cao Cấp Thermal Grizzly Kryonaut Extreme 2g', brand: 'cooler-master', price: 420000, type: 'Keo tản nhiệt' },
        { name: 'Bộ Hub Điều Khiển Quạt & LED ARGB Razer Chroma Addressable RGB Controller', brand: 'razer', price: 1190000, type: 'Hub điều khiển' },
        { name: 'Giá Treo Tai Nghe Gaming Corsair ST100 RGB Premium Headset Stand 7.1', brand: 'corsair', price: 1650000, type: 'Giá treo tai nghe' },
        { name: 'Bàn Di Chuột Gaming Cỡ Lớn SteelSeries QcK Prism Cloth 3XL RGB', brand: 'logitech', price: 1290000, type: 'Lót chuột RGB' },
        { name: 'Dây Cáp Nối Dài PCIe 4.0 Riser Cable Cooler Master Universal 200mm', brand: 'cooler-master', price: 1150000, type: 'Cáp Riser dựng VGA' }
      ];
      const base = extraItems[i % extraItems.length];
      const name = `${base.name} Gen${i + 1}`;
      const imgIdx = (i % 5) + 30;
      return {
        name,
        brand_slug: base.brand,
        basePrice: base.price + (i % 3) * 50000,
        short_desc: `${base.type}, Chuẩn linh kiện cao cấp, Tương thích hoàn hảo mọi hệ thống PC`,
        desc: `Phụ kiện trang trí và nâng cấp hệ thống PC chuyên nghiệp, giúp góc máy tính của bạn trở nên gọn gàng, đẹp mắt và cá tính hơn bao giờ hết.`,
        images: [
          `http://localhost:3000/public/images/anh_tan_nhiet/image_${imgIdx}.png`,
          `http://localhost:3000/public/images/anh_nguon_may_tinh/image_${imgIdx}.png`,
          `http://localhost:3000/public/images/anh_ram_corsair/image_${(i % 5) + 14}.png`
        ]
      };
    })
  };

  // 5.2 Thực hiện tạo sản phẩm cho từng danh mục
  for (const [slug, pList] of Object.entries(newCategoryDefinitions)) {
    const catDoc = categoryDocs[slug];
    if (!catDoc) continue;

    const currentCount = await ProductModel.countDocuments({ cat_id: catDoc._id });
    console.log(`\n👉 Danh mục [${slug}] "${catDoc.name}": hiện có ${currentCount} sản phẩm.`);

    if (currentCount >= 20) {
      console.log(`   ✓ Đã có đủ ${currentCount} sản phẩm (>= 20). Không cần tạo thêm.`);
      continue;
    }

    const needed = Math.max(20 - currentCount, pList.length);
    console.log(`   ➕ Đang tạo thêm ${needed} sản phẩm để đạt chuẩn...`);

    for (let idx = 0; idx < needed; idx++) {
      const pDef = pList[idx % pList.length];
      const brandDoc = brandDocs[pDef.brand_slug] || brandDocs['winnotech'];
      const productSlug = `${slugify(pDef.name)}-${slug}-${idx + 1 + currentCount}`;

      await ProductModel.deleteOne({ slug: productSlug });

      const product = await ProductModel.create({
        name: pDef.name,
        slug: productSlug,
        thumnail: pDef.images[0],
        description: pDef.desc,
        short_desc: pDef.short_desc,
        status: 'active',
        sale: idx % 3 === 0 ? 10 : idx % 5 === 0 ? 15 : 0,
        cat_id: catDoc._id,
        brand_id: brandDoc._id,
        compatibility_meta: {
          socket: pDef.socket || null,
          ram_type: pDef.ram_type || null,
          form_factor: pDef.form_factor || null,
          supported_ff: pDef.supported_ff || [],
          tdp: pDef.tdp || null,
          wattage: pDef.wattage || null,
          gpu_tier: pDef.gpu_tier || null
        }
      });

      // Tạo 3 hình ảnh riêng biệt cho sản phẩm
      await ImageModel.insertMany([
        { p_id: product._id, url: pDef.images[0], alt: `${product.name} - Ảnh chính diện`, is_main: true },
        { p_id: product._id, url: pDef.images[1] || pDef.images[0], alt: `${product.name} - Góc nghiêng chi tiết`, is_main: false },
        { p_id: product._id, url: pDef.images[2] || pDef.images[0], alt: `${product.name} - Mặt sau & Cổng kết nối`, is_main: false }
      ]);

      // Biến thể 1: Bản Tiêu Chuẩn (Standard)
      const v1Price = pDef.basePrice;
      const v1 = await ProductVariantModel.create({
        variant_name: 'Bản Tiêu Chuẩn (Standard)',
        price: v1Price,
        sale_price: product.sale > 0 ? Math.round(v1Price * (100 - product.sale) / 100) : 0,
        sku: `SKU-${slug.toUpperCase().slice(0, 4)}-${1000 + idx + currentCount}`,
        stock_quantity: randInt(15, 60),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valColorBlack._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valVerStd._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valWarranty36._id });

      // Biến thể 2: Bản Cao Cấp (White / OC Edition)
      const v2Price = Math.round(pDef.basePrice * 1.08);
      const v2 = await ProductVariantModel.create({
        variant_name: 'Bản Cao Cấp (White / OC)',
        price: v2Price,
        sale_price: product.sale > 0 ? Math.round(v2Price * (100 - product.sale) / 100) : 0,
        sku: `SKU-${slug.toUpperCase().slice(0, 4)}-${2000 + idx + currentCount}`,
        stock_quantity: randInt(10, 40),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valColorWhite._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valVerOC._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valWarranty36._id });
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 6. TẠO & ĐỒNG BỘ BÀI VIẾT (POSTS & POST CATEGORIES) >= 30 BÀI
  // ═════════════════════════════════════════════════════════════
  console.log('\n📝 6. Đồng bộ Danh mục bài viết (PostCategory) & Bài viết (Post)...');

  const postCategoryList = [
    { name: 'Hướng Dẫn Build PC', slug: 'huong-dan-build-pc', image: 'http://localhost:3000/public/images/anh_case/image_40.png' },
    { name: 'Kiến Thức Phần Cứng', slug: 'kien-thuc-phan-cung', image: 'http://localhost:3000/public/images/anh_cpu_intel/image_10.png' },
    { name: 'Đánh Giá & Review', slug: 'danh-gia-san-pham', image: 'http://localhost:3000/public/images/anh_vga_asus/image_11.png' },
    { name: 'Tin Tức Công Nghệ', slug: 'tin-cong-nghe', image: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
    { name: 'Mẹo Hay & Thủ Thuật', slug: 'meo-hay-thu-thuat', image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_12.png' },
    { name: 'Tư Vấn Cấu Hình', slug: 'tu-van-cau-hinh', image: 'http://localhost:3000/public/images/anh_case/image_41.png' }
  ];

  const postCatDocs = {};
  for (const pc of postCategoryList) {
    const doc = await PostCategoryModel.findOneAndUpdate(
      { slug: pc.slug },
      { $set: { name: pc.name, image: pc.image, status: 'active' } },
      { upsert: true, returnDocument: 'after' }
    );
    postCatDocs[pc.slug] = doc;
  }
  console.log(`✅ Đã đồng bộ ${Object.keys(postCatDocs).length} Danh mục bài viết`);

  // Danh sách 35 bài viết chất lượng cao, chi tiết
  const articleList = [
    // 1-6: Hướng Dẫn Build PC
    {
      tittle: 'Hướng dẫn tự build PC gaming từ A đến Z cho người mới bắt đầu năm 2026',
      slug: 'huong-dan-tu-build-pc-gaming-tu-a-den-z-2026',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_40.png',
      image: 'http://localhost:3000/public/images/anh_case/image_41.png',
      content: `<h2>1. Chuẩn bị trước khi lắp ráp PC</h2><p>Tự tay lắp ráp một dàn PC gaming không chỉ giúp bạn tiết kiệm chi phí mà còn mang lại cảm giác thỏa mãn tuyệt đối khi ngắm nhìn dàn máy do chính mình dựng nên. Trước khi bắt đầu, bạn cần chuẩn bị đầy đủ dụng cụ: tua vít 4 cạnh có từ tính, dây rút giữ gọn dây cáp, keo tản nhiệt và một bề mặt làm việc bằng phẳng, sạch sẽ, không tĩnh điện.</p><h2>2. Trình tự các bước lắp ráp chuẩn kỹ thuật</h2><ul><li><strong>Bước 1: Lắp CPU vào Socket Mainboard:</strong> Mở ngàm giữ socket, căn chỉnh tam giác vàng trên CPU trùng với dấu tam giác trên socket, đặt nhẹ nhàng và khóa ngàm.</li><li><strong>Bước 2: Cắm RAM:</strong> Mở chốt 2 đầu khe RAM, cắm thanh RAM đúng chiều rãnh khuyết vào khe 2 và 4 (chế độ Dual Channel) và ấn dứt khoát đến khi nghe tiếng tách.</li><li><strong>Bước 3: Lắp SSD NVMe M.2:</strong> Gắn SSD góc nghiêng 30 độ vào khe M.2 đầu tiên (nối trực tiếp với CPU), ấn xuống và siết ốc hoặc khóa lẫy xoay.</li><li><strong>Bước 4: Bắt Mainboard vào Case:</strong> Lắp tấm I/O Shield phía sau, căn chỉnh mainboard vào các chân ốc đồng (standoff) và siết ốc cố định.</li><li><strong>Bước 5: Lắp Nguồn (PSU) và đi dây:</strong> Cắm các đầu nguồn 24-pin Mainboard, 8-pin CPU, và dây Front Panel case.</li><li><strong>Bước 6: Cắm Card đồ họa (VGA):</strong> Tháo nẹp khe PCIe sau case, cắm VGA vào khe PCIe x16 trên cùng, khóa ốc và cắm nguồn phụ PCIe.</li></ul><h2>3. Kiểm tra và cài đặt hệ điều hành</h2><p>Cắm màn hình vào cổng xuất hình trên Card đồ họa (tránh cắm nhầm vào Mainboard), bật nguồn máy, nhấn phím Del hoặc F2 để vào BIOS kiểm tra dung lượng RAM, nhiệt độ CPU và bật cấu hình XMP/EXPO để RAM chạy đúng xung nhịp danh định.</p>`
    },
    {
      tittle: 'Cách tính công suất nguồn PSU chuẩn xác cho dàn PC gaming & đồ họa',
      slug: 'cach-tinh-cong-suat-nguon-psu-chuan-xac',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_15.png',
      image: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_16.png',
      content: `<h2>Tại sao việc chọn nguồn đúng công suất lại tối quan trọng?</h2><p>Bộ nguồn (PSU) được ví như trái tim của toàn bộ dàn máy tính, cung cấp dòng điện 12V, 5V và 3.3V ổn định cho toàn bộ linh kiện. Một bộ nguồn thiếu công suất hoặc kém chất lượng có thể dẫn đến hiện tượng sập nguồn đột ngột khi tải nặng, tụt xung, hoặc nghiêm trọng hơn là gây cháy nổ linh kiện đắt tiền.</p><h2>Công thức tính toán công suất nguồn khuyên dùng</h2><p><strong>Công suất PSU tối thiểu = (TDP CPU + TDP GPU + 150W cho Main/RAM/Quạt) x 1.3 (Dải an toàn & hiệu suất tối ưu 50-70% tải)</strong></p><ul><li><strong>Dàn máy văn phòng (i3/i5 không card rời):</strong> Nguồn từ 450W - 550W chuẩn 80 Plus Bronze.</li><li><strong>PC Gaming tầm trung (i5/Ryzen 5 + RTX 4060 / 4060 Ti):</strong> Nguồn từ 650W chuẩn 80 Plus Bronze hoặc Gold.</li><li><strong>PC Gaming cao cấp (i7/Ryzen 7 + RTX 4070 Ti Super / 4080 Super):</strong> Nguồn từ 750W - 850W chuẩn ATX 3.0 PCIe 5.0 12VHPWR.</li><li><strong>Workstation / Flagship (i9/Ryzen 9 + RTX 4090):</strong> Nguồn từ 1000W - 1200W chuẩn 80 Plus Gold/Platinum.</li></ul>`
    },
    {
      tittle: 'Lắp đặt tản nhiệt nước AIO: Top 5 sai lầm tai hại khiến CPU nóng ran',
      slug: 'lap-dat-tan-nhiet-nuoc-aio-top-5-sai-lam-tai-hai',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_tan_nhiet/image_10.png',
      image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_11.png',
      content: `<h2>1. Quên bóc miếng nilon dán bảo vệ mặt đồng tản nhiệt</h2><p>Đây là sai lầm kinh điển mà ngay cả những thợ build PC giàu kinh nghiệm đôi khi vẫn mắc phải. Lớp nilon mỏng cách nhiệt hoàn toàn giữa mặt đế đồng và nắp kim loại CPU (IHS), khiến nhiệt độ CPU tăng vọt lên 90-100 độ C ngay khi vừa bật máy.</p><h2>2. Vị trí đặt két nước (Radiator) sai làm tạo bọt khí trong bơm</h2><p>Quy tắc vàng khi lắp tản AIO: <strong>Bơm (Block nước) KHÔNG BAO GIỜ được là điểm cao nhất của vòng tuần hoàn.</strong> Vị trí tối ưu nhất là gắn két nước lên nóc case (Top-mounted) thổi gió ra ngoài. Nếu gắn mặt trước, phải đảm bảo đầu ống nối két nước nằm cao hơn block CPU.</p><h2>3. Cắm sai chân cắm quạt và bơm trên Mainboard</h2><p>Đầu dây bơm cần cắm vào chân <code>AIO_PUMP</code> hoặc <code>W_PUMP</code> và cài đặt tốc độ 100% Full Speed liên tục trong BIOS để đảm bảo dòng nước đối lưu liên tục.</p>`
    },
    {
      tittle: 'Tối ưu luồng gió trong vỏ case PC: Áp suất dương hay Áp suất âm tốt hơn?',
      slug: 'toi-uu-luong-gio-trong-vo-case-pc-ap-suat-khi',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_12.png',
      image: 'http://localhost:3000/public/images/anh_case/image_13.png',
      content: `<h2>Hiểu rõ nguyên lý lưu thông không khí trong thùng máy</h2><p>Nhiệt độ của các linh kiện như CPU, GPU và dàn VRM phụ thuộc trực tiếp vào lưu lượng gió mát được nạp vào và khí nóng được đẩy ra ngoài vỏ case.</p><h2>So sánh Áp suất Dương và Áp suất Âm</h2><ul><li><strong>Áp suất Dương (Positive Pressure):</strong> Lưu lượng quạt hút vào (Intake) lớn hơn quạt thổi ra (Exhaust). Ưu điểm vượt trội là không khí dư thừa sẽ thoát qua các khe hở của case, ngăn chặn bụi bẩn lọt vào qua các khe không có lưới lọc bụi.</li><li><strong>Áp suất Âm (Negative Pressure):</strong> Lưu lượng quạt thổi ra lớn hơn quạt hút vào. Khí nóng thoát nhanh nhưng case sẽ hút bụi liên tục qua mọi khe hở.</li></ul><p><strong>Lời khuyên từ WINNOTech:</strong> Hãy thiết lập cấu hình <em>Áp suất dương nhẹ</em> với 3 quạt hút mặt trước có lưới lọc bụi, 1 quạt thổi sau và 2 quạt thổi nóc để đạt nhiệt độ mát mẻ và giảm thiểu tối đa bụi bẩn.</p>`
    },
    {
      tittle: 'Bí quyết đi dây cáp (Cable Management) gọn đẹp như chuyên gia',
      slug: 'bi-quyet-di-day-cap-cable-management-gon-dep',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_11.png',
      image: 'http://localhost:3000/public/images/anh_case/image_12.png',
      content: `<h2>Nghệ thuật giấu dây cáp máy tính</h2><p>Đi dây cáp gọn gàng không chỉ nâng tầm tính thẩm mỹ của thùng máy kính cường lực mà còn giúp luồng không khí lưu thông thông thoáng, không bị cản trở.</p><h3>Các bước thực hiện:</h3><ol><li>Nhóm các bó dây có cùng hướng đi (dây nguồn 24-pin, dây CPU 8-pin, dây Front Panel USB/Audio).</li><li>Sử dụng dây thít nhựa hoặc dây dán velcro để bó chặt dây vào các rãnh đi dây chuyên dụng ở mặt sau case.</li><li>Giấu phần dây thừa vào khoang chứa nguồn bên dưới nắp che PSU Shroud.</li><li>Sử dụng dây nguồn bọc dù mở rộng hoặc dây phát sáng ARGB để tạo điểm nhấn nổi bật cho mặt trước.</li></ol>`
    },
    {
      tittle: 'Hướng dẫn cài đặt BIOS, bật XMP/EXPO và tối ưu Resizable BAR',
      slug: 'huong-dan-cai-dat-bios-bat-xmp-expo-resizable-bar',
      cat_slug: 'huong-dan-build-pc',
      thumnail: 'http://localhost:3000/public/images/anh_mainboard_asus/image_12.png',
      image: 'http://localhost:3000/public/images/anh_mainboard_asus/image_13.png',
      content: `<h2>Bật Resizable BAR và XMP để mở khóa 100% hiệu năng PC</h2><p>Rất nhiều người dùng mua RAM bus 6000MHz nhưng khi lắp vào máy chỉ chạy ở mức mặc định 4800MHz do chưa kích hoạt cấu hình ép xung sẵn có trong BIOS.</p><h3>Cách thiết lập từng bước:</h3><ul><li>Vào BIOS bằng phím <code>Del</code> lúc khởi động.</li><li>Tìm mục <strong>Extreme Memory Profile (XMP)</strong> trên Mainboard Intel hoặc <strong>EXPO / D.O.C.P</strong> trên Mainboard AMD và chọn Profile 1.</li><li>Kích hoạt tính năng <strong>Above 4G Decoding</strong> và <strong>Re-Size BAR Support</strong> để CPU có thể truy cập toàn bộ bộ nhớ VRAM của Card đồ họa cùng một lúc, tăng thêm 5 - 15% FPS trong các tựa game nặng.</li><li>Lưu lại bằng phím <code>F10</code> và khởi động lại vào Windows.</li></ul>`
    },

    // 7-12: Kiến Thức Phần Cứng
    {
      tittle: 'So sánh chi tiết chuẩn RAM DDR4 và DDR5: Đã đến lúc nâng cấp?',
      slug: 'so-sanh-chi-tiet-chuan-ram-ddr4-va-ddr5',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_ram_kingston/image_15.png',
      image: 'http://localhost:3000/public/images/anh_ram_corsair/image_15.png',
      content: `<h2>1. Băng thông và tốc độ truyền dữ liệu</h2><p>RAM DDR5 bắt đầu ở mức xung nhịp 4800MHz và phổ biến ở 6000MHz - 7200MHz, mang lại băng thông cao gấp gần 2 lần so với chuẩn DDR4 (thường dừng lại ở 3200MHz - 3600MHz). Điều này đặc biệt có lợi cho các tác vụ nén/giải nén file, render 3D, dựng video 4K/8K và chơi game trên độ phân giải cao.</p><h2>2. Kiến trúc kênh đôi trên từng thanh RAM</h2><p>Mỗi thanh RAM DDR5 được chia làm hai sub-channel 32-bit độc lập, giúp tăng cường hiệu quả giao tiếp với vi xử lý. Đồng thời, chip quản lý nguồn PMIC (Power Management IC) được tích hợp trực tiếp lên thanh RAM giúp kiểm soát điện áp chuẩn xác và ổn định hơn.</p><h2>3. Đánh giá về mặt chi phí và hiệu quả</h2><p>Vào năm 2026, giá thành RAM DDR5 đã tiệm cận rất sát với DDR4. Nếu bạn xây dựng dàn máy mới từ socket Intel LGA1700, LGA1851 hoặc AMD AM5, DDR5 là sự lựa chọn bắt buộc và tối ưu cho tương lai dài hạn.</p>`
    },
    {
      tittle: 'Chipset Mainboard B650, X670 và B760, Z790: Bạn cần loại nào?',
      slug: 'chipset-mainboard-b650-x670-b760-z790-chon-loai-nao',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png',
      image: 'http://localhost:3000/public/images/anh_mainboard_gigabyte/image_11.png',
      content: `<h2>Phân biệt các dòng chipset Bo mạch chủ</h2><p>Mainboard đóng vai trò là xương sống kết nối tất cả các linh kiện máy tính. Việc chọn đúng dòng chipset sẽ giúp bạn vừa tiết kiệm ngân sách vừa phát huy tối đa sức mạnh của CPU.</p><ul><li><strong>Intel B760 vs Z790:</strong> Dòng B760 phù hợp cho các CPU Non-K (như i5-13400F, i5-14400F, i7-14700F), hỗ trợ ép xung RAM nhưng khóa ép xung CPU. Dòng Z790 trang bị dàn phase nguồn VRM khủng từ 16-24 phase, hỗ trợ ép xung tối đa cho các chip K/KF như i7-14700K, i9-14900K.</li><li><strong>AMD B650 vs X670 / X870:</strong> Mainboard B650 là sự lựa chọn quốc dân cho 95% game thủ dùng Ryzen 5 7600 hay Ryzen 7 7800X3D. Dòng X670/X870 dành cho người dùng cần nhiều khe PCIe 5.0 M.2 và cổng kết nối USB4 siêu tốc.</li></ul>`
    },
    {
      tittle: 'Tìm hiểu về chuẩn PCIe 5.0 và khe cắm SSD NVMe Gen 5 siêu tốc',
      slug: 'tim-hieu-ve-chuan-pcie-5-0-va-ssd-nvme-gen5',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_o_cung/image_10.png',
      image: 'http://localhost:3000/public/images/anh_o_cung/image_12.png',
      content: `<h2>Bước nhảy vọt về tốc độ đọc ghi dữ liệu</h2><p>Chuẩn PCIe Gen 5.0 cung cấp băng thông lên tới 32 GT/s trên mỗi lane, cho phép các ổ cứng SSD NVMe Gen 5 đạt tốc độ đọc tuần tự kinh ngạc lên đến 14.000 MB/s - gấp đôi chuẩn PCIe Gen 4 (7.400 MB/s).</p><h3>Yêu cầu tản nhiệt bắt buộc</h3><p>Do hoạt động ở tần số và tốc độ cực cao, các bộ điều khiển Controller trên SSD Gen 5 tỏa ra lượng nhiệt rất lớn. Người dùng bắt buộc phải trang bị tản nhiệt nhôm dày có ống đồng heatpipe hoặc quạt tản nhiệt chủ động để tránh hiện tượng quá nhiệt giảm tốc độ (Thermal Throttling).</p>`
    },
    {
      tittle: 'Kiến trúc CPU lai Intel: P-Core (Performance) và E-Core (Efficient) hoạt động ra sao?',
      slug: 'kien-truc-cpu-lai-intel-p-core-va-e-core',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_cpu_intel/image_12.png',
      image: 'http://localhost:3000/public/images/anh_cpu_intel/image_13.png',
      content: `<h2>Cuộc cách mạng kiến trúc Hybrid của Intel</h2><p>Kể từ thế hệ thứ 12 Alder Lake trở đi, Intel đã áp dụng mô hình kiến trúc big.LITTLE tương tự như trên chip di động vào vi xử lý máy tính để bàn x86.</p><ul><li><strong>P-Core (Nhân hiệu năng cao):</strong> Nhân có xung nhịp cao, IPC lớn, hỗ trợ siêu phân luồng (Hyper-Threading), chịu trách nhiệm xử lý các tác vụ nặng đơn luồng như chơi game, dựng hình 3D.</li><li><strong>E-Core (Nhân tiết kiệm điện):</strong> Nhân nhỏ gọn hơn, không có siêu phân luồng nhưng mật độ cao, chuyên gánh các tác vụ chạy nền (Background Tasks) như Discord, OBS Stream, trình duyệt Chrome, quét virus.</li><li><strong>Intel Thread Director:</strong> Bộ điều phối phần cứng phối hợp với Windows 11 để phân luồng công việc tới đúng loại nhân phù hợp nhất trong mili giây.</li></ul>`
    },
    {
      tittle: '3D V-Cache của AMD: Vũ khí bí mật thống trị làng game eSports và AAA',
      slug: '3d-v-cache-amd-vu-khi-bi-mat-thong-tri-lang-game',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_cpu_amd/image_10.png',
      image: 'http://localhost:3000/public/images/anh_cpu_amd/image_12.png',
      content: `<h2>Tại sao dung lượng bộ nhớ đệm L3 lại tạo nên sự khác biệt khổng lồ trong game?</h2><p>Trong các tựa game thế giới mở rộng lớn, CPU phải liên tục tính toán vị trí, tương tác vật lý và hướng di chuyển của hàng trăm nhân vật NPC. Nếu dữ liệu không có sẵn trong bộ nhớ đệm L3, CPU sẽ phải chờ hàng trăm chu kỳ xung nhịp để lấy dữ liệu từ thanh RAM.</p><p>Công nghệ <strong>3D V-Cache</strong> của AMD xếp chồng một die SRAM 64MB trực tiếp lên trên cụm nhân CCD, nâng tổng dung lượng L3 Cache của chip Ryzen 7 7800X3D lên con số khổng lồ <strong>96MB</strong>. Nhờ đó, tỉ lệ Cache Hit đạt gần như tuyệt đối, giúp chỉ số FPS tối thiểu (1% Low FPS) cực kỳ ổn định, triệt tiêu hoàn toàn hiện tượng giật cục (micro-stutter).</p>`
    },
    {
      tittle: 'Card đồ họa GDDR6 vs GDDR6X: Tốc độ và băng thông ảnh hưởng thế nào đến 4K Gaming?',
      slug: 'card-do-hoa-gddr6-vs-gddr6x-bang-thong-4k-gaming',
      cat_slug: 'kien-thuc-phan-cung',
      thumnail: 'http://localhost:3000/public/images/anh_vga_msi/image_10.png',
      image: 'http://localhost:3000/public/images/anh_vga_asus/image_12.png',
      content: `<h2>Sự khác biệt kỹ thuật giữa GDDR6 và GDDR6X</h2><p>Bộ nhớ GDDR6X độc quyền được hợp tác phát triển giữa NVIDIA và Micron sử dụng công nghệ mã hóa tín hiệu điều chế biên độ xung 4 mức (PAM4), cho phép truyền 2 bit dữ liệu trong một chu kỳ xung nhịp, đạt tốc độ lên tới 23 Gbps so với 18 Gbps của chuẩn GDDR6 thông thường.</p><p>Khi chơi game ở độ phân giải 4K với các gói texture đồ họa siêu nét độ phân giải cao, băng thông bộ nhớ lên tới gần 1 TB/s của GDDR6X giúp loại bỏ hoàn toàn hiện tượng nghẽn cổ chai bộ nhớ đồ họa.</p>`
    },

    // 13-18: Đánh Giá Linh Kiện & Sản Phẩm
    {
      tittle: 'Đánh giá chi tiết AMD Ryzen 7 7800X3D: Vua gaming không đối thủ',
      slug: 'danh-gia-chi-tiet-amd-ryzen-7-7800x3d-vua-gaming',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_cpu_amd/image_1.png',
      image: 'http://localhost:3000/public/images/anh_cpu_amd/image_10.png',
      content: `<h2>1. Thông số kỹ thuật ấn tượng</h2><p>Ryzen 7 7800X3D sở hữu 8 nhân 16 luồng sản xuất trên tiến trình TSMC 5nm tiên tiến, xung nhịp Boost tối đa 5.0GHz cùng dung lượng bộ nhớ đệm kỷ lục 96MB L3 Cache trên nền tảng socket AM5 hiện đại.</p><h2>2. Thử nghiệm hiệu năng thực tế (Benchmarks)</h2><p>Trong các bài test trên độ phân giải Full HD và 2K với các tựa game như CS2, Valorant, Cyberpunk 2077 và Shadow of the Tomb Raider, 7800X3D vượt trội hơn 15-20% so với Core i9-14900K nhưng chỉ tiêu thụ mức điện năng kinh ngạc vỏn vẹn 65W - 80W.</p><h2>3. Tổng kết</h2><p>Đây là mẫu CPU gaming hoàn hảo nhất dành cho game thủ muốn xây dựng một cấu hình PC đỉnh cao mát mẻ, tiết kiệm điện và gắn bó dài lâu.</p>`
    },
    {
      tittle: 'Review ASUS ROG Strix GeForce RTX 4070 Ti Super 16GB: Đỉnh cao thiết kế và nhiệt độ',
      slug: 'review-asus-rog-strix-geforce-rtx-4070-ti-super',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_vga_asus/image_6.png',
      image: 'http://localhost:3000/public/images/anh_vga_asus/image_13.png',
      content: `<h2>1. Thiết kế hầm hố đậm chất ROG Strix</h2><p>Card màn hình sở hữu khung kim loại đúc liền khối nguyên khối die-cast, dải đèn LED RGB Aura Sync chuyển sắc bắt mắt ở phần đuôi card và kích thước đồ sộ 3.15 khe cắm PCIe.</p><h2>2. Khả năng làm mát vô địch</h2><p>Nhờ trang bị buồng hơi Vapor Chamber mạ niken kết hợp cùng 3 quạt làm mát công nghệ Axial-tech với cánh quạt liên kết và vòng bi kép, nhiệt độ card khi stress test FurMark 4K không bao giờ vượt quá 62 độ C với độ ồn gần như tĩnh lặng.</p>`
    },
    {
      tittle: 'Đánh giá Mainboard MSI MAG B650 Tomahawk WiFi: Sự lựa chọn hoàn hảo phân khúc tầm trung',
      slug: 'danh-gia-mainboard-msi-mag-b650-tomahawk-wifi',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png',
      image: 'http://localhost:3000/public/images/anh_mainboard_msi/image_11.png',
      content: `<h2>Bo mạch chủ quốc dân cho nền tảng AMD AM5</h2><p>MSI MAG B650 Tomahawk WiFi sở hữu dàn VRM chất lượng cao 14+2+1 Phase nguồn 80A Smart Power Stage, sẵn sàng cân ngọt ngào các chip đầu bảng như Ryzen 9 7950X hay 7900X mà không hề bị quá nhiệt dàn tản mosfet.</p><h3>Các trang bị nổi bật:</h3><ul><li>Hỗ trợ RAM DDR5 ép xung lên đến 7600+ MHz (OC).</li><li>3 khe cắm SSD NVMe M.2 bọc tản Shield Frozr siêu dày.</li><li>Tích hợp sẵn Wi-Fi 6E và cổng mạng LAN Realtek 2.5Gbps siêu tốc.</li><li>Cổng Audio Audio Boost 5 với chip Realtek ALC4080 cao cấp.</li></ul>`
    },
    {
      tittle: 'Đánh giá Samsung 990 Pro NVMe SSD 2TB: Đỉnh cao tốc độ PCIe Gen 4',
      slug: 'danh-gia-samsung-990-pro-nvme-ssd-2tb',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_o_cung/image_22.png',
      image: 'http://localhost:3000/public/images/anh_o_cung/image_14.png',
      content: `<h2>Ổ cứng SSD đứng đầu thế giới về độ bền và tốc độ</h2><p>Trang bị chip điều khiển Pascal Controller trên tiến trình 8nm cùng bộ nhớ V-NAND thế hệ thứ 7 của Samsung, 990 Pro đạt tốc độ đọc 7.450 MB/s và ghi 6.900 MB/s, tiệm cận giới hạn vật lý tối đa của giao tiếp PCIe 4.0 x4.</p><p>Độ bền ghi đạt 1.200 TBW cho bản 2TB cùng chế độ bảo hành 5 năm chính hãng giúp người dùng hoàn toàn an tâm lưu trữ dữ liệu công việc quan trọng.</p>`
    },
    {
      tittle: 'Đánh giá Nguồn Corsair RM850e 850W 80 Plus Gold ATX 3.0',
      slug: 'danh-gia-nguon-corsair-rm850e-850w-gold-atx3',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png',
      image: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_13.png',
      content: `<h2>Nguồn máy tính hiện đại đạt chuẩn ATX 3.0</h2><p>Corsair RM850e trang bị sẵn cáp nguồn 12VHPWR cấp điện trực tiếp lên đến 450W cho dòng card đồ họa RTX 40 series mà không cần qua đầu chuyển cồng kềnh. Sử dụng toàn bộ tụ điện công nghiệp chuẩn 105 độ C và quạt làm mát 120mm có chế độ Zero RPM im lặng khi tải nhẹ.</p>`
    },
    {
      tittle: 'Đánh giá Bàn phím cơ Corsair K70 RGB Pro: Biểu tượng gaming bất tử',
      slug: 'danh-gia-ban-phim-co-corsair-k70-rgb-pro',
      cat_slug: 'danh-gia-san-pham',
      thumnail: 'http://localhost:3000/public/images/anh_ram_corsair/image_15.png',
      image: 'http://localhost:3000/public/images/anh_ram_corsair/image_14.png',
      content: `<h2>Thiết kế khung nhôm phay xước cao cấp</h2><p>Corsair K70 RGB Pro tích hợp công nghệ xử lý siêu tốc Corsair AXON mang lại tần số quét phím polling rate lên tới 8.000Hz (nhanh gấp 8 lần bàn phím tiêu chuẩn), switch cơ học Cherry MX độ bền 100 triệu lần nhấn và bộ keycap PBT Double-shot không bao giờ bị bóng mờ chữ.</p>`
    },

    // 19-24: Tin Công Nghệ
    {
      tittle: 'NVIDIA hé lộ kiến trúc GPU Blackwell thế hệ mới với hiệu năng AI đột phá',
      slug: 'nvidia-he-lo-kien-truc-gpu-blackwell-the-he-moi',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_vga_gigabyte/image_1.png',
      image: 'http://localhost:3000/public/images/anh_vga_msi/image_11.png',
      content: `<h2>Kỷ nguyên mới của xử lý trí tuệ nhân tạo và đồ họa</h2><p>Kiến trúc GPU Blackwell mới của NVIDIA mang lại khả năng xử lý các mô hình ngôn ngữ lớn (LLM) và thuật toán dò tia thời gian thực (Path Tracing) với hiệu suất vượt trội gấp 4 lần so với kiến trúc Ada Lovelace tiền nhiệm, hứa hẹn sẽ định hình lại trải nghiệm chơi game siêu thực.</p>`
    },
    {
      tittle: 'Intel chính thức ra mắt dòng vi xử lý Core Ultra cho máy tính để bàn socket LGA1851',
      slug: 'intel-chinh-thuc-ra-mat-core-ultra-desktop-lga1851',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_cpu_intel/image_5.png',
      image: 'http://localhost:3000/public/images/anh_cpu_intel/image_10.png',
      content: `<h2>Tích hợp nhân xử lý trí tuệ nhân tạo NPU chuyên dụng</h2><p>Dòng vi xử lý mới chuyển sang nền tảng socket LGA1851 với công nghệ đóng gói 3D Foveros tiên tiến, loại bỏ hoàn toàn hiện tượng quá nhiệt và mang lại hiệu quả sử dụng năng lượng vượt trội trên từng watt điện năng tiêu thụ.</p>`
    },
    {
      tittle: 'Chuẩn Wi-Fi 7 chính thức phổ cập trên các dòng bo mạch chủ cao cấp',
      slug: 'chuan-wi-fi-7-chinh-thuc-pho-cap-tren-mainboard',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png',
      image: 'http://localhost:3000/public/images/anh_mainboard_gigabyte/image_12.png',
      content: `<h2>Băng thông không dây lên tới 46 Gbps với độ trễ siêu thấp</h2><p>Wi-Fi 7 sử dụng băng tần 320 MHz trên dải tần 6GHz cùng công nghệ Multi-Link Operation (MLO) cho phép PC kết nối đồng thời nhiều băng tần, mang lại độ trễ tương đương với cáp mạng LAN có dây truyền thống.</p>`
    },
    {
      tittle: 'Màn hình OLED 480Hz thế hệ thứ 3: Tiêu chuẩn vàng cho game thủ eSports chuyên nghiệp',
      slug: 'man-hinh-oled-480hz-the-he-thu-3-chuan-esports',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_tan_nhiet/image_33.png',
      image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_32.png',
      content: `<h2>Thời gian phản hồi 0.03ms kết hợp tần số quét siêu khủng</h2><p>Tấm nền QD-OLED và WOLED mới đã khắc phục hoàn toàn hiện tượng burn-in và nâng cao độ sáng tối đa lên tới 1300 nits, mang lại độ tương phản vô cực và chuyển động siêu mượt không bóng mờ trong các game bắn súng FPS.</p>`
    },
    {
      tittle: 'Công nghệ DirectStorage 1.2: Xóa bỏ hoàn toàn màn hình chờ tải game (Loading Screen)',
      slug: 'cong-nghe-directstorage-1-2-xoa-bo-man-hinh-cho-game',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_o_cung/image_14.png',
      image: 'http://localhost:3000/public/images/anh_o_cung/image_22.png',
      content: `<h2>Giải nén trực tiếp dữ liệu game bằng GPU</h2><p>Nhờ chuyển toàn bộ quá trình giải nén texture từ CPU sang nhân CUDA của GPU, thời gian load các tựa game dung lượng hơn 150GB giờ đây được rút ngắn chỉ còn dưới 1.5 giây.</p>`
    },
    {
      tittle: 'Chuẩn nguồn ATX 3.1 và đầu nối nguồn 12V-2x6: An toàn tuyệt đối cho card đồ họa công suất lớn',
      slug: 'chuan-nguon-atx-3-1-dau-noi-12v-2x6-an-toan-tuyet-doi',
      cat_slug: 'tin-cong-nghe',
      thumnail: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_16.png',
      image: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png',
      content: `<h2>Khắc phục triệt để vấn đề tiếp xúc chân cắm</h2><p>Đầu nối 12V-2x6 mới rút ngắn các chân cảm biến tín hiệu (sense pin), đảm bảo nguồn điện chỉ được kích hoạt khi đầu cắm đã được gài chặt hoàn toàn vào card đồ họa.</p>`
    },

    // 25-30: Mẹo Hay & Thủ Thuật
    {
      tittle: 'Cách hạ nhiệt CPU (Undervolt) giúp giảm 10-15 độ C mà không giảm xung nhịp',
      slug: 'cach-ha-nhiet-cpu-undervolt-giam-15-do-c',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_tan_nhiet/image_12.png',
      image: 'http://localhost:3000/public/images/anh_cpu_intel/image_13.png',
      content: `<h2>Bí quyết ép điện áp thông minh (Undervolting)</h2><p>Các nhà sản xuất CPU thường đặt mức điện áp mặc định cao hơn mức cần thiết để đảm bảo độ tương thích cho mọi lô chip bán ra. Bằng cách hạ bớt điện áp offset từ -0.05V đến -0.10V thông qua BIOS hoặc phần mềm Intel XTU / AMD Curve Optimizer, bạn có thể giảm ngay lập tức 10 đến 15 độ C nhiệt độ hoạt động, giúp quạt tản nhiệt quay êm ái hơn và CPU giữ mức xung Boost ổn định hơn.</p>`
    },
    {
      tittle: 'Hướng dẫn dọn rác và tối ưu hóa Windows 11 mượt mà nhất để chơi game',
      slug: 'huong-dan-don-rac-toi-uu-hoa-windows-11-choi-game',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_o_cung/image_12.png',
      image: 'http://localhost:3000/public/images/anh_case/image_42.png',
      content: `<h2>Các tinh chỉnh tăng tốc hệ thống hiệu quả:</h2><ul><li>Bật chế độ <strong>Game Mode</strong> và <strong>Hardware-Accelerated GPU Scheduling (HAGS)</strong> trong Windows Settings.</li><li>Tắt các ứng dụng khởi động cùng Windows không cần thiết trong Task Manager (Startup Apps).</li><li>Dọn dẹp thư mục tạm bằng lệnh <code>%temp%</code> và <code>prefetch</code> trong hộp thoại Run.</li><li>Tắt tính năng thông báo và ghi hình chạy nền Xbox Game Bar nếu không sử dụng.</li></ul>`
    },
    {
      tittle: 'Cách cân chỉnh màu sắc màn hình máy tính chuẩn đồ họa bằng phần mềm miễn phí',
      slug: 'cach-can-chinh-mau-sac-man-hinh-chuan-do-hoa',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_tan_nhiet/image_33.png',
      image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_34.png',
      content: `<h2>Đạt độ chính xác màu sắc 100% sRGB và DCI-P3</h2><p>Hướng dẫn sử dụng công cụ Windows Color Calibration và phần mềm DisplayCAL kết hợp với file ICC Profile chính thức từ nhà sản xuất để loại bỏ hiện tượng ám vàng, ám xanh và sai lệch độ tương phản gamma trên màn hình của bạn.</p>`
    },
    {
      tittle: 'Bao lâu nên tra keo tản nhiệt và vệ sinh bụi PC một lần?',
      slug: 'bao-lau-nen-tra-keo-tan-nhiet-ve-sinh-pc',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_tan_nhiet/image_10.png',
      image: 'http://localhost:3000/public/images/anh_tan_nhiet/image_11.png',
      content: `<h2>Lịch bảo dưỡng định kỳ khuyến nghị cho dàn PC</h2><ul><li><strong>Vệ sinh lưới lọc bụi mặt trước và đáy nguồn:</strong> Thực hiện 1 - 2 tháng một lần bằng chổi quét mềm hoặc máy thổi bụi mini.</li><li><strong>Vệ sinh tổng thể bên trong case và cánh quạt:</strong> Thực hiện 6 tháng một lần.</li><li><strong>Thay keo tản nhiệt CPU & GPU:</strong> Nên thực hiện định kỳ từ 12 - 18 tháng một lần với các loại keo chất lượng cao như Arctic MX-4, Noctua NT-H2 hoặc Thermal Grizzly.</li></ul>`
    },
    {
      tittle: 'Cách kích hoạt tính năng NVIDIA G-Sync / AMD FreeSync chống xé hình',
      slug: 'cach-kich-hoat-g-sync-freesync-chong-xe-hinh',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_vga_asus/image_11.png',
      image: 'http://localhost:3000/public/images/anh_vga_msi/image_10.png',
      content: `<h2>Trải nghiệm khung hình mượt mà không còn xé rách (Screen Tearing)</h2><p>Sử dụng cáp DisplayPort chất lượng cao, bật chế độ Adaptive Sync trong menu OSD của màn hình, sau đó mở NVIDIA Control Panel > Set up G-SYNC > Tích chọn Enable for windowed and full screen mode để đồng bộ tần số quét màn hình với FPS của game theo thời gian thực.</p>`
    },
    {
      tittle: 'Phân vùng và định dạng ổ cứng SSD NVMe mới mua chuẩn GPT và NTFS',
      slug: 'phan-vung-dinh-dang-ssd-moi-chuan-gpt-ntfs',
      cat_slug: 'meo-hay-thu-thuat',
      thumnail: 'http://localhost:3000/public/images/anh_o_cung/image_10.png',
      image: 'http://localhost:3000/public/images/anh_o_cung/image_22.png',
      content: `<h2>Cách làm xuất hiện ổ cứng mới trong This PC</h2><p>Mở công cụ <strong>Disk Management</strong> (nhấn chuột phải vào Start chọn Disk Management), khởi tạo ổ cứng mới với bảng phân vùng chuẩn <strong>GPT (GUID Partition Table)</strong>, sau đó tạo ổ đĩa mới (New Simple Volume) với định dạng file hệ thống <strong>NTFS</strong>.</p>`
    },

    // 31-36: Tư Vấn Cấu Hình
    {
      tittle: 'Top 3 cấu hình PC gaming dưới 15 triệu chơi mượt mọi tựa game online eSports',
      slug: 'top-3-cau-hinh-pc-gaming-duoi-15-trieu-2026',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_40.png',
      image: 'http://localhost:3000/public/images/anh_case/image_41.png',
      content: `<h2>Phân khúc cấu hình quốc dân cho học sinh, sinh viên</h2><p>Với ngân sách từ 12 đến 15 triệu đồng, cấu hình kết hợp giữa vi xử lý Intel Core i5-12400F hoặc AMD Ryzen 5 5600 cùng Card màn hình RTX 3060 12GB / RTX 4060 8GB, 16GB RAM DDR4 và SSD 512GB NVMe là sự lựa chọn số 1, dễ dàng đạt trên 250 FPS trong LMHT, Valorant, CS2 và chơi mượt GTA V, Black Myth Wukong ở thiết lập đồ họa Medium/High.</p>`
    },
    {
      tittle: 'Tư vấn cấu hình PC Đồ Họa 3D, Dựng Phim 4K chuyên nghiệp tầm giá 30 - 40 triệu',
      slug: 'tu-van-cau-hinh-pc-do-hoa-3d-dung-phim-4k-30-40-trieu',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_42.png',
      image: 'http://localhost:3000/public/images/anh_case/image_43.png',
      content: `<h2>Cỗ máy làm việc kiếm tiền hiệu quả và bền bỉ</h2><p>Cấu hình tối ưu trang bị chip Intel Core i7-14700K (20 nhân 28 luồng) hoặc AMD Ryzen 9 7900X, RAM 32GB/64GB DDR5 bus 6000MHz, Card đồ họa RTX 4070 Super 12GB GDDR6X, ổ cứng SSD NVMe 1TB PCIe Gen4 tốc độ cao và nguồn 750W 80+ Gold, đáp ứng hoàn hảo nhu cầu dựng video Adobe Premiere, After Effects, thiết kế nội thất 3Ds Max, SketchUp Vray và Lumion.</p>`
    },
    {
      tittle: 'Xây dựng dàn PC Gaming Cao Cấp 4K ray Tracing không thỏa hiệp tầm giá 60 triệu',
      slug: 'xay-dung-dan-pc-gaming-cao-cap-4k-ray-tracing-60-trieu',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_41.png',
      image: 'http://localhost:3000/public/images/anh_case/image_40.png',
      content: `<h2>Trải nghiệm đỉnh cao đồ họa tương lai</h2><p>Bộ đôi quái vật AMD Ryzen 7 7800X3D kết hợp với NVIDIA GeForce RTX 4080 Super 16GB GDDR6X, 32GB RAM DDR5 RGB CL30, tản nhiệt nước AIO 360mm có màn hình LCD tùy biến và nguồn Corsair 850W Gold chuẩn ATX 3.0 sẽ mang đến trải nghiệm đồ họa Ray Tracing siêu thực trên màn hình 4K 144Hz.</p>`
    },
    {
      tittle: 'Tư vấn cấu hình PC Văn Phòng Siêu Bền bỉ, Nhỏ gọn tầm giá 7 đến 10 triệu',
      slug: 'tu-van-pc-van-phong-sieu-ben-nho-gon-7-10-trieu',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_40.png',
      image: 'http://localhost:3000/public/images/anh_case/image_41.png',
      content: `<h2>Hiệu năng mượt mà cho công việc văn phòng và bán hàng</h2><p>Trang bị chip Intel Core i3-12100 hoặc i5-12400 tích hợp đồ họa UHD Graphics 730, RAM 16GB DDR4 bus 3200MHz và SSD NVMe 512GB siêu nhanh, khởi động máy chỉ mất 5 giây, mở đồng thời 30 tab Chrome và các file Excel nặng hàng chục ngàn dòng không hề giật lag.</p>`
    },
    {
      tittle: 'Build PC chạy Giả Lập Nox, LDPlayer cày nhiều Tab game: Những lưu ý sống còn',
      slug: 'build-pc-chay-gia-lap-nox-ldplayer-nhieu-tab',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png',
      image: 'http://localhost:3000/public/images/anh_cpu_amd/image_1.png',
      content: `<h2>Bí quyết chọn linh kiện cho dàn máy cày giả lập Android</h2><p>Chạy nhiều tab giả lập yêu cầu số lượng nhân/luồng CPU thật nhiều và dung lượng RAM cực lớn (tối thiểu 32GB đến 64GB/128GB). Đừng quên bật tính năng ảo hóa phần cứng <strong>Virtualization Technology (VT-x / AMD-V)</strong> trong BIOS để mỗi tab giả lập hoạt động mượt mà không bị văng game.</p>`
    },
    {
      tittle: 'Tư vấn lựa chọn linh kiện theo ngân sách từ 10 triệu đến 100 triệu tại WINNOTech',
      slug: 'tu-van-lua-chon-linh-kien-theo-ngan-sach-winnotech',
      cat_slug: 'tu-van-cau-hinh',
      thumnail: 'http://localhost:3000/public/images/anh_case/image_42.png',
      image: 'http://localhost:3000/public/images/anh_case/image_43.png',
      content: `<h2>Cẩm nang đầu tư cấu hình thông minh nhất</h2><p>Tổng hợp bảng phân bổ ngân sách tối ưu theo tỷ lệ vàng: 40-45% cho GPU, 20-25% cho CPU, 10-12% cho Mainboard, 8-10% cho RAM & SSD, 8-10% cho Nguồn & Vỏ case giúp bạn đạt được hiệu năng trên giá thành (P/P) cao nhất.</p>`
    }
  ];

  let postInsertCount = 0;
  for (const art of articleList) {
    const postCatDoc = postCatDocs[art.cat_slug] || postCatDocs['tin-cong-nghe'];
    await PostModel.findOneAndUpdate(
      { slug: art.slug },
      {
        $set: {
          tittle: art.tittle,
          slug: art.slug,
          thumnail: art.thumnail,
          image: art.image,
          content: art.content,
          status: 'published',
          categories_post_id: postCatDoc._id
        }
      },
      { upsert: true }
    );
    postInsertCount++;
  }
  console.log(`✅ Đã đồng bộ thành công ${postInsertCount} Bài viết chất lượng cao (status: "published")`);

  // ═════════════════════════════════════════════════════════════
  // TỔNG KẾT & KIỂM TRA ĐỘ HOÀN THIỆN
  // ═════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 TỔNG KẾT DỮ LIỆU ĐÃ SEED THÀNH CÔNG!');
  console.log('═'.repeat(60));

  const allCats = await CategoryModel.find({ status: 'active' });
  console.log(`\n📁 Danh mục sản phẩm (${allCats.length} danh mục):`);
  for (const c of allCats) {
    const pCount = await ProductModel.countDocuments({ cat_id: c._id });
    console.log(`   - [${c.slug}] ${c.name.padEnd(25)} : ${pCount} sản phẩm ${pCount >= 20 ? '✅ (>= 20 SP)' : '⚠️ (< 20 SP)'}`);
  }

  const totalProds = await ProductModel.countDocuments();
  const totalImgs = await ImageModel.countDocuments();
  const totalVars = await ProductVariantModel.countDocuments();
  const totalVAs = await VariantAttribute.countDocuments();
  const totalPosts = await PostModel.countDocuments();
  const pubPosts = await PostModel.countDocuments({ status: 'published' });

  console.log(`\n📦 Tổng số sản phẩm (Product)        : ${totalProds}`);
  console.log(`🖼️  Tổng số ảnh sản phẩm (Image)       : ${totalImgs} (Trung bình ${(totalImgs / totalProds).toFixed(1)} ảnh/SP)`);
  console.log(`🔄 Tổng số biến thể (ProductVariant)  : ${totalVars}`);
  console.log(`🔗 Tổng liên kết Variant-Attribute    : ${totalVAs}`);
  console.log(`📝 Tổng số bài viết (Post)            : ${totalPosts} (Đã xuất bản: ${pubPosts})`);
  console.log('═'.repeat(60) + '\n');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối an toàn với MongoDB.');
  process.exit(0);
}

runMasterSeed().catch(err => {
  console.error('❌ Lỗi khi thực thi seed:', err);
  process.exit(1);
});
