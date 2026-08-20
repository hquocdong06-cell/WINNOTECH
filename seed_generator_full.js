/**
 * SEED DATA GENERATOR SCRIPT
 * Yêu cầu:
 * 1. Danh mục:
 *    - AMD (slug: amd)
 *    - Intel (slug: intel)
 *    - Card dành cho làm đồ họa (slug: card-do-hoa)
 *    - Card gaming (slug: card-gaming)
 *    - PC văn phòng (slug: pc-van-phong)
 *    - PC gaming (slug: pc-gaming)
 *    - Màn hình máy tính (slug: man-hinh)
 *    - Bàn phím cơ (slug: ban-phim)
 *    - Chuột Gaming (slug: chuot-gaming)
 *    - Tai nghe Gaming (slug: tai-nghe)
 * 2. Mỗi category có 30 sản phẩm (Tổng 300 sản phẩm)
 * 3. Đầy đủ dữ liệu DB:
 *    - Product: name, slug, thumnail, description, short_desc, status, sale, compatibility_meta, cat_id, brand_id
 *    - ProductVariant: variant_name, price, sale_price, sku, stock_quantity, status, p_id
 *    - Attribute, AttributeValue, VariantAttribute
 *    - Image: url, alt, is_main, p_id
 * 4. 50 bài viết (Post + PostCategory) với tittle, slug, thumnail, image, content, status
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

async function runSeed() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mẫu...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB:', MONGO_URI);

  // 1. Tạo hoặc cập nhật Brands
  const brandList = [
    { name: 'AMD', slug: 'amd', logo: 'http://localhost:3000/public/images/logos/amd.png' },
    { name: 'Intel', slug: 'intel', logo: 'http://localhost:3000/public/images/logos/intel.png' },
    { name: 'NVIDIA', slug: 'nvidia', logo: 'http://localhost:3000/public/images/logos/nvidia.png' },
    { name: 'ASUS', slug: 'asus', logo: 'http://localhost:3000/public/images/logos/asus.png' },
    { name: 'MSI', slug: 'msi', logo: 'http://localhost:3000/public/images/logos/msi.png' },
    { name: 'Gigabyte', slug: 'gigabyte', logo: 'http://localhost:3000/public/images/logos/gigabyte.png' },
    { name: 'Corsair', slug: 'corsair', logo: 'http://localhost:3000/public/images/logos/corsair.png' },
    { name: 'Kingston', slug: 'kingston', logo: 'http://localhost:3000/public/images/logos/kingston.png' },
    { name: 'Samsung', slug: 'samsung', logo: 'http://localhost:3000/public/images/logos/samsung.png' },
    { name: 'Logitech', slug: 'logitech', logo: 'http://localhost:3000/public/images/logos/logitech.png' },
    { name: 'Razer', slug: 'razer', logo: 'http://localhost:3000/public/images/logos/razer.png' },
    { name: 'Dell', slug: 'dell', logo: 'http://localhost:3000/public/images/logos/dell.png' },
    { name: 'LG', slug: 'lg', logo: 'http://localhost:3000/public/images/logos/lg.png' },
    { name: 'WINNOTech', slug: 'winnotech', logo: 'http://localhost:3000/public/images/logos/logo.png' }
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
  console.log(`✅ Đã đồng bộ ${Object.keys(brandDocs).length} Thương hiệu (Brands)`);

  // 2. Tạo hoặc cập nhật Categories theo đúng yêu cầu
  const categoryList = [
    { name: 'AMD', slug: 'amd', image: 'http://localhost:3000/public/images/anh_cpu_amd/image_1.png' },
    { name: 'Intel', slug: 'intel', image: 'http://localhost:3000/public/images/anh_cpu_intel/image_5.png' },
    { name: 'Card dành cho làm đồ hoạ', slug: 'card-do-hoa', image: 'http://localhost:3000/public/images/anh_vga_asus/image_6.png' },
    { name: 'Card gaming', slug: 'card-gaming', image: 'http://localhost:3000/public/images/anh_vga_msi/image_7.png' },
    { name: 'PC văn phòng', slug: 'pc-van-phong', image: 'http://localhost:3000/public/images/anh_case/image_40.png' },
    { name: 'PC gaming', slug: 'pc-gaming', image: 'http://localhost:3000/public/images/anh_case/image_41.png' },
    { name: 'Màn hình máy tính', slug: 'man-hinh', image: 'http://localhost:3000/public/images/products/monitor_1.png' },
    { name: 'Bàn phím cơ', slug: 'ban-phim', image: 'http://localhost:3000/public/images/products/keyboard_1.png' },
    { name: 'Chuột Gaming', slug: 'chuot-gaming', image: 'http://localhost:3000/public/images/products/mouse_1.png' },
    { name: 'Tai nghe Gaming', slug: 'tai-nghe', image: 'http://localhost:3000/public/images/products/headphone_1.png' }
  ];

  const categoryDocs = {};
  for (const c of categoryList) {
    const doc = await CategoryModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, image: c.image, status: 'active' } },
      { upsert: true, returnDocument: 'after' }
    );
    categoryDocs[c.slug] = doc;
  }
  console.log(`✅ Đã đồng bộ ${Object.keys(categoryDocs).length} Danh mục (Categories)`);

  // 3. Khởi tạo thuộc tính chung (Attributes & Values)
  let attrColor = await Attribute.findOne({ name: 'Màu sắc' });
  if (!attrColor) attrColor = await Attribute.create({ name: 'Màu sắc' });

  let attrCapacity = await Attribute.findOne({ name: 'Phiên bản / Dung lượng' });
  if (!attrCapacity) attrCapacity = await Attribute.create({ name: 'Phiên bản / Dung lượng' });

  let attrWarranty = await Attribute.findOne({ name: 'Bảo hành' });
  if (!attrWarranty) attrWarranty = await Attribute.create({ name: 'Bảo hành' });

  const getOrCreateAttrVal = async (attrId, val) => {
    let doc = await AttributeValue.findOne({ value: val, id_attribute: attrId });
    if (!doc) doc = await AttributeValue.create({ value: val, id_attribute: attrId });
    return doc;
  };

  const valColorBlack = await getOrCreateAttrVal(attrColor._id, 'Đen (Black)');
  const valColorWhite = await getOrCreateAttrVal(attrColor._id, 'Trắng (White)');
  const valWarranty24 = await getOrCreateAttrVal(attrWarranty._id, '24 Tháng');
  const valWarranty36 = await getOrCreateAttrVal(attrWarranty._id, '36 Tháng');
  const valVerStandard = await getOrCreateAttrVal(attrCapacity._id, 'Tiêu chuẩn');
  const valVerOC = await getOrCreateAttrVal(attrCapacity._id, 'Bản ép xung (OC Edition)');

  // 4. Định nghĩa dữ liệu sản phẩm cho 10 Categories (30 SP mỗi danh mục = 300 SP)
  const productDefinitions = {
    amd: Array.from({ length: 30 }, (_, i) => {
      const series = i < 8 ? 'Ryzen 5' : i < 16 ? 'Ryzen 7' : i < 24 ? 'Ryzen 9' : 'Threadripper';
      const modelNum = ['5600', '5600X', '7500F', '7600', '7600X', '5700X', '7700', '7700X', '7800X3D', '9700X', '5900X', '7900X', '7900X3D', '7950X', '7950X3D', '9950X', '9900X', '7960X', '7970X'][i % 19];
      const name = `Bộ vi xử lý AMD ${series} ${modelNum} (Up to ${4.5 + (i % 10) * 0.1}GHz, ${6 + (i % 6) * 2} Cores / ${12 + (i % 6) * 4} Threads)`;
      const socket = i >= 24 ? 'sTR5' : (parseInt(modelNum) < 6000 ? 'AM4' : 'AM5');
      return {
        name,
        brand_slug: 'amd',
        basePrice: (3000000 + i * 850000),
        short_desc: `${6 + (i % 6) * 2}C/${12 + (i % 6) * 4}T, Socket ${socket}, Cache ${32 + (i % 4) * 32}MB`,
        desc: `Bộ vi xử lý CPU AMD ${series} ${modelNum} mang lại hiệu năng đa nhiệm vượt trội, tiết kiệm điện năng và tối ưu hóa mạnh mẽ cho cả làm việc nặng lẫn chơi game eSports, AAA.`,
        socket,
        tdp: 65 + (i % 4) * 40,
        img: `http://localhost:3000/public/images/anh_cpu_amd/image_${(i % 5) + 1}.png`
      };
    }),

    intel: Array.from({ length: 30 }, (_, i) => {
      const tier = i < 6 ? 'Core i3' : i < 14 ? 'Core i5' : i < 22 ? 'Core i7' : 'Core i9';
      const gen = 12 + (i % 3);
      const model = tier === 'Core i3' ? `${gen}100` : tier === 'Core i5' ? `${gen}400F` : tier === 'Core i7' ? `${gen}700K` : `${gen}900KS`;
      const name = `Bộ vi xử lý CPU Intel ${tier}-${model} Turbo ${5.0 + (i % 8) * 0.1}GHz, LGA1700, 1${gen}th Gen`;
      return {
        name,
        brand_slug: 'intel',
        basePrice: (2500000 + i * 900000),
        short_desc: `${4 + (i % 6) * 4}C/${8 + (i % 6) * 4}T, Socket LGA1700, Turbo ${5.0 + (i % 8) * 0.1}GHz`,
        desc: `CPU Intel ${tier}-${model} thế hệ thứ ${gen} mang kiến trúc hybrid đột phá kết hợp P-Core và E-Core, tối ưu hóa toàn diện cho ứng dụng văn phòng, đồ họa Adobe và chơi game siêu mượt.`,
        socket: 'LGA1700',
        tdp: 65 + (i % 4) * 60,
        img: `http://localhost:3000/public/images/anh_cpu_intel/image_${(i % 5) + 1}.png`
      };
    }),

    'card-do-hoa': Array.from({ length: 30 }, (_, i) => {
      const vgaTypes = [
        'NVIDIA RTX A2000 6GB GDDR6',
        'NVIDIA RTX A4000 16GB GDDR6 Workstation',
        'NVIDIA RTX A5000 24GB GDDR6 Chuyên Dụng Render 3D',
        'NVIDIA RTX 4080 Studio Creator Edition 16GB',
        'NVIDIA RTX 4090 24GB AI Deep Learning Edition',
        'AMD Radeon Pro W6600 8GB GDDR6',
        'AMD Radeon Pro W7800 32GB Chuyên Kiến Trúc & VFX',
        'NVIDIA Quadro RTX 6000 24GB ECC Graphic Card'
      ];
      const brand = pickRandom(['asus', 'msi', 'gigabyte', 'nvidia']);
      const baseName = vgaTypes[i % vgaTypes.length];
      const name = `Card màn hình đồ họa chuyên nghiệp ${brandDocs[brand]?.name || 'ASUS'} ${baseName} Pro V${i + 1}`;
      return {
        name,
        brand_slug: brand,
        basePrice: (12000000 + i * 2500000),
        short_desc: `VRAM ${8 + (i % 4) * 8}GB, Băng thông cực cao, Hỗ trợ driver Studio & ISV Certified`,
        desc: `Card đồ họa thiết kế chuyên dụng cho Designer, Kiến trúc sư và Kỹ sư 3D Max, Maya, AutoCAD, Premiere Pro với độ ổn định màu sắc 10-bit và khả năng render liên tục 24/7.`,
        gpu_tier: 4 + (i % 2),
        tdp: 150 + (i % 4) * 50,
        img: `http://localhost:3000/public/images/anh_vga_asus/image_${(i % 6) + 1}.png`
      };
    }),

    'card-gaming': Array.from({ length: 30 }, (_, i) => {
      const models = ['RTX 3060 12GB', 'RTX 4060 8GB', 'RTX 4060 Ti 16GB', 'RTX 4070 Super 12GB', 'RTX 4070 Ti Super 16GB', 'RTX 4080 Super 16GB', 'RTX 4090 24GB', 'RX 6600 8GB', 'RX 7700 XT 12GB', 'RX 7800 XT 16GB', 'RX 7900 XTX 24GB'];
      const brand = pickRandom(['asus', 'msi', 'gigabyte']);
      const model = models[i % models.length];
      const edition = ['TUF Gaming', 'ROG Strix', 'Gaming X Trio', 'Ventus 2X', 'AORUS Master', 'Eagle OC'][i % 6];
      const name = `Card màn hình ${brandDocs[brand]?.name || 'MSI'} GeForce ${model} ${edition} GDDR6X`;
      return {
        name,
        brand_slug: brand,
        basePrice: (6500000 + i * 1400000),
        short_desc: `${model}, Chuẩn PCIe 4.0, RGB Sync, Tản nhiệt 3 quạt siêu mát`,
        desc: `Card đồ họa chiến game đỉnh cao với công nghệ Ray Tracing và DLSS 3 Frame Generation, mang lại chỉ số FPS siêu mượt trên các độ phân giải 2K và 4K.`,
        gpu_tier: 3 + (i % 3),
        tdp: 170 + (i % 4) * 60,
        img: `http://localhost:3000/public/images/anh_vga_msi/image_${(i % 6) + 1}.png`
      };
    }),

    'pc-van-phong': Array.from({ length: 30 }, (_, i) => {
      const tiers = ['Eco Office', 'Standard Business', 'Pro Enterprise', 'Compact Slim', 'All-In-One Modern'];
      const tier = tiers[i % tiers.length];
      const cpus = ['Intel Core i3-12100', 'Intel Core i5-12400', 'Intel Core i5-13400', 'AMD Ryzen 5 5600G', 'Intel Core i7-12700'];
      const cpu = cpus[i % cpus.length];
      const name = `Máy tính để bàn PC Văn Phòng WINNOTech ${tier} V${i + 1} (${cpu} / RAM 16GB / SSD 512GB NVMe)`;
      return {
        name,
        brand_slug: 'winnotech',
        basePrice: (5500000 + i * 350000),
        short_desc: `${cpu}, RAM 16GB DDR4, SSD 512GB NVMe, Nguồn 500W Chuẩn 80 Plus`,
        desc: `Bộ máy tính để bàn văn phòng được tinh chỉnh tối ưu cho kế toán, hành chính nhân sự, bán hàng online và lướt web đa tác vụ tốc độ cao, hoạt động êm ái bền bỉ.`,
        form_factor: 'mATX',
        wattage: 500,
        img: `http://localhost:3000/public/images/anh_case/image_${(i % 5) + 40}.png`
      };
    }),

    'pc-gaming': Array.from({ length: 30 }, (_, i) => {
      const ranks = ['Dragon Hunter', 'Cyber Titan', 'Shadow Phantom', 'Apex Predator', 'Valkyrie Elite', 'Inferno Master'];
      const rank = ranks[i % ranks.length];
      const specs = [
        'i5-13400F / RTX 4060 8GB / 16GB RAM / 500GB SSD',
        'Ryzen 5 7600 / RTX 4060 Ti 16GB / 32GB DDR5 / 1TB SSD',
        'i7-14700F / RTX 4070 Super 12GB / 32GB DDR5 / 1TB SSD',
        'Ryzen 7 7800X3D / RTX 4070 Ti Super / 32GB DDR5 / 1TB SSD',
        'i9-14900K / RTX 4080 Super 16GB / 64GB DDR5 / 2TB SSD',
        'Ryzen 7 7800X3D / RTX 4090 24GB Liquid / 64GB DDR5 / 2TB NVMe'
      ];
      const spec = specs[i % specs.length];
      const name = `PC Gaming WINNOTech ${rank} Gen${i + 1} (${spec})`;
      return {
        name,
        brand_slug: 'winnotech',
        basePrice: (13500000 + i * 1800000),
        short_desc: spec,
        desc: `Dàn PC Gaming cao cấp được lắp ráp linh kiện chuẩn chỉ, tản nhiệt nước AIO ARGB rực rỡ, cân mượt tất cả các tựa game nặng như Black Myth Wukong, Cyberpunk 2077, GTA V.`,
        form_factor: 'ATX',
        wattage: 750 + (i % 3) * 100,
        img: `http://localhost:3000/public/images/anh_case/image_${(i % 6) + 40}.png`
      };
    }),

    'man-hinh': Array.from({ length: 30 }, (_, i) => {
      const sizes = ['24 inch', '27 inch', '32 inch', '34 inch Cong'];
      const hzs = ['100Hz', '144Hz', '180Hz', '240Hz', '360Hz'];
      const res = ['FHD IPS', '2K QHD Fast IPS', '4K UHD OLED'];
      const brand = pickRandom(['asus', 'msi', 'gigabyte', 'lg', 'dell', 'samsung']);
      const name = `Màn hình máy tính ${brandDocs[brand]?.name || 'LG'} ${sizes[i % sizes.length]} ${res[i % res.length]} ${hzs[i % hzs.length]} 1ms Gaming Monitor Pro V${i + 1}`;
      return {
        name,
        brand_slug: brand,
        basePrice: (2300000 + i * 420000),
        short_desc: `${sizes[i % sizes.length]}, Tần số quét ${hzs[i % hzs.length]}, Tấm nền IPS chuẩn màu 99% sRGB`,
        desc: `Màn hình máy tính thiết kế viền siêu mỏng, độ phân giải sắc nét cùng công nghệ chống chói và lọc ánh sáng xanh bảo vệ mắt tối đa khi làm việc và chơi game trong thời gian dài.`,
        img: `http://localhost:3000/public/images/anh_tan_nhiet/image_${(i % 5) + 32}.png`
      };
    }),

    'ban-phim': Array.from({ length: 30 }, (_, i) => {
      const types = ['Cơ Không Dây Tri-Mode (Bluetooth / 2.4G / Type-C)', 'Cơ Quang Học Siêu Tốc', 'Cơ Custom Hotswap 5-Pin RGB', 'Cơ Silent Êm Ái Văn Phòng'];
      const brand = pickRandom(['corsair', 'razer', 'logitech', 'asus']);
      const name = `Bàn phím cơ ${brandDocs[brand]?.name || 'Corsair'} K${70 + i} RGB ${types[i % types.length]}`;
      return {
        name,
        brand_slug: brand,
        basePrice: (650000 + i * 120000),
        short_desc: `Switch cơ học cao cấp, Keycap PBT Double-shot bền bỉ, LED RGB 16.8 triệu màu`,
        desc: `Bàn phím cơ mang lại trải nghiệm gõ phím cực đã, độ nảy tốt, hỗ trợ tính năng anti-ghosting 100% và phần mềm tùy chỉnh macro chuyên sâu.`,
        img: `http://localhost:3000/public/images/anh_ram_corsair/image_${(i % 4) + 15}.png`
      };
    }),

    'chuot-gaming': Array.from({ length: 30 }, (_, i) => {
      const sensors = ['Sensor Hero 25K', 'Focus Pro 30K Optical', 'TrueMove Core', 'PAW3395 Siêu Chuẩn'];
      const brand = pickRandom(['logitech', 'razer', 'asus', 'corsair']);
      const name = `Chuột Gaming Không Dây Siêu Nhẹ ${brandDocs[brand]?.name || 'Logitech'} G${100 + i * 5} Speed ${sensors[i % sensors.length]}`;
      return {
        name,
        brand_slug: brand,
        basePrice: (350000 + i * 95000),
        short_desc: `Trọng lượng siêu nhẹ chỉ 55g, DPI lên tới 26.000, Thời lượng pin 90 giờ`,
        desc: `Chuột gaming công thái học không dây với mắt đọc quang học độ chính xác từng milimet, feet chuột PTFE trượt êm mượt trên mọi bề mặt pad chuột.`,
        img: `http://localhost:3000/public/images/anh_ram_kingston/image_${(i % 4) + 15}.png`
      };
    }),

    'tai-nghe': Array.from({ length: 30 }, (_, i) => {
      const soundTech = ['Âm thanh vòm 7.1 Virtual Surround', 'Driver 50mm Hi-Res Audio', 'Spatial Audio Không Dây', 'Chống Ồn Chủ Động ANC'];
      const brand = pickRandom(['corsair', 'razer', 'logitech', 'msi', 'asus']);
      const name = `Tai nghe Gaming ${brandDocs[brand]?.name || 'Razer'} Kraken Sound V${i + 1} (${soundTech[i % soundTech.length]})`;
      return {
        name,
        brand_slug: brand,
        basePrice: (550000 + i * 110000),
        short_desc: `Đệm tai bọt nhớ thoáng khí, Mic đàm thoại lọc tạp âm ENC, Tương thích đa nền tảng PC/Console`,
        desc: `Tai nghe chuyên game với chất âm mạnh mẽ, âm trầm uy lực giúp định vị chính xác tiếng bước chân đối thủ trong các tựa game bắn súng FPS như CS2, Valorant, PUBG.`,
        img: `http://localhost:3000/public/images/anh_nguon_may_tinh/image_${(i % 5) + 30}.png`
      };
    })
  };

  // 5. Tiến hành Seed 300 Sản Phẩm cùng đầy đủ bảng liên kết
  let totalProductsCreated = 0;
  for (const [catSlug, pList] of Object.entries(productDefinitions)) {
    const catDoc = categoryDocs[catSlug];
    if (!catDoc) continue;

    console.log(`\n📦 Đang tạo 30 sản phẩm cho danh mục: [${catDoc.name}] (${catSlug})...`);

    for (let idx = 0; idx < pList.length; idx++) {
      const pDef = pList[idx];
      const brandDoc = brandDocs[pDef.brand_slug] || brandDocs['winnotech'];
      const slug = `${slugify(pDef.name)}-${catSlug}-${idx + 1}`;

      // Xóa sản phẩm cũ trùng slug nếu có
      await ProductModel.deleteOne({ slug });

      // Tạo Product
      const product = await ProductModel.create({
        name: pDef.name,
        slug,
        thumnail: pDef.img,
        description: pDef.desc,
        short_desc: pDef.short_desc,
        status: 'active',
        sale: idx % 3 === 0 ? 10 : idx % 5 === 0 ? 15 : 0,
        cat_id: catDoc._id,
        brand_id: brandDoc._id,
        compatibility_meta: {
          socket: pDef.socket || null,
          ram_type: catSlug.includes('ram') || catSlug.includes('amd') || catSlug.includes('intel') ? (idx % 2 === 0 ? 'DDR5' : 'DDR4') : null,
          form_factor: pDef.form_factor || null,
          supported_ff: catSlug.includes('pc') ? ['ATX', 'mATX', 'ITX'] : [],
          tdp: pDef.tdp || null,
          wattage: pDef.wattage || null,
          gpu_tier: pDef.gpu_tier || null
        }
      });

      // Tạo Biến thể 1 (Mặc định / Tiêu chuẩn)
      const variant1 = await ProductVariantModel.create({
        variant_name: 'Tiêu chuẩn',
        price: pDef.basePrice,
        sale_price: product.sale > 0 ? Math.round(pDef.basePrice * (100 - product.sale) / 100) : 0,
        sku: `SKU-${catSlug.toUpperCase().slice(0, 3)}-${1000 + idx}`,
        stock_quantity: randInt(15, 100),
        status: 'active',
        p_id: product._id
      });

      // Gắn VariantAttribute cho Biến thể 1
      await VariantAttribute.create({ id_variants: variant1._id, id_attribute_value: valColorBlack._id });
      await VariantAttribute.create({ id_variants: variant1._id, id_attribute_value: valWarranty36._id });
      await VariantAttribute.create({ id_variants: variant1._id, id_attribute_value: valVerStandard._id });

      // Tạo Biến thể 2 (Bản nâng cấp / Màu trắng hoặc OC)
      const var2Price = Math.round(pDef.basePrice * 1.1);
      const variant2 = await ProductVariantModel.create({
        variant_name: 'Bản Cao Cấp (White / OC)',
        price: var2Price,
        sale_price: product.sale > 0 ? Math.round(var2Price * (100 - product.sale) / 100) : 0,
        sku: `SKU-${catSlug.toUpperCase().slice(0, 3)}-${2000 + idx}`,
        stock_quantity: randInt(10, 50),
        status: 'active',
        p_id: product._id
      });

      // Gắn VariantAttribute cho Biến thể 2
      await VariantAttribute.create({ id_variants: variant2._id, id_attribute_value: valColorWhite._id });
      await VariantAttribute.create({ id_variants: variant2._id, id_attribute_value: valWarranty36._id });
      await VariantAttribute.create({ id_variants: variant2._id, id_attribute_value: valVerOC._id });

      // Tạo 2 ảnh cho sản phẩm trong ImageModel
      await ImageModel.create({
        p_id: product._id,
        url: pDef.img,
        alt: `${pDef.name} - Ảnh chính`,
        is_main: true
      });
      await ImageModel.create({
        p_id: product._id,
        url: pDef.img,
        alt: `${pDef.name} - Ảnh chi tiết`,
        is_main: false
      });

      totalProductsCreated++;
    }
  }

  console.log(`\n🎉 Đã tạo thành công tổng cộng ${totalProductsCreated} sản phẩm đầy đủ biến thể, thuộc tính và hình ảnh!`);

  // ═══════════════════════════════════════════════════════════
  // 6. TẠO 50 BÀI VIẾT (POSTS & POST CATEGORIES)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 Bắt đầu tạo 50 bài viết tin tức công nghệ...');

  await PostCategoryModel.deleteMany({});
  const postCategoryDefs = [
    { name: 'Tin tức', slug: 'tin-tuc', image: 'http://localhost:3000/public/images/banners/banner_tech.jpg' },
    { name: 'Đánh giá sản phẩm', slug: 'danh-gia-san-pham', image: 'http://localhost:3000/public/images/banners/banner_review.jpg' },
    { name: 'Hướng dẫn Build PC', slug: 'huong-dan-build-pc', image: 'http://localhost:3000/public/images/banners/banner_build.jpg' },
    { name: 'Kiến thức & Mẹo hay', slug: 'kien-thuc', image: 'http://localhost:3000/public/images/banners/banner_tips.jpg' },
    { name: 'Tin khuyến mãi', slug: 'tin-khuyen-mai', image: 'http://localhost:3000/public/images/banners/banner_promo.jpg' }
  ];

  const postCatDocs = [];
  for (const pc of postCategoryDefs) {
    const doc = await PostCategoryModel.create(pc);
    postCatDocs.push(doc);
  }

  // Danh sách 50 tiêu đề bài viết chất lượng
  const postTitles = [
    'Top 5 cấu hình PC Gaming đáng mua nhất trong tầm giá 15 đến 25 triệu đồng năm 2026',
    'Đánh giá chi tiết hiệu năng CPU AMD Ryzen 7 7800X3D: Vua gaming phân khúc cao cấp',
    'Hướng dẫn chọn card màn hình VGA phù hợp cho nhu cầu dựng phim và render đồ họa 3D',
    'So sánh Intel Core i7-14700K vs AMD Ryzen 7 9700X: Đâu là lựa chọn tối ưu cho bạn?',
    'Nên chọn RAM DDR4 hay DDR5 khi xây dựng cấu hình máy tính mới ở thời điểm hiện tại?',
    'Bí quyết tối ưu hóa luồng gió trong vỏ case giúp hạ nhiệt độ máy tính đến 10 độ C',
    'Cách chọn nguồn máy tính PSU chuẩn 80 Plus giúp dàn PC hoạt động bền bỉ, an toàn',
    'Top bàn phím cơ gõ êm ái dành cho dân văn phòng và lập trình viên không gây ồn ào',
    'Chuột gaming không dây siêu nhẹ: Xu hướng mới nâng tầm phản xạ game thủ eSports',
    'Review chi tiết màn hình Gaming 27 inch 2K Fast IPS 180Hz giá cực mềm cho học sinh sinh viên',
    'Hướng dẫn tự lắp ráp máy tính Build PC tại nhà từ A đến Z chi tiết và an toàn nhất',
    'Card đồ họa RTX 4070 Ti Super có thực sự xứng đáng để nâng cấp trong năm nay?',
    'Cách kiểm tra nhiệt độ CPU và GPU đơn giản nhất bằng phần mềm hoàn toàn miễn phí',
    'Tổng hợp 10 mẹo tăng tốc Windows 11 mượt mà vượt trội không lo bị giật lag',
    'So sánh tản nhiệt khí và tản nhiệt nước AIO: Loại nào làm mát CPU hiệu quả hơn?',
    'Cảnh báo những sai lầm tai hại thường gặp khi tự bôi keo tản nhiệt cho vi xử lý',
    'Công nghệ DLSS 3 Frame Generation là gì và nó giúp tăng gấp đôi FPS như thế nào?',
    'Top 5 cấu hình PC văn phòng nhỏ gọn, tiết kiệm điện năng cho doanh nghiệp vừa và nhỏ',
    'Màn hình OLED cho máy tính: Ưu điểm hình ảnh rực rỡ và những điều cần lưu ý về burn-in',
    'Đánh giá hiệu năng thực tế của dòng card đồ họa chuyên nghiệp NVIDIA Quadro RTX',
    'Tại sao tốc độ đọc ghi của SSD NVMe Gen 4 lại vượt trội hơn hẳn SSD SATA 3 truyền thống?',
    'Hướng dẫn cài đặt driver card màn hình NVIDIA chuẩn chỉnh giúp tránh lỗi màn hình xanh',
    'Phím tắt Windows hữu ích giúp nâng cao năng suất làm việc của bạn lên gấp 3 lần',
    'Review bàn phím cơ custom núm xoay RGB: Trải nghiệm gõ phím đầm tay chuẩn âm thock',
    'Kinh nghiệm chọn tai nghe gaming có micro lọc ồn tốt nhất để giao tiếp voice chat rõ ràng',
    'Sự khác biệt giữa chuẩn PCIe 4.0 và PCIe 5.0 đối với hiệu năng card màn hình thế hệ mới',
    'Cách vệ sinh bụi bẩn máy tính để bàn định kỳ đúng cách không sợ chập cháy linh kiện',
    'Top 7 tựa game AAA đồ họa siêu đẹp thách thức mọi cấu hình phần cứng trong năm 2026',
    'Chương trình khuyến mãi siêu bùng nổ: Giảm giá đến 30% khi mua combo Build PC tại WINNOTech',
    'Đánh giá màn hình cong UltraWide 34 inch: Không gian làm việc đa nhiệm và xem phim cực đã',
    'CPU Intel thế hệ 14 có điểm gì mới nổi bật so với thế hệ tiền nhiệm?',
    'Hướng dẫn bật XMP / EXPO trong BIOS để RAM chạy đúng mức xung nhịp cao nhất',
    'Tai nghe gaming 7.1 có thực sự giúp bạn nghe rõ tiếng bước chân kẻ địch trong game FPS?',
    'Nên chọn ổ cứng SSD dung lượng 512GB hay 1TB khi sắm dàn PC gaming mới?',
    'Top 5 mẫu vỏ case bể cá hai mặt kính cường lực ngắm trọn nội thất linh kiện ARGB',
    'Đánh giá sức mạnh card đồ họa AMD Radeon RX 7800 XT trong bài test game 2K Ultra Settings',
    'Cẩm nang xử lý lỗi máy tính không lên màn hình hoặc kêu tiếng bíp liên tục khi bật nguồn',
    'Cách thiết lập 2 màn hình máy tính song song để tối ưu hóa không gian làm việc đa nhiệm',
    'Tư vấn chọn ghế công thái học Ergonomic bảo vệ cột sống cho người ngồi máy tính nhiều giờ',
    'Lợi ích của việc trang bị tản nhiệt SSD M.2 giúp duy trì tốc độ đọc ghi ổn định lâu dài',
    'Review chuột không dây công thái học chống mỏi cổ tay dành cho dân thiết kế đồ họa',
    'Hướng dẫn sao lưu dữ liệu tự động trên máy tính phòng ngừa rủi ro mất dữ liệu quan trọng',
    'So sánh hiệu năng chip đồ họa tích hợp Intel UHD vs AMD Radeon Graphics thế hệ mới',
    'Những lưu ý quan trọng khi chọn mua linh kiện máy tính cũ đã qua sử dụng để tránh tiền mất tật mang',
    'Top 5 phần mềm benchmark kiểm tra sức mạnh máy tính chuẩn xác nhất hiện nay',
    'Bật mí cách giảm độ trễ input lag khi chơi các tựa game đối kháng và bắn súng trực tuyến',
    'Đại tiệc công nghệ cuối năm: Thu cũ đổi mới lên đời PC Gaming trợ giá cực sốc',
    'Đánh giá bộ nhớ RAM Corsair Vengeance RGB DDR5: Vẻ đẹp sang trọng cùng hiệu năng ép xung đỉnh cao',
    'Lý do vì sao game thủ hiện đại luôn ưu tiên sử dụng màn hình có tần số quét từ 144Hz trở lên',
    'Tổng kết xu hướng phát triển phần cứng máy tính và trí tuệ nhân tạo AI PC năm 2026'
  ];

  await PostModel.deleteMany({});
  for (let i = 0; i < postTitles.length; i++) {
    const tittle = postTitles[i];
    const cat = postCatDocs[i % postCatDocs.length];
    const slug = slugify(tittle);
    const postImg = `http://localhost:3000/public/images/anh_vga_asus/image_${(i % 6) + 1}.png`;

    await PostModel.create({
      tittle,
      slug: `${slug}-${i + 1}`,
      thumnail: postImg,
      image: postImg,
      status: 'published',
      categories_post_id: cat._id,
      content: `
        <p><strong>${tittle}</strong> là chủ đề đang nhận được rất nhiều sự quan tâm từ cộng đồng đam mê công nghệ và game thủ trong thời gian gần đây.</p>
        <h2>1. Giới thiệu tổng quan và tầm quan trọng</h2>
        <p>Trong kỷ nguyên công nghệ số hiện đại, việc trang bị và nâng cấp phần cứng máy tính phù hợp không chỉ giúp bạn xử lý công việc mượt mà mà còn mang đến những phút giây giải trí đỉnh cao. Đội ngũ chuyên gia kỹ thuật tại <strong>WINNOTech</strong> đã thực hiện hàng loạt bài test thực tế để đưa ra những phân tích chính xác nhất.</p>
        <p><img src="${postImg}" alt="${tittle}" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" /></p>
        <h2>2. Đánh giá chi tiết và trải nghiệm thực tế</h2>
        <p>Qua quá trình thử nghiệm khắt khe, sản phẩm và giải pháp này chứng minh được sự vượt trội về độ ổn định, khả năng tản nhiệt cũng như tối ưu hóa điện năng tiêu thụ. Dù bạn là game thủ chuyên nghiệp, kiến trúc sư 3D hay nhân viên văn phòng, đây chắc chắn là một giải pháp rất đáng để đầu tư.</p>
        <h2>3. Lời khuyên và tổng kết từ chuyên gia WINNOTech</h2>
        <p>Nếu bạn đang có nhu cầu tư vấn cấu hình chi tiết hoặc cần hỗ trợ lắp ráp máy tính theo yêu cầu, hãy liên hệ ngay với <strong>WINNOTech</strong> để nhận được sự phục vụ tận tâm nhất cùng nhiều ưu đãi hấp dẫn!</p>
      `
    });
  }

  console.log(`✅ Đã tạo thành công 50 bài viết (Posts) thuộc ${postCatDocs.length} danh mục bài viết!`);

  await mongoose.disconnect();
  console.log('🔌 Đã hoàn tất và ngắt kết nối database!');
}

runSeed().catch(err => {
  console.error('❌ Lỗi trong quá trình tạo seed:', err);
  process.exit(1);
});
