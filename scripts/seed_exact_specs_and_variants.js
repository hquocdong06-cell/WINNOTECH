const mongoose = require('mongoose');
require('dotenv').config();

const {
  Product,
  Category,
  Brand,
  ProductVariant,
  VariantAttribute,
  CategoryAttribute,
  AttributeValue,
  Specification,
} = require('../models');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winnotech';

// Helper: Lấy hoặc tạo CategoryAttribute (trong categories_attribute)
async function getOrCreateCategoryAttr(name) {
  const trimmed = name.trim();
  let attr = await CategoryAttribute.findOne({ name: trimmed });
  if (!attr) {
    attr = await CategoryAttribute.create({ name: trimmed, status: 'active' });
    console.log(`  ➕ Tạo CategoryAttribute mới: "${trimmed}"`);
  }
  return attr;
}

// Helper: Lấy hoặc tạo AttributeValue (trong attribute_value)
async function getOrCreateAttrValue(catAttrId, valueStr) {
  const trimmed = String(valueStr).trim();
  let valDoc = await AttributeValue.findOne({
    value: trimmed,
    $or: [{ id_categories_attribute: catAttrId }, { id_attribute: catAttrId }],
  });
  if (!valDoc) {
    valDoc = await AttributeValue.create({
      value: trimmed,
      id_categories_attribute: catAttrId,
      id_attribute: catAttrId,
      status: 'active',
    });
    console.log(`     ➕ Tạo AttributeValue mới: "${trimmed}"`);
  }
  return valDoc;
}

