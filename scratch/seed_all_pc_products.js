const connectDB = require('../config/db');
const ProductModel = require('../models/Product');
const CategoryModel = require('../models/Category');
const BrandModel = require('../models/Brand');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { Image: ImageModel } = require('../models/BannerPaymentImage');

async function seedAllPCProducts() {
  await connectDB();
  console.log('--- Start seeding complete real products for all categories into DB ---');

  async function getOrCreateBrand(name, slug) {
    let b = await BrandModel.findOne({ $or: [{ name: new RegExp(name, 'i') }, { slug }] });
    if (!b) {
      b = new BrandModel({ name, slug });
      await b.save();
    }
    return b;
  }

  async function getOrCreateCat(name, slug) {
    let c = await CategoryModel.findOne({ $or: [{ slug }, { name: new RegExp(name, 'i') }] });
    if (!c) {
      c = new CategoryModel({ name, slug });
      await c.save();
    }
    return c;
  }

  const intel = await getOrCreateBrand('Intel', 'intel');
  const amd = await getOrCreateBrand('AMD', 'amd');
  const nvidia = await getOrCreateBrand('NVIDIA', 'nvidia');
  const asus = await getOrCreateBrand('ASUS', 'asus');
  const msi = await getOrCreateBrand('MSI', 'msi');
  const giga = await getOrCreateBrand('GIGABYTE', 'gigabyte');
  const corsair = await getOrCreateBrand('Corsair', 'corsair');
  const gskill = await getOrCreateBrand('G.Skill', 'gskill');
  const samsung = await getOrCreateBrand('Samsung', 'samsung');
  const nzxt = await getOrCreateBrand('NZXT', 'nzxt');
  const logitech = await getOrCreateBrand('Logitech', 'logitech');
  const razer = await getOrCreateBrand('Razer', 'razer');
  const lg = await getOrCreateBrand('LG', 'lg');

  const monitorCat = await getOrCreateCat('Màn hình', 'monitor');
  const peripheralCat = await getOrCreateCat('Bàn phím • Chuột', 'peripheral');
  const extraCat = await getOrCreateCat('Phụ kiện khác', 'extra');
  const ramCat = await getOrCreateCat('RAM', 'ram');
  const cpuCat = await getOrCreateCat('CPU', 'cpu');
  const gpuCat = await getOrCreateCat('VGA / GPU', 'gpu');
  const mbCat = await getOrCreateCat('Mainboard', 'mainboard');
  const storageCat = await getOrCreateCat('Ổ cứng', 'storage');
  const psuCat = await getOrCreateCat('Nguồn máy tính', 'psu');
  const coolingCat = await getOrCreateCat('Tản nhiệt', 'cooling');
  const caseCat = await getOrCreateCat('Vỏ case', 'case');

  async function ensureProduct({ name, slug, price, sale_price = 0, short_desc, description, category, brand, imgUrl }) {
    let prod = await ProductModel.findOne({ slug });
    if (!prod) {
      prod = new ProductModel({
        name,
        slug,
        price,
        sale: sale_price > 0 ? Math.round(((price - sale_price) / price) * 100) : 0,
        short_desc,
        description,
        status: 'active',
        cat_id: category._id,
        brand_id: brand._id,
      });
      await prod.save();
    } else {
      prod.price = price;
      prod.short_desc = short_desc;
      prod.description = description;
      prod.cat_id = category._id;
      prod.brand_id = brand._id;
      await prod.save();
    }

    let variant = await ProductVariantModel.findOne({ p_id: prod._id });
    if (!variant) {
      variant = new ProductVariantModel({
        p_id: prod._id,
        sku: 'SKU-' + slug.toUpperCase().slice(0, 15),
        variant_name: 'Mặc định',
        price,
        sale_price,
        stock_quantity: 20
      });
      await variant.save();
    }

    if (imgUrl) {
      let img = await ImageModel.findOne({ p_id: prod._id });
      if (!img) {
        img = new ImageModel({
          p_id: prod._id,
          url: imgUrl,
          is_main: true
        });
        await img.save();
      }
    }
    return prod;
  }

  // Monitors
  await ensureProduct({
    name: 'LG 27GP850-B 27" QHD 165Hz Nano IPS',
    slug: 'lg-27gp850-b-27-qhd-165hz-nano-ips',
    price: 8490000,
    sale_price: 7990000,
    short_desc: '27" QHD 2560×1440 · 165Hz · 1ms · Nano IPS · FreeSync & G-Sync',
    description: `# LG 27GP850-B\n\nMàn hình chơi game đỉnh cao 27 inch độ phân giải QHD 2K với tấm nền Nano IPS 1ms cực sắc nét.\n`,
    category: monitorCat,
    brand: lg,
    imgUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'
  });

  await ensureProduct({
    name: 'ASUS ROG Swift 27" 4K 160Hz OLED PG27AQDM',
    slug: 'asus-rog-swift-27-4k-160hz-oled',
    price: 19990000,
    sale_price: 18990000,
    short_desc: '27" 4K UHD · 160Hz · 0.03ms · Tấm nền OLED · G-Sync Compatible',
    description: `# ASUS ROG Swift PG27AQDM OLED\n\nMàn hình gaming OLED siêu chuẩn màu, phản hồi cực nhanh 0.03ms.\n`,
    category: monitorCat,
    brand: asus,
    imgUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500'
  });

  await ensureProduct({
    name: 'Samsung Odyssey G5 34" UWQHD 165Hz Cong 1000R',
    slug: 'samsung-odyssey-g5-34-uwqhd-165hz',
    price: 11990000,
    sale_price: 10490000,
    short_desc: '34" UltraWide QHD 3440×1440 · 165Hz · Cong 1000R · FreeSync Premium',
    description: `# Samsung Odyssey G5 34"\n\nMàn hình cong UltraWide siêu rộng cho trải nghiệm làm việc và giải trí sống động.\n`,
    category: monitorCat,
    brand: samsung,
    imgUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500'
  });

  // Peripherals
  await ensureProduct({
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    slug: 'logitech-g-pro-x-superlight-2',
    price: 3890000,
    sale_price: 3490000,
    short_desc: 'Chuột gaming không dây siêu nhẹ 60g, Mắt đọc HERO 2 32.000 DPI, Switch LIGHTFORCE',
    description: `# Logitech G Pro X Superlight 2\n\nChuột esports đỉnh cao với trọng lượng siêu nhẹ 60g và kết nối không dây Lightspeed siêu tốc.\n`,
    category: peripheralCat,
    brand: logitech,
    imgUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500'
  });

  await ensureProduct({
    name: 'Razer BlackWidow V4 Pro RGB Mechanical Keyboard',
    slug: 'razer-blackwidow-v4-pro-rgb',
    price: 4990000,
    sale_price: 4490000,
    short_desc: 'Bàn phím cơ cao cấp Razer Green Switch, LED RGB Chroma, Kèm đệm kê tay nam nhung',
    description: `# Razer BlackWidow V4 Pro\n\nBàn phím cơ chơi game cao cấp đầy đủ phím multimedia và núm xoay Command Dial độc đáo.\n`,
    category: peripheralCat,
    brand: razer,
    imgUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'
  });

  // Extras
  await ensureProduct({
    name: 'Dây cáp bọc lưới Sleeved Extension Kit RGB ATX 24Pin + PCIe',
    slug: 'day-cap-boc-luoi-sleeved-extension-kit-rgb',
    price: 690000,
    sale_price: 590000,
    short_desc: 'Bộ dây cáp bọc lưới cao cấp cho PSU, chống cháy, dây 24pin ATX + CPU 8pin + PCIe 8pin',
    description: `# Dây cáp bọc lưới Sleeved Extension Kit RGB\n\nPhụ kiện trang trí dây nguồn PC rực rỡ và chuyên nghiệp.\n`,
    category: extraCat,
    brand: corsair,
    imgUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500'
  });

  await ensureProduct({
    name: 'NZXT RGB Fan Controller & Commander Hub',
    slug: 'nzxt-rgb-fan-controller-commander-hub',
    price: 890000,
    sale_price: 790000,
    short_desc: 'Hub điều khiển 8 quạt tản nhiệt và 4 kênh LED RGB qua phần mềm NZXT CAM',
    description: `# NZXT RGB Fan Controller\n\nHub điều khiển hệ thống quạt và LED RGB chuyên dụng.\n`,
    category: extraCat,
    brand: nzxt,
    imgUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500'
  });

  // Extra RAM products
  await ensureProduct({
    name: 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 5600MHz',
    slug: 'corsair-vengeance-rgb-ddr5-32gb-5600mhz',
    price: 3490000,
    sale_price: 3190000,
    short_desc: 'DDR5 32GB (2x16GB), Bus 5600MHz, CL36, LED RGB',
    description: `# Corsair Vengeance RGB DDR5 32GB\n\nBộ nhớ RAM DDR5 tốc độ cao với dải LED RGB đa vùng rực rỡ.\n`,
    category: ramCat,
    brand: corsair,
    imgUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500'
  });

  await ensureProduct({
    name: 'Kingston Fury Beast DDR4 16GB (1x16GB) 3200MHz',
    slug: 'kingston-fury-beast-ddr4-16gb-3200mhz',
    price: 1090000,
    sale_price: 990000,
    short_desc: 'DDR4 16GB (1x16GB), Bus 3200MHz, Tản nhiệt nhôm đen',
    description: `# Kingston Fury Beast DDR4 16GB\n\nRAM DDR4 phổ thông ổn định cao cho PC Intel và AMD.\n`,
    category: ramCat,
    brand: gskill,
    imgUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500'
  });

  console.log('✅ Successfully seeded all products for Monitor, Peripheral, Extra, RAM, and other categories in DB!');
  process.exit(0);
}

seedAllPCProducts();
