/**
 * SEED PREBUILT PC SCRIPT — WINNOTech
 * Tạo & Đồng bộ sản phẩm cho 3 danh mục PC nguyên bộ:
 * 1. PC Gaming (slug: pc-gaming)
 * 2. PC Văn Phòng (slug: pc-van-phong)
 * 3. PC Đồ Họa (slug: pc-do-hoa)
 *
 * Yêu cầu:
 * - Mỗi danh mục có ít nhất 20 sản phẩm (tạo 25 sản phẩm mỗi danh mục = 75 sản phẩm PC)
 * - Mỗi sản phẩm có ÍT NHẤT 3 BIẾN THỂ (ProductVariant) với giá bán, SKU, tồn kho thực tế
 * - Đầy đủ các bảng liên quan: Attribute, AttributeValue, VariantAttribute, Image (>= 3 ảnh/SP)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CategoryModel = require('./models/Category');
const BrandModel = require('./models/Brand');
const ProductModel = require('./models/Product');
const { ProductVariant: ProductVariantModel, VariantAttribute } = require('./models/ProductVariant');
const { Attribute, AttributeValue } = require('./models/Attribute');
const { Image: ImageModel } = require('./models/BannerPaymentImage');

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

async function runPrebuiltSeed() {
  console.log('🚀 Bắt đầu tạo dữ liệu PC Nguyên Bộ (3 Biến thể / SP)...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB:', MONGO_URI);

  // 1. Lấy hoặc tạo 3 Danh mục PC nguyên bộ
  const pcCategories = [
    { name: 'PC gaming', slug: 'pc-gaming', image: '/public/images/anh_case/image_41.png' },
    { name: 'PC văn phòng', slug: 'pc-van-phong', image: '/public/images/anh_case/image_40.png' },
    { name: 'PC đồ họa', slug: 'pc-do-hoa', image: '/public/images/anh_case/image_42.png' },
  ];

  const catDocs = {};
  for (const cat of pcCategories) {
    let doc = await CategoryModel.findOne({ slug: cat.slug });
    if (!doc) {
      doc = await CategoryModel.create({
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        status: 'active'
      });
      console.log(`➕ Tạo danh mục mới: [${cat.slug}] ${cat.name}`);
    } else {
      doc.status = 'active';
      await doc.save();
      console.log(`✓ Đã có danh mục: [${cat.slug}] ${doc.name}`);
    }
    catDocs[cat.slug] = doc;
  }

  // 2. Lấy Brands
  const brandWinnotech = await BrandModel.findOne({ slug: 'winnotech' }) || await BrandModel.findOne({ slug: 'asus' }) || await BrandModel.findOne();
  const brandAsus = await BrandModel.findOne({ slug: 'asus' }) || brandWinnotech;
  const brandMsi = await BrandModel.findOne({ slug: 'msi' }) || brandWinnotech;

  // 3. Khởi tạo Attributes & AttributeValues phong phú cho PC nguyên bộ
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

  const attrSpecTier = await getOrCreateAttr('Tùy chọn Cấu hình (RAM & SSD)');
  const attrColor = await getOrCreateAttr('Màu sắc Vỏ Case');
  const attrCooling = await getOrCreateAttr('Hệ thống Tản nhiệt');
  const attrWarranty = await getOrCreateAttr('Gói Bảo Hành');

  // Giá trị thuộc tính
  const valSpecStandard = await getOrCreateVal(attrSpecTier._id, 'Cấu hình Tiêu chuẩn (16GB RAM / 500GB SSD NVMe)');
  const valSpecUpgraded = await getOrCreateVal(attrSpecTier._id, 'Cấu hình Nâng cấp (32GB RAM / 1TB SSD NVMe Gen4)');
  const valSpecUltimate = await getOrCreateVal(attrSpecTier._id, 'Cấu hình Cao cấp (64GB RAM / 2TB SSD NVMe Gen4)');

  const valSpecOffice1 = await getOrCreateVal(attrSpecTier._id, 'Bản Cơ bản (8GB RAM / 256GB SSD)');
  const valSpecOffice2 = await getOrCreateVal(attrSpecTier._id, 'Bản Tiêu chuẩn (16GB RAM / 512GB SSD)');
  const valSpecOffice3 = await getOrCreateVal(attrSpecTier._id, 'Bản Nâng cao (32GB RAM / 1TB SSD NVMe)');

  const valColorBlack = await getOrCreateVal(attrColor._id, 'Đen Huyền Bí (Black Edition)');
  const valColorWhite = await getOrCreateVal(attrColor._id, 'Trắng Tinh Khôi (White Edition)');
  const valColorSilver = await getOrCreateVal(attrColor._id, 'Bạc Titan (Silver Titanium)');

  const valCoolAir = await getOrCreateVal(attrCooling._id, 'Tản nhiệt khí Tower Fan');
  const valCoolAIO240 = await getOrCreateVal(attrCooling._id, 'Tản nhiệt nước AIO 240mm ARGB');
  const valCoolAIO360 = await getOrCreateVal(attrCooling._id, 'Tản nhiệt nước AIO 360mm Màn hình LCD');

  const valWarranty24 = await getOrCreateVal(attrWarranty._id, 'Bảo hành 24 Tháng tận nơi');
  const valWarranty36 = await getOrCreateVal(attrWarranty._id, 'Bảo hành 36 Tháng 1 đổi 1');

  // 4. Danh sách định nghĩa 25 sản phẩm cho mỗi Category
  const pcProductDefinitions = {
    // ═════════════════════════════════════════════════════════════
    // 🎮 PC GAMING (25 Sản phẩm)
    // ═════════════════════════════════════════════════════════════
    'pc-gaming': [
      {
        name: 'PC Gaming WINNOTech Dragon Knight I5 (Core i5-13400F / RTX 4060 8GB / B760)',
        basePrice: 16900000,
        cpu: 'Intel Core i5-13400F',
        vga: 'RTX 4060 8GB GDDR6',
        desc: 'Bộ PC Gaming tầm trung cực mạnh cân mượt mọi game eSports 240 FPS (LMHT, Valorant, CS2) và chiến mượt mà các siêu phẩm AAA như Black Myth Wukong, Cyberpunk 2077 trên độ phân giải Full HD / 2K.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 650, gpu_tier: 3,
        caseImgs: [40, 41, 12, 13]
      },
      {
        name: 'PC Gaming WINNOTech Cyber Titan R5 (Ryzen 5 7600 / RTX 4060 Ti 16GB / B650)',
        basePrice: 21500000,
        cpu: 'AMD Ryzen 5 7600',
        vga: 'RTX 4060 Ti 16GB GDDR6',
        desc: 'Sở hữu kiến trúc Zen 4 trên nền tảng socket AM5 mới nhất, hỗ trợ nâng cấp lâu dài cùng card đồ họa RTX 4060 Ti 16GB VRAM tha hồ chiến game nặng và mod texture đồ họa chất lượng cao.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 700, gpu_tier: 4,
        caseImgs: [41, 42, 11, 14]
      },
      {
        name: 'PC Gaming WINNOTech Shadow Phantom I7 (Core i7-14700F / RTX 4070 Super 12GB / B760)',
        basePrice: 32900000,
        cpu: 'Intel Core i7-14700F',
        vga: 'RTX 4070 Super 12GB GDDR6X',
        desc: 'Sức mạnh vượt trội với 20 nhân 28 luồng của chip i7 thế hệ 14 kết hợp sức mạnh vượt bậc của RTX 4070 Super, hỗ trợ công nghệ DLSS 3.5 Ray Reconstruction mang lại hình ảnh siêu thực.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 750, gpu_tier: 4,
        caseImgs: [42, 43, 13, 15]
      },
      {
        name: 'PC Gaming WINNOTech Apex Predator X3D (Ryzen 7 7800X3D / RTX 4070 Ti Super 16GB / X670)',
        basePrice: 43500000,
        cpu: 'AMD Ryzen 7 7800X3D',
        vga: 'RTX 4070 Ti Super 16GB GDDR6X',
        desc: 'Cỗ máy chơi game đỉnh cao với V-Cache 3D bá chủ gaming thế giới, 96MB L3 Cache giúp chỉ số FPS tối thiểu cực kỳ ổn định, không giật lag ở mọi độ phân giải 2K và 4K.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 850, gpu_tier: 5,
        caseImgs: [43, 40, 14, 16]
      },
      {
        name: 'PC Gaming WINNOTech Valkyrie White Edition (Core i7-14700K / RTX 4080 Super 16GB / Z790)',
        basePrice: 56900000,
        cpu: 'Intel Core i7-14700K',
        vga: 'RTX 4080 Super 16GB GDDR6X White',
        desc: 'Dàn PC Gaming Full Trắng tinh khôi tuyệt đẹp trang bị tản nhiệt nước AIO 360mm ARGB, vỏ case bể cá kính cong vô cực sang trọng và hiệu năng hủy diệt mọi tựa game ở độ phân giải 4K 144Hz.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 850, gpu_tier: 5,
        caseImgs: [40, 42, 15, 12]
      },
      {
        name: 'PC Gaming WINNOTech Inferno Godlike (Ryzen 7 7800X3D / RTX 4090 24GB Liquid / X670E)',
        basePrice: 85000000,
        cpu: 'AMD Ryzen 7 7800X3D',
        vga: 'NVIDIA RTX 4090 24GB GDDR6X',
        desc: 'Flagship Gaming PC đỉnh nóc kịch trần, không thỏa hiệp với card đồ họa mạnh nhất hành tinh RTX 4090 24GB VRAM, hệ thống tản nhiệt nước custom cao cấp và nguồn 1000W 80+ Platinum.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 1000, gpu_tier: 5,
        caseImgs: [41, 43, 16, 13]
      },
      {
        name: 'PC Gaming WINNOTech Starter Esports (Core i3-12100F / GTX 1650 4GB / H610)',
        basePrice: 9200000,
        cpu: 'Intel Core i3-12100F',
        vga: 'GeForce GTX 1650 4GB',
        desc: 'Cấu hình giá rẻ quốc dân cho học sinh sinh viên, chơi mượt mà LOL, FIFA Online 4, Valorant, CS2, Đột Kích và học tập online mượt mà.',
        socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'mATX', wattage: 500, gpu_tier: 2,
        caseImgs: [42, 40, 11, 15]
      },
      {
        name: 'PC Gaming WINNOTech Streamer Pro (Ryzen 7 7700 / RTX 4060 Ti 8GB / B650)',
        basePrice: 24900000,
        cpu: 'AMD Ryzen 7 7700',
        vga: 'RTX 4060 Ti 8GB GDDR6',
        desc: 'Tối ưu hóa toàn diện cho các Streamer và Creator với khả năng vừa chơi game đồ họa nặng vừa livestream đa nền tảng Facebook, Youtube, TikTok cùng lúc với bộ mã hóa NVENC AV1 thế hệ mới.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 700, gpu_tier: 4,
        caseImgs: [43, 41, 12, 14]
      },
      // Sinh thêm 17 cấu hình PC Gaming tiếp theo
      ...Array.from({ length: 17 }, (_, i) => {
        const series = ['Thunder Strike', 'Ghost Recon', 'Neon Samurai', 'Solaris Pro', 'Nova Prime', 'Vortex Elite', 'Ragnarok Master'][i % 7];
        const tierIdx = i % 4;
        const cpus = ['Intel Core i5-14400F', 'AMD Ryzen 5 7500F', 'Intel Core i7-13700K', 'AMD Ryzen 7 9700X'];
        const gpus = ['RTX 4060 8GB OC', 'RTX 4060 Ti 16GB Dual', 'RTX 4070 Super 12GB Trinity', 'RTX 4070 Ti Super 16GB Gaming X'];
        const prices = [17800000, 22900000, 31500000, 39900000];
        const imgBase = (i % 6) + 40;
        return {
          name: `PC Gaming WINNOTech ${series} Gen${i + 9} (${cpus[tierIdx]} / ${gpus[tierIdx]})`,
          basePrice: prices[tierIdx] + (i % 3) * 600000,
          cpu: cpus[tierIdx],
          vga: gpus[tierIdx],
          desc: `Cấu hình PC Gaming ${series} được tinh chỉnh tối ưu hóa phần cứng và cài đặt sẵn Windows 11 Gaming Mode, sẵn sàng chiến mượt mọi tựa game bom tấn hiện nay.`,
          socket: cpus[tierIdx].includes('Intel') ? 'LGA1700' : 'AM5',
          ram_type: 'DDR5',
          form_factor: 'ATX',
          wattage: 650 + tierIdx * 50,
          gpu_tier: 3 + (tierIdx % 3),
          caseImgs: [imgBase, ((imgBase + 1) % 43) + 1, ((imgBase + 2) % 43) + 1, ((imgBase + 3) % 43) + 1]
        };
      })
    ],

    // ═════════════════════════════════════════════════════════════
    // 💼 PC VĂN PHÒNG (25 Sản phẩm)
    // ═════════════════════════════════════════════════════════════
    'pc-van-phong': [
      {
        name: 'PC Văn Phòng WINNOTech Eco Office V1 (Core i3-12100 / UHD 730 / H610)',
        basePrice: 5890000,
        cpu: 'Intel Core i3-12100',
        vga: 'Intel UHD Graphics 730',
        desc: 'Máy tính để bàn văn phòng nhỏ gọn, tiết kiệm điện năng chỉ 65W, khởi động siêu nhanh trong 5 giây, phục vụ hoàn hảo công việc kế toán, văn thư, bán hàng Pos và lướt web đa tab.',
        socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'mATX', wattage: 450, gpu_tier: 1,
        caseImgs: [40, 11, 12, 13]
      },
      {
        name: 'PC Văn Phòng WINNOTech Standard Business V2 (Core i5-12400 / UHD 730 / B760)',
        basePrice: 7990000,
        cpu: 'Intel Core i5-12400',
        vga: 'Intel UHD Graphics 730',
        desc: 'Bộ vi xử lý 6 nhân 12 luồng mạnh mẽ giúp xử lý trơn tru các bảng tính Excel hàng chục vạn dòng, phần mềm quản lý kho, ERP và họp trực tuyến Zoom/Teams chuẩn HD.',
        socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'mATX', wattage: 500, gpu_tier: 1,
        caseImgs: [41, 12, 13, 14]
      },
      {
        name: 'PC Văn Phòng WINNOTech Pro Enterprise V3 (Core i5-13400 / UHD 730 / B760 DDR5)',
        basePrice: 10500000,
        cpu: 'Intel Core i5-13400',
        vga: 'Intel UHD Graphics 730',
        desc: 'Trang bị chuẩn bộ nhớ RAM DDR5 thế hệ mới tốc độ cao, khả năng đa nhiệm mượt mà hơn 30 ứng dụng làm việc cùng lúc không hề bị tràn RAM hay giật lag.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'mATX', wattage: 550, gpu_tier: 1,
        caseImgs: [42, 13, 14, 15]
      },
      {
        name: 'PC Văn Phòng WINNOTech Compact Slim ITX (AMD Ryzen 5 5600G / Vega 7 / B550)',
        basePrice: 7650000,
        cpu: 'AMD Ryzen 5 5600G',
        vga: 'Radeon Vega 7 Graphics',
        desc: 'Thiết kế thùng máy nhỏ gọn chuẩn Mini-ITX để gọn trên bàn làm việc, tích hợp nhân đồ họa Radeon Vega 7 mạnh mẽ hỗ trợ xuất 3 màn hình 4K cùng lúc.',
        socket: 'AM4', ram_type: 'DDR4', form_factor: 'ITX', wattage: 450, gpu_tier: 2,
        caseImgs: [43, 14, 15, 16]
      },
      {
        name: 'PC Văn Phòng WINNOTech Premium Executive (Core i7-13700 / UHD 770 / B760 WiFi)',
        basePrice: 15900000,
        cpu: 'Intel Core i7-13700',
        vga: 'Intel UHD Graphics 770',
        desc: 'Dòng PC cao cấp dành cho lãnh đạo và quản lý cấp cao, tích hợp Wi-Fi 6E không dây và Bluetooth 5.3 tốc độ cao, hoạt động êm ái tuyệt đối không phát ra tiếng ồn.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'mATX', wattage: 600, gpu_tier: 1,
        caseImgs: [40, 15, 16, 11]
      },
      // Sinh thêm 20 cấu hình PC Văn phòng tiếp theo
      ...Array.from({ length: 20 }, (_, i) => {
        const brands = ['Office Master', 'Slim Business', 'Smart Desk', 'OptiPlex Pro', 'Elite Desk'];
        const bName = brands[i % brands.length];
        const isIntel = i % 2 === 0;
        const cpu = isIntel ? `Intel Core i${(i % 3 === 0 ? 5 : 3)}-${12100 + (i % 3) * 1000}` : `AMD Ryzen 5 ${5600 + (i % 2) * 2000}G`;
        const price = 6200000 + (i % 5) * 850000;
        const imgBase = (i % 5) + 40;
        return {
          name: `PC Văn Phòng WINNOTech ${bName} Series ${i + 6} (${cpu})`,
          basePrice: price,
          cpu,
          vga: isIntel ? 'Intel UHD Graphics' : 'AMD Radeon Graphics',
          desc: `Bộ máy tính để bàn văn phòng ${bName} tối ưu cho công việc hàng ngày, độ bền linh kiện đạt chuẩn quân đội, tiết kiệm điện năng tối đa và vận hành bền bỉ 24/7.`,
          socket: isIntel ? 'LGA1700' : 'AM4',
          ram_type: i % 3 === 0 ? 'DDR5' : 'DDR4',
          form_factor: 'mATX',
          wattage: 450 + (i % 2) * 50,
          gpu_tier: 1,
          caseImgs: [imgBase, ((imgBase + 1) % 43) + 1, ((imgBase + 2) % 43) + 1, ((imgBase + 3) % 43) + 1]
        };
      })
    ],

    // ═════════════════════════════════════════════════════════════
    // 🎨 PC ĐỒ HỌA / WORKSTATION (25 Sản phẩm)
    // ═════════════════════════════════════════════════════════════
    'pc-do-hoa': [
      {
        name: 'PC Đồ Họa 3D WINNOTech Studio Master I7 (Core i7-14700K / RTX 4070 Super 12GB / Z790)',
        basePrice: 35900000,
        cpu: 'Intel Core i7-14700K',
        vga: 'RTX 4070 Super 12GB GDDR6X',
        desc: 'Cấu hình đồ họa chuyên sâu tối ưu cho 3Ds Max, Maya, Vray, Corona Render, SketchUp và Lumion 2024. Khả năng preview viewport thời gian thực mượt mà và render frame siêu tốc.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 750, gpu_tier: 4,
        caseImgs: [42, 43, 11, 13]
      },
      {
        name: 'PC Đồ Họa Dựng Phim WINNOTech Video Creator R9 (Ryzen 9 7900X / RTX 4070 Ti Super 16GB / B650)',
        basePrice: 45900000,
        cpu: 'AMD Ryzen 9 7900X',
        vga: 'RTX 4070 Ti Super 16GB GDDR6X',
        desc: 'Dành riêng cho Editor và Colorist chuyên nghiệp làm việc với timeline 4K/8K ProRes, RED RAW trên Adobe Premiere Pro, After Effects và DaVinci Resolve Studio.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 850, gpu_tier: 5,
        caseImgs: [43, 40, 12, 14]
      },
      {
        name: 'PC Đồ Họa Render Farm WINNOTech Architect Titan (Ryzen 9 7950X / RTX 4080 Super 16GB / X670E)',
        basePrice: 63900000,
        cpu: 'AMD Ryzen 9 7950X',
        vga: 'RTX 4080 Super 16GB GDDR6X',
        desc: 'Sức mạnh 16 nhân 32 luồng all-core 5.0GHz kết hợp cùng 16GB VRAM băng thông cực cao, rút ngắn thời gian render phối cảnh kiến trúc quy mô lớn từ hàng giờ xuống vài phút.',
        socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 1000, gpu_tier: 5,
        caseImgs: [40, 41, 13, 15]
      },
      {
        name: 'PC Đồ Họa Kỹ Thuật WINNOTech CAD & SolidWorks Pro (Core i5-14600K / RTX 4060 Ti 16GB / B760)',
        basePrice: 25500000,
        cpu: 'Intel Core i5-14600K',
        vga: 'RTX 4060 Ti 16GB GDDR6',
        desc: 'Chuyên dụng cho các kỹ sư cơ khí và xây dựng làm việc với AutoCAD, SolidWorks, Revit, Inventor, tính toán mô phỏng kết cấu độ chính xác cao.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 700, gpu_tier: 3,
        caseImgs: [41, 42, 14, 16]
      },
      {
        name: 'PC Đồ Họa AI Deep Learning WINNOTech Neural Beast (Core i9-14900K / RTX 4090 24GB / Z790)',
        basePrice: 89000000,
        cpu: 'Intel Core i9-14900K',
        vga: 'NVIDIA RTX 4090 24GB GDDR6X',
        desc: 'Trạm máy tính AI Workstation chuyên dụng để huấn luyện mô hình học sâu (Deep Learning), Fine-tune mô hình LLM, Stable Diffusion và xử lý dữ liệu Big Data quy mô doanh nghiệp.',
        socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 1200, gpu_tier: 5,
        caseImgs: [42, 43, 15, 11]
      },
      // Sinh thêm 20 cấu hình PC Đồ Họa tiếp theo
      ...Array.from({ length: 20 }, (_, i) => {
        const ranks = ['Vision Creator', 'Render Beast', 'Studio Ultra', 'Animation Pro', 'Architect V'];
        const rName = ranks[i % ranks.length];
        const isIntel = i % 2 === 0;
        const cpus = ['Intel Core i7-14700', 'AMD Ryzen 7 7700X', 'Intel Core i7-13700K', 'AMD Ryzen 9 7900X'];
        const gpus = ['RTX 4060 Ti 16GB', 'RTX 4070 12GB Dual', 'RTX 4070 Super 12GB', 'RTX 4070 Ti Super 16GB'];
        const prices = [27500000, 31900000, 36500000, 44900000];
        const tier = i % 4;
        const imgBase = (i % 6) + 40;
        return {
          name: `PC Đồ Họa WINNOTech ${rName} Series ${i + 6} (${cpus[tier]} / ${gpus[tier]})`,
          basePrice: prices[tier] + (i % 3) * 800000,
          cpu: cpus[tier],
          vga: gpus[tier],
          desc: `Cấu hình PC Đồ Họa ${rName} được lắp ráp với các linh kiện cao cấp, tản nhiệt mát mẻ bền bỉ, chạy driver NVIDIA Studio tối ưu hóa độ ổn định tối đa cho dân thiết kế.`,
          socket: cpus[tier].includes('Intel') ? 'LGA1700' : 'AM5',
          ram_type: 'DDR5',
          form_factor: 'ATX',
          wattage: 750 + tier * 50,
          gpu_tier: 4 + (tier % 2),
          caseImgs: [imgBase, ((imgBase + 1) % 43) + 1, ((imgBase + 2) % 43) + 1, ((imgBase + 3) % 43) + 1]
        };
      })
    ]
  };

  // ═════════════════════════════════════════════════════════════
  // 5. THỰC HIỆN TẠO SẢN PHẨM & 3 BIẾN THỂ CHO TỪNG SẢN PHẨM
  // ═════════════════════════════════════════════════════════════
  for (const [catSlug, pList] of Object.entries(pcProductDefinitions)) {
    const catDoc = catDocs[catSlug];
    console.log(`\n📦 Đang xử lý ${pList.length} sản phẩm cho danh mục: [${catSlug}] ${catDoc.name}...`);

    // Xóa các sản phẩm cũ của category này để tạo mới chuẩn 100%
    const oldProducts = await ProductModel.find({ cat_id: catDoc._id });
    for (const op of oldProducts) {
      const oldVariants = await ProductVariantModel.find({ p_id: op._id });
      for (const ov of oldVariants) {
        await VariantAttribute.deleteMany({ id_variants: ov._id });
      }
      await ProductVariantModel.deleteMany({ p_id: op._id });
      await ImageModel.deleteMany({ p_id: op._id });
      await ProductModel.deleteOne({ _id: op._id });
    }

    // Tạo mới từng sản phẩm
    for (let idx = 0; idx < pList.length; idx++) {
      const pDef = pList[idx];
      const prodSlug = `${slugify(pDef.name)}-${catSlug}-${idx + 1}`;

      const brandDoc = brandWinnotech;

      const mainImgUrl = `/public/images/anh_case/image_${pDef.caseImgs[0]}.png`;

      // 5.1 Tạo Product
      const product = await ProductModel.create({
        name: pDef.name,
        slug: prodSlug,
        thumnail: mainImgUrl,
        description: pDef.desc,
        short_desc: `${pDef.cpu}, ${pDef.vga}, Chuẩn ${pDef.form_factor}, Nguồn ${pDef.wattage}W`,
        status: 'active',
        sale: idx % 3 === 0 ? 10 : idx % 5 === 0 ? 15 : 0,
        cat_id: catDoc._id,
        brand_id: brandDoc._id,
        compatibility_meta: {
          socket: pDef.socket || null,
          ram_type: pDef.ram_type || 'DDR5',
          form_factor: pDef.form_factor || 'ATX',
          supported_ff: ['ATX', 'mATX', 'ITX'],
          tdp: 65 + (idx % 4) * 40,
          wattage: pDef.wattage,
          gpu_tier: pDef.gpu_tier
        }
      });

      // 5.2 Tạo ít nhất 4 hình ảnh trong bảng Image
      await ImageModel.insertMany([
        { p_id: product._id, url: `/public/images/anh_case/image_${pDef.caseImgs[0]}.png`, alt: `${product.name} - Ảnh chính diện (Front)`, is_main: true },
        { p_id: product._id, url: `/public/images/anh_case/image_${pDef.caseImgs[1]}.png`, alt: `${product.name} - Góc nghiêng kính cường lực (Side Glass)`, is_main: false },
        { p_id: product._id, url: `/public/images/anh_case/image_${pDef.caseImgs[2]}.png`, alt: `${product.name} - Mặt sau & Cổng kết nối (Rear I/O)`, is_main: false },
        { p_id: product._id, url: `/public/images/anh_case/image_${pDef.caseImgs[3]}.png`, alt: `${product.name} - Khoang nội thất & Đèn ARGB`, is_main: false }
      ]);

      // 5.3 Tạo ĐÚNG 3 BIẾN THỂ cho MỖI SẢN PHẨM:
      // --- BIẾN THỂ 1: Cấu hình Tiêu Chuẩn (Màu Đen) ---
      const price1 = pDef.basePrice;
      const salePrice1 = product.sale > 0 ? Math.round(price1 * (100 - product.sale) / 100) : 0;
      const v1 = await ProductVariantModel.create({
        variant_name: catSlug === 'pc-van-phong' ? 'Bản Tiêu Chuẩn (16GB RAM / 512GB SSD)' : 'Bản Tiêu Chuẩn (16GB RAM / 500GB SSD / Black)',
        price: price1,
        sale_price: salePrice1,
        sku: `SKU-${catSlug.toUpperCase().slice(0, 4)}-${1000 + idx}-STD`,
        stock_quantity: randInt(15, 50),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: catSlug === 'pc-van-phong' ? valSpecOffice2._id : valSpecStandard._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valColorBlack._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valCoolAir._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valWarranty24._id });

      // --- BIẾN THỂ 2: Cấu hình Nâng Cấp (32GB RAM / 1TB SSD / Tản AIO / Màu Đen) ---
      const price2 = Math.round(pDef.basePrice * (catSlug === 'pc-van-phong' ? 1.15 : 1.18));
      const salePrice2 = product.sale > 0 ? Math.round(price2 * (100 - product.sale) / 100) : 0;
      const v2 = await ProductVariantModel.create({
        variant_name: catSlug === 'pc-van-phong' ? 'Bản Nâng Cao (32GB RAM / 1TB SSD NVMe)' : 'Bản Nâng Cấp (32GB RAM / 1TB SSD NVMe Gen4 / AIO 240mm)',
        price: price2,
        sale_price: salePrice2,
        sku: `SKU-${catSlug.toUpperCase().slice(0, 4)}-${2000 + idx}-UPG`,
        stock_quantity: randInt(10, 35),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: catSlug === 'pc-van-phong' ? valSpecOffice3._id : valSpecUpgraded._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valColorBlack._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: catSlug === 'pc-van-phong' ? valCoolAir._id : valCoolAIO240._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valWarranty36._id });

      // --- BIẾN THỂ 3: Cấu hình Cao Cấp (64GB RAM / 2TB SSD / Full White / AIO 360mm LCD) ---
      const price3 = Math.round(pDef.basePrice * (catSlug === 'pc-van-phong' ? 1.3 : 1.35));
      const salePrice3 = product.sale > 0 ? Math.round(price3 * (100 - product.sale) / 100) : 0;
      const v3 = await ProductVariantModel.create({
        variant_name: catSlug === 'pc-van-phong' ? 'Bản Executive Full White (32GB RAM / 1TB SSD / Wi-Fi 6E)' : 'Bản Cao Cấp Full White (64GB RAM / 2TB SSD / AIO 360mm LCD)',
        price: price3,
        sale_price: salePrice3,
        sku: `SKU-${catSlug.toUpperCase().slice(0, 4)}-${3000 + idx}-ULT`,
        stock_quantity: randInt(8, 25),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v3._id, id_attribute_value: catSlug === 'pc-van-phong' ? valSpecOffice3._id : valSpecUltimate._id });
      await VariantAttribute.create({ id_variants: v3._id, id_attribute_value: valColorWhite._id });
      await VariantAttribute.create({ id_variants: v3._id, id_attribute_value: catSlug === 'pc-van-phong' ? valCoolAir._id : valCoolAIO360._id });
      await VariantAttribute.create({ id_variants: v3._id, id_attribute_value: valWarranty36._id });
    }
    console.log(`✅ Đã tạo hoàn tất 25 sản phẩm x 3 biến thể = 75 biến thể cho [${catSlug}]!`);
  }

  // ═════════════════════════════════════════════════════════════
  // 6. KIỂM TRA & TỔNG KẾT
  // ═════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 TỔNG KẾT DỮ LIỆU 3 DANH MỤC PC NGUYÊN BỘ:');
  console.log('═'.repeat(60));

  for (const cat of pcCategories) {
    const doc = catDocs[cat.slug];
    const products = await ProductModel.find({ cat_id: doc._id });
    let totalVar = 0;
    let totalImg = 0;
    for (const p of products) {
      const vCount = await ProductVariantModel.countDocuments({ p_id: p._id });
      const iCount = await ImageModel.countDocuments({ p_id: p._id });
      totalVar += vCount;
      totalImg += iCount;
    }
    console.log(`🖥️  [${cat.slug}] "${doc.name}":`);
    console.log(`    - Số lượng sản phẩm : ${products.length} SP`);
    console.log(`    - Tổng số biến thể  : ${totalVar} biến thể (Trung bình ${(totalVar / products.length).toFixed(1)} biến thể/SP)`);
    console.log(`    - Tổng số hình ảnh  : ${totalImg} ảnh (Trung bình ${(totalImg / products.length).toFixed(1)} ảnh/SP)`);
  }

  console.log('═'.repeat(60) + '\n');
  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối an toàn với MongoDB.');
  process.exit(0);
}

runPrebuiltSeed().catch(err => {
  console.error('❌ Lỗi khi thực thi seed prebuilt PC:', err);
  process.exit(1);
});
