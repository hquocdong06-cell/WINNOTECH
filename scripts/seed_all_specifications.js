const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

function generateSpecifications(product) {
  const pName = (product.name || '').toUpperCase();
  const catSlug = (product.cat_id?.slug || '').toLowerCase();
  const catName = (product.cat_id?.name || '').toLowerCase();
  const brandName = product.brand_id?.name || 'Chính hãng';

  const specs = [];
  const add = (group, name, value) => {
    if (!name || !value) return;
    specs.push({ name: name.trim(), value: String(value).trim(), group });
  };

  // ============================================================
  // 1. CPU (Intel & AMD)
  // ============================================================
  if (catSlug === 'cpu' || catSlug === 'intel' || catSlug === 'amd' || pName.includes('CORE I') || pName.includes('RYZEN') || (pName.includes('INTEL') && !pName.includes('ARC'))) {
    const isIntel = pName.includes('INTEL') || pName.includes('CORE') || pName.includes('I3') || pName.includes('I5') || pName.includes('I7') || pName.includes('I9');
    const brand = isIntel ? 'Intel' : 'AMD';
    add('general', 'Thương hiệu', brand);
    add('general', 'Bảo hành', '36 Tháng Chính Hãng');
    add('general', 'Nhu cầu', pName.includes('I9') || pName.includes('RYZEN 9') || pName.includes('X3D') ? 'Gaming cao cấp & Đồ họa Workstation' : (pName.includes('I7') || pName.includes('RYZEN 7') ? 'Gaming chuyên nghiệp & Stream' : 'Gaming phổ thông & Văn phòng'));

    if (isIntel) {
      // Intel CPU
      const is14th = pName.includes('14900') || pName.includes('14700') || pName.includes('14600') || pName.includes('14400') || pName.includes('14100');
      const is13th = pName.includes('13900') || pName.includes('13700') || pName.includes('13600') || pName.includes('13400') || pName.includes('13100');
      const is12th = pName.includes('12900') || pName.includes('12700') || pName.includes('12600') || pName.includes('12400') || pName.includes('12100');

      let socket = 'LGA 1700';
      if (pName.includes('CORE ULTRA') || pName.includes('285K') || pName.includes('265K')) socket = 'LGA 1851';

      let cores = '6 Nhân / 12 Luồng';
      let baseClock = '2.5 GHz';
      let boostClock = '4.4 GHz';
      let cache = '18MB Intel Smart Cache';
      let tdp = '65W (Turbo 117W)';

      if (pName.includes('14900') || pName.includes('13900')) {
        cores = '24 Nhân / 32 Luồng (8 P-Core + 16 E-Core)';
        baseClock = '3.2 GHz';
        boostClock = pName.includes('14900KS') ? '6.2 GHz' : (pName.includes('14900') ? '6.0 GHz' : '5.8 GHz');
        cache = '36MB Intel Smart Cache';
        tdp = '125W (Turbo 253W)';
      } else if (pName.includes('14700')) {
        cores = '20 Nhân / 28 Luồng (8 P-Core + 12 E-Core)';
        baseClock = '3.4 GHz';
        boostClock = '5.6 GHz';
        cache = '33MB Intel Smart Cache';
        tdp = pName.includes('F') && !pName.includes('KF') ? '65W (Turbo 219W)' : '125W (Turbo 253W)';
      } else if (pName.includes('13700') || pName.includes('12900')) {
        cores = '16 Nhân / 24 Luồng (8 P-Core + 8 E-Core)';
        baseClock = '3.4 GHz';
        boostClock = '5.4 GHz';
        cache = '30MB Intel Smart Cache';
        tdp = '125W (Turbo 253W)';
      } else if (pName.includes('14600') || pName.includes('13600')) {
        cores = '14 Nhân / 20 Luồng (6 P-Core + 8 E-Core)';
        baseClock = '3.5 GHz';
        boostClock = pName.includes('14600') ? '5.3 GHz' : '5.1 GHz';
        cache = '24MB Intel Smart Cache';
        tdp = '125W (Turbo 181W)';
      } else if (pName.includes('14400') || pName.includes('13400')) {
        cores = '10 Nhân / 16 Luồng (6 P-Core + 4 E-Core)';
        baseClock = '2.5 GHz';
        boostClock = '4.7 GHz';
        cache = '20MB Intel Smart Cache';
        tdp = '65W (Turbo 148W)';
      } else if (pName.includes('14100') || pName.includes('13100') || pName.includes('12100')) {
        cores = '4 Nhân / 8 Luồng';
        baseClock = '3.5 GHz';
        boostClock = '4.7 GHz';
        cache = '12MB Intel Smart Cache';
        tdp = '60W (Turbo 110W)';
      }

      const hasIGPU = !pName.includes('F') || pName.includes('KF');
      const iGPU = pName.endsWith('F') || pName.includes(' F') || pName.includes('KF') ? 'Không tích hợp (Yêu cầu VGA rời)' : 'Intel UHD Graphics 770';

      add('detail', 'Socket Hỗ Trợ', socket);
      add('detail', 'Số Nhân / Số Luồng', cores);
      add('detail', 'Xung Nhịp Cơ Bản', baseClock);
      add('detail', 'Xung Nhịp Tối Đa (Boost)', boostClock);
      add('detail', 'Bộ Nhớ Đệm (Cache L3)', cache);
      add('detail', 'Công Suất Tiêu Thụ (TDP)', tdp);
      add('detail', 'Đồ Họa Tích Hợp (iGPU)', iGPU);
      add('detail', 'Chuẩn RAM Hỗ Trợ', 'DDR4 Up to 3200 MT/s / DDR5 Up to 5600 MT/s');
      add('detail', 'Hỗ Trợ PCIe', 'PCIe 5.0 & PCIe 4.0');
    } else {
      // AMD CPU
      let socket = pName.includes('5000') || pName.includes('5600') || pName.includes('5700') || pName.includes('5800') || pName.includes('5900') || pName.includes('5950') ? 'AM4' : 'AM5';
      let cores = '8 Nhân / 16 Luồng';
      let baseClock = '3.8 GHz';
      let boostClock = '5.0 GHz';
      let cache = '32MB L3 Cache';
      let tdp = '105W';

      if (pName.includes('7950') || pName.includes('9950') || pName.includes('5950')) {
        cores = '16 Nhân / 32 Luồng';
        baseClock = '4.2 GHz';
        boostClock = '5.7 GHz';
        cache = pName.includes('X3D') ? '128MB 3D V-Cache' : '64MB L3 Cache';
        tdp = pName.includes('X3D') ? '120W' : '170W';
      } else if (pName.includes('7900') || pName.includes('9900') || pName.includes('5900')) {
        cores = '12 Nhân / 24 Luồng';
        baseClock = '3.7 GHz';
        boostClock = '5.4 GHz';
        cache = pName.includes('X3D') ? '128MB 3D V-Cache' : '64MB L3 Cache';
        tdp = pName.includes('X3D') ? '120W' : '170W';
      } else if (pName.includes('7800X3D') || pName.includes('9800X3D') || pName.includes('5800X3D') || pName.includes('5700X3D')) {
        cores = '8 Nhân / 16 Luồng';
        baseClock = '4.2 GHz';
        boostClock = '5.0 GHz';
        cache = '96MB 3D V-Cache';
        tdp = '120W';
      } else if (pName.includes('7700') || pName.includes('9700') || pName.includes('5700') || pName.includes('5800')) {
        cores = '8 Nhân / 16 Luồng';
        baseClock = '3.8 GHz';
        boostClock = '5.3 GHz';
        cache = '32MB L3 Cache';
        tdp = pName.includes('X') ? '105W' : '65W';
      } else if (pName.includes('7600') || pName.includes('9600') || pName.includes('5600') || pName.includes('5500') || pName.includes('7500')) {
        cores = '6 Nhân / 12 Luồng';
        baseClock = '3.7 GHz';
        boostClock = pName.includes('7600') ? '5.1 GHz' : '4.6 GHz';
        cache = '32MB L3 Cache';
        tdp = '65W';
      }

      add('detail', 'Socket Hỗ Trợ', socket);
      add('detail', 'Số Nhân / Số Luồng', cores);
      add('detail', 'Xung Nhịp Cơ Bản', baseClock);
      add('detail', 'Xung Nhịp Tối Đa (Boost)', boostClock);
      add('detail', 'Bộ Nhớ Đệm (Cache L3)', cache);
      add('detail', 'Công Suất Tiêu Thụ (TDP)', tdp);
      add('detail', 'Đồ Họa Tích Hợp (iGPU)', socket === 'AM5' ? 'AMD Radeon Graphics (2 CUs)' : (pName.includes('G') ? 'AMD Radeon Vega Graphics' : 'Không có (Cần VGA rời)'));
      add('detail', 'Chuẩn RAM Hỗ Trợ', socket === 'AM5' ? 'DDR5 Up to 5200 MT/s' : 'DDR4 Up to 3200 MT/s');
    }
  }

  // ============================================================
  // 2. GPU / VGA (Card màn hình / Card gaming / Card đồ họa)
  // ============================================================
  else if (catSlug === 'gpu' || catSlug === 'card-gaming' || catSlug === 'card-do-hoa' || pName.includes('RTX') || pName.includes('GTX') || pName.includes('RADEON') || pName.includes('GEFORCE')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('ASUS') ? 'ASUS' : (pName.includes('MSI') ? 'MSI' : (pName.includes('GIGABYTE') ? 'Gigabyte' : 'Colorful'))));
    add('general', 'Bảo hành', '36 Tháng Chính Hãng');
    add('general', 'Nhu cầu', pName.includes('DO HOA') || catSlug.includes('do-hoa') ? 'Đồ họa chuyên nghiệp & Render 3D' : 'Gaming eSports & AAA 4K');

    let vram = '8GB GDDR6';
    let bus = '128-bit';
    let boost = '2460 MHz';
    let psu = '550W';
    let tdp = '115W';
    let pcie = 'PCIe 4.0 x16';
    let length = '242 mm';

    if (pName.includes('4090')) {
      vram = '24GB GDDR6X';
      bus = '384-bit';
      boost = '2520 - 2640 MHz';
      psu = '850W - 1000W';
      tdp = '450W';
      length = '336 mm';
    } else if (pName.includes('4080')) {
      vram = '16GB GDDR6X';
      bus = '256-bit';
      boost = '2550 MHz';
      psu = '750W - 850W';
      tdp = '320W';
      length = '310 mm';
    } else if (pName.includes('4070 TI')) {
      vram = '16GB GDDR6X';
      bus = '256-bit';
      boost = '2610 MHz';
      psu = '750W';
      tdp = '285W';
      length = '305 mm';
    } else if (pName.includes('4070')) {
      vram = '12GB GDDR6X';
      bus = '192-bit';
      boost = '2475 MHz';
      psu = '650W';
      tdp = '200W - 220W';
      length = '269 mm';
    } else if (pName.includes('4060 TI')) {
      vram = pName.includes('16GB') ? '16GB GDDR6' : '8GB GDDR6';
      bus = '128-bit';
      boost = '2535 MHz';
      psu = '550W - 650W';
      tdp = '160W';
      length = '250 mm';
    } else if (pName.includes('3060')) {
      vram = '12GB GDDR6';
      bus = '192-bit';
      boost = '1777 MHz';
      psu = '550W';
      tdp = '170W';
      length = '235 mm';
    } else if (pName.includes('7900')) {
      vram = '24GB GDDR6';
      bus = '384-bit';
      boost = '2500 MHz';
      psu = '800W';
      tdp = '355W';
      length = '320 mm';
    } else if (pName.includes('7800')) {
      vram = '16GB GDDR6';
      bus = '256-bit';
      boost = '2430 MHz';
      psu = '700W';
      tdp = '263W';
      length = '290 mm';
    }

    add('detail', 'Dung Lượng Bộ Nhớ (VRAM)', vram);
    add('detail', 'Băng Thông Bộ Nhớ (Bus Width)', bus);
    add('detail', 'Xung Nhịp Boost', boost);
    add('detail', 'Chuẩn Giao Tiếp', pcie);
    add('detail', 'Công Suất Tiêu Thụ (TDP)', tdp);
    add('detail', 'Nguồn Khuyến Nghị (Recommended PSU)', psu);
    add('detail', 'Cổng Xuất Hình', '3x DisplayPort 1.4a, 1x HDMI 2.1a');
    add('dimension', 'Chiều Dài Card (Length)', length);
  }

  // ============================================================
  // 3. RAM (Bộ nhớ trong)
  // ============================================================
  else if (catSlug === 'ram' || pName.includes('RAM') || pName.includes('DDR4') || pName.includes('DDR5')) {
    const isDDR5 = pName.includes('DDR5') || pName.includes('6000') || pName.includes('5600') || pName.includes('5200');
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('CORSAIR') ? 'Corsair' : (pName.includes('G.SKILL') ? 'G.Skill' : 'Kingston')));
    add('general', 'Bảo hành', '36 Tháng Chính Hãng');
    add('general', 'Màu sắc', pName.includes('WHITE') || pName.includes('TRANG') ? 'Trắng (White)' : 'Đen (Black)');
    add('general', 'Đèn LED', pName.includes('RGB') ? 'ARGB Đồng Bộ' : 'Không LED (Non-RGB)');

    let cap = '16GB (1x16GB)';
    if (pName.includes('64GB') || pName.includes('2X32GB')) cap = '64GB (2x32GB)';
    else if (pName.includes('32GB') || pName.includes('2X16GB')) cap = '32GB (2x16GB)';
    else if (pName.includes('8GB')) cap = '8GB (1x8GB)';

    let bus = isDDR5 ? '6000 MHz' : '3200 MHz';
    if (pName.includes('6400')) bus = '6400 MHz';
    else if (pName.includes('5600')) bus = '5600 MHz';
    else if (pName.includes('5200')) bus = '5200 MHz';
    else if (pName.includes('3600')) bus = '3600 MHz';

    let timing = isDDR5 ? 'CL30-36-36-76' : 'CL16-18-18-38';
    let voltage = isDDR5 ? '1.35V' : '1.35V';

    add('detail', 'Dung Lượng', cap);
    add('detail', 'Chuẩn Bộ Nhớ', isDDR5 ? 'DDR5' : 'DDR4');
    add('detail', 'Tốc Độ Bus', bus);
    add('detail', 'Độ Trễ (Latency Timing)', timing);
    add('detail', 'Điện Áp Hoạt Động', voltage);
    add('detail', 'Tính Năng Ép Xung', isDDR5 ? 'Intel XMP 3.0 & AMD EXPO' : 'Intel XMP 2.0');
  }

  // ============================================================
  // 4. MAINBOARD (Bo mạch chủ)
  // ============================================================
  else if (catSlug === 'mainboard' || pName.includes('MAINBOARD') || pName.includes('BO MACH') || pName.includes('B760') || pName.includes('Z790') || pName.includes('B650') || pName.includes('H610')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('ASUS') ? 'ASUS' : (pName.includes('MSI') ? 'MSI' : 'Gigabyte')));
    add('general', 'Bảo hành', '36 Tháng Chính Hãng');

    const isAM5 = pName.includes('B650') || pName.includes('X670') || pName.includes('A620') || pName.includes('X870');
    const isLGA1700 = pName.includes('Z790') || pName.includes('B760') || pName.includes('H610') || pName.includes('Z690') || pName.includes('B660');

    let chipset = 'Intel B760';
    let socket = 'LGA 1700';
    if (pName.includes('Z790')) chipset = 'Intel Z790';
    else if (pName.includes('H610')) chipset = 'Intel H610';
    else if (pName.includes('B650')) { chipset = 'AMD B650'; socket = 'AM5'; }
    else if (pName.includes('X670')) { chipset = 'AMD X670'; socket = 'AM5'; }
    else if (pName.includes('B550')) { chipset = 'AMD B550'; socket = 'AM4'; }

    let size = pName.includes('ITX') ? 'Mini-ITX' : (pName.includes('M-') || pName.includes('M ') || pName.includes('MATX') || pName.includes('PRIME B') ? 'Micro-ATX' : 'ATX');
    let ramSlots = size === 'Mini-ITX' ? '2 Khe DDR5' : (pName.includes('H610') ? '2 Khe DDR4' : (pName.includes('D4') ? '4 Khe DDR4' : '4 Khe DDR5'));

    add('detail', 'Socket Hỗ Trợ', socket);
    add('detail', 'Chipset', chipset);
    add('detail', 'Chuẩn Kích Thước (Form Factor)', size);
    add('detail', 'Số Khe Cắm RAM', ramSlots);
    add('detail', 'Hỗ Trợ Dung Lượng RAM Tối Đa', '192GB (DDR5) / 128GB (DDR4)');
    add('detail', 'Số Khe M.2 NVMe', pName.includes('Z790') || pName.includes('X670') ? '4x M.2 PCIe Gen4/Gen5' : '2x - 3x M.2 PCIe Gen4');
    add('detail', 'Khe Cắm Mở Rộng (PCIe)', '1x PCIe 5.0 x16, 1x PCIe 4.0 x16');
    add('detail', 'Kết Nối Không Dây', pName.includes('WIFI') || pName.includes('AX') ? 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3' : 'LAN 2.5GbE Realtek');
    add('detail', 'Cổng Xuất Hình', '1x HDMI 2.1, 1x DisplayPort 1.4');
  }

  // ============================================================
  // 5. SSD / STORAGE (Ổ cứng lưu trữ)
  // ============================================================
  else if (catSlug === 'storage' || catSlug === 'ssd' || pName.includes('SSD') || pName.includes('NVME') || pName.includes('HDD') || pName.includes('O CUNG')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('SAMSUNG') ? 'Samsung' : (pName.includes('KINGSTON') ? 'Kingston' : 'Western Digital (WD)')));
    add('general', 'Bảo hành', pName.includes('990') || pName.includes('SN850X') ? '60 Tháng Chính Hãng' : '36 Tháng Chính Hãng');

    let cap = '1TB';
    if (pName.includes('2TB')) cap = '2TB';
    else if (pName.includes('4TB')) cap = '4TB';
    else if (pName.includes('512GB') || pName.includes('500GB')) cap = '500GB';
    else if (pName.includes('256GB') || pName.includes('250GB')) cap = '250GB';

    let protocol = 'PCIe Gen4 x4 M.2 NVMe';
    let readSpeed = '5000 MB/s';
    let writeSpeed = '4500 MB/s';
    let tbw = '600 TBW';

    if (pName.includes('990 PRO') || pName.includes('SN850X')) {
      readSpeed = '7450 MB/s';
      writeSpeed = '6900 MB/s';
      tbw = cap === '2TB' ? '1200 TBW' : '600 TBW';
    } else if (pName.includes('980') || pName.includes('KC3000')) {
      readSpeed = '7000 MB/s';
      writeSpeed = '6000 MB/s';
      tbw = '800 TBW';
    } else if (pName.includes('GEN5') || pName.includes('T700')) {
      protocol = 'PCIe Gen5 x4 M.2 NVMe';
      readSpeed = '12400 MB/s';
      writeSpeed = '11800 MB/s';
    } else if (pName.includes('SATA') || pName.includes('870')) {
      protocol = 'SATA 3 (6Gb/s) 2.5 inch';
      readSpeed = '560 MB/s';
      writeSpeed = '530 MB/s';
    }

    add('detail', 'Dung Lượng Lưu Trữ', cap);
    add('detail', 'Chuẩn Giao Tiếp', protocol);
    add('detail', 'Kích Thước Thiết Kế', protocol.includes('SATA') ? '2.5 inch' : 'M.2 2280');
    add('detail', 'Tốc Độ Đọc Tuần Tự (Max Read)', readSpeed);
    add('detail', 'Tốc Độ Ghi Tuần Tự (Max Write)', writeSpeed);
    add('detail', 'Độ Bền Hoạt Động (TBW)', tbw);
    add('detail', 'Bộ Điều Khiển (Controller)', 'DRAM Cache Buffer tích hợp');
  }

  // ============================================================
  // 6. PSU (Nguồn máy tính)
  // ============================================================
  else if (catSlug === 'psu' || pName.includes('NGUON') || pName.includes('PSU') || pName.includes('WATT') || pName.includes('850W') || pName.includes('750W') || pName.includes('1000W') || pName.includes('650W')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('CORSAIR') ? 'Corsair' : (pName.includes('MSI') ? 'MSI' : (pName.includes('ASUS') ? 'ASUS' : 'Deepcool'))));
    add('general', 'Bảo hành', pName.includes('RMX') || pName.includes('RM') || pName.includes('1000W') ? '120 Tháng (10 Năm)' : '60 Tháng (5 Năm)');

    let wattage = '750W';
    if (pName.includes('1200W')) wattage = '1200W';
    else if (pName.includes('1000W')) wattage = '1000W';
    else if (pName.includes('850W')) wattage = '850W';
    else if (pName.includes('650W')) wattage = '650W';
    else if (pName.includes('550W')) wattage = '550W';

    let eff = pName.includes('PLATINUM') ? '80 Plus Platinum' : (pName.includes('BRONZE') ? '80 Plus Bronze' : '80 Plus Gold');
    let mod = pName.includes('MODULAR') || pName.includes('RM') || pName.includes('MAG') ? 'Full Modular (Dây Rời Toàn Bộ)' : 'Semi-Modular';

    add('detail', 'Công Suất Định Mức', wattage);
    add('detail', 'Chứng Nhận Hiệu Suất', eff);
    add('detail', 'Kiểu Cáp Nguồn', mod);
    add('detail', 'Chuẩn Nguồn Hỗ Trợ', 'ATX 3.0 & PCIe 5.0 (12VHPWR 16-pin)');
    add('detail', 'Kích Thước Quạt Làm Mát', '135mm FDB Fan (Chế độ Zero RPM khi tải thấp)');
    add('detail', 'Dải Điện Áp Đầu Vào', '100 - 240VAC (Auto)');
    add('detail', 'Tính Năng Bảo Vệ', 'OVP, OCP, OPP, OTP, SCP, UVP');
  }

  // ============================================================
  // 7. COOLING / TẢN NHIỆT PC
  // ============================================================
  else if (catSlug === 'cooling' || pName.includes('TAN NHIET') || pName.includes('COOLER') || pName.includes('AIO') || pName.includes('KRAKEN') || pName.includes('THERMALRIGHT')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('NZXT') ? 'NZXT' : (pName.includes('THERMALRIGHT') ? 'Thermalright' : (pName.includes('CORSAIR') ? 'Corsair' : 'Deepcool'))));
    add('general', 'Bảo hành', pName.includes('NZXT') || pName.includes('CORSAIR') ? '72 Tháng Chính Hãng' : '36 Tháng Chính Hãng');

    const isAIO = pName.includes('AIO') || pName.includes('KRAKEN') || pName.includes('360') || pName.includes('240') || pName.includes('NUOC');
    let type = isAIO ? 'Tản nhiệt nước All-in-One (AIO)' : 'Tản nhiệt khí Tháp Đôi (Dual Tower)';
    let radSize = pName.includes('360') ? '360 mm (3x Quạt 120mm)' : (pName.includes('280') ? '280 mm (2x Quạt 140mm)' : (pName.includes('240') ? '240 mm (2x Quạt 120mm)' : 'Tháp tản nhiệt 6 Ống Đồng'));

    add('detail', 'Loại Tản Nhiệt', type);
    add('detail', 'Kích Thước Radiator / Khối Tản', radSize);
    add('detail', 'Số Lượng Quạt Đi Kèm', isAIO && pName.includes('360') ? '3x Quạt 120mm ARGB PWM' : '2x Quạt 120mm ARGB');
    add('detail', 'Tốc Độ Vòng Quay Quạt (RPM)', '500 - 2000 RPM (±10%)');
    add('detail', 'Độ Ồn Tối Đa', '28.5 dBA');
    add('detail', 'Hiệu Ứng Ánh Sáng', pName.includes('LCD') ? 'Màn hình LCD 2.4 inch hiển thị nhiệt độ thực' : 'ARGB 16.8 triệu màu đồng bộ');
    add('detail', 'Socket CPU Hỗ Trợ', 'Intel LGA 1700 / LGA 1200 / LGA 1851 & AMD AM5 / AM4');
  }

  // ============================================================
  // 8. CASE (Vỏ máy tính)
  // ============================================================
  else if (catSlug === 'case' || pName.includes('CASE') || pName.includes('VO CASE') || pName.includes('THUNG MAY')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('NZXT') ? 'NZXT' : (pName.includes('CORSAIR') ? 'Corsair' : (pName.includes('MONTECH') ? 'Montech' : 'Xigmatek'))));
    add('general', 'Bảo hành', '12 - 24 Tháng');
    add('general', 'Màu sắc', pName.includes('WHITE') || pName.includes('TRANG') ? 'Trắng Tinh Khôi (White)' : 'Đen Huyền Bí (Black)');

    let formType = pName.includes('DUAL') || pName.includes('H9') || pName.includes('H6') || pName.includes('BE CA') ? 'Dual-Chamber Mid Tower (Bể Cá Panoramic)' : 'Mid Tower Hiện Đại';

    add('detail', 'Loại Vỏ Case', formType);
    add('detail', 'Chất Liệu', 'Khung Thép SPCC dày 0.8mm + 2 Mặt Kính Cường Lực 4mm');
    add('detail', 'Hỗ Trợ Mainboard', 'ATX, Micro-ATX, Mini-ITX');
    add('detail', 'Hỗ Trợ Chiều Dài VGA Tối Đa', '390 - 415 mm');
    add('detail', 'Hỗ Trợ Chiều Cao Tản Khí CPU', 'Tối đa 175 mm');
    add('detail', 'Hỗ Trợ Tản Nước AIO', 'Nóc case 360mm, Mặt bên 360mm, Đáy case 360mm');
    add('detail', 'Cổng Giao Tiếp Phía Trước (I/O)', '1x USB 3.2 Gen 2 Type-C, 2x USB 3.0, Audio combo jack');
    add('dimension', 'Kích Thước Sản Phẩm', '466 x 290 x 495 mm');
  }

  // ============================================================
  // 9. MÀN HÌNH MÁY TÍNH
  // ============================================================
  else if (catSlug === 'man-hinh' || pName.includes('MAN HINH') || pName.includes('MONITOR') || pName.includes('INCH')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : (pName.includes('ASUS') ? 'ASUS' : (pName.includes('LG') ? 'LG' : (pName.includes('SAMSUNG') ? 'Samsung' : 'Dell'))));
    add('general', 'Bảo hành', '36 Tháng Chính Hãng');

    let size = '27 inch';
    if (pName.includes('24') || pName.includes('23.8')) size = '24 inch';
    else if (pName.includes('32')) size = '32 inch';
    else if (pName.includes('34')) size = '34 inch Cong (21:9 UltraWide)';

    let res = pName.includes('4K') ? '4K UHD (3840 x 2160)' : (pName.includes('2K') || size.includes('27') ? '2K QHD (2560 x 1440)' : 'Full HD (1920 x 1080)');
    let hz = '180Hz';
    if (pName.includes('360')) hz = '360Hz';
    else if (pName.includes('240')) hz = '240Hz';
    else if (pName.includes('144')) hz = '144Hz';
    else if (pName.includes('100')) hz = '100Hz';

    let panel = pName.includes('OLED') ? 'QD-OLED Siêu Nét' : 'Fast IPS';
    let gtg = pName.includes('OLED') ? '0.03 ms (GTG)' : '1 ms (GTG) / 0.5 ms (MPRT)';

    add('detail', 'Kích Thước Màn Hình', size);
    add('detail', 'Độ Phân Giải Tối Đa', res);
    add('detail', 'Tần Số Quét', hz);
    add('detail', 'Công Nghệ Tấm Nền', panel);
    add('detail', 'Thời Gian Phản Hồi', gtg);
    add('detail', 'Độ Phủ Màu Chuẩn Đồ Họa', '99% sRGB / 95% DCI-P3 (Delta E < 2)');
    add('detail', 'Độ Sáng & Tương Phản', '400 nits (DisplayHDR 400), 1000:1');
    add('detail', 'Công Nghệ Chống Xé Hình', 'NVIDIA G-Sync Compatible & AMD FreeSync Premium');
    add('detail', 'Cổng Kết Nối', '2x HDMI 2.1, 1x DisplayPort 1.4, 1x Audio Out');
    add('dimension', 'Chuẩn Gắn Arm VESA', '100 x 100 mm');
  }

  // ============================================================
  // 10. GEAR: BÀN PHÍM, CHUỘT, TAI NGHE
  // ============================================================
  else if (catSlug === 'ban-phim' || pName.includes('BAN PHIM') || pName.includes('KEYBOARD')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : 'AKKO');
    add('general', 'Bảo hành', '12 - 24 Tháng');
    add('general', 'Loại Bàn Phím', 'Bàn phím cơ Custom Gaming');
    add('detail', 'Kết Nối Hỗ Trợ', '3 Chế độ: Type-C có dây + Wireless 2.4GHz + Bluetooth 5.1');
    add('detail', 'Loại Switch', 'Gateron Pro / Cherry MX Mechanical Switches (Hotswap 5-pin)');
    add('detail', 'Chất Liệu Keycap', 'PBT Double-Shot OEM Profile chống mòn bóng');
    add('detail', 'Hiệu Ứng Đèn LED', 'RGB 16.8 triệu màu với 20 chế độ nháy');
    add('detail', 'Dung Lượng Pin', '4000 mAh (Dùng liên tục lên tới 200 giờ)');
    add('dimension', 'Layout Thiết Kế', pName.includes('75') ? 'Layout 75% gọn gàng' : 'TKL 87 phím');
  }
  else if (catSlug === 'chuot-gaming' || pName.includes('CHUOT') || pName.includes('MOUSE')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : 'Logitech');
    add('general', 'Bảo hành', '24 Tháng Chính Hãng');
    add('detail', 'Kiểu Kết Nối', 'Không dây Lightspeed 2.4GHz + Cáp Type-C');
    add('detail', 'Mắt Đọc Cảm Biến', 'Cảm biến quang học cao cấp (Tối đa 26.000 - 32.000 DPI)');
    add('detail', 'Trọng Lượng Siêu Nhẹ', '60g (Thiết kế công thái học eSports)');
    add('detail', 'Switch Bấm', 'Optical-Mechanical Switches độ bền 100 triệu lần nhấn');
    add('detail', 'Thời Lượng Pin', 'Lên đến 95 giờ chơi game liên tục');
  }
  else if (catSlug === 'tai-nghe' || pName.includes('TAI NGHE') || pName.includes('HEADPHONE')) {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : 'HyperX');
    add('general', 'Bảo hành', '24 Tháng Chính Hãng');
    add('detail', 'Kiểu Tai Nghe', 'Chụp tai Over-ear cách âm cao cấp');
    add('detail', 'Đường Kính Màng Loa (Driver)', '50mm Neodymium Drivers');
    add('detail', 'Công Nghệ Âm Thanh', 'DTS Headphone:X Spatial Audio 7.1 vòm sống động');
    add('detail', 'Microphone', 'Mic khử ồn có thể tháo rời, chứng nhận Discord');
    add('detail', 'Chuẩn Kết Nối', 'Jack 3.5mm mạ vàng + Cáp USB Soundcard');
  }

  // ============================================================
  // 11. PREBUILT PC (PC Gaming, PC Đồ họa, PC Văn phòng)
  // ============================================================
  else if (catSlug.includes('pc') || pName.includes('PC GAMING') || pName.includes('BO MAY') || pName.includes('WORKSTATION')) {
    add('general', 'Thương hiệu', 'WINNOTECH Custom Build');
    add('general', 'Bảo hành', '36 Tháng Tận Nơi');
    add('general', 'Hệ Điều Hành', 'Windows 11 Pro 64-bit cài sẵn kích hoạt');
    add('general', 'Nhu cầu', catSlug.includes('do-hoa') ? 'Render 3D, Premiere, AutoCAD, SolidWorks' : 'Chiến mượt mọi tựa game AAA & eSports 2K/4K');

    add('detail', 'Bộ Vi Xử Lý (CPU)', pName.includes('I9') || pName.includes('R9') ? 'Intel Core i9 / AMD Ryzen 9 Mạnh Mẽ' : (pName.includes('I7') || pName.includes('R7') ? 'Intel Core i7-14700F / Ryzen 7' : 'Intel Core i5-13400F / i5-14400F'));
    add('detail', 'Card Đồ Họa (VGA)', pName.includes('4080') || pName.includes('4090') ? 'NVIDIA GeForce RTX 4080 / 4090 Đỉnh Cao' : (pName.includes('4070') ? 'NVIDIA GeForce RTX 4070 / 4070 Super 12GB' : 'NVIDIA GeForce RTX 4060 8GB GDDR6'));
    add('detail', 'Bộ Nhớ RAM', pName.includes('32GB') || pName.includes('64GB') ? '32GB / 64GB DDR5 Bus 6000MHz RGB' : '16GB (2x8GB) DDR4/DDR5 Dual Channel');
    add('detail', 'Ổ Cứng Lưu Trữ (SSD)', '1TB M.2 PCIe Gen4 NVMe Siêu Tốc');
    add('detail', 'Bo Mạch Chủ (Mainboard)', 'B760 / B650 Gaming Wi-Fi Cao Cấp');
    add('detail', 'Hệ Thống Tản Nhiệt', 'Tản nhiệt nước AIO 360mm ARGB Đồng Bộ');
    add('detail', 'Nguồn Máy Tính (PSU)', '750W - 850W 80 Plus Gold Chuẩn ATX 3.0');
    add('detail', 'Vỏ Case PC', 'Case Bể Cá 2 Mặt Kính Kèm 6-9 Fan ARGB Rực Rỡ');
  }

  // ============================================================
  // 12. PHỤ KIỆN KHÁC / FALLBACK
  // ============================================================
  else {
    add('general', 'Thương hiệu', brandName !== 'Chính hãng' ? brandName : 'Chính Hãng');
    add('general', 'Bảo hành', '12 Tháng Chính Hãng');
    add('detail', 'Phân Loại Sản Phẩm', 'Phụ kiện PC Chuyên dụng');
    add('detail', 'Chất Liệu Hoàn Thiện', 'Chống cháy cao cấp, độ bền tối ưu');
    add('detail', 'Tiêu Chuẩn Tương Thích', 'Phù hợp với mọi hệ thống máy tính hiện đại');
  }

  return specs;
}