// Dữ liệu thông số kỹ thuật chuẩn cho từng sản phẩm theo slug
const PRODUCT_SPECS_DATA = {
  // 1. AMD Ryzen 7 7800X3D
  'amd-ryzen-7-7800x3d': [
    { name: 'Thương hiệu', val: 'AMD', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'Ryzen 7', group: 'general' },
    { name: 'Thế hệ CPU', val: 'Ryzen 7000 Series (Zen 4)', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Nhu cầu', val: 'Gaming chuyên nghiệp & Đồ họa', group: 'general' },
    { name: 'Socket', val: 'AM5', group: 'detail' },
    { name: 'Số nhân', val: '8 nhân', group: 'detail' },
    { name: 'Số luồng', val: '16 luồng', group: 'detail' },
    { name: 'Xung nhịp cơ bản', val: '4.2 GHz', group: 'detail' },
    { name: 'Xung nhịp tối đa', val: '5.0 GHz (Boost)', group: 'detail' },
    { name: 'Bộ nhớ đệm L3', val: '96MB AMD 3D V-Cache', group: 'detail' },
    { name: 'Tổng bộ nhớ đệm', val: '104MB (L2 + L3)', group: 'detail' },
    { name: 'Điện năng tiêu thụ (TDP)', val: '120W', group: 'detail' },
    { name: 'Tiến trình sản xuất', val: 'TSMC 5nm FinFET', group: 'detail' },
    { name: 'Hỗ trợ RAM', val: 'DDR5 lên đến 5200 MT/s (Hỗ trợ AMD EXPO)', group: 'detail' },
    { name: 'Đồ họa tích hợp', val: 'AMD Radeon Graphics (2 nhân)', group: 'detail' },
    { name: 'Chuẩn PCIe', val: 'PCIe 5.0', group: 'detail' },
    { name: 'Quy cách đóng gói', val: 'Box Chính Hãng / Tray Không Quạt', group: 'general' },
  ],

  // 2. Intel Core i7-14700K
  'intel-core-i7-14700k': [
    { name: 'Thương hiệu', val: 'Intel', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'Core i7', group: 'general' },
    { name: 'Thế hệ CPU', val: 'Intel Core thế hệ 14 (Raptor Lake Refresh)', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Nhu cầu', val: 'Gaming đỉnh cao & Sáng tạo nội dung', group: 'general' },
    { name: 'Socket', val: 'LGA1700', group: 'detail' },
    { name: 'Số nhân', val: '20 nhân (8 P-Core + 12 E-Core)', group: 'detail' },
    { name: 'Số luồng', val: '28 luồng', group: 'detail' },
    { name: 'Xung nhịp cơ bản P-Core', val: '3.4 GHz', group: 'detail' },
    { name: 'Xung nhịp tối đa P-Core', val: '5.5 GHz', group: 'detail' },
    { name: 'Xung nhịp tối đa E-Core', val: '4.3 GHz', group: 'detail' },
    { name: 'Intel Turbo Boost Max 3.0', val: '5.6 GHz', group: 'detail' },
    { name: 'Bộ nhớ đệm', val: '33MB Intel Smart Cache + 28MB L2', group: 'detail' },
    { name: 'Điện năng tiêu thụ (TDP)', val: '125W (Tối đa Turbo 253W)', group: 'detail' },
    { name: 'Hỗ trợ RAM', val: 'DDR5 5600 MT/s & DDR4 3200 MT/s (Tối đa 192GB)', group: 'detail' },
    { name: 'Đồ họa tích hợp', val: 'Intel UHD Graphics 770', group: 'detail' },
    { name: 'Chuẩn PCIe', val: 'PCIe 5.0 & PCIe 4.0 (20 làn)', group: 'detail' },
    { name: 'Mở khóa ép xung', val: 'Có (Unlocked)', group: 'detail' },
    { name: 'Quy cách đóng gói', val: 'Box Chính Hãng / Tray Không Quạt', group: 'general' },
  ],

  // 3. Intel Core i5-13400F
  'intel-core-i5-13400f': [
    { name: 'Thương hiệu', val: 'Intel', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'Core i5', group: 'general' },
    { name: 'Thế hệ CPU', val: 'Intel Core thế hệ 13 (Raptor Lake)', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Nhu cầu', val: 'Gaming tầm trung & Văn phòng cao cấp', group: 'general' },
    { name: 'Socket', val: 'LGA1700', group: 'detail' },
    { name: 'Số nhân', val: '10 nhân (6 P-Core + 4 E-Core)', group: 'detail' },
    { name: 'Số luồng', val: '16 luồng', group: 'detail' },
    { name: 'Xung nhịp cơ bản', val: '2.5 GHz', group: 'detail' },
    { name: 'Xung nhịp tối đa', val: '4.6 GHz (Turbo)', group: 'detail' },
    { name: 'Bộ nhớ đệm', val: '20MB Intel Smart Cache + 9.5MB L2', group: 'detail' },
    { name: 'Điện năng tiêu thụ (TDP)', val: '65W (Tối đa Turbo 148W)', group: 'detail' },
    { name: 'Hỗ trợ RAM', val: 'DDR5 4800 MT/s & DDR4 3200 MT/s', group: 'detail' },
    { name: 'Đồ họa tích hợp', val: 'Không có (Cần card VGA rời)', group: 'detail' },
    { name: 'Tản nhiệt đi kèm', val: 'Intel Laminar RM1 Cooler', group: 'detail' },
    { name: 'Chuẩn PCIe', val: 'PCIe 5.0 & PCIe 4.0', group: 'detail' },
    { name: 'Quy cách đóng gói', val: 'Box Chính Hãng', group: 'general' },
  ],

  // 4. ASUS ROG Strix GeForce RTX 4070 Ti Super
  'asus-rog-strix-rtx-4070-ti-super': [
    { name: 'Thương hiệu', val: 'ASUS', group: 'general' },
    { name: 'Series', val: 'ROG Strix Gaming', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Part-number', val: 'ROG-STRIX-RTX4070TIS-O16G-GAMING', group: 'general' },
    { name: 'Chipset đồ họa', val: 'NVIDIA GeForce RTX 4070 Ti SUPER', group: 'detail' },
    { name: 'Dung lượng VRAM', val: '16GB GDDR6X', group: 'detail' },
    { name: 'Giao diện bộ nhớ', val: '256-bit', group: 'detail' },
    { name: 'Số nhân CUDA', val: '8448 nhân', group: 'detail' },
    { name: 'Xung nhịp Boost', val: '2670 MHz (OC Mode) / 2640 MHz (Default)', group: 'detail' },
    { name: 'Tốc độ bộ nhớ', val: '21 Gbps', group: 'detail' },
    { name: 'Chuẩn giao tiếp', val: 'PCIe 4.0 x16', group: 'detail' },
    { name: 'Cổng xuất hình', val: '2x HDMI 2.1a, 3x DisplayPort 1.4a (Tối đa 4 màn hình)', group: 'detail' },
    { name: 'Độ phân giải tối đa', val: '7680 x 4320 (8K)', group: 'detail' },
    { name: 'Hệ thống tản nhiệt', val: '3 Quạt Axial-tech, Khung đúc Diecast, Vapour Chamber', group: 'detail' },
    { name: 'Đèn LED', val: 'ARGB Aura Sync viền thân và đuôi card', group: 'detail' },
    { name: 'Nguồn đề nghị', val: '750W trở lên', group: 'detail' },
    { name: 'Đầu cấp nguồn', val: '1 x 16-pin 12VHPWR (Đi kèm cáp chuyển 3x 8-pin)', group: 'detail' },
    { name: 'Kích thước', val: '336 x 150 x 63 mm (3.15 Slot)', group: 'dimension' },
    { name: 'Khối lượng', val: '1.8 kg', group: 'dimension' },
  ],

  // 5. MSI GeForce RTX 4060 VENTUS 2X
  'msi-rtx-4060-ventus-2x': [
    { name: 'Thương hiệu', val: 'MSI', group: 'general' },
    { name: 'Series', val: 'VENTUS 2X OC', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Màu sắc', val: 'Đen / Trắng (White Edition)', group: 'general' },
    { name: 'Chipset đồ họa', val: 'NVIDIA GeForce RTX 4060', group: 'detail' },
    { name: 'Dung lượng VRAM', val: '8GB GDDR6', group: 'detail' },
    { name: 'Giao diện bộ nhớ', val: '128-bit', group: 'detail' },
    { name: 'Số nhân CUDA', val: '3072 nhân', group: 'detail' },
    { name: 'Xung nhịp Boost', val: '2490 MHz (MSI Center: 2505 MHz)', group: 'detail' },
    { name: 'Tốc độ bộ nhớ', val: '17 Gbps', group: 'detail' },
    { name: 'Chuẩn giao tiếp', val: 'PCIe 4.0 x8 (khe x16 vật lý)', group: 'detail' },
    { name: 'Cổng xuất hình', val: '1x HDMI 2.1a, 3x DisplayPort 1.4a', group: 'detail' },
    { name: 'Độ phân giải tối đa', val: '7680 x 4320', group: 'detail' },
    { name: 'Hệ thống tản nhiệt', val: '2 Quạt TORX Fan 4.0 kép, Mặt lưng củng cố', group: 'detail' },
    { name: 'Công nghệ làm mát', val: 'Zero Frozr (Tự dừng quạt khi tải nhẹ)', group: 'detail' },
    { name: 'Nguồn đề nghị', val: '550W trở lên', group: 'detail' },
    { name: 'Đầu cấp nguồn', val: '1 x 8-pin PCIe', group: 'detail' },
    { name: 'Kích thước', val: '199 x 120 x 41 mm (Dual Slot)', group: 'dimension' },
    { name: 'Khối lượng', val: '546 g', group: 'dimension' },
  ],

  // 6. MSI MAG B650 Tomahawk WiFi
  'msi-mag-b650-tomahawk-wifi': [
    { name: 'Thương hiệu', val: 'MSI', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'MAG Tomahawk Gaming', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Chipset', val: 'AMD B650', group: 'detail' },
    { name: 'Socket', val: 'AM5 (Hỗ trợ Ryzen 7000/8000/9000)', group: 'detail' },
    { name: 'Kích thước', val: 'ATX (30.4 cm x 24.4 cm)', group: 'dimension' },
    { name: 'Số khe RAM', val: '4 x DDR5 DIMM', group: 'detail' },
    { name: 'Kiểu RAM hỗ trợ', val: 'DDR5 Dual Channel lên đến 7600+(OC) MHz', group: 'detail' },
    { name: 'Hỗ trợ bộ nhớ tối đa', val: '192GB', group: 'detail' },
    { name: 'Khe mở rộng', val: '1x PCIe 4.0 x16 bọc thép, 1x PCIe 4.0 x4, 1x PCIe 3.0 x1', group: 'detail' },
    { name: 'Lưu trữ M.2', val: '3 x M.2 PCIe 4.0 x4 (Kèm tản nhiệt Shield Frozr)', group: 'detail' },
    { name: 'Cổng SATA', val: '6 x SATA 6Gb/s', group: 'detail' },
    { name: 'Cổng xuất hình', val: '1 x HDMI 2.1, 1 x DisplayPort 1.4', group: 'detail' },
    { name: 'Cổng USB sau', val: '1x USB 3.2 Gen 2x2 Type-C (20Gbps), 3x USB 3.2 Gen 2, 4x USB 3.2 Gen 1, 2x USB 2.0', group: 'detail' },
    { name: 'Kết nối mạng', val: 'Realtek 2.5Gbps LAN, AMD Wi-Fi 6E, Bluetooth 5.3', group: 'detail' },
    { name: 'Âm thanh', val: 'Realtek ALC4080 7.1 Channel High Definition Audio', group: 'detail' },
    { name: 'Dàn cấp điện (VRM)', val: '14+2+1 Phase Duet Rail Power System (80A SPS)', group: 'detail' },
  ],

  // 7. ASUS ROG Strix B760-F Gaming WiFi
  'asus-rog-strix-b760f-gaming-wifi': [
    { name: 'Thương hiệu', val: 'ASUS', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'ROG Strix', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Chipset', val: 'Intel B760', group: 'detail' },
    { name: 'Socket', val: 'LGA1700 (Hỗ trợ Intel Gen 12, 13, 14)', group: 'detail' },
    { name: 'Kích thước', val: 'ATX (30.5 cm x 24.4 cm)', group: 'dimension' },
    { name: 'Số khe RAM', val: '4 x DDR5 DIMM', group: 'detail' },
    { name: 'Kiểu RAM hỗ trợ', val: 'DDR5 Dual Channel lên đến 7800+(OC) MHz, AEMP II', group: 'detail' },
    { name: 'Hỗ trợ bộ nhớ tối đa', val: '192GB', group: 'detail' },
    { name: 'Khe mở rộng', val: '1x PCIe 5.0 x16 (ROG SafeSlot), 1x PCIe 3.0 x16, 2x PCIe 3.0 x1', group: 'detail' },
    { name: 'Lưu trữ M.2', val: '3 x M.2 PCIe 4.0 x4 với tản nhiệt đúc khối cao cấp', group: 'detail' },
    { name: 'Cổng SATA', val: '4 x SATA 6Gb/s', group: 'detail' },
    { name: 'Cổng xuất hình', val: '1 x HDMI 2.1, 1 x DisplayPort 1.4', group: 'detail' },
    { name: 'Cổng USB sau', val: '1x USB 3.2 Gen 2x2 Type-C, 1x USB 3.2 Gen 2 Type-C, 6x USB 3.2 Gen 1/Gen 2, 2x USB 2.0', group: 'detail' },
    { name: 'Kết nối mạng', val: 'Intel 2.5Gb Ethernet, Wi-Fi 6E (802.11ax), Bluetooth 5.3', group: 'detail' },
    { name: 'Âm thanh', val: 'ROG SupremeFX 7.1 ALC4080 + Savitech SV3H712 AMP', group: 'detail' },
    { name: 'Dàn cấp điện (VRM)', val: '16+1 Phase Power Stages (60A)', group: 'detail' },
  ],

  // 8. ASUS ROG Strix B650E-I Gaming WiFi
  'asus-rog-strix-b650e-i-gaming-wifi': [
    { name: 'Thương hiệu', val: 'ASUS', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'ROG Strix Mini-ITX', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Chipset', val: 'AMD B650E (PCIe 5.0 Extreme)', group: 'detail' },
    { name: 'Socket', val: 'AM5', group: 'detail' },
    { name: 'Kích thước', val: 'Mini-ITX (17.0 cm x 17.0 cm)', group: 'dimension' },
    { name: 'Số khe RAM', val: '2 x DDR5 DIMM', group: 'detail' },
    { name: 'Kiểu RAM hỗ trợ', val: 'DDR5 Dual Channel lên đến 6400+(OC) MHz, EXPO', group: 'detail' },
    { name: 'Hỗ trợ bộ nhớ tối đa', val: '96GB', group: 'detail' },
    { name: 'Khe mở rộng', val: '1 x PCIe 5.0 x16 (SafeSlot bọc kim loại)', group: 'detail' },
    { name: 'Lưu trữ M.2', val: '1x M.2 PCIe 5.0 x4 + 1x M.2 PCIe 4.0 x4 (Kèm tản nhiệt xếp tầng)', group: 'detail' },
    { name: 'Cổng SATA', val: '2 x SATA 6Gb/s', group: 'detail' },
    { name: 'Cổng xuất hình', val: '1 x HDMI 2.1', group: 'detail' },
    { name: 'Cổng USB sau', val: '1x USB 3.2 Gen 2x2 Type-C, 5x USB 3.2 Gen 2, 2x USB 2.0', group: 'detail' },
    { name: 'Kết nối mạng', val: 'Intel 2.5Gb LAN, Wi-Fi 6E, Bluetooth 5.2', group: 'detail' },
    { name: 'Âm thanh', val: 'ROG SupremeFX ALC4080 High Definition', group: 'detail' },
    { name: 'Dàn cấp điện (VRM)', val: '10+2 Phase (80A SPS)', group: 'detail' },
  ],

  // 9. GIGABYTE B760M DS3H DDR4
  'gigabyte-b760m-ds3h-ddr4': [
    { name: 'Thương hiệu', val: 'GIGABYTE', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'Ultra Durable', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Chipset', val: 'Intel B760', group: 'detail' },
    { name: 'Socket', val: 'LGA1700', group: 'detail' },
    { name: 'Kích thước', val: 'Micro-ATX (24.4 cm x 24.4 cm)', group: 'dimension' },
    { name: 'Số khe RAM', val: '4 x DDR4 DIMM', group: 'detail' },
    { name: 'Kiểu RAM hỗ trợ', val: 'DDR4 Dual Channel lên đến 5333(OC) MHz', group: 'detail' },
    { name: 'Hỗ trợ bộ nhớ tối đa', val: '128GB', group: 'detail' },
    { name: 'Khe mở rộng', val: '1x PCIe 4.0 x16, 2x PCIe 3.0 x1', group: 'detail' },
    { name: 'Lưu trữ M.2', val: '2 x M.2 PCIe 4.0 x4', group: 'detail' },
    { name: 'Cổng SATA', val: '4 x SATA 6Gb/s', group: 'detail' },
    { name: 'Cổng xuất hình', val: '1x HDMI 2.0, 2x DisplayPort, 1x D-Sub (VGA)', group: 'detail' },
    { name: 'Cổng USB sau', val: '1x USB 3.2 Gen 2 Type-C, 3x USB 3.2 Gen 1, 2x USB 2.0', group: 'detail' },
    { name: 'Kết nối mạng', val: 'Realtek 2.5GbE LAN chip', group: 'detail' },
    { name: 'Âm thanh', val: 'Realtek Audio CODEC 7.1 HD', group: 'detail' },
    { name: 'Dàn cấp điện (VRM)', val: '6+2+1 Phase Hybrid Digital VRM', group: 'detail' },
  ],

  // 10. G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz
  'gskill-trident-z5-rgb-ddr5-32gb': [
    { name: 'Thương hiệu', val: 'G.Skill', group: 'general' },
    { name: 'Series', val: 'Trident Z5 RGB', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Loại RAM', val: 'DDR5', group: 'detail' },
    { name: 'Dung lượng', val: '32GB (2 x 16GB)', group: 'detail' },
    { name: 'Bus RAM', val: '6000 MHz', group: 'detail' },
    { name: 'Độ trễ (Timing)', val: 'CL30-36-36-96', group: 'detail' },
    { name: 'Điện áp (Voltage)', val: '1.35V', group: 'detail' },
    { name: 'Profile hỗ trợ', val: 'Intel XMP 3.0 & AMD EXPO', group: 'detail' },
    { name: 'Đèn LED', val: 'RGB đa sắc uốn lượn, hỗ trợ sync mainboard', group: 'detail' },
    { name: 'Màu sắc tản nhiệt', val: 'Đen nhám (Matte Black) / Trắng Bạc (Silver)', group: 'general' },
    { name: 'Chiều cao thanh RAM', val: '43.5 mm', group: 'dimension' },
  ],

  // 11. Corsair Vengeance RGB DDR5 32GB (2x16GB) 5600MHz
  'corsair-vengeance-rgb-ddr5-32gb-5600mhz': [
    { name: 'Thương hiệu', val: 'Corsair', group: 'general' },
    { name: 'Series', val: 'Vengeance RGB', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Loại RAM', val: 'DDR5', group: 'detail' },
    { name: 'Dung lượng', val: '32GB (2 x 16GB)', group: 'detail' },
    { name: 'Bus RAM', val: '5600 MHz', group: 'detail' },
    { name: 'Độ trễ (Timing)', val: 'CL36-36-36-76', group: 'detail' },
    { name: 'Điện áp', val: '1.25V', group: 'detail' },
    { name: 'Profile hỗ trợ', val: 'Intel XMP 3.0 & Corsair iCUE', group: 'detail' },
    { name: 'Đèn LED', val: '10 bóng LED Dynamic Panoramic RGB', group: 'detail' },
    { name: 'Tản nhiệt', val: 'Nhôm nguyên khối sơn tĩnh điện anodized', group: 'detail' },
    { name: 'Màu sắc', val: 'Đen / Trắng', group: 'general' },
    { name: 'Chiều cao thanh RAM', val: '45 mm', group: 'dimension' },
  ],

  // 12. Kingston Fury Beast DDR4 16GB (1x16GB) 3200MHz
  'kingston-fury-beast-ddr4-16gb-1x16gb-3200mhz': [
    { name: 'Thương hiệu', val: 'Kingston', group: 'general' },
    { name: 'Series', val: 'Fury Beast', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng', group: 'general' },
    { name: 'Loại RAM', val: 'DDR4', group: 'detail' },
    { name: 'Dung lượng', val: '16GB (1 x 16GB)', group: 'detail' },
    { name: 'Bus RAM', val: '3200 MHz', group: 'detail' },
    { name: 'Độ trễ (Timing)', val: 'CL16-20-20', group: 'detail' },
    { name: 'Điện áp', val: '1.35V', group: 'detail' },
    { name: 'Profile hỗ trợ', val: 'Intel XMP 2.0 & AMD Ryzen Ready', group: 'detail' },
    { name: 'Tản nhiệt', val: 'Nhôm mỏng thấp (Low-profile), tương thích tản khí lớn', group: 'detail' },
    { name: 'Màu sắc', val: 'Đen', group: 'general' },
    { name: 'Chiều cao thanh RAM', val: '34.1 mm', group: 'dimension' },
  ],

  // 13. Samsung 990 Pro NVMe M.2 SSD
  'samsung-990-pro-nvme-ssd': [
    { name: 'Thương hiệu', val: 'Samsung', group: 'general' },
    { name: 'Series', val: '990 PRO', group: 'general' },
    { name: 'Bảo hành', val: '60 tháng (5 năm)', group: 'general' },
    { name: 'Dung lượng', val: '1TB / 2TB', group: 'general' },
    { name: 'Chuẩn kết nối', val: 'PCIe Gen 4.0 x4, NVMe 2.0', group: 'detail' },
    { name: 'Kích thước', val: 'M.2 2280 (80.15 x 22.15 x 2.38 mm)', group: 'dimension' },
    { name: 'Bộ điều khiển (Controller)', val: 'Samsung Pascal Controller mạ niken tản nhiệt', group: 'detail' },
    { name: 'Loại chip nhớ', val: 'Samsung V-NAND TLC thế hệ thứ 7', group: 'detail' },
    { name: 'Bộ nhớ đệm (DRAM Cache)', val: '1GB LPDDR4 (bản 1TB) / 2GB LPDDR4 (bản 2TB)', group: 'detail' },
    { name: 'Tốc độ đọc tuần tự', val: 'Lên đến 7,450 MB/s', group: 'detail' },
    { name: 'Tốc độ ghi tuần tự', val: 'Lên đến 6,900 MB/s', group: 'detail' },
    { name: 'Đọc ngẫu nhiên (4KB, QD32)', val: '1,400,000 IOPS', group: 'detail' },
    { name: 'Ghi ngẫu nhiên (4KB, QD32)', val: '1,550,000 IOPS', group: 'detail' },
    { name: 'Độ bền (TBW)', val: '600 TBW (1TB) / 1200 TBW (2TB)', group: 'detail' },
    { name: 'Khối lượng', val: '9.0 g', group: 'dimension' },
  ],

  // 14. Corsair RM850e 850W 80 Plus Gold
  'corsair-rm850e-850w': [
    { name: 'Thương hiệu', val: 'Corsair', group: 'general' },
    { name: 'Series', val: 'RMe Series', group: 'general' },
    { name: 'Bảo hành', val: '84 tháng (7 năm)', group: 'general' },
    { name: 'Công suất danh định', val: '850W', group: 'detail' },
    { name: 'Chứng nhận hiệu suất', val: '80 Plus Gold (Lên đến 90%) & Cybenetics Platinum', group: 'detail' },
    { name: 'Chuẩn nguồn', val: 'ATX 3.0 & PCIe 5.0 Ready (Kèm cáp 12VHPWR 450W)', group: 'detail' },
    { name: 'Thiết kế cáp', val: 'Full Modular (Tháo rời toàn bộ)', group: 'detail' },
    { name: 'Kích thước quạt', val: '120mm Rifle Bearing Fan', group: 'detail' },
    { name: 'Chế độ quạt thông minh', val: 'Zero RPM Mode (Tự ngắt quạt khi tải thấp)', group: 'detail' },
    { name: 'Chuẩn bảo vệ', val: 'OVP, OCP, OTP, SCP, UVP, OPP', group: 'detail' },
    { name: 'Kích thước', val: '140 x 150 x 86 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '1.5 kg', group: 'dimension' },
  ],

  // 15. NZXT Kraken X63 RGB AIO 280mm
  'nzxt-kraken-x63-rgb-280mm': [
    { name: 'Thương hiệu', val: 'NZXT', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'Kraken X Series', group: 'general' },
    { name: 'Bảo hành', val: '72 tháng (6 năm)', group: 'general' },
    { name: 'Loại tản nhiệt', val: 'Tản nhiệt nước All-in-One (AIO)', group: 'detail' },
    { name: 'Kích thước Két nước (Radiator)', val: '315 x 143 x 30 mm (Nhôm nguyên khối)', group: 'dimension' },
    { name: 'Bơm nước (Pump)', val: 'Asetek Gen 7 (800 - 2,800 ± 300 RPM)', group: 'detail' },
    { name: 'Mặt Block tiếp xúc', val: 'Đồng nguyên chất, Mặt gương vô cực xoay 360°', group: 'detail' },
    { name: 'Số lượng quạt', val: '2 x Quạt Aer RGB 2 140mm', group: 'detail' },
    { name: 'Tốc độ quạt', val: '500 - 1,500 ± 300 RPM', group: 'detail' },
    { name: 'Lưu lượng không khí', val: '30.39 - 91.19 CFM', group: 'detail' },
    { name: 'Độ ồn quạt', val: '22 - 33 dBA', group: 'detail' },
    { name: 'Tương thích Socket', val: 'Intel LGA1700/1200/115X, AMD AM5/AM4', group: 'detail' },
    { name: 'Đèn LED', val: 'ARGB tùy chỉnh qua phần mềm NZXT CAM', group: 'detail' },
    { name: 'Màu sắc', val: 'Đen / Trắng', group: 'general' },
  ],

  // 16. NZXT H7 Flow RGB ATX Mid Tower Case
  'nzxt-h7-flow-rgb-atx-mid-tower-case': [
    { name: 'Thương hiệu', val: 'NZXT', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'H7 Series', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Loại case', val: 'Mid-Tower', group: 'general' },
    { name: 'Chất liệu', val: 'Thép SGCC sơn tĩnh điện, Kính cường lực bên hông', group: 'detail' },
    { name: 'Hỗ trợ Mainboard', val: 'E-ATX (tối đa 272mm), ATX, Micro-ATX, Mini-ITX', group: 'detail' },
    { name: 'Số khe mở rộng PCI', val: '7 khe tiêu chuẩn', group: 'detail' },
    { name: 'Khay gắn ổ đĩa', val: '2 x 3.5", 4+2 x 2.5"', group: 'detail' },
    { name: 'Cổng kết nối I/O mặt trước', val: '2x USB 3.2 Gen 1 Type-A, 1x USB 3.2 Gen 2 Type-C, 1x Headset Audio Jack', group: 'detail' },
    { name: 'Quạt lắp sẵn', val: '3x Quạt F140 RGB Core 140mm (Trước) + 1x Quạt F120Q 120mm (Sau)', group: 'detail' },
    { name: 'Hỗ trợ Radiator tản nước', val: 'Trước tối đa 360mm / 280mm; Nóc tối đa 360mm / 280mm', group: 'detail' },
    { name: 'Chiều dài GPU tối đa', val: '400 mm', group: 'dimension' },
    { name: 'Chiều cao tản CPU tối đa', val: '185 mm', group: 'dimension' },
    { name: 'Chiều dài nguồn PSU tối đa', val: '200 mm', group: 'dimension' },
    { name: 'Kích thước case', val: '505 x 230 x 480 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '10.26 kg', group: 'dimension' },
    { name: 'Màu sắc', val: 'Đen / Trắng', group: 'general' },
  ],

  // 17. Corsair 4000D Airflow ATX Mid Tower Case
  'corsair-4000d-airflow-atx-mid-tower-case': [
    { name: 'Thương hiệu', val: 'Corsair', group: 'general' },
    { name: 'Dòng sản phẩm', val: '4000 Series Airflow', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Loại case', val: 'Mid-Tower', group: 'general' },
    { name: 'Chất liệu', val: 'Thép cao cấp, Lưới kim loại thoáng khí, Kính cường lực', group: 'detail' },
    { name: 'Hỗ trợ Mainboard', val: 'ATX, Micro-ATX, Mini-ITX', group: 'detail' },
    { name: 'Khe mở rộng', val: '7 ngang + 2 dọc (Hỗ trợ dựng đứng card)', group: 'detail' },
    { name: 'Khay ổ cứng', val: '2 x 3.5" HDD, 2 x 2.5" SSD', group: 'detail' },
    { name: 'Cổng kết nối trước', val: '1x USB 3.1 Type-C, 1x USB 3.0 Type-A, 1x Audio combo 3.5mm', group: 'detail' },
    { name: 'Quạt đi kèm', val: '2 x Quạt Corsair AirGuide 120mm độc quyền', group: 'detail' },
    { name: 'Hỗ trợ Radiator', val: 'Trước 360mm / 280mm, Nóc 240mm / 280mm, Sau 120mm', group: 'detail' },
    { name: 'Hệ thống đi dây', val: 'Corsair RapidRoute Cable Management (25mm rãnh đi dây)', group: 'detail' },
    { name: 'Chiều dài GPU tối đa', val: '360 mm', group: 'dimension' },
    { name: 'Chiều cao tản CPU tối đa', val: '170 mm', group: 'dimension' },
    { name: 'Kích thước case', val: '453 x 230 x 466 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '7.85 kg', group: 'dimension' },
    { name: 'Màu sắc', val: 'Đen / Trắng', group: 'general' },
  ],

  // 18. LG 27GP850-B 27" QHD 165Hz Nano IPS
  'lg-27gp850-b-27-qhd-165hz-nano-ips': [
    { name: 'Thương hiệu', val: 'LG', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'UltraGear Gaming', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Kích thước màn hình', val: '27 inch', group: 'detail' },
    { name: 'Độ phân giải', val: '2K QHD (2560 x 1440)', group: 'detail' },
    { name: 'Tấm nền', val: 'Nano IPS cao cấp', group: 'detail' },
    { name: 'Tần số quét', val: '165Hz (Overclock 180Hz qua DisplayPort)', group: 'detail' },
    { name: 'Thời gian phản hồi', val: '1ms (GtG nhanh nhất)', group: 'detail' },
    { name: 'Tỉ lệ khung hình', val: '16:9', group: 'detail' },
    { name: 'Độ sáng', val: '400 cd/m² (Hỗ trợ VESA DisplayHDR 400)', group: 'detail' },
    { name: 'Độ tương phản tĩnh', val: '1000:1', group: 'detail' },
    { name: 'Góc nhìn', val: '178° (Ngang) / 178° (Dọc)', group: 'detail' },
    { name: 'Độ phủ màu', val: 'DCI-P3 98% (CIE1976), 1.07 tỷ màu', group: 'detail' },
    { name: 'Công nghệ đồng bộ', val: 'NVIDIA G-Sync Compatible, AMD FreeSync Premium', group: 'detail' },
    { name: 'Cổng kết nối', val: '2x HDMI 2.0, 1x DisplayPort 1.4, 2x USB 3.0 Downstream, Jack 3.5mm', group: 'detail' },
    { name: 'Chuẩn gắn ARM', val: 'VESA 100 x 100 mm', group: 'detail' },
    { name: 'Chân đế công thái học', val: 'Điều chỉnh nâng hạ độ cao, xoay dọc 90 độ, nghiêng gập', group: 'detail' },
    { name: 'Kích thước (có chân)', val: '614.2 x 575.9 x 291.2 mm', group: 'dimension' },
    { name: 'Khối lượng (có chân)', val: '6.3 kg', group: 'dimension' },
  ],

  // 19. ASUS ROG Swift 27" 4K 160Hz OLED PG27AQDM
  'asus-rog-swift-27-4k-160hz-oled': [
    { name: 'Thương hiệu', val: 'ASUS', group: 'general' },
    { name: 'Series', val: 'ROG Swift OLED', group: 'general' },
    { name: 'Bảo hành', val: '36 tháng (Bao gồm bảo hành chống lưu ảnh Burn-in)', group: 'general' },
    { name: 'Kích thước màn hình', val: '27 inch (chính xác 26.5 inch)', group: 'detail' },
    { name: 'Độ phân giải', val: 'QHD 2K (2560 x 1440)', group: 'detail' },
    { name: 'Tấm nền', val: 'OLED thế hệ mới với lớp phủ Micro-texture chống chói', group: 'detail' },
    { name: 'Tần số quét', val: '240Hz siêu tốc độ thể thao điện tử', group: 'detail' },
    { name: 'Thời gian phản hồi', val: '0.03ms (GtG)', group: 'detail' },
    { name: 'Tỉ lệ khung hình', val: '16:9', group: 'detail' },
    { name: 'Độ sáng', val: '1000 nits (Peak HDR 3%), 450 cd/m² (100% APL)', group: 'detail' },
    { name: 'Độ tương phản tĩnh', val: '1,500,000:1 (Màu đen tuyệt đối True Black)', group: 'detail' },
    { name: 'Độ phủ màu', val: 'DCI-P3 99%, sRGB 135%, Delta E < 2 cân màu chuẩn xuất xưởng', group: 'detail' },
    { name: 'Công nghệ đồng bộ', val: 'NVIDIA G-Sync Compatible, AMD FreeSync Premium', group: 'detail' },
    { name: 'Hệ thống tản nhiệt', val: 'Tản nhiệt buồng hơi tùy biến (Custom Heatsink) chống quá nhiệt OLED', group: 'detail' },
    { name: 'Cổng kết nối', val: '1x DisplayPort 1.4 (DSC), 2x HDMI 2.0, 2x USB 3.2 Gen 1, Jack tai nghe 3.5mm, Cổng quang Optical', group: 'detail' },
    { name: 'Chuẩn gắn ARM', val: 'VESA 100 x 100 mm', group: 'detail' },
    { name: 'Kích thước (có chân)', val: '605 x 508 x 274 mm', group: 'dimension' },
    { name: 'Khối lượng (có chân)', val: '6.9 kg', group: 'dimension' },
  ],

  // 20. Samsung Odyssey G5 34" UWQHD 165Hz Cong 1000R
  'samsung-odyssey-g5-34-uwqhd-165hz': [
    { name: 'Thương hiệu', val: 'Samsung', group: 'general' },
    { name: 'Series', val: 'Odyssey G5 UltraWide', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Kích thước màn hình', val: '34 inch', group: 'detail' },
    { name: 'Độ cong màn hình', val: '1000R (Bao quát trọn vẹn tầm mắt)', group: 'detail' },
    { name: 'Tỉ lệ khung hình', val: '21:9 UltraWide Cinema', group: 'detail' },
    { name: 'Độ phân giải', val: 'Ultra WQHD (3440 x 1440)', group: 'detail' },
    { name: 'Tấm nền', val: 'VA góc nhìn rộng', group: 'detail' },
    { name: 'Tần số quét', val: '165Hz', group: 'detail' },
    { name: 'Thời gian phản hồi', val: '1ms (MPRT)', group: 'detail' },
    { name: 'Độ tương phản tĩnh', val: '4000:1 (Sắc nét đến từng chi tiết bóng tối)', group: 'detail' },
    { name: 'Độ sáng', val: '300 cd/m² (Hỗ trợ HDR10)', group: 'detail' },
    { name: 'Góc nhìn', val: '178° (Ngang) / 178° (Dọc)', group: 'detail' },
    { name: 'Công nghệ đồng bộ', val: 'AMD FreeSync Premium', group: 'detail' },
    { name: 'Cổng kết nối', val: '1x DisplayPort 1.4, 1x HDMI 2.0, 1x Headphone Jack', group: 'detail' },
    { name: 'Chuẩn gắn ARM', val: 'VESA 75 x 75 mm', group: 'detail' },
    { name: 'Kích thước (có chân)', val: '806.6 x 475.3 x 272.6 mm', group: 'dimension' },
    { name: 'Khối lượng (có chân)', val: '5.6 kg', group: 'dimension' },
  ],

  // 21. Logitech G Pro X Superlight 2 Wireless Gaming Mouse
  'logitech-g-pro-x-superlight-2': [
    { name: 'Thương hiệu', val: 'Logitech G', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'PRO Series E-Sports', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Kiểu kết nối', val: 'Không dây LIGHTSPEED 2 / Có dây USB-C', group: 'detail' },
    { name: 'Tần số gửi tín hiệu (Polling Rate)', val: 'Lên đến 4000Hz (0.25ms siêu nhạy)', group: 'detail' },
    { name: 'Cảm biến (Sensor)', val: 'HERO 2 thế hệ mới nhất', group: 'detail' },
    { name: 'Độ phân giải (DPI)', val: '100 - 32,000 DPI (Gia tốc >40G, Tốc độ >500 IPS)', group: 'detail' },
    { name: 'Công nghệ Switch', val: 'Lai quang học - cơ học LIGHTFORCE (Độ bền 100 triệu lần nhấn)', group: 'detail' },
    { name: 'Số nút bấm', val: '5 nút lập trình qua phần mềm G HUB', group: 'detail' },
    { name: 'Bộ nhớ trong', val: 'Có (Lưu trực tiếp profile trên chuột)', group: 'detail' },
    { name: 'Thời lượng pin', val: 'Lên đến 95 giờ sử dụng liên tục (Sạc nhanh USB-C)', group: 'detail' },
    { name: 'Đế chuột (Skates)', val: '100% nhựa PTFE không pha tạp (Lướt êm mượt mà)', group: 'detail' },
    { name: 'Màu sắc', val: 'Đen / Trắng / Hồng', group: 'general' },
    { name: 'Kích thước', val: '125.0 x 63.5 x 40.0 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '60 g (Siêu nhẹ đẳng cấp thi đấu)', group: 'dimension' },
  ],

  // 22. Razer BlackWidow V4 Pro RGB Mechanical Keyboard
  'razer-blackwidow-v4-pro-rgb': [
    { name: 'Thương hiệu', val: 'Razer', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'BlackWidow V4 Pro', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Loại bàn phím', val: 'Bàn phím cơ Full-size cao cấp kèm đệm cổ tay nam châm', group: 'general' },
    { name: 'Kiểu kết nối', val: 'Cáp rời Type-C bọc dù + Cổng USB Passthrough', group: 'detail' },
    { name: 'Loại Switch', val: 'Razer Green Switch (Clicky) / Yellow Switch (Linear)', group: 'detail' },
    { name: 'Độ bền Switch', val: '100 triệu lần nhấn', group: 'detail' },
    { name: 'Tần số phản hồi (Polling Rate)', val: 'Lên đến 8000Hz Razer HyperPolling', group: 'detail' },
    { name: 'Đèn nền', val: 'Razer Chroma RGB Per-key + Dải LED viền gầm Underglow 3 mặt', group: 'detail' },
    { name: 'Phím chức năng', val: 'Núm xoay đa năng Razer Command Dial, 8 phím Macro, Cụm phím Media riêng', group: 'detail' },
    { name: 'Keycap', val: 'Doubleshot ABS cao cấp chống mòn chữ', group: 'detail' },
    { name: 'Đệm kê tay', val: 'Đệm bọt xốp bọc da mềm từ tính tích hợp dải LED viền', group: 'detail' },
    { name: 'Chất liệu khung', val: 'Hợp kim nhôm 5052 cao cấp trên lớp lót foam tiêu âm', group: 'detail' },
    { name: 'Kích thước', val: '466 x 152 x 44 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '1.13 kg', group: 'dimension' },
  ],

  // 23. Dây cáp bọc lưới Sleeved Extension Kit RGB ATX 24Pin + PCIe
  'day-cap-boc-luoi-sleeved-extension-kit-rgb': [
    { name: 'Thương hiệu', val: 'WINNOTech Custom', group: 'general' },
    { name: 'Loại phụ kiện', val: 'Bộ dây nối dài nguồn PC bọc lưới cao cấp', group: 'general' },
    { name: 'Bảo hành', val: '12 tháng', group: 'general' },
    { name: 'Gói sản phẩm bao gồm', val: '1x 24-Pin ATX, 2x 8-Pin (6+2) PCIe VGA, 1x 8-Pin CPU', group: 'detail' },
    { name: 'Chiều dài dây', val: '300 mm', group: 'dimension' },
    { name: 'Chuẩn lõi dây', val: 'Lõi đồng mạ thiếc 16AWG chịu tải công suất cao (đến 600W)', group: 'detail' },
    { name: 'Lớp bọc lưới', val: 'Sợi bện PET mật độ cao 3 lớp chống rối và giữ dáng cong', group: 'detail' },
    { name: 'Phụ kiện kèm theo', val: '12 Lược kẹp cáp trong suốt định hình dây', group: 'detail' },
    { name: 'Hiệu ứng ánh sáng', val: 'Ống dẫn sáng sợi quang ARGB 5V 3-Pin sync mainboard', group: 'detail' },
    { name: 'Màu sắc', val: 'Trắng / Đen Carbon', group: 'general' },
  ],

  // 24. NZXT RGB Fan Controller & Commander Hub
  'nzxt-rgb-fan-controller-commander-hub': [
    { name: 'Thương hiệu', val: 'NZXT', group: 'general' },
    { name: 'Dòng sản phẩm', val: 'CAM Powered Hub', group: 'general' },
    { name: 'Bảo hành', val: '24 tháng', group: 'general' },
    { name: 'Loại phụ kiện', val: 'Bộ điều tốc quạt PWM và trung tâm quản lý LED RGB', group: 'general' },
    { name: 'Kênh quạt', val: '3 kênh điều tốc PWM (Hỗ trợ tối đa 9 quạt qua cáp chia)', group: 'detail' },
    { name: 'Kênh LED RGB', val: '6 kênh NZXT RGB (Hỗ trợ lên đến 120 bóng LED)', group: 'detail' },
    { name: 'Công suất đầu ra', val: 'Tối đa 36W (12W mỗi kênh quạt)', group: 'detail' },
    { name: 'Đầu nối nguồn', val: 'Cáp SATA Power 12V', group: 'detail' },
    { name: 'Giao tiếp bo mạch chủ', val: 'Đầu cắm USB 2.0 Header 9-pin nội bộ', group: 'detail' },
    { name: 'Phương thức lắp đặt', val: 'Nam châm tích hợp mặt lưng hoặc dán keo 3M', group: 'detail' },
    { name: 'Phần mềm điều khiển', val: 'NZXT CAM (Điều khiển đường cong nhiệt độ & ánh sáng)', group: 'detail' },
    { name: 'Kích thước', val: '101 x 65 x 15 mm', group: 'dimension' },
    { name: 'Khối lượng', val: '89 g', group: 'dimension' },
  ],
};

// Dữ liệu biến thể chuẩn xác cho từng sản phẩm
const PRODUCT_VARIANTS_DATA = {
  // AMD Ryzen 7 7800X3D
  'amd-ryzen-7-7800x3d': [
    {
      variant_name: 'Ryzen 7 7800X3D - Box Chính Hãng',
      price: 8990000,
      sale_price: 7641500,
      sku: 'CPU-7800X3D-BOX',
      stock_quantity: 23,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Box Chính Hãng' },
        { name: 'Socket CPU', val: 'AM5' },
      ],
    },
    {
      variant_name: 'Ryzen 7 7800X3D - Tray Không Quạt',
      price: 8190000,
      sale_price: 6961500,
      sku: 'CPU-7800X3D-TRAY',
      stock_quantity: 15,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Tray Không Quạt' },
        { name: 'Socket CPU', val: 'AM5' },
      ],
    },
  ],

  // Intel Core i7-14700K
  'intel-core-i7-14700k': [
    {
      variant_name: 'i7-14700K - Box Chính Hãng',
      price: 9490000,
      sale_price: 8541000,
      sku: 'CPU-14700K-BOX',
      stock_quantity: 19,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Box Chính Hãng' },
        { name: 'Socket CPU', val: 'LGA1700' },
      ],
    },
    {
      variant_name: 'i7-14700K - Tray Không Quạt',
      price: 8790000,
      sale_price: 7911000,
      sku: 'CPU-14700K-TRAY',
      stock_quantity: 15,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Tray Không Quạt' },
        { name: 'Socket CPU', val: 'LGA1700' },
      ],
    },
  ],

  // Intel Core i5-13400F
  'intel-core-i5-13400f': [
    {
      variant_name: 'i5-13400F - Box Chính Hãng',
      price: 4990000,
      sale_price: 4490000,
      sku: 'CPU-13400F-BOX',
      stock_quantity: 20,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Box Chính Hãng' },
        { name: 'Socket CPU', val: 'LGA1700' },
      ],
    },
    {
      variant_name: 'i5-13400F - Tray Không Quạt',
      price: 4390000,
      sale_price: 3990000,
      sku: 'CPU-13400F-TRAY',
      stock_quantity: 12,
      attributes: [
        { name: 'Quy cách đóng gói', val: 'Tray Không Quạt' },
        { name: 'Socket CPU', val: 'LGA1700' },
      ],
    },
  ],

  // ASUS ROG Strix GeForce RTX 4070 Ti Super
  'asus-rog-strix-rtx-4070-ti-super': [
    {
      variant_name: 'ROG Strix RTX 4070 Ti Super OC 16GB',
      price: 23990000,
      sale_price: 22790500,
      sku: 'GPU-4070TIS-ROG',
      stock_quantity: 8,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Ép Xung (OC Edition)' },
        { name: 'Dung lượng VRAM', val: '16GB' },
      ],
    },
  ],

  // MSI GeForce RTX 4060 VENTUS 2X
  'msi-rtx-4060-ventus-2x': [
    {
      variant_name: 'RTX 4060 Ventus 2X 8G OC - Đen',
      price: 8490000,
      sale_price: 7810800,
      sku: 'GPU-4060-V2X-BK',
      stock_quantity: 30,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
        { name: 'Dung lượng VRAM', val: '8GB' },
      ],
    },
    {
      variant_name: 'RTX 4060 Ventus 2X 8G OC - Trắng',
      price: 8690000,
      sale_price: 7994800,
      sku: 'GPU-4060-V2X-WH',
      stock_quantity: 18,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
        { name: 'Dung lượng VRAM', val: '8GB' },
      ],
    },
  ],

  // MSI MAG B650 Tomahawk WiFi
  'msi-mag-b650-tomahawk-wifi': [
    {
      variant_name: 'MAG B650 Tomahawk WiFi',
      price: 6490000,
      sale_price: 5711200,
      sku: 'MB-B650-TOMA',
      stock_quantity: 18,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn (Wi-Fi 6E)' },
      ],
    },
  ],

  // ASUS ROG Strix B760-F Gaming WiFi
  'asus-rog-strix-b760f-gaming-wifi': [
    {
      variant_name: 'ROG Strix B760-F Gaming WiFi',
      price: 6990000,
      sale_price: 6291000,
      sku: 'MB-B760F-ROG',
      stock_quantity: 12,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn (Wi-Fi 6E)' },
      ],
    },
  ],

  // ASUS ROG Strix B650E-I Gaming WiFi
  'asus-rog-strix-b650e-i-gaming-wifi': [
    {
      variant_name: 'ROG Strix B650E-I Gaming WiFi (Mini-ITX)',
      price: 7490000,
      sale_price: 6890000,
      sku: 'MB-B650EI-ROG',
      stock_quantity: 10,
      attributes: [
        { name: 'Phiên bản', val: 'Mini-ITX Wi-Fi' },
      ],
    },
  ],

  // GIGABYTE B760M DS3H DDR4
  'gigabyte-b760m-ds3h-ddr4': [
    {
      variant_name: 'GIGABYTE B760M DS3H DDR4',
      price: 3390000,
      sale_price: 3190000,
      sku: 'MB-B760M-DS3H',
      stock_quantity: 15,
      attributes: [
        { name: 'Phiên bản', val: 'Micro-ATX DDR4' },
      ],
    },
  ],

  // G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz
  'gskill-trident-z5-rgb-ddr5-32gb': [
    {
      variant_name: 'Trident Z5 RGB DDR5 32GB (2x16GB) - Đen',
      price: 3990000,
      sale_price: 3591000,
      sku: 'RAM-TZ5-32G-BK',
      stock_quantity: 35,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
        { name: 'Dung lượng RAM', val: '32GB' },
      ],
    },
    {
      variant_name: 'Trident Z5 RGB DDR5 32GB (2x16GB) - Trắng',
      price: 4090000,
      sale_price: 3681000,
      sku: 'RAM-TZ5-32G-WH',
      stock_quantity: 20,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
        { name: 'Dung lượng RAM', val: '32GB' },
      ],
    },
  ],

  // Corsair Vengeance RGB DDR5 32GB (2x16GB) 5600MHz
  'corsair-vengeance-rgb-ddr5-32gb-5600mhz': [
    {
      variant_name: 'Corsair Vengeance RGB DDR5 32GB - Đen',
      price: 3490000,
      sale_price: 3190000,
      sku: 'RAM-VEN-32G-BK',
      stock_quantity: 19,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
        { name: 'Dung lượng RAM', val: '32GB' },
      ],
    },
    {
      variant_name: 'Corsair Vengeance RGB DDR5 32GB - Trắng',
      price: 3590000,
      sale_price: 3290000,
      sku: 'RAM-VEN-32G-WH',
      stock_quantity: 15,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
        { name: 'Dung lượng RAM', val: '32GB' },
      ],
    },
  ],

  // Kingston Fury Beast DDR4 16GB (1x16GB) 3200MHz
  'kingston-fury-beast-ddr4-16gb-1x16gb-3200mhz': [
    {
      variant_name: 'Kingston Fury Beast DDR4 16GB (1x16GB) 3200MHz',
      price: 1090000,
      sale_price: 990000,
      sku: 'RAM-FURY-16G-BK',
      stock_quantity: 25,
      attributes: [
        { name: 'Dung lượng RAM', val: '16GB' },
        { name: 'Màu sắc', val: 'Đen' },
      ],
    },
  ],

  // Samsung 990 Pro NVMe M.2 SSD
  'samsung-990-pro-nvme-ssd': [
    {
      variant_name: 'Samsung 990 Pro NVMe 1TB',
      price: 3290000,
      sale_price: 3026800,
      sku: 'SSD-990P-1TB',
      stock_quantity: 50,
      attributes: [
        { name: 'Dung lượng lưu trữ', val: '1TB' },
      ],
    },
    {
      variant_name: 'Samsung 990 Pro NVMe 2TB',
      price: 5990000,
      sale_price: 5510800,
      sku: 'SSD-990P-2TB',
      stock_quantity: 25,
      attributes: [
        { name: 'Dung lượng lưu trữ', val: '2TB' },
      ],
    },
  ],

  // Corsair RM850e 850W 80 Plus Gold
  'corsair-rm850e-850w': [
    {
      variant_name: 'RM850e 850W 80+ Gold Full Modular',
      price: 2990000,
      sale_price: 2840500,
      sku: 'PSU-RM850E',
      stock_quantity: 22,
      attributes: [
        { name: 'Công suất', val: '850W' },
      ],
    },
  ],

  // NZXT Kraken X63 RGB AIO 280mm
  'nzxt-kraken-x63-rgb-280mm': [
    {
      variant_name: 'Kraken X63 RGB 280mm - Đen',
      price: 4590000,
      sale_price: 4131000,
      sku: 'COOL-KRK-X63-BK',
      stock_quantity: 15,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
        { name: 'Kích thước Radiator', val: '280mm' },
      ],
    },
    {
      variant_name: 'Kraken X63 RGB 280mm - Trắng',
      price: 4790000,
      sale_price: 4311000,
      sku: 'COOL-KRK-X63-WH',
      stock_quantity: 10,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
        { name: 'Kích thước Radiator', val: '280mm' },
      ],
    },
  ],

  // NZXT H7 Flow RGB ATX Mid Tower Case
  'nzxt-h7-flow-rgb-atx-mid-tower-case': [
    {
      variant_name: 'NZXT H7 Flow RGB - Đen',
      price: 3890000,
      sale_price: 3590000,
      sku: 'CASE-H7F-RGB-BK',
      stock_quantity: 20,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
      ],
    },
    {
      variant_name: 'NZXT H7 Flow RGB - Trắng',
      price: 3990000,
      sale_price: 3690000,
      sku: 'CASE-H7F-RGB-WH',
      stock_quantity: 15,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
      ],
    },
  ],

  // Corsair 4000D Airflow ATX Mid Tower Case
  'corsair-4000d-airflow-atx-mid-tower-case': [
    {
      variant_name: 'Corsair 4000D Airflow - Đen',
      price: 2690000,
      sale_price: 2290000,
      sku: 'CASE-4000D-BK',
      stock_quantity: 25,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
      ],
    },
    {
      variant_name: 'Corsair 4000D Airflow - Trắng',
      price: 2790000,
      sale_price: 2390000,
      sku: 'CASE-4000D-WH',
      stock_quantity: 20,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
      ],
    },
  ],

  // LG 27GP850-B 27" QHD 165Hz Nano IPS
  'lg-27gp850-b-27-qhd-165hz-nano-ips': [
    {
      variant_name: 'Bản Tiêu Chuẩn (Chân Đế Theo Máy)',
      price: 8490000,
      sale_price: 7990000,
      sku: 'MON-LG-27GP850-STD',
      stock_quantity: 20,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn' },
      ],
    },
    {
      variant_name: 'Combo Kèm Giá Đỡ Màn Hình Arm Human Motion',
      price: 9390000,
      sale_price: 8790000,
      sku: 'MON-LG-27GP850-ARM',
      stock_quantity: 10,
      attributes: [
        { name: 'Phiên bản', val: 'Kèm Giá Đỡ Arm' },
      ],
    },
  ],

  // ASUS ROG Swift 27" 4K 160Hz OLED PG27AQDM
  'asus-rog-swift-27-4k-160hz-oled': [
    {
      variant_name: 'ROG Swift OLED PG27AQDM 240Hz 0.03ms',
      price: 19990000,
      sale_price: 18990000,
      sku: 'MON-ASUS-PG27AQDM',
      stock_quantity: 15,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn' },
      ],
    },
  ],

  // Samsung Odyssey G5 34" UWQHD 165Hz Cong 1000R
  'samsung-odyssey-g5-34-uwqhd-165hz': [
    {
      variant_name: 'Samsung Odyssey G5 34" 165Hz Cong 1000R',
      price: 11990000,
      sale_price: 10490000,
      sku: 'MON-SS-G5-34',
      stock_quantity: 20,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn' },
      ],
    },
  ],

  // Logitech G Pro X Superlight 2 Wireless Gaming Mouse
  'logitech-g-pro-x-superlight-2': [
    {
      variant_name: 'Logitech G Pro X Superlight 2 - Đen',
      price: 3890000,
      sale_price: 3490000,
      sku: 'MOU-GPX2-BK',
      stock_quantity: 20,
      attributes: [
        { name: 'Màu sắc', val: 'Đen' },
      ],
    },
    {
      variant_name: 'Logitech G Pro X Superlight 2 - Trắng',
      price: 3990000,
      sale_price: 3590000,
      sku: 'MOU-GPX2-WH',
      stock_quantity: 15,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
      ],
    },
    {
      variant_name: 'Logitech G Pro X Superlight 2 - Hồng Magenta',
      price: 4090000,
      sale_price: 3690000,
      sku: 'MOU-GPX2-PK',
      stock_quantity: 10,
      attributes: [
        { name: 'Màu sắc', val: 'Hồng Magenta' },
      ],
    },
  ],

  // Razer BlackWidow V4 Pro RGB Mechanical Keyboard
  'razer-blackwidow-v4-pro-rgb': [
    {
      variant_name: 'Razer BlackWidow V4 Pro - Green Switch (Clicky)',
      price: 4990000,
      sale_price: 4490000,
      sku: 'KB-BW-V4PRO-GR',
      stock_quantity: 19,
      attributes: [
        { name: 'Loại Switch', val: 'Green Switch (Clicky)' },
      ],
    },
    {
      variant_name: 'Razer BlackWidow V4 Pro - Yellow Switch (Linear)',
      price: 4990000,
      sale_price: 4490000,
      sku: 'KB-BW-V4PRO-YL',
      stock_quantity: 15,
      attributes: [
        { name: 'Loại Switch', val: 'Yellow Switch (Linear)' },
      ],
    },
  ],

  // Dây cáp bọc lưới Sleeved Extension Kit RGB ATX 24Pin + PCIe
  'day-cap-boc-luoi-sleeved-extension-kit-rgb': [
    {
      variant_name: 'Sleeved Extension Kit RGB - Trắng',
      price: 690000,
      sale_price: 590000,
      sku: 'EXT-RGB-WH',
      stock_quantity: 20,
      attributes: [
        { name: 'Màu sắc', val: 'Trắng' },
      ],
    },
    {
      variant_name: 'Sleeved Extension Kit RGB - Đen Carbon',
      price: 690000,
      sale_price: 590000,
      sku: 'EXT-RGB-BK',
      stock_quantity: 18,
      attributes: [
        { name: 'Màu sắc', val: 'Đen Carbon' },
      ],
    },
  ],

  // NZXT RGB Fan Controller & Commander Hub
  'nzxt-rgb-fan-controller-commander-hub': [
    {
      variant_name: 'NZXT RGB Fan Controller & Commander Hub',
      price: 890000,
      sale_price: 790000,
      sku: 'NZXT-FAN-CTRL',
      stock_quantity: 20,
      attributes: [
        { name: 'Phiên bản', val: 'Bản Tiêu Chuẩn' },
      ],
    },
  ],
};

