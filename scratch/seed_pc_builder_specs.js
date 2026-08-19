const connectDB = require('../config/db');
const ProductModel = require('../models/Product');
const CategoryModel = require('../models/Category');
const BrandModel = require('../models/Brand');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');

async function seedSpecs() {
  await connectDB();
  console.log('--- Start updating & seeding PC Builder Technical Specs ---');

  const cpuCat = await CategoryModel.findOne({ slug: 'cpu' });
  const gpuCat = await CategoryModel.findOne({ slug: 'gpu' });
  const mbCat  = await CategoryModel.findOne({ slug: 'mainboard' });
  const ramCat = await CategoryModel.findOne({ slug: 'ram' });
  const ssdCat = await CategoryModel.findOne({ slug: 'storage' });
  const psuCat = await CategoryModel.findOne({ slug: 'psu' });
  const clrCat = await CategoryModel.findOne({ slug: 'cooling' });
  const caseCat= await CategoryModel.findOne({ slug: 'case' });

  const intelBrand = await BrandModel.findOne({ name: /Intel/i }) || (await BrandModel.findOne({}));
  const amdBrand   = await BrandModel.findOne({ name: /AMD/i }) || (await BrandModel.findOne({}));
  const asusBrand  = await BrandModel.findOne({ name: /ASUS/i }) || (await BrandModel.findOne({}));
  const gigaBrand  = await BrandModel.findOne({ name: /Gigabyte/i }) || asusBrand;
  const msiBrand   = await BrandModel.findOne({ name: /MSI/i }) || asusBrand;

  // 1. MSI MAG B650 Tomahawk WiFi (ATX, AM5, 4 Khe RAM, 2 Khe PCIe x16 VGA)
  await ProductModel.updateOne(
    { name: /B650 Tomahawk/i },
    {
      $set: {
        short_desc: 'Socket AM5, Form ATX, Hỗ trợ RAM DDR5 (4 Khe RAM), 2 Khe PCIe x16 VGA, 3x M.2 NVMe',
        description: `# MSI MAG B650 Tomahawk WiFi\n\nBo mạch chủ chipset AMD B650 Socket AM5 cao cấp hỗ trợ RAM DDR5 và PCIe 5.0.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | AM5 |\n| **Chuẩn Kích Thước (Form Factor)** | ATX |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n| **Số Khe RAM** | 4 Khe RAM (Tối đa 192GB) |\n| **Dung Lượng RAM Tối Đa** | 192GB |\n| **Số Khe PCIe / VGA** | 2 Khe PCIe x16 (VGA) |\n| **Số Khe M.2 NVMe** | 3 Khe M.2 PCIe 4.0/5.0 |\n| **Chuẩn PCIe** | PCIe 5.0 x16 |\n`
      }
    }
  );

  // 2. ASUS ROG Strix B760-F Gaming WiFi (ATX, LGA1700, 4 Khe RAM, 2 Khe PCIe x16 VGA)
  await ProductModel.updateOne(
    { name: /B760-F Gaming/i },
    {
      $set: {
        short_desc: 'Socket LGA1700, Form ATX, Hỗ trợ RAM DDR5 (4 Khe RAM), 2 Khe PCIe x16 VGA, 3x M.2 NVMe',
        description: `# ASUS ROG Strix B760-F Gaming WiFi\n\nMainboard Intel LGA1700 dành cho CPU thế hệ 12, 13, 14 với dàn VRM 16+1 Phase cực mát.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | LGA1700 |\n| **Chuẩn Kích Thước (Form Factor)** | ATX |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n| **Số Khe RAM** | 4 Khe RAM (Tối đa 192GB) |\n| **Dung Lượng RAM Tối Đa** | 192GB |\n| **Số Khe PCIe / VGA** | 2 Khe PCIe x16 (VGA) |\n| **Số Khe M.2 NVMe** | 3 Khe M.2 PCIe 4.0 |\n| **Chuẩn PCIe** | PCIe 5.0 x16 |\n`
      }
    }
  );

  // 3. ASUS ROG Strix B650E-I Gaming WiFi (Mini-ITX, AM5, 2 Khe RAM, 1 Khe PCIe x16 VGA)
  let itxMB = await ProductModel.findOne({ name: /B650E-I/i });
  if (!itxMB) {
    itxMB = new ProductModel({
      name: 'ASUS ROG Strix B650E-I Gaming WiFi (Mini-ITX)',
      slug: 'asus-rog-strix-b650e-i-gaming-wifi',
      sale: 0,
      price: 7490000,
      short_desc: 'Socket AM5, Form Mini-ITX, Hỗ trợ RAM DDR5 (2 Khe RAM), 1 Khe PCIe x16 VGA',
      description: `# ASUS ROG Strix B650E-I Gaming WiFi\n\nBo mạch chủ Mini-ITX nhỏ gọn siêu cao cấp cho CPU AMD Ryzen AM5, trang bị PCIe 5.0 x16 và 2 khe cắm RAM DDR5.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | AM5 |\n| **Chuẩn Kích Thước (Form Factor)** | Mini-ITX (ITX) |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n| **Số Khe RAM** | 2 Khe RAM (Tối đa 96GB) |\n| **Dung Lượng RAM Tối Đa** | 96GB |\n| **Số Khe PCIe / VGA** | 1 Khe PCIe 5.0 x16 (VGA) |\n| **Số Khe M.2 NVMe** | 2 Khe M.2 PCIe 5.0 |\n`,
      cat_id: mbCat?._id,
      brand_id: asusBrand?._id,
    });
    await itxMB.save();

    const vItx = new ProductVariantModel({
      p_id: itxMB._id,
      sku: 'MB-B650E-ITX-' + Date.now(),
      variant_name: 'Mặc định',
      price: 7490000,
      sale_price: 0,
      stock_quantity: 10
    });
    await vItx.save();
  }

  // 4. GIGABYTE B760M DS3H DDR4 (mATX, LGA1700, 4 Khe RAM, 1 Khe PCIe x16 VGA)
  let matxMB = await ProductModel.findOne({ name: /B760M DS3H/i });
  if (!matxMB) {
    matxMB = new ProductModel({
      name: 'GIGABYTE B760M DS3H DDR4 (mATX)',
      slug: 'gigabyte-b760m-ds3h-ddr4',
      sale: 5,
      price: 3190000,
      short_desc: 'Socket LGA1700, Form Micro-ATX, Hỗ trợ RAM DDR4 (4 Khe RAM), 1 Khe PCIe x16 VGA',
      description: `# GIGABYTE B760M DS3H DDR4\n\nMainboard Micro-ATX giá tốt cho CPU Intel thế hệ 12/13/14 hỗ trợ RAM DDR4 với 4 khe cắm.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | LGA1700 |\n| **Chuẩn Kích Thước (Form Factor)** | Micro-ATX (mATX) |\n| **Chuẩn RAM Hỗ Trợ** | DDR4 |\n| **Số Khe RAM** | 4 Khe RAM (Tối đa 128GB) |\n| **Dung Lượng RAM Tối Đa** | 128GB |\n| **Số Khe PCIe / VGA** | 1 Khe PCIe 4.0 x16 (VGA) |\n| **Số Khe M.2 NVMe** | 2 Khe M.2 PCIe 4.0 |\n`,
      cat_id: mbCat?._id,
      brand_id: gigaBrand?._id,
    });
    await matxMB.save();

    const vMatx = new ProductVariantModel({
      p_id: matxMB._id,
      sku: 'MB-B760M-GIGA-' + Date.now(),
      variant_name: 'Mặc định',
      price: 3390000,
      sale_price: 3190000,
      stock_quantity: 15
    });
    await vMatx.save();
  }

  console.log('✅ Successfully seeded Mainboard products with RAM slot & VGA slot specifications!');
  process.exit(0);
}

seedSpecs();