async function runSeed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WINNOTech';
  console.log('⚡ Kết nối MongoDB...');
  await mongoose.connect(mongoUri);

  console.log('📦 Đang tải toàn bộ sản phẩm...');
  const products = await Product.find().populate('cat_id brand_id');
  console.log(`Tìm thấy tổng cộng ${products.length} sản phẩm.`);

  let updatedCount = 0;
  const categoryStats = {};

  for (const prod of products) {
    const specs = generateSpecifications(prod);
    prod.specifications = specs;
    await prod.save();

    updatedCount++;
    const catName = prod.cat_id?.name || 'Khác';
    categoryStats[catName] = (categoryStats[catName] || 0) + 1;
  }

  console.log('\n🎉 HOÀN THÀNH CẬP NHẬT!');
  console.log(`Đã nạp specifications thành công cho: ${updatedCount}/${products.length} sản phẩm.`);
  console.log('\n--- THỐNG KÊ SẢN PHẨM ĐÃ CẬP NHẬT THEO DANH MỤC ---');
  Object.entries(categoryStats).forEach(([cat, cnt]) => {
    console.log(`- ${cat}: ${cnt} sản phẩm`);
  });

  // In mẫu 5 sản phẩm ngẫu nhiên để kiểm tra
  console.log('\n--- KIỂM TRA MẪU 3 SẢN PHẨM KHÁC NHAU ---');
  const sampleNames = ['Intel Core i9-14900K', 'ASUS ROG Strix GeForce RTX 4070', 'Corsair Vengeance'];
  for (const name of sampleNames) {
    const p = await Product.findOne({ name: { $regex: new RegExp(name, 'i') } }).lean();
    if (p) {
      console.log(`\n▶ [${p.name}] - Danh mục: ${p.cat_id?.name || 'N/A'}`);
      console.log(`  Số thông số kỹ thuật: ${p.specifications.length}`);
      p.specifications.forEach(s => console.log(`  + [${s.group}] ${s.name}: ${s.value}`));
    }
  }

  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