async function runSeed() {
  try {
    console.log('⚡ Đang kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // Lấy danh sách sản phẩm trong database
    const products = await Product.find({}).lean();
    console.log(`📦 Tìm thấy ${products.length} sản phẩm trong hệ thống.\n`);

    let totalSpecsCreated = 0;
    let totalVariantsUpdated = 0;

    for (const p of products) {
      const slug = p.slug;
      console.log(`\n==================================================`);
      console.log(`🔍 Xử lý sản phẩm: [${p.name}] (slug: ${slug})`);

      // ── 1. ĐỒNG BỘ THÔNG SỐ KỸ THUẬT VÀO BẢNG Specifications ──
      const specsData = PRODUCT_SPECS_DATA[slug];
      if (specsData && specsData.length > 0) {
        console.log(`  📋 Đồng bộ ${specsData.length} thông số kỹ thuật...`);
        // Xóa thông số cũ của sản phẩm này để tạo mới chính xác nhất
        await Specification.deleteMany({ p_id: p._id });

        for (const specItem of specsData) {
          const catAttr = await getOrCreateCategoryAttr(specItem.name);
          const attrVal = await getOrCreateAttrValue(catAttr._id, specItem.val);

          await Specification.create({
            p_id: p._id,
            id_attribute_value: attrVal._id,
            status: 'active',
            is_deleted: false,
          });
          totalSpecsCreated++;
        }
        console.log(`  ✅ Đã lưu ${specsData.length} thông số vào collection Specifications.`);
      } else {
        console.log(`  ⚠️ Không tìm thấy bảng thông số mẫu cho slug: "${slug}"`);
      }

      // ── 2. ĐỒNG BỘ BIẾN THỂ VÀO BẢNG ProductVariant & VariantAttribute ──
      const variantsData = PRODUCT_VARIANTS_DATA[slug];
      if (variantsData && variantsData.length > 0) {
        console.log(`  🔄 Đồng bộ ${variantsData.length} biến thể...`);

        // Tìm các biến thể hiện tại của sản phẩm
        const existingVariants = await ProductVariant.find({ p_id: p._id });
        const existingVariantIds = existingVariants.map(v => v._id);

        // Xóa liên kết thuộc tính cũ trong VariantAttribute
        if (existingVariantIds.length > 0) {
          await VariantAttribute.deleteMany({ id_variants: { $in: existingVariantIds } });
        }

        // Xóa biến thể cũ để tái tạo chính xác
        await ProductVariant.deleteMany({ p_id: p._id });

        for (const vData of variantsData) {
          const newVariant = await ProductVariant.create({
            p_id: p._id,
            variant_name: vData.variant_name,
            price: vData.price,
            sale_price: vData.sale_price,
            sku: vData.sku,
            stock_quantity: vData.stock_quantity,
            status: 'active',
          });

          // Tạo liên kết thuộc tính cho biến thể
          if (vData.attributes && vData.attributes.length > 0) {
            for (const aItem of vData.attributes) {
              const catAttr = await getOrCreateCategoryAttr(aItem.name);
              const attrVal = await getOrCreateAttrValue(catAttr._id, aItem.val);

              await VariantAttribute.create({
                id_variants: newVariant._id,
                id_attribute_value: attrVal._id,
              });
            }
          }
          totalVariantsUpdated++;
        }
        console.log(`  ✅ Đã cập nhật ${variantsData.length} biến thể cùng thuộc tính.`);
      }
    }

    // Dọn dẹp 2 sản phẩm test rác nếu còn tồn tại
    const junkCount = await Product.deleteMany({ slug: { $in: ['sdgsg', 'sdfsfsd'] } });
    if (junkCount.deletedCount > 0) {
      console.log(`\n🧹 Đã dọn dẹp ${junkCount.deletedCount} sản phẩm test rác (sdgsg, sdfsfsd).`);
    }

    console.log(`\n🎉 HOÀN THÀNH ĐỒNG BỘ TẤT CẢ SẢN PHẨM!`);
    console.log(`📊 Tổng số thông số kỹ thuật được tạo: ${totalSpecsCreated}`);
    console.log(`📊 Tổng số biến thể được đồng bộ: ${totalVariantsUpdated}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi thực thi script đồng bộ:', err);
    process.exit(1);
  }
}

runSeed();
