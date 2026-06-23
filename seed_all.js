/**
 * SEED DATA — Tạo dữ liệu mẫu cho TẤT CẢ các bảng
 * Chạy: node seed_all.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ─── Import tất cả Models ─────────────────────────────────────
const UserModel = require("./models/User");
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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối DB thành công!");

    // ═══════════════════════════════════════════════════════════
    // XÓA DỮ LIỆU CŨ
    // ═══════════════════════════════════════════════════════════
    console.log("\n🗑️  Xóa dữ liệu cũ...");
    await Promise.all([
      UserModel.deleteMany({}),
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
    console.log("✅ Xóa xong!");

    // ═══════════════════════════════════════════════════════════
    // 1. USERS (3 user + 1 admin)
    // ═══════════════════════════════════════════════════════════
    console.log("\n👤 Tạo Users...");
    const salt = await bcrypt.genSalt(10);
    const users = await UserModel.insertMany([
      {
        name: "Admin WINNOTECH",
        email: "admin@winnotech.vn",
        password: await bcrypt.hash("admin123", salt),
        role: "admin",
        status: "active",
      },
      {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: await bcrypt.hash("123456", salt),
        role: "user",
        status: "active",
      },
      {
        name: "Trần Thị B",
        email: "tranthib@gmail.com",
        password: await bcrypt.hash("123456", salt),
        role: "user",
        status: "active",
      },
      {
        name: "Lê Văn C",
        email: "levanc@gmail.com",
        password: await bcrypt.hash("123456", salt),
        role: "user",
        status: "active",
      },
    ]);
    console.log(`✅ Đã tạo ${users.length} users`);

    // ═══════════════════════════════════════════════════════════
    // 2. CATEGORIES (6 danh mục linh kiện PC)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📁 Tạo Categories...");
    const categories = await CategoryModel.insertMany([
      { name: "CPU", slug: "cpu", status: "active" },
      { name: "GPU", slug: "gpu", status: "active" },
      { name: "Mainboard", slug: "mainboard", status: "active" },
      { name: "RAM", slug: "ram", status: "active" },
      { name: "Storage", slug: "storage", status: "active" },
      { name: "PSU", slug: "psu", status: "active" },
      { name: "Cooling", slug: "cooling", status: "active" },
      { name: "Case", slug: "case", status: "active" },
    ]);
    const [catCPU, catGPU, catMainboard, catRAM, catStorage, catPSU, catCooling, catCase] = categories;
    console.log(`✅ Đã tạo ${categories.length} categories`);

    // ═══════════════════════════════════════════════════════════
    // 3. BRANDS (thương hiệu)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🏷️  Tạo Brands...");
    const brands = await BrandModel.insertMany([
      { name: "AMD", slug: "amd" },
      { name: "Intel", slug: "intel" },
      { name: "NVIDIA", slug: "nvidia" },
      { name: "ASUS", slug: "asus" },
      { name: "MSI", slug: "msi" },
      { name: "Gigabyte", slug: "gigabyte" },
      { name: "Corsair", slug: "corsair" },
      { name: "G.Skill", slug: "gskill" },
      { name: "Samsung", slug: "samsung" },
      { name: "Western Digital", slug: "western-digital" },
      { name: "NZXT", slug: "nzxt" },
      { name: "Cooler Master", slug: "cooler-master" },
    ]);
    const [brAMD, brIntel, brNVIDIA, brASUS, brMSI, brGigabyte, brCorsair, brGSkill, brSamsung, brWD, brNZXT, brCoolerMaster] = brands;
    console.log(`✅ Đã tạo ${brands.length} brands`);

    // ═══════════════════════════════════════════════════════════
    // 4. ATTRIBUTES + ATTRIBUTE VALUES
    // ═══════════════════════════════════════════════════════════
    console.log("\n🏷️  Tạo Attributes...");
    const attrColor = await Attribute.create({ name: "Màu sắc" });
    const attrRAMSize = await Attribute.create({ name: "Dung lượng RAM" });
    const attrStorage = await Attribute.create({ name: "Dung lượng lưu trữ" });

    const colorBlack = await AttributeValue.create({ name: "Đen", slug: "den", value: "Đen", id_attribute: attrColor._id });
    const colorWhite = await AttributeValue.create({ name: "Trắng", slug: "trang", value: "Trắng", id_attribute: attrColor._id });
    const ram16 = await AttributeValue.create({ name: "16GB", slug: "16gb", value: "16GB", id_attribute: attrRAMSize._id });
    const ram32 = await AttributeValue.create({ name: "32GB", slug: "32gb", value: "32GB", id_attribute: attrRAMSize._id });
    const ssd512 = await AttributeValue.create({ name: "512GB", slug: "512gb", value: "512GB", id_attribute: attrStorage._id });
    const ssd1tb = await AttributeValue.create({ name: "1TB", slug: "1tb", value: "1TB", id_attribute: attrStorage._id });
    const ssd2tb = await AttributeValue.create({ name: "2TB", slug: "2tb", value: "2TB", id_attribute: attrStorage._id });
    console.log("✅ Đã tạo Attributes + Values");

    // ═══════════════════════════════════════════════════════════
    // 5. PRODUCTS (12 sản phẩm linh kiện PC thật)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 Tạo Products...");
    const products = await ProductModel.insertMany([
      // --- CPU ---
      {
        name: "AMD Ryzen 7 7800X3D",
        slug: "amd-ryzen-7-7800x3d",
        sale: 15,
        description: "CPU Gaming tốt nhất 2024 với V-Cache 3D, 8 nhân 16 luồng, xung nhịp lên tới 5.0GHz. Hiệu năng gaming vượt trội.",
        short_desc: "8C/16T, 5.0GHz, V-Cache 3D",
        status: "active",
        cat_id: catCPU._id,
        brand_id: brAMD._id,
      },
      {
        name: "Intel Core i7-14700K",
        slug: "intel-core-i7-14700k",
        sale: 10,
        description: "CPU Intel thế hệ 14 với 20 nhân (8P + 12E), 28 luồng. Hiệu năng đa nhiệm mạnh mẽ, hỗ trợ DDR4 và DDR5.",
        short_desc: "20C/28T, 5.6GHz, LGA1700",
        status: "active",
        cat_id: catCPU._id,
        brand_id: brIntel._id,
      },
      // --- GPU ---
      {
        name: "ASUS ROG Strix GeForce RTX 4070 Ti Super",
        slug: "asus-rog-strix-rtx-4070-ti-super",
        sale: 5,
        description: "Card đồ họa cao cấp với DLSS 3.0, Ray Tracing, 16GB GDDR6X. Tản nhiệt ROG Strix 3 quạt, hiệu năng 1440p đỉnh cao.",
        short_desc: "16GB GDDR6X, DLSS 3.0, 3 Fan",
        status: "active",
        cat_id: catGPU._id,
        brand_id: brASUS._id,
      },
      {
        name: "MSI GeForce RTX 4060 VENTUS 2X",
        slug: "msi-rtx-4060-ventus-2x",
        sale: 8,
        description: "Card đồ họa tầm trung mạnh mẽ, 8GB GDDR6, DLSS 3.0, Ray Tracing. Phù hợp gaming 1080p ultra.",
        short_desc: "8GB GDDR6, DLSS 3.0, 2 Fan",
        status: "active",
        cat_id: catGPU._id,
        brand_id: brMSI._id,
      },
      // --- MAINBOARD ---
      {
        name: "MSI MAG B650 Tomahawk WiFi",
        slug: "msi-mag-b650-tomahawk-wifi",
        sale: 12,
        description: "Mainboard AM5 tầm trung cao cấp, hỗ trợ DDR5, PCIe 5.0, WiFi 6E, USB 3.2 Gen 2. VRM 12+2+1 Phase.",
        short_desc: "AM5, DDR5, WiFi 6E, PCIe 5.0",
        status: "active",
        cat_id: catMainboard._id,
        brand_id: brMSI._id,
      },
      {
        name: "ASUS ROG Strix B760-F Gaming WiFi",
        slug: "asus-rog-strix-b760f-gaming-wifi",
        sale: 10,
        description: "Mainboard Intel B760 cao cấp, DDR5, WiFi 6, Thunderbolt 4, VRM 16+1 Phase. Thiết kế ROG đặc trưng.",
        short_desc: "LGA1700, DDR5, WiFi 6, Thunderbolt 4",
        status: "active",
        cat_id: catMainboard._id,
        brand_id: brASUS._id,
      },
      // --- RAM ---
      {
        name: "G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz",
        slug: "gskill-trident-z5-rgb-ddr5-32gb",
        sale: 10,
        description: "RAM DDR5 cao cấp với đèn LED RGB tuyệt đẹp, tốc độ 6000MHz CL30, tương thích Intel XMP 3.0.",
        short_desc: "DDR5, 6000MHz, CL30, RGB",
        status: "active",
        cat_id: catRAM._id,
        brand_id: brGSkill._id,
      },
      {
        name: "Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz",
        slug: "corsair-vengeance-ddr5-32gb",
        sale: 5,
        description: "RAM DDR5 hiệu năng cao, thiết kế low-profile, Intel XMP 3.0, iCUE RGB tùy chỉnh.",
        short_desc: "DDR5, 5600MHz, CL36, Low Profile",
        status: "active",
        cat_id: catRAM._id,
        brand_id: brCorsair._id,
      },
      // --- STORAGE ---
      {
        name: "Samsung 990 Pro 2TB NVMe M.2 SSD",
        slug: "samsung-990-pro-2tb",
        sale: 8,
        description: "SSD NVMe PCIe 4.0 tốc độ đọc lên tới 7450MB/s, ghi 6900MB/s. Bảo hành 5 năm.",
        short_desc: "NVMe, PCIe 4.0, 7450MB/s",
        status: "active",
        cat_id: catStorage._id,
        brand_id: brSamsung._id,
      },
      {
        name: "WD Black SN850X 1TB NVMe M.2 SSD",
        slug: "wd-black-sn850x-1tb",
        sale: 12,
        description: "SSD NVMe PCIe 4.0 cho gaming, tốc độ đọc 7300MB/s, Game Mode 2.0 tối ưu hiệu năng.",
        short_desc: "NVMe, PCIe 4.0, 7300MB/s, Game Mode",
        status: "active",
        cat_id: catStorage._id,
        brand_id: brWD._id,
      },
      // --- PSU ---
      {
        name: "Corsair RM850e 850W 80 Plus Gold",
        slug: "corsair-rm850e-850w",
        sale: 5,
        description: "Nguồn full modular 850W chuẩn 80+ Gold, quạt 140mm, hiệu suất 90%. ATX 3.0, hỗ trợ GPU 12VHPWR.",
        short_desc: "850W, 80+ Gold, Full Modular, ATX 3.0",
        status: "active",
        cat_id: catPSU._id,
        brand_id: brCorsair._id,
      },
      // --- COOLING ---
      {
        name: "NZXT Kraken X63 RGB AIO 280mm",
        slug: "nzxt-kraken-x63-rgb-280mm",
        sale: 10,
        description: "Tản nhiệt nước AIO 280mm, màn hình LCD hiển thị nhiệt độ/GIF, 2 quạt 140mm RGB.",
        short_desc: "AIO 280mm, LCD Display, RGB",
        status: "active",
        cat_id: catCooling._id,
        brand_id: brNZXT._id,
      },
    ]);
    console.log(`✅ Đã tạo ${products.length} products`);

    // ═══════════════════════════════════════════════════════════
    // 6. IMAGES (ảnh sản phẩm - dùng placeholder)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🖼️  Tạo Images...");
    const imageData = products.map((p, i) => ({
      p_id: p._id,
      url: `https://placehold.co/600x400/1a1a2e/7c3aed?text=${encodeURIComponent(p.name.substring(0, 20))}`,
      alt: p.name,
      is_main: true,
    }));
    const images = await Image.insertMany(imageData);
    console.log(`✅ Đã tạo ${images.length} images`);

    // ═══════════════════════════════════════════════════════════
    // 7. PRODUCT VARIANTS (mỗi sản phẩm 1-2 biến thể)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 Tạo Product Variants...");
    const variantData = [
      // CPU: Ryzen 7 7800X3D — 1 variant (CPU chỉ có 1 loại)
      { variant_name: "Ryzen 7 7800X3D - BOX", price: 8990000, sale_price: 7641500, sku: "CPU-7800X3D-BOX", stock_quantity: 25, p_id: products[0]._id },
      // CPU: i7-14700K — 2 variant (BOX và Tray)
      { variant_name: "i7-14700K - BOX", price: 9490000, sale_price: 8541000, sku: "CPU-14700K-BOX", stock_quantity: 20, p_id: products[1]._id },
      { variant_name: "i7-14700K - Tray", price: 8790000, sale_price: 7911000, sku: "CPU-14700K-TRAY", stock_quantity: 15, p_id: products[1]._id },
      // GPU: RTX 4070 Ti Super — 1 variant
      { variant_name: "ROG Strix RTX 4070 Ti Super OC", price: 23990000, sale_price: 22790500, sku: "GPU-4070TIS-ROG", stock_quantity: 10, p_id: products[2]._id },
      // GPU: RTX 4060 — 2 variant
      { variant_name: "RTX 4060 Ventus 2X 8G OC", price: 8490000, sale_price: 7810800, sku: "GPU-4060-V2X-OC", stock_quantity: 30, p_id: products[3]._id },
      { variant_name: "RTX 4060 Ventus 2X 8G", price: 7990000, sale_price: 7350800, sku: "GPU-4060-V2X", stock_quantity: 20, p_id: products[3]._id },
      // Mainboard: B650 Tomahawk — 1 variant
      { variant_name: "MAG B650 Tomahawk WiFi", price: 6490000, sale_price: 5711200, sku: "MB-B650-TOMA", stock_quantity: 18, p_id: products[4]._id },
      // Mainboard: B760-F — 1 variant
      { variant_name: "ROG Strix B760-F Gaming WiFi", price: 6990000, sale_price: 6291000, sku: "MB-B760F-ROG", stock_quantity: 12, p_id: products[5]._id },
      // RAM: G.Skill — 2 variant (đen + trắng)
      { variant_name: "Trident Z5 RGB DDR5 32GB - Đen", price: 3990000, sale_price: 3591000, sku: "RAM-TZ5-32G-BK", stock_quantity: 35, p_id: products[6]._id },
      { variant_name: "Trident Z5 RGB DDR5 32GB - Trắng", price: 4090000, sale_price: 3681000, sku: "RAM-TZ5-32G-WH", stock_quantity: 20, p_id: products[6]._id },
      // RAM: Corsair — 1 variant
      { variant_name: "Vengeance DDR5 32GB 5600MHz", price: 2990000, sale_price: 2840500, sku: "RAM-VEN-32G", stock_quantity: 40, p_id: products[7]._id },
      // SSD: Samsung 990 Pro — 2 variant (1TB / 2TB)
      { variant_name: "990 Pro 1TB", price: 3290000, sale_price: 3026800, sku: "SSD-990P-1TB", stock_quantity: 50, p_id: products[8]._id },
      { variant_name: "990 Pro 2TB", price: 5990000, sale_price: 5510800, sku: "SSD-990P-2TB", stock_quantity: 25, p_id: products[8]._id },
      // SSD: WD Black — 1 variant
      { variant_name: "SN850X 1TB", price: 2890000, sale_price: 2543200, sku: "SSD-SN850X-1TB", stock_quantity: 30, p_id: products[9]._id },
      // PSU: Corsair — 1 variant
      { variant_name: "RM850e 850W Full Modular", price: 2990000, sale_price: 2840500, sku: "PSU-RM850E", stock_quantity: 22, p_id: products[10]._id },
      // Cooling: NZXT — 1 variant
      { variant_name: "Kraken X63 RGB 280mm - Đen", price: 4590000, sale_price: 4131000, sku: "COOL-KRK-X63-BK", stock_quantity: 15, p_id: products[11]._id },
    ];
    const variants = await ProductVariant.insertMany(variantData);
    console.log(`✅ Đã tạo ${variants.length} variants`);

    // ═══════════════════════════════════════════════════════════
    // 8. VARIANT ATTRIBUTES (nối variant với attribute value)
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 Tạo Variant Attributes...");
    const vaData = [
      // G.Skill Đen → Màu Đen + 32GB
      { id_variants: variants[8]._id, id_attribute_value: colorBlack._id },
      { id_variants: variants[8]._id, id_attribute_value: ram32._id },
      // G.Skill Trắng → Màu Trắng + 32GB
      { id_variants: variants[9]._id, id_attribute_value: colorWhite._id },
      { id_variants: variants[9]._id, id_attribute_value: ram32._id },
      // Samsung 1TB
      { id_variants: variants[11]._id, id_attribute_value: ssd1tb._id },
      // Samsung 2TB
      { id_variants: variants[12]._id, id_attribute_value: ssd2tb._id },
      // WD 1TB
      { id_variants: variants[13]._id, id_attribute_value: ssd1tb._id },
      // Cooling Đen
      { id_variants: variants[15]._id, id_attribute_value: colorBlack._id },
    ];
    const variantAttrs = await VariantAttribute.insertMany(vaData);
    console.log(`✅ Đã tạo ${variantAttrs.length} variant-attribute links`);

    // ═══════════════════════════════════════════════════════════
    // 9. PAYMENT METHODS
    // ═══════════════════════════════════════════════════════════
    console.log("\n💳 Tạo Payment Methods...");
    const payments = await PaymentMethod.insertMany([
      { name: "Thanh toán khi nhận hàng (COD)", status: "active" },
      { name: "Chuyển khoản ngân hàng", status: "active" },
      { name: "Ví MoMo", status: "active" },
      { name: "VNPay", status: "active" },
    ]);
    console.log(`✅ Đã tạo ${payments.length} payment methods`);

    // ═══════════════════════════════════════════════════════════
    // 10. BANNERS
    // ═══════════════════════════════════════════════════════════
    console.log("\n🎯 Tạo Banners...");
    const banners = await Banner.insertMany([
      { name: "Banner Sale Hè 2024", image: "https://placehold.co/1200x400/7c3aed/ffffff?text=SALE+HE+2024", link: "/products", status: "active" },
      { name: "Banner Build PC", image: "https://placehold.co/1200x400/1a1a2e/c4f44a?text=BUILD+PC+NGAY", link: "/build-pc", status: "active" },
      { name: "Banner RTX 40 Series", image: "https://placehold.co/1200x400/76b900/ffffff?text=RTX+40+SERIES", link: "/gpu", status: "active" },
    ]);
    console.log(`✅ Đã tạo ${banners.length} banners`);

    // ═══════════════════════════════════════════════════════════
    // 11. VOUCHERS
    // ═══════════════════════════════════════════════════════════
    console.log("\n🎟️  Tạo Vouchers...");
    const vouchers = await Voucher.insertMany([
      {
        code: "WELCOME10",
        discount_type: "percent",
        discount_value: 10,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2027-12-31"),
        usage_limit: 1000,
        used_count: 0,
        min_order: 500000,
      },
      {
        code: "SUMMER50K",
        discount_type: "fixed",
        discount_value: 50000,
        start_day: new Date("2024-06-01"),
        end_day: new Date("2027-08-31"),
        usage_limit: 500,
        used_count: 0,
        min_order: 1000000,
      },
      {
        code: "WINNO100K",
        discount_type: "fixed",
        discount_value: 100000,
        start_day: new Date("2024-01-01"),
        end_day: new Date("2027-12-31"),
        usage_limit: 200,
        used_count: 0,
        min_order: 3000000,
      },
    ]);
    console.log(`✅ Đã tạo ${vouchers.length} vouchers`);

    // ═══════════════════════════════════════════════════════════
    // 12. ORDERS + ORDER ITEMS (1 đơn mẫu)
    // ═══════════════════════════════════════════════════════════
    console.log("\n📋 Tạo Orders...");
    const order = await Order.create({
      user_id: users[1]._id,
      code: "ORD-20240601-001",
      status: "delivered",
      Name: "Nguyễn Văn A",
      Phone: "0901234567",
      Adress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      total_amount: 16631500,
      payment_method: payments[1]._id,
      voucher_code: "WELCOME10",
      voucher_value: 0,
      payment_status: "paid",
    });

    const orderItems = await OrderItem.insertMany([
      { order_id: order._id, attribute_value_id: variants[0]._id, Quantity: 1, price: 7641500 },
      { order_id: order._id, attribute_value_id: variants[6]._id, Quantity: 1, price: 5711200 },
      { order_id: order._id, attribute_value_id: variants[8]._id, Quantity: 1, price: 3591000 },
    ]);
    console.log(`✅ Đã tạo 1 order + ${orderItems.length} order items`);

    // ═══════════════════════════════════════════════════════════
    // 13. REVIEWS
    // ═══════════════════════════════════════════════════════════
    console.log("\n⭐ Tạo Reviews...");
    const reviews = await Review.insertMany([
      { id_oderitems: orderItems[0]._id, content: "CPU gaming quá tốt, chơi game mượt mà, nhiệt độ ổn định!", star_number: 5 },
      { id_oderitems: orderItems[1]._id, content: "Mainboard đẹp, BIOS dễ dùng, WiFi bắt rất mạnh.", star_number: 4 },
      { id_oderitems: orderItems[2]._id, content: "RAM chạy ổn, LED RGB đẹp lung linh, tốc độ nhanh.", star_number: 5 },
    ]);
    console.log(`✅ Đã tạo ${reviews.length} reviews`);

    // ═══════════════════════════════════════════════════════════
    // 14. FAVORITES + COMPARES
    // ═══════════════════════════════════════════════════════════
    console.log("\n❤️  Tạo Favorites & Compares...");
    await Favorite.insertMany([
      { user_id: users[1]._id, product_id: products[0]._id },
      { user_id: users[1]._id, product_id: products[2]._id },
      { user_id: users[2]._id, product_id: products[6]._id },
    ]);
    await Compare.insertMany([
      { user_id: users[1]._id, product_id: products[0]._id },
      { user_id: users[1]._id, product_id: products[1]._id },
    ]);
    console.log("✅ Đã tạo favorites + compares");

    // ═══════════════════════════════════════════════════════════
    // 15. BUILD PC
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔧 Tạo Build PC...");
    const build = await BuildPC.create({
      variant_id: variants[0]._id,
      summary_price: 45000000,
    });
    await BuildItem.insertMany([
      { build_id: build._id, name: "CPU - AMD Ryzen 7 7800X3D" },
      { build_id: build._id, name: "GPU - ASUS ROG Strix RTX 4070 Ti Super" },
      { build_id: build._id, name: "RAM - G.Skill Trident Z5 32GB DDR5" },
      { build_id: build._id, name: "SSD - Samsung 990 Pro 2TB" },
      { build_id: build._id, name: "PSU - Corsair RM850e 850W" },
    ]);
    console.log("✅ Đã tạo 1 build PC + 5 items");

    // ═══════════════════════════════════════════════════════════
    // 16. POST CATEGORIES + POSTS
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 Tạo Post Categories & Posts...");
    const postCats = await PostCategory.insertMany([
      { name: "Hướng dẫn", slug: "huong-dan" },
      { name: "Kiến thức", slug: "kien-thuc" },
      { name: "Tin tức", slug: "tin-tuc" },
      { name: "Build PC", slug: "build-pc" },
    ]);

    const posts = await Post.insertMany([
      {
        tittle: "Hướng dẫn chọn cấu hình PC gaming 2024 phù hợp với bạn",
        slug: "huong-dan-chon-cau-hinh-pc-gaming-2024",
        content: "Năm 2024 mang đến nhiều lựa chọn linh kiện mới với hiệu năng vượt trội...",
        status: "published",
        categories_post_id: postCats[0]._id,
      },
      {
        tittle: "CPU có nhân và luồng là gì? Hiểu đúng để chọn CPU tốt",
        slug: "cpu-nhan-va-luong-la-gi",
        content: "Nhân (Core) và Luồng (Thread) là hai khái niệm quan trọng khi chọn CPU...",
        status: "published",
        categories_post_id: postCats[1]._id,
      },
      {
        tittle: "RTX 5090 ra mắt - Liệu có đáng nâng cấp?",
        slug: "rtx-5090-ra-mat-co-dang-nang-cap",
        content: "NVIDIA vừa công bố RTX 5090 với kiến trúc Blackwell hoàn toàn mới...",
        status: "published",
        categories_post_id: postCats[2]._id,
      },
      {
        tittle: "Build PC trắng đẹp 2024 - Stealth design & hiệu năng cao",
        slug: "build-pc-trang-dep-2024",
        content: "Xu hướng build PC full trắng đang ngày càng được ưa chuộng...",
        status: "published",
        categories_post_id: postCats[3]._id,
      },
    ]);
    console.log(`✅ Đã tạo ${postCats.length} post categories + ${posts.length} posts`);

    // ═══════════════════════════════════════════════════════════
    // TỔNG KẾT
    // ═══════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(50));
    console.log("🎉 SEED DATA HOÀN TẤT!");
    console.log("═".repeat(50));
    console.log(`👤 Users:             ${users.length}`);
    console.log(`📁 Categories:        ${categories.length}`);
    console.log(`🏷️  Brands:            ${brands.length}`);
    console.log(`📦 Products:          ${products.length}`);
    console.log(`🖼️  Images:            ${images.length}`);
    console.log(`🔄 Variants:          ${variants.length}`);
    console.log(`🔗 Variant Attrs:     ${variantAttrs.length}`);
    console.log(`💳 Payment Methods:   ${payments.length}`);
    console.log(`🎯 Banners:           ${banners.length}`);
    console.log(`🎟️  Vouchers:          ${vouchers.length}`);
    console.log(`📋 Orders:            1`);
    console.log(`⭐ Reviews:           ${reviews.length}`);
    console.log(`📝 Posts:             ${posts.length}`);
    console.log("═".repeat(50));
    console.log("\n🔑 Tài khoản test:");
    console.log("   Admin:  admin@winnotech.vn / admin123");
    console.log("   User:   nguyenvana@gmail.com / 123456");
    console.log("   User:   tranthib@gmail.com / 123456");
    console.log("═".repeat(50));

  } catch (error) {
    console.error("❌ Lỗi seed data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Đã ngắt kết nối DB.");
    process.exit(0);
  }
}

seedAll();
