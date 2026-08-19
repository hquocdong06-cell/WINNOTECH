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
  const nzxtBrand  = await BrandModel.findOne({ name: /NZXT/i }) || (await BrandModel.findOne({}));
  const corsairBrand = await BrandModel.findOne({ name: /Corsair/i }) || (await BrandModel.findOne({}));

  // 1. AMD Ryzen 7 7800X3D
  await ProductModel.updateOne(
    { name: /Ryzen 7 7800X3D/i },
    {
      $set: {
        short_desc: '8C/16T, Boost 5.0GHz, 96MB 3D V-Cache, Socket AM5, TDP 120W',
        description: `# AMD Ryzen 7 7800X3D\n\nBộ vi xử lý Gaming đỉnh cao hàng đầu thế giới tích hợp công nghệ 3D V-Cache 96MB độc quyền từ AMD.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket** | AM5 |\n| **Số Nhân / Luồng** | 8 Nhân / 16 Luồng |\n| **Xung Nhịp Boost** | 5.0 GHz |\n| **Bộ Nhớ Đệm (Cache)** | 96MB 3D V-Cache |\n| **Công Suất Tiêu Thụ (TDP)** | 120W |\n| **Đồ Họa Tích Hợp (iGPU)** | Có (AMD Radeon Graphics) |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n`
      }
    }
  );

  // 2. Intel Core i7-14700K
  await ProductModel.updateOne(
    { name: /i7-14700K/i },
    {
      $set: {
        short_desc: '20C/28T, Boost 5.6GHz, Socket LGA1700, TDP 125W, iGPU UHD 770',
        description: `# Intel Core i7-14700K\n\nBộ vi xử lý Intel Core thế hệ 14 Raptor Lake Refresh với 20 nhân (8 P-Core + 12 E-Core), 28 luồng.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket** | LGA1700 |\n| **Số Nhân / Luồng** | 20 Nhân / 28 Luồng |\n| **Xung Nhịp Boost** | 5.6 GHz |\n| **Bộ Nhớ Đệm (Cache)** | 33MB Intel Smart Cache |\n| **Công Suất Tiêu Thụ (TDP)** | 125W |\n| **Đồ Họa Tích Hợp (iGPU)** | Có (Intel UHD Graphics 770) |\n| **Chuẩn RAM Hỗ Trợ** | DDR4 / DDR5 |\n`
      }
    }
  );

  // 3. Seed / Update Intel Core i5-13400F (F-Series CPU for testing no iGPU rule)
  let i5_13400f = await ProductModel.findOne({ name: /i5-13400F/i });
  if (!i5_13400f) {
    i5_13400f = new ProductModel({
      name: 'Intel Core i5-13400F',
      slug: 'intel-core-i5-13400f',
      sale: 10,
      price: 4990000,
      short_desc: '10C/16T, Boost 4.6GHz, Socket LGA1700, TDP 65W, Không iGPU (Dòng F)',
      description: `# Intel Core i5-13400F\n\nBộ vi xử lý quốc dân cho các cấu hình PC Gaming tầm trung với 10 nhân 16 luồng mạnh mẽ.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket** | LGA1700 |\n| **Số Nhân / Luồng** | 10 Nhân / 16 Luồng |\n| **Xung Nhịp Boost** | 4.6 GHz |\n| **Công Suất Tiêu Thụ (TDP)** | 65W |\n| **Đồ Họa Tích Hợp (iGPU)** | Không (Dòng F - Cần VGA rời) |\n| **Chuẩn RAM Hỗ Trợ** | DDR4 / DDR5 |\n`,
      cat_id: cpuCat?._id,
      brand_id: intelBrand?._id,
    });
    await i5_13400f.save();

    const v1 = new ProductVariantModel({
      p_id: i5_13400f._id,
      sku: 'CPU-13400F-' + Date.now(),
      variant_name: 'Mặc định',
      price: 5490000,
      sale_price: 4990000,
      stock_quantity: 15
    });
    await v1.save();
  }

  // 4. ASUS ROG Strix GeForce RTX 4070 Ti Super
  await ProductModel.updateOne(
    { name: /4070 Ti Super/i },
    {
      $set: {
        short_desc: '16GB GDDR6X, TDP 285W, Nguồn khuyên dùng 750W, Dài 336mm',
        description: `# ASUS ROG Strix GeForce RTX 4070 Ti Super 16GB GDDR6X\n\nCard màn hình cao cấp thế hệ Ada Lovelace hỗ trợ DLSS 3.0 và Ray Tracing cực đỉnh.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Dung Lượng VRAM** | 16GB GDDR6X |\n| **Chiều Dài Card (Length)** | 336 mm |\n| **Công Suất Card (TDP)** | 285W |\n| **Nguồn Khuyên Dùng (Recommended PSU)** | 750W |\n| **Chuẩn Băng Thông PCIe** | PCIe 4.0 x16 |\n`
      }
    }
  );

  // 5. MSI GeForce RTX 4060 VENTUS 2X
  await ProductModel.updateOne(
    { name: /4060 VENTUS/i },
    {
      $set: {
        short_desc: '8GB GDDR6, TDP 115W, Nguồn khuyên dùng 550W, Dài 242mm',
        description: `# MSI GeForce RTX 4060 VENTUS 2X 8G OC\n\nCard đồ họa nhỏ gọn hiệu năng cao cho trải nghiệm Gaming 1080p Ultra settings mượt mà.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Dung Lượng VRAM** | 8GB GDDR6 |\n| **Chiều Dài Card (Length)** | 242 mm |\n| **Công Suất Card (TDP)** | 115W |\n| **Nguồn Khuyên Dùng (Recommended PSU)** | 550W |\n| **Chuẩn Băng Thông PCIe** | PCIe 4.0 x8 |\n`
      }
    }
  );

  // 6. MSI MAG B650 Tomahawk WiFi
  await ProductModel.updateOne(
    { name: /B650 Tomahawk/i },
    {
      $set: {
        short_desc: 'Socket AM5, Chuẩn ATX, Hỗ trợ RAM DDR5, 3x M.2 NVMe, PCIe 5.0',
        description: `# MSI MAG B650 Tomahawk WiFi\n\nBo mạch chủ chipset AMD B650 Socket AM5 cao cấp hỗ trợ RAM DDR5 và PCIe 5.0.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | AM5 |\n| **Chuẩn Kích Thước (Form Factor)** | ATX |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n| **Dung Lượng RAM Tối Đa** | 192GB (4 Khe RAM) |\n| **Số Khe M.2 NVMe** | 3 Khe M.2 PCIe 4.0/5.0 |\n| **Chuẩn PCIe** | PCIe 4.0 / PCIe 5.0 |\n`
      }
    }
  );

  // 7. ASUS ROG Strix B760-F Gaming WiFi
  await ProductModel.updateOne(
    { name: /B760-F Gaming/i },
    {
      $set: {
        short_desc: 'Socket LGA1700, Chuẩn ATX, Hỗ trợ RAM DDR5, 3x M.2 NVMe, WiFi 6E',
        description: `# ASUS ROG Strix B760-F Gaming WiFi\n\nMainboard Intel LGA1700 dành cho CPU thế hệ 12, 13, 14 với dàn VRM 16+1 Phase cực mát.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Socket CPU** | LGA1700 |\n| **Chuẩn Kích Thước (Form Factor)** | ATX |\n| **Chuẩn RAM Hỗ Trợ** | DDR5 |\n| **Dung Lượng RAM Tối Đa** | 192GB (4 Khe RAM) |\n| **Số Khe M.2 NVMe** | 3 Khe M.2 PCIe 4.0 |\n| **Chuẩn PCIe** | PCIe 5.0 x16 |\n`
      }
    }
  );

  // 8. G.Skill Trident Z5 RGB DDR5 32GB
  await ProductModel.updateOne(
    { name: /Trident Z5/i },
    {
      $set: {
        short_desc: 'DDR5 32GB (2x16GB), Bus 6000MHz, CL30, LED RGB uốn lượn',
        description: `# G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz\n\nBộ nhớ RAM DDR5 cao cấp với thanh LED RGB uốn lượn phong cách, bus 6000MHz CL30.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Loại RAM (RAM Type)** | DDR5 |\n| **Tổng Dung Lượng** | 32GB (2x16GB) |\n| **Tốc Độ Bus** | 6000 MHz |\n| **Độ Trễ Latency** | CL30 |\n`
      }
    }
  );

  // 9. Samsung 990 Pro NVMe M.2 SSD
  await ProductModel.updateOne(
    { name: /990 Pro/i },
    {
      $set: {
        short_desc: 'PCIe 4.0 NVMe M.2 2280, Đọc 7450MB/s, Ghi 6900MB/s',
        description: `# Samsung 990 Pro NVMe M.2 SSD 1TB\n\nỔ cứng SSD NVMe PCIe 4.0 tốc độ cao đỉnh bảng thế giới.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Chuẩn Giao Tiếp** | NVMe PCIe Gen 4.0 x4 M.2 2280 |\n| **Tốc Độ Đọc** | 7450 MB/s |\n| **Tốc Độ Ghi** | 6900 MB/s |\n`
      }
    }
  );

  // 10. Corsair RM850e 850W 80 Plus Gold
  await ProductModel.updateOne(
    { name: /RM850e/i },
    {
      $set: {
        short_desc: 'Công suất 850W, 80+ Gold, Full Modular, Chuẩn ATX 3.0 & PCIe 5.0 (12VHPWR)',
        description: `# Corsair RM850e 850W 80 Plus Gold\n\nBộ nguồn máy tính ATX 3.0 Full Modular cao cấp hỗ trợ cổng 12VHPWR cho card RTX 40 series.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Công Suất Nguồn (Wattage)** | 850W |\n| **Chứng Nhận Hiệu Suất** | 80 Plus Gold |\n| **Kiểu Dây** | Full Modular (Tháo rời toàn bộ) |\n| **Chuẩn Nguồn** | ATX 3.0 & PCIe 5.0 (Cáp 12VHPWR) |\n`
      }
    }
  );

  // 11. NZXT Kraken X63 RGB AIO 280mm
  await ProductModel.updateOne(
    { name: /Kraken X63/i },
    {
      $set: {
        short_desc: 'Tản nước AIO 280mm, Mặt vô cực RGB, Hỗ trợ Socket LGA1700, AM5, AM4',
        description: `# NZXT Kraken X63 RGB AIO 280mm\n\nTản nhiệt nước AIO mặt gương vô cực Infinity Mirror rực rỡ với Két nước Radiator 280mm.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Loại Tản Nhiệt** | AIO (Tản nước bằng chất lỏng) |\n| **Kích Thước Radiator** | 280mm (2x 140mm Quạt Aer RGB 2) |\n| **Socket Hỗ Trợ** | LGA1700, AM5, AM4, LGA1200 |\n`
      }
    }
  );

  // 12. Seed Case 1: NZXT H7 Flow RGB ATX Mid Tower Case
  let case1 = await ProductModel.findOne({ name: /NZXT H7 Flow/i });
  if (!case1) {
    case1 = new ProductModel({
      name: 'NZXT H7 Flow RGB ATX Mid Tower Case',
      slug: 'nzxt-h7-flow-rgb-atx-mid-tower-case',
      sale: 0,
      price: 3890000,
      short_desc: 'Chuẩn Form Factor ATX/mATX/ITX, Hỗ trợ VGA 400mm, Tản AIO 360mm, Tản khí 185mm',
      description: `# NZXT H7 Flow RGB ATX Mid Tower Case\n\nThùng máy tính thiết kế mặt lưới thoáng khí tối ưu luồng gió, hỗ trợ tản AIO 360mm và VGA dài.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Chuẩn Form Factor Hỗ Trợ** | ATX, mATX, ITX |\n| **Chiều Dài VGA Tối Đa** | 400 mm |\n| **Chiều Cao Tản Khí Tối Đa** | 185 mm |\n| **Kích Thước Radiator Hỗ Trợ** | 360mm, 280mm, 240mm, 120mm |\n`,
      cat_id: caseCat?._id,
      brand_id: nzxtBrand?._id,
    });
    await case1.save();

    const vCase1 = new ProductVariantModel({
      p_id: case1._id,
      sku: 'CASE-NZXT-H7-' + Date.now(),
      variant_name: 'Mặc định',
      price: 3890000,
      sale_price: 0,
      stock_quantity: 20
    });
    await vCase1.save();
  }

  // 13. Seed Case 2: Corsair 4000D Airflow ATX Mid Tower Case
  let case2 = await ProductModel.findOne({ name: /Corsair 4000D/i });
  if (!case2) {
    case2 = new ProductModel({
      name: 'Corsair 4000D Airflow ATX Mid Tower Case',
      slug: 'corsair-4000d-airflow-atx-mid-tower-case',
      sale: 15,
      price: 2290000,
      short_desc: 'Chuẩn Form Factor ATX/mATX/ITX, Hỗ trợ VGA 360mm, Tản AIO 360mm, Tản khí 170mm',
      description: `# Corsair 4000D Airflow ATX Mid Tower Case\n\nVỏ case PC gaming quốc dân phong cách hiện đại, luồng không khí vượt trội.\n\n## Thông Số Kỹ Thuật Chi Tiết\n\n| Thông số | Giá trị |\n| :--- | :--- |\n| **Chuẩn Form Factor Hỗ Trợ** | ATX, mATX, ITX |\n| **Chiều Dài VGA Tối Đa** | 360 mm |\n| **Chiều Cao Tản Khí Tối Đa** | 170 mm |\n| **Kích Thước Radiator Hỗ Trợ** | 360mm, 280mm, 240mm |\n`,
      cat_id: caseCat?._id,
      brand_id: corsairBrand?._id,
    });
    await case2.save();

    const vCase2 = new ProductVariantModel({
      p_id: case2._id,
      sku: 'CASE-CORSAIR-4000D-' + Date.now(),
      variant_name: 'Mặc định',
      price: 2690000,
      sale_price: 2290000,
      stock_quantity: 25
    });
    await vCase2.save();
  }

  console.log('✅ Successfully updated & seeded PC Builder technical specifications for all products in DB!');
  process.exit(0);
}

seedSpecs();
