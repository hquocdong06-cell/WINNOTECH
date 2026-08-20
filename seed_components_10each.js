/**
 * SCRIPT SEED THÊM 10 SẢN PHẨM CHO 8 DANH MỤC LINH KIỆN PC:
 * 1. CPU (slug: cpu)
 * 2. GPU (slug: gpu)
 * 3. RAM (slug: ram)
 * 4. Ổ cứng (slug: storage)
 * 5. Mainboard (slug: mainboard)
 * 6. Nguồn (slug: psu)
 * 7. Tản nhiệt PC (slug: cooling)
 * 8. Case (slug: case)
 * 
 * Tổng cộng: 8 x 10 = 80 sản phẩm
 * Đầy đủ: Product, ProductVariant (2 biến thể), Attribute, AttributeValue, VariantAttribute, Image, CompatibilityMeta
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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedComponents() {
  console.log('🚀 Bắt đầu thêm 10 sản phẩm cho mỗi danh mục linh kiện...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB:', MONGO_URI);

  // 1. Lấy Categories
  const catSlugs = ['cpu', 'gpu', 'ram', 'storage', 'mainboard', 'psu', 'cooling', 'case'];
  const categories = {};
  for (const slug of catSlugs) {
    const cat = await CategoryModel.findOne({ slug });
    if (cat) categories[slug] = cat;
  }

  // 2. Lấy Brands
  const brands = {};
  const brandDocs = await BrandModel.find().lean();
  brandDocs.forEach(b => { brands[b.slug] = b; });

  // 3. Lấy hoặc tạo Attributes
  let attrColor = await Attribute.findOne({ name: 'Màu sắc' }) || await Attribute.create({ name: 'Màu sắc' });
  let attrVer = await Attribute.findOne({ name: 'Phiên bản' }) || await Attribute.create({ name: 'Phiên bản' });
  let attrWarranty = await Attribute.findOne({ name: 'Bảo hành' }) || await Attribute.create({ name: 'Bảo hành' });

  const getAttrVal = async (attrId, val) => {
    let doc = await AttributeValue.findOne({ value: val, id_attribute: attrId });
    if (!doc) doc = await AttributeValue.create({ value: val, id_attribute: attrId });
    return doc;
  };

  const valBlack = await getAttrVal(attrColor._id, 'Đen (Black)');
  const valWhite = await getAttrVal(attrColor._id, 'Trắng (White)');
  const valStd = await getAttrVal(attrVer._id, 'Bản Tiêu Chuẩn');
  const valPro = await getAttrVal(attrVer._id, 'Bản Cao Cấp OC');
  const valW36 = await getAttrVal(attrWarranty._id, '36 Tháng Chính Hãng');

  // 4. Danh sách định nghĩa 10 sản phẩm cho mỗi danh mục
  const componentProducts = {
    // 1. CPU (10 SP)
    cpu: [
      { name: 'CPU Intel Core i5-13400F (Up to 4.6GHz, 10C/16T, LGA1700)', brand: 'intel', price: 4790000, socket: 'LGA1700', tdp: 65, short_desc: '10C/16T, Turbo 4.6GHz, LGA1700, 20MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_intel/image_1.png' },
      { name: 'CPU Intel Core i7-13700K (Up to 5.4GHz, 16C/24T, LGA1700)', brand: 'intel', price: 9890000, socket: 'LGA1700', tdp: 125, short_desc: '16C/24T, Turbo 5.4GHz, LGA1700, 30MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_intel/image_2.png' },
      { name: 'CPU Intel Core i9-14900K (Up to 6.0GHz, 24C/32T, LGA1700)', brand: 'intel', price: 14990000, socket: 'LGA1700', tdp: 125, short_desc: '24C/32T, Turbo 6.0GHz, LGA1700, 36MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_intel/image_3.png' },
      { name: 'CPU Intel Core i3-14100 (Up to 4.7GHz, 4C/8T, LGA1700)', brand: 'intel', price: 2990000, socket: 'LGA1700', tdp: 60, short_desc: '4C/8T, Turbo 4.7GHz, LGA1700, 12MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_intel/image_4.png' },
      { name: 'CPU Intel Core i5-14600K (Up to 5.3GHz, 14C/20T, LGA1700)', brand: 'intel', price: 7990000, socket: 'LGA1700', tdp: 125, short_desc: '14C/20T, Turbo 5.3GHz, LGA1700, 24MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_intel/image_5.png' },
      { name: 'CPU AMD Ryzen 5 7600X (Up to 5.3GHz, 6C/12T, AM5)', brand: 'amd', price: 5690000, socket: 'AM5', tdp: 105, short_desc: '6C/12T, Turbo 5.3GHz, Socket AM5, 32MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_amd/image_1.png' },
      { name: 'CPU AMD Ryzen 7 7700X (Up to 5.4GHz, 8C/16T, AM5)', brand: 'amd', price: 8290000, socket: 'AM5', tdp: 105, short_desc: '8C/16T, Turbo 5.4GHz, Socket AM5, 32MB Cache', img: 'http://localhost:3000/public/images/anh_cpu_amd/image_2.png' },
      { name: 'CPU AMD Ryzen 7 7800X3D (Up to 5.0GHz, 8C/16T, 3D V-Cache)', brand: 'amd', price: 9990000, socket: 'AM5', tdp: 120, short_desc: '8C/16T, Turbo 5.0GHz, 96MB 3D V-Cache, AM5', img: 'http://localhost:3000/public/images/anh_cpu_amd/image_3.png' },
      { name: 'CPU AMD Ryzen 9 7950X3D (Up to 5.7GHz, 16C/32T, 3D V-Cache)', brand: 'amd', price: 16500000, socket: 'AM5', tdp: 120, short_desc: '16C/32T, Turbo 5.7GHz, 128MB Cache, AM5', img: 'http://localhost:3000/public/images/anh_cpu_amd/image_4.png' },
      { name: 'CPU AMD Ryzen 9 9900X (Up to 5.6GHz, 12C/24T, AM5 Zen 5)', brand: 'amd', price: 12990000, socket: 'AM5', tdp: 120, short_desc: '12C/24T, Turbo 5.6GHz, Zen 5, Socket AM5', img: 'http://localhost:3000/public/images/anh_cpu_amd/image_5.png' }
    ],

    // 2. GPU (10 SP)
    gpu: [
      { name: 'VGA ASUS Dual GeForce RTX 4060 EVO OC 8GB GDDR6', brand: 'asus', price: 8490000, gpu_tier: 3, tdp: 115, short_desc: 'RTX 4060 8GB GDDR6, 2 Fan Axial-tech, DLSS 3', img: 'http://localhost:3000/public/images/anh_vga_asus/image_6.png' },
      { name: 'VGA ASUS TUF Gaming GeForce RTX 4070 Super 12GB GDDR6X', brand: 'asus', price: 18990000, gpu_tier: 4, tdp: 220, short_desc: 'RTX 4070 Super 12GB, 3 Fan TUF mát lạnh, Ray Tracing', img: 'http://localhost:3000/public/images/anh_vga_asus/image_7.png' },
      { name: 'VGA MSI GeForce RTX 4060 Ventus 2X Black 8GB OC', brand: 'msi', price: 7990000, gpu_tier: 3, tdp: 115, short_desc: 'RTX 4060 8GB, Thiết kế 2 quạt gọn gàng, Cân game 1080p', img: 'http://localhost:3000/public/images/anh_vga_msi/image_8.png' },
      { name: 'VGA MSI GeForce RTX 4070 Ti Gaming X Slim 12GB', brand: 'msi', price: 21500000, gpu_tier: 4, tdp: 285, short_desc: 'RTX 4070 Ti 12GB, Thiết kế Slim thanh mảnh, RGB Mystic', img: 'http://localhost:3000/public/images/anh_vga_msi/image_9.png' },
      { name: 'VGA MSI GeForce RTX 4080 Super GAMING X TRIO 16GB', brand: 'msi', price: 31900000, gpu_tier: 5, tdp: 320, short_desc: 'RTX 4080 Super 16GB, Chiến game 4K Max Settings', img: 'http://localhost:3000/public/images/anh_vga_msi/image_10.png' },
      { name: 'VGA Gigabyte GeForce RTX 4060 Eagle OC 8GB', brand: 'gigabyte', price: 8290000, gpu_tier: 3, tdp: 115, short_desc: 'RTX 4060 8GB, 3 Quạt Windforce làm mát tối ưu', img: 'http://localhost:3000/public/images/anh_vga_gigabyte/image_11.png' },
      { name: 'VGA Gigabyte GeForce RTX 4070 Ti Super AERO OC 16GB (White)', brand: 'gigabyte', price: 24900000, gpu_tier: 5, tdp: 285, short_desc: 'RTX 4070 Ti Super 16GB, Tông trắng AERO tinh tế sang trọng', img: 'http://localhost:3000/public/images/anh_vga_gigabyte/image_12.png' },
      { name: 'VGA ASUS ROG Strix GeForce RTX 4090 OC 24GB GDDR6X', brand: 'asus', price: 54900000, gpu_tier: 5, tdp: 450, short_desc: 'RTX 4090 24GB, Trùm cuối hiệu năng, Buồng hơi làm mát', img: 'http://localhost:3000/public/images/anh_vga_asus/image_13.png' },
      { name: 'VGA Gigabyte Radeon RX 7700 XT GAMING OC 12GB', brand: 'gigabyte', price: 12500000, gpu_tier: 4, tdp: 245, short_desc: 'Radeon RX 7700 XT 12GB, Băng thông cao, Chiến mượt 2K', img: 'http://localhost:3000/public/images/anh_vga_gigabyte/image_14.png' },
      { name: 'VGA ASUS Dual Radeon RX 7600 V2 OC Edition 8GB', brand: 'asus', price: 6990000, gpu_tier: 3, tdp: 165, short_desc: 'RX 7600 8GB, Giá mềm hiệu năng cực tốt phân khúc eSports', img: 'http://localhost:3000/public/images/anh_vga_asus/image_6.png' }
    ],

    // 3. RAM (10 SP)
    ram: [
      { name: 'RAM Kingston Fury Beast 16GB (1x16GB) DDR4 3200MHz', brand: 'kingston', price: 950000, ram_type: 'DDR4', short_desc: '16GB (1x16GB), DDR4 3200MHz, Tản nhiệt nhôm đen', img: 'http://localhost:3000/public/images/anh_ram_kingston/image_15.png' },
      { name: 'RAM Kingston Fury Beast RGB 32GB (2x16GB) DDR4 3200MHz', brand: 'kingston', price: 2190000, ram_type: 'DDR4', short_desc: '32GB (2x16GB), DDR4 3200MHz, LED RGB sống động', img: 'http://localhost:3000/public/images/anh_ram_kingston/image_16.png' },
      { name: 'RAM Kingston Fury Renegade RGB 32GB (2x16GB) DDR5 6000MHz', brand: 'kingston', price: 3490000, ram_type: 'DDR5', short_desc: '32GB (2x16GB), DDR5 6000MHz, XMP 3.0 & EXPO', img: 'http://localhost:3000/public/images/anh_ram_kingston/image_17.png' },
      { name: 'RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', brand: 'corsair', price: 990000, ram_type: 'DDR4', short_desc: '16GB (2x8GB), DDR4 3200MHz, Tản thấp chống cấn quạt', img: 'http://localhost:3000/public/images/anh_ram_corsair/image_18.png' },
      { name: 'RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 5600MHz Black', brand: 'corsair', price: 2890000, ram_type: 'DDR5', short_desc: '32GB (2x16GB), DDR5 5600MHz, iCUE RGB tùy biến', img: 'http://localhost:3000/public/images/anh_ram_corsair/image_19.png' },
      { name: 'RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz White', brand: 'corsair', price: 4590000, ram_type: 'DDR5', short_desc: '32GB (2x16GB), DDR5 6000MHz, Dòng Dominator đỉnh cao tông trắng', img: 'http://localhost:3000/public/images/anh_ram_corsair/image_20.png' },
      { name: 'RAM Corsair Vengeance RGB 64GB (2x32GB) DDR5 6000MHz', brand: 'corsair', price: 5890000, ram_type: 'DDR5', short_desc: '64GB (2x32GB), DDR5 6000MHz, Siêu dung lượng cho Render 3D', img: 'http://localhost:3000/public/images/anh_ram_corsair/image_21.png' },
      { name: 'RAM Kingston Fury Beast 16GB (1x16GB) DDR5 5600MHz', brand: 'kingston', price: 1350000, ram_type: 'DDR5', short_desc: '16GB (1x16GB), DDR5 5600MHz, Plug N Play tự ép xung', img: 'http://localhost:3000/public/images/anh_ram_kingston/image_15.png' },
      { name: 'RAM Kingston Fury Beast RGB 16GB (2x8GB) DDR4 3600MHz', brand: 'kingston', price: 1290000, ram_type: 'DDR4', short_desc: '16GB (2x8GB), DDR4 3600MHz, Hiệu ứng đèn RGB hồng ngoại', img: 'http://localhost:3000/public/images/anh_ram_kingston/image_16.png' },
      { name: 'RAM Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5 6200MHz', brand: 'corsair', price: 4290000, ram_type: 'DDR5', short_desc: '32GB (2x16GB), DDR5 6200MHz, Chip nhớ tuyển chọn ép xung cực bốc', img: 'http://localhost:3000/public/images/anh_ram_corsair/image_19.png' }
    ],

    // 4. Ổ CỨNG / STORAGE (10 SP)
    storage: [
      { name: 'SSD Samsung 980 500GB PCIe NVMe 3.0 M.2 2280', brand: 'samsung', price: 1290000, short_desc: 'Dung lượng 500GB, Tốc độ đọc 3.100MB/s, Ghi 2.600MB/s', img: 'http://localhost:3000/public/images/anh_o_cung/image_22.png' },
      { name: 'SSD Samsung 980 PRO 1TB PCIe Gen 4.0 x4 NVMe M.2', brand: 'samsung', price: 2490000, short_desc: 'Dung lượng 1TB, Đọc 7.000MB/s, Ghi 5.000MB/s, Chuẩn Gen 4', img: 'http://localhost:3000/public/images/anh_o_cung/image_23.png' },
      { name: 'SSD Samsung 990 PRO 2TB PCIe Gen 4.0 x4 NVMe', brand: 'samsung', price: 4690000, short_desc: 'Dung lượng 2TB, Đọc đỉnh cao 7.450MB/s, Ghi 6.900MB/s', img: 'http://localhost:3000/public/images/anh_o_cung/image_24.png' },
      { name: 'SSD Samsung 870 EVO 500GB 2.5 inch SATA III', brand: 'samsung', price: 1190000, short_desc: 'Dung lượng 500GB, Đọc 560MB/s, Ghi 530MB/s, Cắm cổng SATA', img: 'http://localhost:3000/public/images/anh_o_cung/image_25.png' },
      { name: 'SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2 2280', brand: 'kingston', price: 950000, short_desc: 'Dung lượng 500GB, Đọc 3.500MB/s, Ghi 2.100MB/s, Giá siêu hời', img: 'http://localhost:3000/public/images/anh_o_cung/image_26.png' },
      { name: 'SSD Kingston NV2 1TB PCIe 4.0 NVMe M.2 2280', brand: 'kingston', price: 1690000, short_desc: 'Dung lượng 1TB, Đọc 3.500MB/s, Ghi 2.800MB/s, Bền bỉ', img: 'http://localhost:3000/public/images/anh_o_cung/image_27.png' },
      { name: 'SSD Kingston KC3000 1TB PCIe 4.0 NVMe M.2 Cao Cấp', brand: 'kingston', price: 2650000, short_desc: 'Dung lượng 1TB, Đọc 7.000MB/s, Tản nhôm Graphene mỏng nhẹ', img: 'http://localhost:3000/public/images/anh_o_cung/image_28.png' },
      { name: 'SSD Samsung 990 PRO Heatsink 1TB PCIe 4.0 NVMe (Kèm Tản Nhiệt)', brand: 'samsung', price: 2890000, short_desc: 'Dung lượng 1TB, Kèm tản nhiệt kim loại nguyên khối, Chống tụt tốc', img: 'http://localhost:3000/public/images/anh_o_cung/image_29.png' },
      { name: 'SSD Kingston NV2 2TB PCIe 4.0 NVMe M.2', brand: 'kingston', price: 2990000, short_desc: 'Dung lượng 2TB, Lưu trữ game và dữ liệu nặng thả ga', img: 'http://localhost:3000/public/images/anh_o_cung/image_26.png' },
      { name: 'SSD Samsung 870 QVO 1TB 2.5 inch SATA III', brand: 'samsung', price: 1950000, short_desc: 'Dung lượng 1TB SATA 3, Thích hợp nâng cấp mở rộng cho laptop và PC', img: 'http://localhost:3000/public/images/anh_o_cung/image_25.png' }
    ],

    // 5. MAINBOARD (10 SP)
    mainboard: [
      { name: 'Mainboard MSI B760M GAMING PLUS WIFI DDR5', brand: 'msi', price: 3890000, socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'mATX', short_desc: 'Socket LGA1700, Hỗ trợ DDR5, WiFi 6E + Bluetooth 5.3', img: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
      { name: 'Mainboard MSI MAG B760 TOMAHAWK WIFI DDR4', brand: 'msi', price: 4790000, socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'ATX', short_desc: 'Socket LGA1700, 12+1+1 Duet Rail VRM, Tản nhiệt mở rộng', img: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
      { name: 'Mainboard MSI MAG Z790 TOMAHAWK WIFI DDR5', brand: 'msi', price: 6990000, socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', short_desc: 'Socket LGA1700, PCIe 5.0, 16+1+1 Phases 90A SPS', img: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
      { name: 'Mainboard ASUS TUF GAMING B760M-PLUS WIFI II DDR5', brand: 'asus', price: 4290000, socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'mATX', short_desc: 'Socket LGA1700, Linh kiện TUF chuẩn quân đội, WiFi 6E', img: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png' },
      { name: 'Mainboard ASUS ROG STRIX B760-A GAMING WIFI D4 (White)', brand: 'asus', price: 5490000, socket: 'LGA1700', ram_type: 'DDR4', form_factor: 'ATX', short_desc: 'Socket LGA1700, Tông trắng bạc ROG Strix, Aura Sync RGB', img: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png' },
      { name: 'Mainboard ASUS ROG MAXIMUS Z790 HERO DDR5', brand: 'asus', price: 16990000, socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', short_desc: 'Socket LGA1700, 20+1 Power Stages, Màn hình Polymo Lighting', img: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png' },
      { name: 'Mainboard MSI PRO B650M-A WIFI DDR5 (Socket AM5)', brand: 'msi', price: 3990000, socket: 'AM5', ram_type: 'DDR5', form_factor: 'mATX', short_desc: 'Socket AM5, Hỗ trợ CPU Ryzen 7000/8000/9000, DDR5 Boost', img: 'http://localhost:3000/public/images/anh_mainboard_msi/image_10.png' },
      { name: 'Mainboard ASUS TUF GAMING B650-PLUS WIFI DDR5 (AM5)', brand: 'asus', price: 5290000, socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', short_desc: 'Socket AM5, PCIe 5.0 M.2, Realtek 2.5Gb Ethernet, WiFi 6', img: 'http://localhost:3000/public/images/anh_mainboard_asus/image_10.png' },
      { name: 'Mainboard Gigabyte B650 AORUS ELITE AX ICE (White AM5)', brand: 'gigabyte', price: 5990000, socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', short_desc: 'Socket AM5, Trắng tinh khôi ICE Edition, 12+2+2 Phase nguồn', img: 'http://localhost:3000/public/images/anh_mainboard_gigabyte/image_10.png' },
      { name: 'Mainboard Gigabyte X670E AORUS MASTER DDR5 (AM5 Flagship)', brand: 'gigabyte', price: 12900000, socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', short_desc: 'Socket AM5, Chipset X670E cao cấp nhất, PCIe 5.0 x16 & M.2', img: 'http://localhost:3000/public/images/anh_mainboard_gigabyte/image_10.png' }
    ],

    // 6. NGUỒN / PSU (10 SP)
    psu: [
      { name: 'Nguồn Máy Tính Corsair CV650 650W 80 Plus Bronze', brand: 'corsair', price: 1390000, wattage: 650, short_desc: 'Công suất 650W, Chuẩn 80 Plus Bronze, Quạt 120mm êm ái', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
      { name: 'Nguồn Máy Tính Corsair CX750 750W 80 Plus Bronze', brand: 'corsair', price: 1690000, wattage: 750, short_desc: 'Công suất 750W, Hiệu suất trên 88%, Dây cáp đen phẳng', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' },
      { name: 'Nguồn Máy Tính Corsair RM750e 750W 80 Plus Gold Full Modular (ATX 3.0)', brand: 'corsair', price: 2790000, wattage: 750, short_desc: 'Công suất 750W, Chuẩn 80 Plus Gold, Chuẩn nguồn ATX 3.0 & PCIe 5.0', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
      { name: 'Nguồn Máy Tính Corsair RM850x 850W 80 Plus Gold Full Modular', brand: 'corsair', price: 3490000, wattage: 850, short_desc: 'Công suất 850W, Tụ điện 100% Nhật Bản 105°C, Chế độ Zero RPM', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' },
      { name: 'Nguồn Máy Tính Corsair RM1000e 1000W 80 Plus Gold ATX 3.0', brand: 'corsair', price: 4290000, wattage: 1000, short_desc: 'Công suất 1000W, Cáp 12VHPWR cấp điện trực tiếp RTX 4090', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
      { name: 'Nguồn Máy Tính MSI MAG A650BN 650W 80 Plus Bronze', brand: 'msi', price: 1290000, wattage: 650, short_desc: 'Công suất 650W, Đạt chuẩn 80 Plus Bronze, Mạch bảo vệ DC to DC', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' },
      { name: 'Nguồn Máy Tính MSI MAG A750GL PCIE5 750W 80 Plus Gold Full Modular', brand: 'msi', price: 2690000, wattage: 750, short_desc: 'Công suất 750W, Cáp nguồn PCIe 5.0 chuẩn màu vàng chống lỏng chân cắm', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
      { name: 'Nguồn Máy Tính MSI MAG A850GL PCIE5 850W 80 Plus Gold', brand: 'msi', price: 3190000, wattage: 850, short_desc: 'Công suất 850W, Hỗ trợ GPU thế hệ mới, Kích thước nhỏ gọn 140mm', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' },
      { name: 'Nguồn Máy Tính ASUS TUF Gaming 750W 80 Plus Bronze', brand: 'asus', price: 1890000, wattage: 750, short_desc: 'Công suất 750W, Phủ lớp bảo vệ PCB chống bụi bẩn và ẩm mốc', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png' },
      { name: 'Nguồn Máy Tính ASUS ROG Thor 1000W Platinum II EVA Edition', brand: 'asus', price: 8990000, wattage: 1000, short_desc: 'Công suất 1000W, Chuẩn 80 Plus Platinum, Màn hình OLED hiển thị công suất thực', img: 'http://localhost:3000/public/images/anh_nguon_may_tinh/image_31.png' }
    ],

    // 7. TẢN NHIỆT / COOLING (10 SP)
    cooling: [
      { name: 'Tản nhiệt khí Deepcool AK400 Digital Black (Hiển thị nhiệt độ)', brand: 'winnotech', price: 890000, tdp: 220, short_desc: '4 ống đồng dẫn nhiệt, Màn hình LED kỹ thuật số theo dõi nhiệt độ CPU', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_32.png' },
      { name: 'Tản nhiệt khí Deepcool AK620 Digital White (2 Tháp Tản Nhiệt)', brand: 'winnotech', price: 1690000, tdp: 260, short_desc: '2 tháp tản nhiệt 6 ống đồng, Tông màu trắng tinh khôi, Cân tốt i7/Ryzen 7', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_33.png' },
      { name: 'Tản nhiệt nước AIO ASUS ROG RYUJIN III 360 ARGB (Màn Hình LCD 3.5 inch)', brand: 'asus', price: 8990000, tdp: 350, short_desc: 'Két nước 360mm, Màn hình LCD 3.5 inch 60Hz hiển thị GIF và thông số', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_34.png' },
      { name: 'Tản nhiệt nước AIO ASUS TUF Gaming LC II 360 ARGB', brand: 'asus', price: 3290000, tdp: 300, short_desc: 'Két nước 360mm, 3 quạt ARGB Gen 2 đồng bộ Aura Sync, Độ bền TUF', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_35.png' },
      { name: 'Tản nhiệt nước AIO MSI MAG CORELIQUID E240 ARGB White', brand: 'msi', price: 2390000, tdp: 250, short_desc: 'Két nước 240mm, Mặt block xoay 270 độ, Hiệu ứng nhật thực Eclipse đẹp mắt', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_36.png' },
      { name: 'Tản nhiệt nước AIO MSI MAG CORELIQUID E360 Black', brand: 'msi', price: 3190000, tdp: 320, short_desc: 'Két nước 360mm, Tăng diện tích tiếp xúc bề mặt đồng làm mát tức thì', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_37.png' },
      { name: 'Tản nhiệt nước AIO Corsair iCUE LINK H150i RGB 360mm', brand: 'corsair', price: 5490000, tdp: 320, short_desc: 'Két nước 360mm, Công nghệ iCUE LINK đi dây 1 sợi thông minh siêu gọn', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_38.png' },
      { name: 'Tản nhiệt nước AIO Corsair iCUE H100i RGB ELITE 240mm', brand: 'corsair', price: 3190000, tdp: 260, short_desc: 'Két nước 240mm, Quạt AirGuide định hướng luồng gió tập trung', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_39.png' },
      { name: 'Tản nhiệt khí Thermalright Peerless Assassin 120 SE ARGB', brand: 'winnotech', price: 790000, tdp: 245, short_desc: 'Vua tản nhiệt khí giá rẻ, 6 ống đồng AGHP chống trọng lực', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_32.png' },
      { name: 'Tản nhiệt nước AIO Deepcool LT720 360mm Gương Vô Cực ARGB', brand: 'winnotech', price: 2890000, tdp: 300, short_desc: 'Két nước 360mm, Mặt block gương vô cực đa chiều 3D bắt mắt', img: 'http://localhost:3000/public/images/anh_tan_nhiet/image_34.png' }
    ],

    // 8. CASE (10 SP)
    case: [
      { name: 'Vỏ Case MSI MAG FORGE 120A AIRFLOW (Kèm 6 Quạt Auto RGB)', brand: 'msi', price: 1090000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Mặt lưới siêu thoáng khí, Kèm sẵn 6 quạt RGB, Mặt kính cường lực', img: 'http://localhost:3000/public/images/anh_case/image_40.png' },
      { name: 'Vỏ Case MSI MPG GUNGNIR 300R AIRFLOW Black', brand: 'msi', price: 3490000, form_factor: 'ATX', supported_ff: ['E-ATX', 'ATX', 'mATX', 'ITX'], short_desc: 'Hỗ trợ tản 360mm cả nóc và mặt trước, Kèm giá đỡ card VGA đa hướng', img: 'http://localhost:3000/public/images/anh_case/image_41.png' },
      { name: 'Vỏ Case ASUS TUF Gaming GT301 ARGB', brand: 'asus', price: 1990000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Mặt trước tổ ong, Dây đai TUF Gaming cá tính, Kèm 4 quạt tản nhiệt', img: 'http://localhost:3000/public/images/anh_case/image_40.png' },
      { name: 'Vỏ Case ASUS ROG Strix Helios GX601 RGB Flagship', brand: 'asus', price: 7990000, form_factor: 'ATX', supported_ff: ['E-ATX', 'ATX', 'mATX', 'ITX'], short_desc: 'Khung nhôm xước cao cấp, 3 mặt kính cường lực, Tay xách công thái học', img: 'http://localhost:3000/public/images/anh_case/image_41.png' },
      { name: 'Vỏ Case Corsair 4000D AIRFLOW Tempered Glass Black', brand: 'corsair', price: 1990000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Huyền thoại vỏ case thoáng khí, Hệ thống giấu dây RapidRoute thông minh', img: 'http://localhost:3000/public/images/anh_case/image_40.png' },
      { name: 'Vỏ Case Corsair 4000D AIRFLOW Tempered Glass White (Trắng)', brand: 'corsair', price: 2090000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Tông trắng tinh tế, Mặt kính cường lực trong suốt khoe trọn linh kiện ARGB', img: 'http://localhost:3000/public/images/anh_case/image_41.png' },
      { name: 'Vỏ Case Corsair 5000D CORE AIRFLOW Black', brand: 'corsair', price: 3490000, form_factor: 'ATX', supported_ff: ['E-ATX', 'ATX', 'mATX', 'ITX'], short_desc: 'Không gian rộng rãi, Lắp được tối đa 10 quạt 120mm hoặc 2 rad 360mm cùng lúc', img: 'http://localhost:3000/public/images/anh_case/image_40.png' },
      { name: 'Vỏ Case Bể Cá Jonsbo TK-1 White (Kính Cong 2 Mặt Liền Mạch)', brand: 'winnotech', price: 1890000, form_factor: 'mATX', supported_ff: ['mATX', 'ITX'], short_desc: 'Kính cong góc uốn liền mạch 2.5D, Tông màu trắng sang trọng bàn làm việc', img: 'http://localhost:3000/public/images/anh_case/image_41.png' },
      { name: 'Vỏ Case Bể Cá Montech King 95 PRO Black (Kèm 6 Quạt ARGB)', brand: 'winnotech', price: 3290000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Khung kính cong không cột cản tầm nhìn, Kèm sẵn 6 quạt quạt chém ngược ARGB', img: 'http://localhost:3000/public/images/anh_case/image_40.png' },
      { name: 'Vỏ Case NZXT H9 Flow Dual-Chamber Tempered Glass White', brand: 'winnotech', price: 3990000, form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'], short_desc: 'Thiết kế 2 khoang riêng biệt, Kính panoramic liền góc, Hút gió đáy lên đỉnh', img: 'http://localhost:3000/public/images/anh_case/image_41.png' }
    ]
  };

  let totalCreated = 0;
  for (const [slug, pList] of Object.entries(componentProducts)) {
    const cat = categories[slug];
    if (!cat) {
      console.log(`⚠️ Không tìm thấy category slug: ${slug}, bỏ qua.`);
      continue;
    }

    console.log(`\n⚙️ Đang thêm 10 sản phẩm cho danh mục: [${cat.name}] (${slug})...`);

    for (let idx = 0; idx < pList.length; idx++) {
      const p = pList[idx];
      const brand = brands[p.brand] || brands['winnotech'] || brandDocs[0];
      const pSlug = `${slugify(p.name)}-item-${idx + 1}`;

      // Xóa nếu trùng slug
      await ProductModel.deleteOne({ slug: pSlug });

      // Tạo Product
      const product = await ProductModel.create({
        name: p.name,
        slug: pSlug,
        thumnail: p.img,
        description: `Sản phẩm ${p.name} chính hãng chất lượng cao, bảo hành 36 tháng, tối ưu cho dàn PC gaming và đồ họa chuyên nghiệp.`,
        short_desc: p.short_desc,
        status: 'active',
        sale: idx % 3 === 0 ? 10 : 0,
        cat_id: cat._id,
        brand_id: brand._id,
        compatibility_meta: {
          socket: p.socket || null,
          ram_type: p.ram_type || null,
          form_factor: p.form_factor || null,
          supported_ff: p.supported_ff || [],
          tdp: p.tdp || null,
          wattage: p.wattage || null,
          gpu_tier: p.gpu_tier || null
        }
      });

      // Biến thể 1 (Tiêu chuẩn)
      const v1 = await ProductVariantModel.create({
        variant_name: 'Mặc định',
        price: p.price,
        sale_price: product.sale > 0 ? Math.round(p.price * (100 - product.sale) / 100) : 0,
        sku: `SKU-${slug.toUpperCase().slice(0, 3)}-${3000 + idx}`,
        stock_quantity: randInt(20, 80),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valBlack._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valStd._id });
      await VariantAttribute.create({ id_variants: v1._id, id_attribute_value: valW36._id });

      // Biến thể 2 (Bản cao cấp / Màu trắng)
      const v2Price = Math.round(p.price * 1.08);
      const v2 = await ProductVariantModel.create({
        variant_name: 'Bản Cao Cấp (White / OC)',
        price: v2Price,
        sale_price: product.sale > 0 ? Math.round(v2Price * (100 - product.sale) / 100) : 0,
        sku: `SKU-${slug.toUpperCase().slice(0, 3)}-${4000 + idx}`,
        stock_quantity: randInt(10, 40),
        status: 'active',
        p_id: product._id
      });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valWhite._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valPro._id });
      await VariantAttribute.create({ id_variants: v2._id, id_attribute_value: valW36._id });

      // Ảnh sản phẩm
      await ImageModel.create({ p_id: product._id, url: p.img, alt: `${p.name} - Ảnh chính`, is_main: true });
      await ImageModel.create({ p_id: product._id, url: p.img, alt: `${p.name} - Ảnh phụ`, is_main: false });

      totalCreated++;
    }
  }

  console.log(`\n🎉 Đã thêm thành công ${totalCreated} sản phẩm vào 8 danh mục linh kiện chính!`);
  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối database!');
}

seedComponents().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
