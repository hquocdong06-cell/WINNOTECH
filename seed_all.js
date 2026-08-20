/**
 * SEED DATA — Tạo dữ liệu mẫu hoàn chỉnh cho TẤT CẢ các bảng trong Database WINNOTech
 * Bao gồm: EXACTLY 10 Sản phẩm chính với đầy đủ các bảng liên quan & biến thể (ProductVariants)
 * Chạy script: node seed_all.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ─── Import TẤT CẢ Models ─────────────────────────────────────
const UserModel = require("./models/User");
const DeliveryAddressModel = require("./models/DeliveryAddress");
const CategoryModel = require("./models/Category");
const BrandModel = require("./models/Brand");
const ProductModel = require("./models/Product");
const { ProductVariant, VariantAttribute } = require("./models/ProductVariant");
const { Attribute, AttributeValue } = require("./models/Attribute");
const { Banner, PaymentMethod, Image } = require("./models/BannerPaymentImage");
const CartItemModel = require("./models/Cartitem");
const { Order, OrderItem } = require("./models/Order");
const { Voucher, UserVoucher } = require("./models/Voucher");
const { Favorite, Compare, Review } = require("./models/FavoriteCompareReview");
const { BuildPC, BuildItem } = require("./models/BuildPc");
const { PostCategory, Post } = require("./models/Post");

async function seedAll() {
  try {
    console.log("🔄 Đang kết nối tới MongoDB database...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1/WINNOTech");
    console.log("✅ Kết nối DB thành công!");

    // ═══════════════════════════════════════════════════════════
    // XÓA DỮ LIỆU CỦA TẤT CẢ CÁC BẢNG (24 COLLECTIONS)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🗑️  Đang dọn dẹp xóa dữ liệu cũ của tất cả 24 bảng...");
    await Promise.all([
      UserModel.deleteMany({}),
      DeliveryAddressModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      BrandModel.deleteMany({}),
      ProductModel.deleteMany({}),
      ProductVariant.deleteMany({}),
      VariantAttribute.deleteMany({}),
      Attribute.deleteMany({}),
      AttributeValue.deleteMany({}),
      Banner.deleteMany({}),
      PaymentMethod.deleteMany({}),
      Image.deleteMany({}),
      CartItemModel.deleteMany({}),
      Order.deleteMany({}),
      OrderItem.deleteMany({}),
      Voucher.deleteMany({}),
      UserVoucher.deleteMany({}),
      Favorite.deleteMany({}),
      Compare.deleteMany({}),
      Review.deleteMany({}),
      BuildPC.deleteMany({}),
      BuildItem.deleteMany({}),
      PostCategory.deleteMany({}),
      Post.deleteMany({}),
    ]);
    console.log("✅ Đã xóa toàn bộ dữ liệu cũ!");

    // ═══════════════════════════════════════════════════════════
    // 1. BẢNG USERS (1 Admin + 3 Khách hàng)
    // ═══════════════════════════════════════════════════════════
    console.log("\n👤 1. Tạo dữ liệu bảng User...");
    const salt = await bcrypt.genSalt(10);
    const users = await UserModel.insertMany([
      {
        name: "Admin WINNOTECH",
        email: "admin@winnotech.vn",
        password: await bcrypt.hash("admin123", salt),
        phone: "0900000000",
        role: "admin",
        status: "active",
        avatar: "http://localhost:3000/public/images/avatars/admin.png"
      },
      {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: await bcrypt.hash("123456", salt),
        phone: "0901234567",
        role: "user",
        status: "active",
        avatar: "http://localhost:3000/public/images/avatars/user1.png"
      },
      {
        name: "Trần Thị B",
        email: "tranthib@gmail.com",
        password: await bcrypt.hash("123456", salt),
        phone: "0987654321",
        role: "user",
        status: "active",
        avatar: "http://localhost:3000/public/images/avatars/user2.png"
      },
      {
        name: "Lê Văn C",
        email: "levanc@gmail.com",
        password: await bcrypt.hash("123456", salt),
        phone: "0912345678",
        role: "user",
        status: "active",
        avatar: "http://localhost:3000/public/images/avatars/user3.png"
      },
    ]);
    const [userAdmin, userA, userB, userC] = users;
    console.log(`✅ Đã tạo ${users.length} Users`);

    // ═══════════════════════════════════════════════════════════
    // 2. BẢNG DELIVERY ADDRESS (Sổ địa chỉ giao hàng)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🏠 2. Tạo dữ liệu bảng DeliveryAddress...");
    const addresses = await DeliveryAddressModel.insertMany([
      {
        Name: "Nguyễn Văn A (Nhà riêng)",
        id_user: userA._id,
        Phone: "0901234567",
        address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        set_default: true
      },
      {
        Name: "Nguyễn Văn A (Văn phòng)",
        id_user: userA._id,
        Phone: "0901234567",
        address: "456 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        set_default: false
      },
      {
        Name: "Trần Thị B",
        id_user: userB._id,
        Phone: "0987654321",
        address: "789 Lạc Long Quân, Phường 11, Quận Tân Bình, TP. Hồ Chí Minh",
        set_default: true
      }
    ]);
    console.log(`✅ Đã tạo ${addresses.length} địa chỉ giao hàng`);

    // ═══════════════════════════════════════════════════════════
    // 3. BẢNG CATEGORIES (Danh mục linh kiện PC)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📁 3. Tạo dữ liệu bảng Category...");
    const categories = await CategoryModel.insertMany([
      { name: "CPU", slug: "cpu", image: "http://localhost:3000/public/images/anh_cpu_amd/image_1.png", status: "active" },
      { name: "GPU", slug: "gpu", image: "http://localhost:3000/public/images/anh_vga_asus/image_6.png", status: "active" },
      { name: "Mainboard", slug: "mainboard", image: "http://localhost:3000/public/images/anh_mainboard_msi/image_10.png", status: "active" },
      { name: "RAM", slug: "ram", image: "http://localhost:3000/public/images/anh_ram_kingston/image_15.png", status: "active" },
      { name: "Storage", slug: "storage", image: "http://localhost:3000/public/images/anh_o_cung/image_22.png", status: "active" },
      { name: "PSU", slug: "psu", image: "http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png", status: "active" },
      { name: "Cooling", slug: "cooling", image: "http://localhost:3000/public/images/anh_tan_nhiet/image_32.png", status: "active" },
      { name: "Case", slug: "case", image: "http://localhost:3000/public/images/anh_vo_case/image_40.png", status: "active" },
    ]);
    const [catCPU, catGPU, catMainboard, catRAM, catStorage, catPSU, catCooling, catCase] = categories;
    console.log(`✅ Đã tạo ${categories.length} Categories`);

    // ═══════════════════════════════════════════════════════════
    // 4. BẢNG BRANDS (Thương hiệu)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🏷️  4. Tạo dữ liệu bảng Brand...");
    const brands = await BrandModel.insertMany([
      { name: "AMD", slug: "amd", logo: "http://localhost:3000/public/images/brands/amd.png" },
      { name: "Intel", slug: "intel", logo: "http://localhost:3000/public/images/brands/intel.png" },
      { name: "NVIDIA", slug: "nvidia", logo: "http://localhost:3000/public/images/brands/nvidia.png" },
      { name: "ASUS", slug: "asus", logo: "http://localhost:3000/public/images/brands/asus.png" },
      { name: "MSI", slug: "msi", logo: "http://localhost:3000/public/images/brands/msi.png" },
      { name: "Gigabyte", slug: "gigabyte", logo: "http://localhost:3000/public/images/brands/gigabyte.png" },
      { name: "Corsair", slug: "corsair", logo: "http://localhost:3000/public/images/brands/corsair.png" },
      { name: "G.Skill", slug: "gskill", logo: "http://localhost:3000/public/images/brands/gskill.png" },
      { name: "Samsung", slug: "samsung", logo: "http://localhost:3000/public/images/brands/samsung.png" },
      { name: "Western Digital", slug: "western-digital", logo: "http://localhost:3000/public/images/brands/wd.png" },
      { name: "NZXT", slug: "nzxt", logo: "http://localhost:3000/public/images/brands/nzxt.png" },
      { name: "Cooler Master", slug: "cooler-master", logo: "http://localhost:3000/public/images/brands/coolermaster.png" },
    ]);
    const [brAMD, brIntel, brNVIDIA, brASUS, brMSI, brGigabyte, brCorsair, brGSkill, brSamsung, brWD, brNZXT, brCoolerMaster] = brands;
    console.log(`✅ Đã tạo ${brands.length} Brands`);

    // ═══════════════════════════════════════════════════════════
    // 5. BẢNG ATTRIBUTES & ATTRIBUTE VALUES (Thuộc tính & Giá trị thuộc tính)
    // ═══════════════════════════════════════════════════════════
    console.log("\n⚙️  5. Tạo dữ liệu bảng Attribute & AttributeValue...");
    const attrColor = await Attribute.create({ name: "Màu sắc" });
    const attrRAMSize = await Attribute.create({ name: "Dung lượng RAM" });
    const attrStorage = await Attribute.create({ name: "Dung lượng lưu trữ" });
    const attrSocket = await Attribute.create({ name: "Socket CPU" });
    const attrPackaging = await Attribute.create({ name: "Quy cách đóng gói" });

    const colorBlack = await AttributeValue.create({ value: "Đen", id_attribute: attrColor._id });
    const colorWhite = await AttributeValue.create({ value: "Trắng", id_attribute: attrColor._id });
    const ram16 = await AttributeValue.create({ value: "16GB", id_attribute: attrRAMSize._id });
    const ram32 = await AttributeValue.create({ value: "32GB", id_attribute: attrRAMSize._id });
    const ram64 = await AttributeValue.create({ value: "64GB", id_attribute: attrRAMSize._id });
    const ssd512 = await AttributeValue.create({ value: "512GB", id_attribute: attrStorage._id });
    const ssd1tb = await AttributeValue.create({ value: "1TB", id_attribute: attrStorage._id });
    const ssd2tb = await AttributeValue.create({ value: "2TB", id_attribute: attrStorage._id });
    const socketAM5 = await AttributeValue.create({ value: "AM5", id_attribute: attrSocket._id });
    const socketLGA1700 = await AttributeValue.create({ value: "LGA1700", id_attribute: attrSocket._id });
    const pkgBox = await AttributeValue.create({ value: "Box Chính Hãng", id_attribute: attrPackaging._id });
    const pkgTray = await AttributeValue.create({ value: "Tray Không Quạt", id_attribute: attrPackaging._id });
    console.log("✅ Đã tạo 5 Attributes & 12 AttributeValues");

    // ═══════════════════════════════════════════════════════════
    // 6. BẢNG PRODUCTS (ĐÚNG 10 SẢN PHẨM)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 6. Tạo dữ liệu bảng Product (Đúng 10 Sản phẩm)...");
    const products = await ProductModel.insertMany([
      // 1. CPU AMD
      {
        name: "AMD Ryzen 7 7800X3D",
        slug: "amd-ryzen-7-7800x3d",
        sale: 15,
        description: "CPU Gaming tốt nhất với V-Cache 3D thế hệ mới, 8 nhân 16 luồng, xung nhịp Boost tối đa 5.0GHz, cache 96MB. Lựa chọn đỉnh cao cho các gamer chuyên nghiệp.",
        short_desc: "8C/16T, Boost 5.0GHz, 96MB V-Cache 3D, Socket AM5",
        status: "active",
        cat_id: catCPU._id,
        brand_id: brAMD._id,
        thumnail: "http://localhost:3000/public/images/anh_cpu_amd/image_1.png",
      },
      // 2. CPU Intel
      {
        name: "Intel Core i7-14700K",
        slug: "intel-core-i7-14700k",
        sale: 10,
        description: "Bộ vi xử lý Intel Core thế hệ 14 Raptor Lake Refresh với 20 nhân (8 P-Core + 12 E-Core), 28 luồng. Xung nhịp tối đa 5.6GHz, hỗ trợ chuẩn bộ nhớ DDR4 và DDR5.",
        short_desc: "20C/28T, Boost 5.6GHz, Socket LGA1700, Đồ họa UHD 770",
        status: "active",
        cat_id: catCPU._id,
        brand_id: brIntel._id,
        thumnail: "http://localhost:3000/public/images/anh_cpu_intel/image_5.png",
      },
      // 3. GPU ASUS
      {
        name: "ASUS ROG Strix GeForce RTX 4070 Ti Super",
        slug: "asus-rog-strix-rtx-4070-ti-super",
        sale: 5,
        description: "Card màn hình ASUS ROG Strix trang bị nhân đồ họa RTX 4070 Ti Super 16GB GDDR6X, kiến trúc Ada Lovelace, hỗ trợ DLSS 3.0 và hệ thống tản nhiệt 3 quạt Axial-tech.",
        short_desc: "16GB GDDR6X, DLSS 3.0, Ray Tracing, Tản nhiệt ROG 3 Fan",
        status: "active",
        cat_id: catGPU._id,
        brand_id: brASUS._id,
        thumnail: "http://localhost:3000/public/images/anh_vga_asus/image_6.png",
      },
      // 4. GPU MSI
      {
        name: "MSI GeForce RTX 4060 VENTUS 2X",
        slug: "msi-rtx-4060-ventus-2x",
        sale: 8,
        description: "VGA tầm trung cực kỳ hiệu quả của MSI, bộ nhớ 8GB GDDR6, hệ thống quạt đôi TORX Fan 4.0, thiết kế nhỏ gọn phù hợp cho mọi case PC.",
        short_desc: "8GB GDDR6, DLSS 3, Quạt kép TORX 4.0, Gaming 1080p Ultra",
        status: "active",
        cat_id: catGPU._id,
        brand_id: brMSI._id,
        thumnail: "http://localhost:3000/public/images/anh_vga_msi/image_9.png",
      },
      // 5. Mainboard MSI
      {
        name: "MSI MAG B650 Tomahawk WiFi",
        slug: "msi-mag-b650-tomahawk-wifi",
        sale: 12,
        description: "Bo mạch chủ chipset AMD B650 cho socket AM5, hỗ trợ RAM DDR5 lên đến 7600+MHz, khe PCIe 5.0 M.2, WiFi 6E và LAN 2.5G. Dàn VRM 12+2+1 phase mạnh mẽ.",
        short_desc: "Socket AM5, DDR5, Wi-Fi 6E, 2.5G LAN, PCIe 5.0 M.2",
        status: "active",
        cat_id: catMainboard._id,
        brand_id: brMSI._id,
        thumnail: "http://localhost:3000/public/images/anh_mainboard_msi/image_10.png",
      },
      // 6. Mainboard ASUS
      {
        name: "ASUS ROG Strix B760-F Gaming WiFi",
        slug: "asus-rog-strix-b760f-gaming-wifi",
        sale: 10,
        description: "Mainboard Intel LGA1700 thiết kế Gaming đẳng cấp, hỗ trợ chip Intel thế hệ 13 và 14, RAM DDR5, WiFi 6E, cổng USB 3.2 Gen 2x2 Type-C.",
        short_desc: "LGA1700, DDR5, WiFi 6E, PCIe 5.0, VRM 16+1 Phase",
        status: "active",
        cat_id: catMainboard._id,
        brand_id: brASUS._id,
        thumnail: "http://localhost:3000/public/images/anh_mainboard_asus/image_12.png",
      },
      // 7. RAM G.Skill
      {
        name: "G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz",
        slug: "gskill-trident-z5-rgb-ddr5-32gb",
        sale: 10,
        description: "Bộ nhớ RAM DDR5 thế hệ mới với thanh LED RGB uốn lượn phong cách, tốc độ bus 6000MHz CL30 tối ưu cho cả nền tảng AMD Expo và Intel XMP 3.0.",
        short_desc: "DDR5 32GB (2x16GB), Bus 6000MHz, CL30, LED RGB",
        status: "active",
        cat_id: catRAM._id,
        brand_id: brGSkill._id,
        thumnail: "http://localhost:3000/public/images/anh_ram_kingston/image_15.png",
      },
      // 8. Storage Samsung
      {
        name: "Samsung 990 Pro NVMe M.2 SSD",
        slug: "samsung-990-pro-nvme-ssd",
        sale: 8,
        description: "Ổ cứng SSD NVMe PCIe Gen 4.0 hàng đầu thế giới với tốc độ đọc tuần tự đến 7450 MB/s và ghi 6900 MB/s. Đạt độ bền và tin cậy cực cao.",
        short_desc: "PCIe 4.0 NVMe M.2 2280, Read 7450MB/s, Write 6900MB/s",
        status: "active",
        cat_id: catStorage._id,
        brand_id: brSamsung._id,
        thumnail: "http://localhost:3000/public/images/anh_o_cung/image_22.png",
      },
      // 9. PSU Corsair
      {
        name: "Corsair RM850e 850W 80 Plus Gold",
        slug: "corsair-rm850e-850w",
        sale: 5,
        description: "Nguồn máy tính công suất 850W đạt chứng nhận 80 Plus Gold, cáp Full Modular gọn gàng, hỗ trợ chuẩn ATX 3.0 và cổng nguồn 12VHPWR cho dòng card RTX 40 series.",
        short_desc: "850W, 80+ Gold, Full Modular, Chuẩn ATX 3.0 & PCIe 5.0",
        status: "active",
        cat_id: catPSU._id,
        brand_id: brCorsair._id,
        thumnail: "http://localhost:3000/public/images/anh_nguon_may_tinh/image_30.png",
      },
      // 10. Cooling NZXT
      {
        name: "NZXT Kraken X63 RGB AIO 280mm",
        slug: "nzxt-kraken-x63-rgb-280mm",
        sale: 10,
        description: "Tản nhiệt nước AIO cao cấp mặt gương vô cực Infinity Mirror, két nước 280mm cùng 2 quạt Aer RGB 2 140mm mang lại hiệu năng làm mát mượt mà và êm ái.",
        short_desc: "AIO 280mm, Mặt vô cực RGB, 2 Quạt 140mm Aer RGB 2",
        status: "active",
        cat_id: catCooling._id,
        brand_id: brNZXT._id,
        thumnail: "http://localhost:3000/public/images/anh_tan_nhiet/image_32.png",
      },
    ]);
    console.log(`✅ Đã tạo đúng ${products.length} Sản phẩm (Products)`);

    // ═══════════════════════════════════════════════════════════
    // 7. BẢNG IMAGES (Ảnh gallery bổ sung cho 10 sản phẩm)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🖼️  7. Tạo dữ liệu bảng Image...");
    const imageData = [];
    products.forEach((p, idx) => {
      // Main image
      imageData.push({
        p_id: p._id,
        url: p.thumnail,
        alt: `${p.name} - Ảnh chính`,
        is_main: true,
      });
      // Sub image 1
      imageData.push({
        p_id: p._id,
        url: p.thumnail,
        alt: `${p.name} - Góc nghiêng`,
        is_main: false,
      });
    });
    const images = await Image.insertMany(imageData);
    console.log(`✅ Đã tạo ${images.length} Ảnh sản phẩm trong bảng Image`);

    // ═══════════════════════════════════════════════════════════
    // 8. BẢNG PRODUCT VARIANTS (Biến thể của 10 sản phẩm)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 8. Tạo dữ liệu bảng ProductVariant...");
    const variantData = [
      // Product 1: AMD Ryzen 7 7800X3D (2 variants)
      { variant_name: "Ryzen 7 7800X3D - Box Chính Hãng", price: 8990000, sale_price: 7641500, sku: "CPU-7800X3D-BOX", stock_quantity: 25, p_id: products[0]._id },
      { variant_name: "Ryzen 7 7800X3D - Tray Không Quạt", price: 8190000, sale_price: 6961500, sku: "CPU-7800X3D-TRAY", stock_quantity: 15, p_id: products[0]._id },

      // Product 2: Intel Core i7-14700K (2 variants)
      { variant_name: "i7-14700K - Box Chính Hãng", price: 9490000, sale_price: 8541000, sku: "CPU-14700K-BOX", stock_quantity: 20, p_id: products[1]._id },
      { variant_name: "i7-14700K - Tray Không Quạt", price: 8790000, sale_price: 7911000, sku: "CPU-14700K-TRAY", stock_quantity: 15, p_id: products[1]._id },

      // Product 3: ASUS ROG Strix RTX 4070 Ti Super (1 variant)
      { variant_name: "ROG Strix RTX 4070 Ti Super OC 16GB", price: 23990000, sale_price: 22790500, sku: "GPU-4070TIS-ROG", stock_quantity: 10, p_id: products[2]._id },

      // Product 4: MSI RTX 4060 VENTUS (2 variants)
      { variant_name: "RTX 4060 Ventus 2X 8G OC - Đen", price: 8490000, sale_price: 7810800, sku: "GPU-4060-V2X-BK", stock_quantity: 30, p_id: products[3]._id },
      { variant_name: "RTX 4060 Ventus 2X 8G OC - Trắng", price: 8690000, sale_price: 7994800, sku: "GPU-4060-V2X-WH", stock_quantity: 18, p_id: products[3]._id },

      // Product 5: MSI MAG B650 Tomahawk WiFi (1 variant)
      { variant_name: "MAG B650 Tomahawk WiFi", price: 6490000, sale_price: 5711200, sku: "MB-B650-TOMA", stock_quantity: 18, p_id: products[4]._id },

      // Product 6: ASUS ROG Strix B760-F Gaming WiFi (1 variant)
      { variant_name: "ROG Strix B760-F Gaming WiFi", price: 6990000, sale_price: 6291000, sku: "MB-B760F-ROG", stock_quantity: 12, p_id: products[5]._id },

      // Product 7: G.Skill Trident Z5 RGB (2 variants)
      { variant_name: "Trident Z5 RGB DDR5 32GB (2x16GB) - Đen", price: 3990000, sale_price: 3591000, sku: "RAM-TZ5-32G-BK", stock_quantity: 35, p_id: products[6]._id },
      { variant_name: "Trident Z5 RGB DDR5 32GB (2x16GB) - Trắng", price: 4090000, sale_price: 3681000, sku: "RAM-TZ5-32G-WH", stock_quantity: 20, p_id: products[6]._id },

      // Product 8: Samsung 990 Pro SSD (2 variants)
      { variant_name: "Samsung 990 Pro NVMe 1TB", price: 3290000, sale_price: 3026800, sku: "SSD-990P-1TB", stock_quantity: 50, p_id: products[7]._id },
      { variant_name: "Samsung 990 Pro NVMe 2TB", price: 5990000, sale_price: 5510800, sku: "SSD-990P-2TB", stock_quantity: 25, p_id: products[7]._id },

      // Product 9: Corsair RM850e PSU (1 variant)
      { variant_name: "RM850e 850W 80+ Gold Full Modular", price: 2990000, sale_price: 2840500, sku: "PSU-RM850E", stock_quantity: 22, p_id: products[8]._id },

      // Product 10: NZXT Kraken X63 RGB (2 variants)
      { variant_name: "Kraken X63 RGB 280mm - Đen", price: 4590000, sale_price: 4131000, sku: "COOL-KRK-X63-BK", stock_quantity: 15, p_id: products[9]._id },
      { variant_name: "Kraken X63 RGB 280mm - Trắng", price: 4790000, sale_price: 4311000, sku: "COOL-KRK-X63-WH", stock_quantity: 10, p_id: products[9]._id },
    ];

    const variants = await ProductVariant.insertMany(variantData);
    console.log(`✅ Đã tạo ${variants.length} Biến thể sản phẩm (ProductVariants)`);

    // ═══════════════════════════════════════════════════════════
    // 9. BẢNG VARIANT ATTRIBUTES (Liên kết Biến thể ↔ Giá trị thuộc tính)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 9. Tạo dữ liệu bảng VariantAttribute...");
    const vaData = [
      // Ryzen 7 7800X3D Box -> Socket AM5 + Box
      { id_variants: variants[0]._id, id_attribute_value: socketAM5._id },
      { id_variants: variants[0]._id, id_attribute_value: pkgBox._id },
      // Ryzen 7 7800X3D Tray -> Socket AM5 + Tray
      { id_variants: variants[1]._id, id_attribute_value: socketAM5._id },
      { id_variants: variants[1]._id, id_attribute_value: pkgTray._id },

      // i7-14700K Box -> Socket LGA1700 + Box
      { id_variants: variants[2]._id, id_attribute_value: socketLGA1700._id },
      { id_variants: variants[2]._id, id_attribute_value: pkgBox._id },

      // RTX 4060 Đen -> Màu Đen
      { id_variants: variants[5]._id, id_attribute_value: colorBlack._id },
      // RTX 4060 Trắng -> Màu Trắng
      { id_variants: variants[6]._id, id_attribute_value: colorWhite._id },

      // RAM G.Skill Đen -> Màu Đen + 32GB
      { id_variants: variants[9]._id, id_attribute_value: colorBlack._id },
      { id_variants: variants[9]._id, id_attribute_value: ram32._id },
      // RAM G.Skill Trắng -> Màu Trắng + 32GB
      { id_variants: variants[10]._id, id_attribute_value: colorWhite._id },
      { id_variants: variants[10]._id, id_attribute_value: ram32._id },

      // SSD 1TB -> 1TB
      { id_variants: variants[11]._id, id_attribute_value: ssd1tb._id },
      // SSD 2TB -> 2TB
      { id_variants: variants[12]._id, id_attribute_value: ssd2tb._id },

      // Kraken X63 Đen -> Màu Đen
      { id_variants: variants[14]._id, id_attribute_value: colorBlack._id },
      // Kraken X63 Trắng -> Màu Trắng
      { id_variants: variants[15]._id, id_attribute_value: colorWhite._id },
    ];
    const variantAttrs = await VariantAttribute.insertMany(vaData);
    console.log(`✅ Đã tạo ${variantAttrs.length} liên kết Variant-Attribute`);

    // ═══════════════════════════════════════════════════════════
    // 10. BẢNG CART ITEMS (Giỏ hàng của người dùng)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🛒 10. Tạo dữ liệu bảng CartItem...");
    const cartItems = await CartItemModel.insertMany([
      {
        u_id: userA._id,
        variant_id: variants[4]._id, // RTX 4070 Ti Super
        quantity: 1,
        price: variants[4].sale_price
      },
      {
        u_id: userA._id,
        variant_id: variants[11]._id, // SSD 1TB
        quantity: 2,
        price: variants[11].sale_price
      },
      {
        u_id: userB._id,
        variant_id: variants[9]._id, // RAM Trident Z5 Black
        quantity: 1,
        price: variants[9].sale_price
      }
    ]);
    console.log(`✅ Đã tạo ${cartItems.length} CartItems trong giỏ hàng`);

    // ═══════════════════════════════════════════════════════════
    // 11. BẢNG PAYMENT METHODS (Phương thức thanh toán)
    // ═══════════════════════════════════════════════════════════
    console.log("\n💳 11. Tạo dữ liệu bảng PaymentMethod...");
    const payments = await PaymentMethod.insertMany([
      { name: "Thanh toán khi nhận hàng (COD)", image: "http://localhost:3000/public/images/payments/cod.png", status: "active" },
      { name: "Chuyển khoản ngân hàng (Bank Transfer)", image: "http://localhost:3000/public/images/payments/bank.png", status: "active" },
      { name: "Ví điện tử MoMo", image: "http://localhost:3000/public/images/payments/momo.png", status: "active" },
      { name: "Cổng thanh toán VNPay", image: "http://localhost:3000/public/images/payments/vnpay.png", status: "active" },
    ]);
    console.log(`✅ Đã tạo ${payments.length} Phương thức thanh toán`);

    // ═══════════════════════════════════════════════════════════
    // 12. BẢNG BANNERS (Quảng cáo banner)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🎯 12. Tạo dữ liệu bảng Banner...");
    const banners = await Banner.insertMany([
      { name: "Banner Siêu Sale Hè 2026", image: "/public/images/banners/banner11.jpg", position: 1, link: "/products", status: "active" },
      { name: "Banner Build PC Chuyên Nghiệp", image: "/public/images/banners/banner22.png", position: 2, link: "/build-pc", status: "active" },
      { name: "Banner RTX 40 Series Đỉnh Cao Gaming", image: "/public/images/banners/banner33.png", position: 3, link: "/gpu", status: "active" },
      { name: "Banner Chuột & Bàn Phím Gaming", image: "/public/images/banners/banner44.png", position: 4, link: "/products", status: "active" },
    ]);
    console.log(`✅ Đã tạo ${banners.length} Banners`);

    // ═══════════════════════════════════════════════════════════
    // 13. BẢNG VOUCHERS & USER VOUCHERS (Mã giảm giá)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🎟️  13. Tạo dữ liệu bảng Voucher & UserVoucher...");
    const vouchers = await Voucher.insertMany([
      {
        code: "WELCOME10",
        discount_type: "percent",
        discount_value: 10,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 1000,
        used_count: 5,
        min_order: 500000,
      },
      {
        code: "SUMMER50K",
        discount_type: "fixed",
        discount_value: 50000,
        start_day: new Date("2024-06-01"),
        end_day: new Date("2028-08-31"),
        usage_limit: 500,
        used_count: 2,
        min_order: 1000000,
      },
      {
        code: "WINNO100K",
        discount_type: "fixed",
        discount_value: 100000,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 200,
        used_count: 1,
        min_order: 3000000,
      },
      {
        code: "SHIP30K",
        discount_type: "fixed",
        discount_value: 30000,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 1000,
        used_count: 0,
        min_order: 0,
      },
      {
        code: "SHIP50",
        discount_type: "percent",
        discount_value: 50,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 1000,
        used_count: 0,
        min_order: 0,
      },
      {
        code: "FRS100K",
        discount_type: "fixed",
        discount_value: 100000,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 1000,
        used_count: 0,
        min_order: 0,
      },
      {
        code: "FRS20",
        discount_type: "percent",
        discount_value: 20,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2028-12-31"),
        usage_limit: 1000,
        used_count: 0,
        min_order: 0,
      },
    ]);


    const userVouchers = await UserVoucher.insertMany([
      { user_id: userA._id, voucher_id: vouchers[0]._id, is_used: true, save_at: new Date() },
      { user_id: userA._id, voucher_id: vouchers[2]._id, is_used: false, save_at: new Date() },
      { user_id: userB._id, voucher_id: vouchers[1]._id, is_used: false, save_at: new Date() },
    ]);
    console.log(`✅ Đã tạo ${vouchers.length} Vouchers & ${userVouchers.length} UserVouchers`);

    // ═══════════════════════════════════════════════════════════
    // 14. BẢNG ORDERS & ORDER ITEMS (Đơn hàng & Chi tiết đơn hàng)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📋 14. Tạo dữ liệu bảng Order & OrderItem...");
    // Đơn hàng 1
    const order1 = await Order.create({
      user_id: userA._id,
      code: "ORD-20260810-001",
      status: "completed",
      Name: "Nguyễn Văn A",
      Phone: "0901234567",
      Adress: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      total_amount: 16943700,
      payment_method: payments[1]._id,
      voucher_code: "WELCOME10",
      voucher_value: 1000000,
      payment_status: "paid",
      date: new Date("2026-08-01")
    });

    const orderItems1 = await OrderItem.insertMany([
      { order_id: order1._id, variants_id: variants[0]._id, Quantity: 1, price: variants[0].sale_price }, // CPU 7800X3D Box
      { order_id: order1._id, variants_id: variants[7]._id, Quantity: 1, price: variants[7].sale_price }, // Main B650 Tomahawk
      { order_id: order1._id, variants_id: variants[9]._id, Quantity: 1, price: variants[9].sale_price }, // RAM Trident Z5 Black
    ]);

    // Đơn hàng 2
    const order2 = await Order.create({
      user_id: userB._id,
      code: "ORD-20260810-002",
      status: "shipping",
      Name: "Trần Thị B",
      Phone: "0987654321",
      Adress: "789 Lạc Long Quân, Phường 11, Quận Tân Bình, TP. Hồ Chí Minh",
      total_amount: 22790500,
      payment_method: payments[2]._id,
      voucher_code: null,
      voucher_value: 0,
      payment_status: "paid",
      date: new Date("2026-08-05")
    });

    const orderItems2 = await OrderItem.insertMany([
      { order_id: order2._id, variants_id: variants[4]._id, Quantity: 1, price: variants[4].sale_price }, // ROG Strix RTX 4070 Ti Super
    ]);

    console.log(`✅ Đã tạo 2 Đơn hàng (Orders) & ${orderItems1.length + orderItems2.length} Chi tiết đơn hàng (OrderItems)`);

    // ═══════════════════════════════════════════════════════════
    // 15. BẢNG REVIEWS (Đánh giá sản phẩm từ người mua)
    // ═══════════════════════════════════════════════════════════
    console.log("\n⭐ 15. Tạo dữ liệu bảng Review...");
    const reviews = await Review.insertMany([
      { id_oderitems: orderItems1[0]._id, content: "CPU gaming siêu bá đạo, chơi Valorant và AAA mượt mà không văng lag!", star_number: 5, status: "active" },
      { id_oderitems: orderItems1[1]._id, content: "Mainboard hoàn thiện cứng cáp, BIOS dễ thao tác, WiFi 6E chạy rất ổn định.", star_number: 5, status: "active" },
      { id_oderitems: orderItems1[2]._id, content: "RAM LED RGB siêu đẹp, bus 6000MHz nhận ngay XMP cực chuẩn.", star_number: 4, status: "active" },
      { id_oderitems: orderItems2[0]._id, content: "VGA ROG Strix quá chất, tản nhiệt mát mẻ 55 độ C khi tải nặng 4K.", star_number: 5, status: "active" },
    ]);
    console.log(`✅ Đã tạo ${reviews.length} Đánh giá (Reviews)`);

    // ═══════════════════════════════════════════════════════════
    // 16. BẢNG FAVORITE & COMPARE (Yêu thích & So sánh)
    // ═══════════════════════════════════════════════════════════
    console.log("\n❤️  16. Tạo dữ liệu bảng Favorite & Compare...");
    const favorites = await Favorite.insertMany([
      { user_id: userA._id, product_id: products[0]._id },
      { user_id: userA._id, product_id: products[2]._id },
      { user_id: userB._id, product_id: products[7]._id },
    ]);

    const compares = await Compare.insertMany([
      { user_id: userA._id, product_id: products[0]._id },
      { user_id: userA._id, product_id: products[1]._id },
      { user_id: userB._id, product_id: products[2]._id },
      { user_id: userB._id, product_id: products[3]._id },
    ]);
    console.log(`✅ Đã tạo ${favorites.length} Favorites & ${compares.length} Compares`);

    // ═══════════════════════════════════════════════════════════
    // 17. BẢNG BUILD PC & BUILD ITEMS (Cấu hình PC tự dựng)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔧 17. Tạo dữ liệu bảng BuildPC & BuildItem...");
    const build1 = await BuildPC.create({
      variant_id: variants[0]._id,
      summary_price: 45500000,
    });

    const buildItems = await BuildItem.insertMany([
      { build_id: build1._id, name: "CPU - AMD Ryzen 7 7800X3D Box" },
      { build_id: build1._id, name: "GPU - ASUS ROG Strix RTX 4070 Ti Super" },
      { build_id: build1._id, name: "Mainboard - MSI MAG B650 Tomahawk WiFi" },
      { build_id: build1._id, name: "RAM - G.Skill Trident Z5 RGB 32GB DDR5" },
      { build_id: build1._id, name: "SSD - Samsung 990 Pro 2TB NVMe" },
      { build_id: build1._id, name: "PSU - Corsair RM850e 850W Gold" },
      { build_id: build1._id, name: "Cooling - NZXT Kraken X63 RGB" },
    ]);
    console.log(`✅ Đã tạo 1 Bộ BuildPC & ${buildItems.length} Linh kiện BuildItem`);

    // ═══════════════════════════════════════════════════════════
    // 18. BẢNG POST CATEGORIES & POSTS (Bài viết tin tức & Hướng dẫn)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 18. Tạo dữ liệu bảng PostCategory & Post...");
    const postCats = await PostCategory.insertMany([
      { name: "Hướng Dẫn Build PC", slug: "huong-dan-build-pc", image: "http://localhost:3000/public/images/posts/cat_guide.png", status: "active" },
      { name: "Kiến Thức Phần Cứng", slug: "kien-thuc-phan-cung", image: "http://localhost:3000/public/images/posts/cat_hardware.png", status: "active" },
      { name: "Tin Tức Công Nghệ", slug: "tin-tuc-cong-nghe", image: "http://localhost:3000/public/images/posts/cat_news.png", status: "active" },
      { name: "Đánh Giá Linh Kiện", slug: "danh-gia-linh-kien", image: "http://localhost:3000/public/images/posts/cat_review.png", status: "active" },
    ]);

    const posts = await Post.insertMany([
      {
        tittle: "Hướng dẫn chọn cấu hình PC gaming 2026 chuẩn nhất cho học sinh, sinh viên",
        slug: "huong-dan-chon-cau-hinh-pc-gaming-2026",
        thumnail: "http://localhost:3000/public/images/posts/post_1.png",
        content: "Năm 2026 đánh dấu bước tiến vượt bậc của các linh kiện PC với chuẩn DDR5 và PCIe 5.0 trở nên phổ biến...",
        status: "published",
        image: "http://localhost:3000/public/images/posts/post_1_banner.png",
        categories_post_id: postCats[0]._id,
      },
      {
        tittle: "CPU V-Cache 3D là gì? Tại sao Ryzen 7 7800X3D bá chủ game?",
        slug: "cpu-v-cache-3d-la-gi",
        thumnail: "http://localhost:3000/public/images/posts/post_2.png",
        content: "Công nghệ 3D V-Cache của AMD cho phép chồng các tầng bộ nhớ đệm L3 lên trực tiếp die CPU, mang lại hiệu năng gaming vượt trội...",
        status: "published",
        image: "http://localhost:3000/public/images/posts/post_2_banner.png",
        categories_post_id: postCats[1]._id,
      },
      {
        tittle: "Đánh giá chi tiết Card màn hình ASUS ROG Strix RTX 4070 Ti Super",
        slug: "danh-gia-asus-rog-strix-rtx-4070-ti-super",
        thumnail: "http://localhost:3000/public/images/posts/post_3.png",
        content: "Với 16GB VRAM GDDR6X cùng bộ tản nhiệt 3 quạt siêu dày, ROG Strix RTX 4070 Ti Super dễ dàng chinh phục mọi tựa game 4K...",
        status: "published",
        image: "http://localhost:3000/public/images/posts/post_3_banner.png",
        categories_post_id: postCats[3]._id,
      },
      {
        tittle: "Top 5 ổ cứng SSD NVMe tốt nhất cho máy tính chơi game năm 2026",
        slug: "top-5-ssd-nvme-tot-nhat-2026",
        thumnail: "http://localhost:3000/public/images/posts/post_4.png",
        content: "Tổng hợp danh sách những mẫu SSD PCIe 4.0 và 5.0 có tốc độ đọc ghi siêu tốc giúp tối ưu thời gian load game và render video...",
        status: "published",
        image: "http://localhost:3000/public/images/posts/post_4_banner.png",
        categories_post_id: postCats[2]._id,
      },
    ]);
    console.log(`✅ Đã tạo ${postCats.length} Danh mục bài viết (PostCategory) & ${posts.length} Bài viết (Post)`);

    // ═══════════════════════════════════════════════════════════
    // TỔNG KẾT TẤT CẢ DỮ LIỆU ĐÃ SEED
    // ═══════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("🎉 TẠO DỮ LIỆU SEED DATA CHO TẤT CẢ CÁC BẢNG HOÀN TẤT 100%!");
    console.log("═".repeat(60));
    console.log(`👤 1. User:               ${users.length} tài khoản (1 Admin, 3 User)`);
    console.log(`🏠 2. DeliveryAddress:    ${addresses.length} địa chỉ giao hàng`);
    console.log(`📁 3. Category:           ${categories.length} danh mục linh kiện`);
    console.log(`🏷️  4. Brand:              ${brands.length} thương hiệu`);
    console.log(`⚙️  5. Attribute:          5 thuộc tính, 12 giá trị thuộc tính`);
    console.log(`📦 6. Product:            ${products.length} sản phẩm chính (ĐÚNG 10 SẢN PHẨM)`);
    console.log(`🖼️  7. Image:              ${images.length} hình ảnh sản phẩm`);
    console.log(`🔄 8. ProductVariant:     ${variants.length} biến thể sản phẩm`);
    console.log(`🔗 9. VariantAttribute:   ${variantAttrs.length} liên kết biến thể thuộc tính`);
    console.log(`🛒 10. CartItem:          ${cartItems.length} sản phẩm trong giỏ hàng`);
    console.log(`💳 11. PaymentMethod:     ${payments.length} phương thức thanh toán`);
    console.log(`🎯 12. Banner:            ${banners.length} banner quảng cáo`);
    console.log(`🎟️  13. Voucher & UV:      ${vouchers.length} mã giảm giá & ${userVouchers.length} user voucher`);
    console.log(`📋 14. Order & OrderItem:  2 đơn hàng & ${orderItems1.length + orderItems2.length} chi tiết đơn hàng`);
    console.log(`⭐ 15. Review:             ${reviews.length} đánh giá sản phẩm`);
    console.log(`❤️  16. Favorite & Compare: ${favorites.length} yêu thích & ${compares.length} so sánh`);
    console.log(`🔧 17. BuildPC & Items:    1 cấu hình PC & ${buildItems.length} linh kiện tự dựng`);
    console.log(`📝 18. PostCat & Post:     ${postCats.length} danh mục bài viết & ${posts.length} bài viết`);
    console.log("═".repeat(60));
    console.log("\n🔑 TÀI KHOẢN ĐĂNG NHẬP MẪU:");
    console.log("   👉 Admin:  admin@winnotech.vn / admin123");
    console.log("   👉 User 1: nguyenvana@gmail.com / 123456");
    console.log("   👉 User 2: tranthib@gmail.com / 123456");
    console.log("   👉 User 3: levanc@gmail.com / 123456");
    console.log("═".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo seed data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB safe & clean.");
    process.exit(0);
  }
}

seedAll();
