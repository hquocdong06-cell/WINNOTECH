const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { ProductVariant } = require('../models/ProductVariant');
const { CategoryAttribute, AttributeValue } = require('../models/Attribute');
const { Specification } = require('../models/Specification');

async function seedCpuAttributesAndSpecs() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WINNOTech';
  console.log('⚡ Kết nối MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  // 0. Xóa dữ liệu rác test 'wefwef' / '3123'
  console.log('\n🧹 Dọn dẹp dữ liệu rác test...');
  await db.collection('categories_attribute').deleteMany({ name: 'wefwef' });
  await db.collection('Attribute').deleteMany({ name: 'wefwef' });
  await db.collection('attribute_value').deleteMany({ value: '3123' });
  await db.collection('AttributeValue').deleteMany({ value: '3123' });
  console.log('✔ Đã xóa dữ liệu rác test wefwef / 3123');

  // 1. Danh sách tất cả các thuộc tính cần có (theo ảnh của người dùng)
  const categoryAttributesToEnsure = [
    'Thương hiệu',
    'Bảo hành',
    'Thương hiệu CPU',
    'Nhu cầu',
    'Series',
    'Thế hệ',
    'CPU',
    'Ra mắt',
    'Số nhân xử lý',
    'Số luồng của CPU',
    'Tốc độ xử lý',
    'Tiêu thụ điện năng',
    'Nhiệt độ tối đa',
    'Cache',
    'Socket',
    'Socket CPU',
    'RAM hỗ trợ',
    'Đồ hoạ tích hợp',
    'Phiên bản PCI Express'
  ];

  console.log('\n📁 Đảm bảo đầy đủ Danh mục thuộc tính (categories_attribute & Attribute)...');
  const catAttrMap = {};

  for (const name of categoryAttributesToEnsure) {
    let cat = await CategoryAttribute.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!cat) {
      cat = await CategoryAttribute.create({ name, status: 'active' });
      console.log(`  + Đã tạo Danh mục thuộc tính mới: "${name}" (ID: ${cat._id})`);
    } else {
      console.log(`  ✓ Đã tồn tại Danh mục thuộc tính: "${cat.name}"`);
    }
    // Đồng bộ sang collection Attribute để tương thích tuyệt đối
    await db.collection('Attribute').updateOne(
      { _id: cat._id },
      { $set: { name: cat.name, status: 'active', updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    catAttrMap[name] = cat;
  }

  // 2. Dữ liệu thật (AttributeValue) cho từng danh mục
  const realAttributeValues = {
    'Thương hiệu': ['AMD', 'Intel'],
    'Bảo hành': ['36 tháng', '24 tháng', '12 tháng'],
    'Thương hiệu CPU': ['AMD', 'Intel'],
    'Nhu cầu': ['Gaming', 'Văn phòng', 'Đồ họa - Kỹ thuật', 'Cao cấp'],
    'Series': ['Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'Ryzen 3', 'Core i3', 'Core i5', 'Core i7', 'Core i9', 'Core Ultra 7', 'Core Ultra 9'],
    'Thế hệ': [
      'AMD Ryzen thế hệ thứ 5',
      'AMD Ryzen 5000 Series',
      'AMD Ryzen 7000 Series',
      'AMD Ryzen 8000 Series',
      'AMD Ryzen 9000 Series',
      'Intel Gen 12th (Alder Lake)',
      'Intel Gen 13th (Raptor Lake)',
      'Intel Gen 14th (Raptor Lake Refresh)',
      'Intel Core Ultra 200S (Arrow Lake)'
    ],
    'CPU': [
      'AMD Ryzen™ 5 5500GT',
      'AMD Ryzen™ 5 5600X',
      'AMD Ryzen™ 5 7600',
      'AMD Ryzen™ 5 7600X',
      'AMD Ryzen™ 7 7700X',
      'AMD Ryzen™ 7 7800X3D',
      'AMD Ryzen™ 9 7950X',
      'AMD Ryzen™ 9 7950X3D',
      'AMD Ryzen™ 9 9900X',
      'AMD Ryzen™ 9 9950X',
      'Intel® Core™ i3-12100F',
      'Intel® Core™ i3-14100',
      'Intel® Core™ i3-14100F',
      'Intel® Core™ i5-13400F',
      'Intel® Core™ i5-13600K',
      'Intel® Core™ i5-14400F',
      'Intel® Core™ i5-14600K',
      'Intel® Core™ i7-13700K',
      'Intel® Core™ i7-14700F',
      'Intel® Core™ i7-14700K',
      'Intel® Core™ i9-12900K',
      'Intel® Core™ i9-13900KS',
      'Intel® Core™ i9-14900K',
      'Intel® Core™ Ultra 7 265K',
      'Intel® Core™ Ultra 9 285K'
    ],
    'Ra mắt': [
      '30/01/2024',
      '08/01/2024',
      '28/02/2023',
      '05/11/2020',
      '06/04/2023',
      '27/09/2022',
      '17/10/2023',
      '03/01/2023',
      '04/01/2022',
      '08/08/2024',
      '24/10/2024'
    ],
    'Số nhân xử lý': ['4', '6', '8', '10', '12', '14', '16', '20', '24'],
    'Số luồng của CPU': ['8', '12', '16', '20', '24', '28', '32'],
    'Tốc độ xử lý': [
      '3.6 GHz - 4.4 GHz',
      '3.7 GHz - 4.6 GHz',
      '3.8 GHz - 5.1 GHz',
      '4.7 GHz - 5.3 GHz',
      '4.5 GHz - 5.4 GHz',
      '4.2 GHz - 5.0 GHz',
      '4.2 GHz - 5.7 GHz',
      '4.5 GHz - 5.7 GHz',
      '3.3 GHz - 4.3 GHz',
      '3.5 GHz - 4.7 GHz',
      '2.5 GHz - 4.6 GHz',
      '3.5 GHz - 5.1 GHz',
      '3.5 GHz - 5.3 GHz',
      '3.4 GHz - 5.4 GHz',
      '3.4 GHz - 5.6 GHz',
      '3.2 GHz - 5.2 GHz',
      '3.2 GHz - 6.0 GHz',
      '3.9 GHz - 5.5 GHz',
      '3.7 GHz - 5.7 GHz'
    ],
    'Tiêu thụ điện năng': ['60W', '65W', '105W', '120W', '125W', '170W', '181W', '253W'],
    'Nhiệt độ tối đa': ['95°C', '89°C', '90°C', '100°C', '105°C'],
    'Cache': ['12MB', '16MB', '19MB', '20MB', '24MB', '32MB', '33MB', '35MB', '36MB', '40MB', '64MB', '96MB', '104MB', '128MB', '144MB'],
    'Socket': ['AM4', 'AM5', 'LGA 1700', 'LGA 1851', 'sTR5'],
    'Socket CPU': ['AM4', 'AM5', 'LGA 1700', 'LGA 1851', 'sTR5'],
    'RAM hỗ trợ': [
      '- DDR4 up to 3200 MT/s',
      '- DDR5 up to 5200 MT/s',
      '- DDR5 up to 5600 MT/s',
      '- DDR4 3200 / DDR5 4800 MT/s',
      '- DDR4 3200 / DDR5 5600 MT/s',
      '- DDR5 up to 6400 MT/s'
    ],
    'Đồ hoạ tích hợp': [
      'AMD Radeon™ Graphics',
      'Intel® UHD Graphics 770',
      'Intel® UHD Graphics 730',
      'Intel® Graphics (Xe-LPG)',
      'Không tích hợp'
    ],
    'Phiên bản PCI Express': ['PCIe® 3.0', 'PCIe® 4.0', 'PCIe® 5.0']
  };

  console.log('\n🏷 Đảm bảo các Giá trị thuộc tính (attribute_value & AttributeValue)...');
  const valDocMap = {}; // key: `${catName}:::${val}` -> doc

  for (const [catName, vals] of Object.entries(realAttributeValues)) {
    const cat = catAttrMap[catName];
    if (!cat) continue;

    for (const val of vals) {
      let vDoc = await AttributeValue.findOne({
        $or: [
          { id_categories_attribute: cat._id, value: val },
          { id_attribute: cat._id, value: val }
        ]
      });

      if (!vDoc) {
        vDoc = await AttributeValue.create({
          id_categories_attribute: cat._id,
          id_attribute: cat._id,
          value: val,
          status: 'active'
        });
        console.log(`  + Đã thêm giá trị: [${catName}] -> "${val}"`);
      }

      // Đồng bộ sang AttributeValue (PascalCase collection)
      await db.collection('AttributeValue').updateOne(
        { _id: vDoc._id },
        {
          $set: {
            value: vDoc.value,
            id_attribute: cat._id,
            id_categories_attribute: cat._id,
            status: 'active',
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      valDocMap[`${catName}:::${val}`] = vDoc;
    }
  }

  // Helper hàm lấy AttributeValue ID
  const getValDoc = (catName, valStr) => {
    return valDocMap[`${catName}:::${valStr}`];
  };

  // 3. Đảm bảo Brand và Category cho CPU
  const brandAmd = await Brand.findOne({ slug: 'amd' });
  const brandIntel = await Brand.findOne({ slug: 'intel' });
  const catCpu = await Category.findOne({ slug: 'cpu' });

  // 4. Tạo sản phẩm "AMD Ryzen 5 5500GT" theo đúng ảnh chụp nếu chưa có
  console.log('\n💎 Kiểm tra / Tạo sản phẩm "AMD Ryzen 5 5500GT" chuẩn data thật...');
  let p5500 = await Product.findOne({ slug: 'amd-ryzen-5-5500gt' });
  if (!p5500) {
    p5500 = await Product.create({
      name: 'AMD Ryzen 5 5500GT',
      slug: 'amd-ryzen-5-5500gt',
      cat_id: catCpu?._id,
      brand_id: brandAmd?._id,
      thumnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
      sale: 8,
      sold_count: 35,
      short_desc: 'CPU AMD Ryzen 5 5500GT (6 Nhân 12 Luồng | 3.6GHz - 4.4GHz | 16MB Cache | AM4 | Radeon Graphics)',
      description: 'Bộ vi xử lý AMD Ryzen 5 5500GT mang lại hiệu năng mạnh mẽ với 6 nhân 12 luồng, tích hợp đồ họa Radeon mạnh mẽ, phù hợp cho chơi game eSports và tác vụ văn phòng đồ họa mà không cần card rời.',
      status: 'active'
    });
    console.log(`  + Đã tạo mới sản phẩm: AMD Ryzen 5 5500GT (_id: ${p5500._id})`);

    // Tạo variant
    await ProductVariant.create({
      p_id: p5500._id,
      variant_name: 'AMD Ryzen 5 5500GT - Box Chính Hãng',
      price: 3290000,
      sale_price: 2990000,
      sku: 'CPU-AMD-R5-5500GT',
      stock_quantity: 40,
      status: 'active'
    });
  } else {
    console.log(`  ✓ Đã có sản phẩm: AMD Ryzen 5 5500GT (_id: ${p5500._id})`);
  }

  // 5. Cấu hình bảng thông số kỹ thuật thật cho các CPU
  console.log('\n⚙ Gán Specifications đầy đủ vào bảng Specifications (ERD) cho các CPU...');

  const cpuSpecsDataset = [
    {
      // Đúng y chang ảnh người dùng gửi
      match: /5500GT/i,
      specs: [
        { cat: 'Thương hiệu', val: 'AMD' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'AMD' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Ryzen 5' },
        { cat: 'Thế hệ', val: 'AMD Ryzen thế hệ thứ 5' },
        { cat: 'CPU', val: 'AMD Ryzen™ 5 5500GT' },
        { cat: 'Ra mắt', val: '30/01/2024' },
        { cat: 'Số nhân xử lý', val: '6' },
        { cat: 'Số luồng của CPU', val: '12' },
        { cat: 'Tốc độ xử lý', val: '3.6 GHz - 4.4 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '65W' },
        { cat: 'Nhiệt độ tối đa', val: '95°C' },
        { cat: 'Cache', val: '16MB' },
        { cat: 'Socket', val: 'AM4' },
        { cat: 'Socket CPU', val: 'AM4' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 up to 3200 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'AMD Radeon™ Graphics' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 3.0' }
      ]
    },
    {
      match: /5600X/i,
      specs: [
        { cat: 'Thương hiệu', val: 'AMD' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'AMD' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Ryzen 5' },
        { cat: 'Thế hệ', val: 'AMD Ryzen 5000 Series' },
        { cat: 'CPU', val: 'AMD Ryzen™ 5 5600X' },
        { cat: 'Ra mắt', val: '05/11/2020' },
        { cat: 'Số nhân xử lý', val: '6' },
        { cat: 'Số luồng của CPU', val: '12' },
        { cat: 'Tốc độ xử lý', val: '3.7 GHz - 4.6 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '65W' },
        { cat: 'Nhiệt độ tối đa', val: '95°C' },
        { cat: 'Cache', val: '32MB' },
        { cat: 'Socket', val: 'AM4' },
        { cat: 'Socket CPU', val: 'AM4' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 up to 3200 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Không tích hợp' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 4.0' }
      ]
    },
    {
      match: /7800X3D/i,
      specs: [
        { cat: 'Thương hiệu', val: 'AMD' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'AMD' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Ryzen 7' },
        { cat: 'Thế hệ', val: 'AMD Ryzen 7000 Series' },
        { cat: 'CPU', val: 'AMD Ryzen™ 7 7800X3D' },
        { cat: 'Ra mắt', val: '06/04/2023' },
        { cat: 'Số nhân xử lý', val: '8' },
        { cat: 'Số luồng của CPU', val: '16' },
        { cat: 'Tốc độ xử lý', val: '4.2 GHz - 5.0 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '120W' },
        { cat: 'Nhiệt độ tối đa', val: '89°C' },
        { cat: 'Cache', val: '96MB' },
        { cat: 'Socket', val: 'AM5' },
        { cat: 'Socket CPU', val: 'AM5' },
        { cat: 'RAM hỗ trợ', val: '- DDR5 up to 5200 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'AMD Radeon™ Graphics' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /7600X/i,
      specs: [
        { cat: 'Thương hiệu', val: 'AMD' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'AMD' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Ryzen 5' },
        { cat: 'Thế hệ', val: 'AMD Ryzen 7000 Series' },
        { cat: 'CPU', val: 'AMD Ryzen™ 5 7600X' },
        { cat: 'Ra mắt', val: '27/09/2022' },
        { cat: 'Số nhân xử lý', val: '6' },
        { cat: 'Số luồng của CPU', val: '12' },
        { cat: 'Tốc độ xử lý', val: '4.7 GHz - 5.3 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '105W' },
        { cat: 'Nhiệt độ tối đa', val: '95°C' },
        { cat: 'Cache', val: '32MB' },
        { cat: 'Socket', val: 'AM5' },
        { cat: 'Socket CPU', val: 'AM5' },
        { cat: 'RAM hỗ trợ', val: '- DDR5 up to 5200 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'AMD Radeon™ Graphics' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /7950X3D/i,
      specs: [
        { cat: 'Thương hiệu', val: 'AMD' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'AMD' },
        { cat: 'Nhu cầu', val: 'Cao cấp' },
        { cat: 'Series', val: 'Ryzen 9' },
        { cat: 'Thế hệ', val: 'AMD Ryzen 7000 Series' },
        { cat: 'CPU', val: 'AMD Ryzen™ 9 7950X3D' },
        { cat: 'Ra mắt', val: '28/02/2023' },
        { cat: 'Số nhân xử lý', val: '16' },
        { cat: 'Số luồng của CPU', val: '32' },
        { cat: 'Tốc độ xử lý', val: '4.2 GHz - 5.7 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '120W' },
        { cat: 'Nhiệt độ tối đa', val: '89°C' },
        { cat: 'Cache', val: '128MB' },
        { cat: 'Socket', val: 'AM5' },
        { cat: 'Socket CPU', val: 'AM5' },
        { cat: 'RAM hỗ trợ', val: '- DDR5 up to 5200 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'AMD Radeon™ Graphics' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /14900K/i,
      specs: [
        { cat: 'Thương hiệu', val: 'Intel' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'Intel' },
        { cat: 'Nhu cầu', val: 'Cao cấp' },
        { cat: 'Series', val: 'Core i9' },
        { cat: 'Thế hệ', val: 'Intel Gen 14th (Raptor Lake Refresh)' },
        { cat: 'CPU', val: 'Intel® Core™ i9-14900K' },
        { cat: 'Ra mắt', val: '17/10/2023' },
        { cat: 'Số nhân xử lý', val: '24' },
        { cat: 'Số luồng của CPU', val: '32' },
        { cat: 'Tốc độ xử lý', val: '3.2 GHz - 6.0 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '253W' },
        { cat: 'Nhiệt độ tối đa', val: '100°C' },
        { cat: 'Cache', val: '36MB' },
        { cat: 'Socket', val: 'LGA 1700' },
        { cat: 'Socket CPU', val: 'LGA 1700' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 3200 / DDR5 5600 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Intel® UHD Graphics 770' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /14700K|14700F/i,
      specs: [
        { cat: 'Thương hiệu', val: 'Intel' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'Intel' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Core i7' },
        { cat: 'Thế hệ', val: 'Intel Gen 14th (Raptor Lake Refresh)' },
        { cat: 'CPU', val: 'Intel® Core™ i7-14700K' },
        { cat: 'Ra mắt', val: '17/10/2023' },
        { cat: 'Số nhân xử lý', val: '20' },
        { cat: 'Số luồng của CPU', val: '28' },
        { cat: 'Tốc độ xử lý', val: '3.4 GHz - 5.6 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '253W' },
        { cat: 'Nhiệt độ tối đa', val: '100°C' },
        { cat: 'Cache', val: '33MB' },
        { cat: 'Socket', val: 'LGA 1700' },
        { cat: 'Socket CPU', val: 'LGA 1700' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 3200 / DDR5 5600 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Intel® UHD Graphics 770' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /14600K/i,
      specs: [
        { cat: 'Thương hiệu', val: 'Intel' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'Intel' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Core i5' },
        { cat: 'Thế hệ', val: 'Intel Gen 14th (Raptor Lake Refresh)' },
        { cat: 'CPU', val: 'Intel® Core™ i5-14600K' },
        { cat: 'Ra mắt', val: '17/10/2023' },
        { cat: 'Số nhân xử lý', val: '14' },
        { cat: 'Số luồng của CPU', val: '20' },
        { cat: 'Tốc độ xử lý', val: '3.5 GHz - 5.3 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '181W' },
        { cat: 'Nhiệt độ tối đa', val: '100°C' },
        { cat: 'Cache', val: '24MB' },
        { cat: 'Socket', val: 'LGA 1700' },
        { cat: 'Socket CPU', val: 'LGA 1700' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 3200 / DDR5 5600 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Intel® UHD Graphics 770' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /13400F/i,
      specs: [
        { cat: 'Thương hiệu', val: 'Intel' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'Intel' },
        { cat: 'Nhu cầu', val: 'Gaming' },
        { cat: 'Series', val: 'Core i5' },
        { cat: 'Thế hệ', val: 'Intel Gen 13th (Raptor Lake)' },
        { cat: 'CPU', val: 'Intel® Core™ i5-13400F' },
        { cat: 'Ra mắt', val: '03/01/2023' },
        { cat: 'Số nhân xử lý', val: '10' },
        { cat: 'Số luồng của CPU', val: '16' },
        { cat: 'Tốc độ xử lý', val: '2.5 GHz - 4.6 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '65W' },
        { cat: 'Nhiệt độ tối đa', val: '100°C' },
        { cat: 'Cache', val: '20MB' },
        { cat: 'Socket', val: 'LGA 1700' },
        { cat: 'Socket CPU', val: 'LGA 1700' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 3200 / DDR5 4800 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Không tích hợp' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 5.0' }
      ]
    },
    {
      match: /14100/i,
      specs: [
        { cat: 'Thương hiệu', val: 'Intel' },
        { cat: 'Bảo hành', val: '36 tháng' },
        { cat: 'Thương hiệu CPU', val: 'Intel' },
        { cat: 'Nhu cầu', val: 'Văn phòng' },
        { cat: 'Series', val: 'Core i3' },
        { cat: 'Thế hệ', val: 'Intel Gen 14th (Raptor Lake Refresh)' },
        { cat: 'CPU', val: 'Intel® Core™ i3-14100' },
        { cat: 'Ra mắt', val: '08/01/2024' },
        { cat: 'Số nhân xử lý', val: '4' },
        { cat: 'Số luồng của CPU', val: '8' },
        { cat: 'Tốc độ xử lý', val: '3.5 GHz - 4.7 GHz' },
        { cat: 'Tiêu thụ điện năng', val: '60W' },
        { cat: 'Nhiệt độ tối đa', val: '100°C' },
        { cat: 'Cache', val: '12MB' },
        { cat: 'Socket', val: 'LGA 1700' },
        { cat: 'Socket CPU', val: 'LGA 1700' },
        { cat: 'RAM hỗ trợ', val: '- DDR4 3200 / DDR5 4800 MT/s' },
        { cat: 'Đồ hoạ tích hợp', val: 'Intel® UHD Graphics 730' },
        { cat: 'Phiên bản PCI Express', val: 'PCIe® 4.0' }
      ]
    }
  ];

  // Lấy tất cả sản phẩm CPU trong database
  const allCpuProducts = await Product.find({
    $or: [
      { cat_id: catCpu?._id },
      { name: { $regex: /Ryzen|Intel|Core i|CPU/i } }
    ]
  });

  console.log(`Tìm thấy ${allCpuProducts.length} sản phẩm CPU trong DB để áp dụng thông số.`);

  let totalSpecsLinked = 0;

  for (const prod of allCpuProducts) {
    const config = cpuSpecsDataset.find(c => c.match.test(prod.name));
    if (!config) continue;

    for (const item of config.specs) {
      const vDoc = getValDoc(item.cat, item.val);
      if (!vDoc) {
        console.warn(`⚠️ Không tìm thấy AttributeValue cho: ${item.cat} -> ${item.val}`);
        continue;
      }

      await Specification.updateOne(
        { p_id: prod._id, id_attribute_value: vDoc._id },
        {
          $setOnInsert: {
            p_id: prod._id,
            id_attribute_value: vDoc._id,
            status: 'active',
            is_deleted: false
          }
        },
        { upsert: true }
      );
      totalSpecsLinked++;
    }
    console.log(`  ✓ Đã cập nhật ${config.specs.length} thông số cho: "${prod.name}"`);
  }

  console.log(`\n🎉 HOÀN TẤT SEEDING!`);
  console.log(`- Đã thêm đầy đủ các Danh mục thuộc tính còn thiếu.`);
  console.log(`- Đã tạo các Giá trị thuộc tính (Attribute Values) thật.`);
  console.log(`- Đã liên kết ${totalSpecsLinked} thông số chuẩn vào bảng Specifications cho các CPU.`);

  // Test kiểm tra lại 5500GT
  console.log('\n🔍 Kiểm tra sản phẩm AMD Ryzen 5 5500GT sau khi thêm thông số:');
  const checkSpecs = await Specification.find({ p_id: p5500._id, status: 'active', is_deleted: false })
    .populate({
      path: 'id_attribute_value',
      populate: { path: 'id_categories_attribute id_attribute', select: 'name' }
    })
    .lean();

  console.log(`Tổng số thông số của AMD Ryzen 5 5500GT: ${checkSpecs.length}`);
  checkSpecs.forEach(s => {
    const cat = s.id_attribute_value?.id_categories_attribute || s.id_attribute_value?.id_attribute;
    console.log(`  • ${cat?.name}: ${s.id_attribute_value?.value}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

seedCpuAttributesAndSpecs().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
