/**
 * seed_product_sales.js
 * Tạo và lưu dữ liệu lượt bán thật (sold_count, sold_quantity) vào Database MongoDB
 * đồng thời tạo các Order và OrderItem tương ứng với trạng thái 'completed' / 'paid'
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const { ProductVariant } = require('./models/ProductVariant');
const { Order, OrderItem } = require('./models/Order');
const User = require('./models/User');

const CUSTOMER_NAMES = [
  'Nguyễn Văn Tuấn', 'Trần Quốc Huy', 'Lê Hoàng Nam', 'Phạm Minh Đức',
  'Đỗ Hữu Thắng', 'Võ Thị Mai', 'Hoàng Long', 'Bùi Tiến Đạt',
  'Ngô Thanh Tùng', 'Đặng Thảo My', 'Phan Văn Hậu', 'Trịnh Gia Bảo',
  'Dương Quốc Cường', 'Lý Hải Đăng', 'Vũ Đình Trọng', 'Hồ Ngọc Hà',
  'Mai Anh Dũng', 'Lương Minh Triết', 'Tô Hoài An', 'Cao Tiến Dũng'
];

const CITIES = [
  'Quận Cầu Giấy, Hà Nội',
  'Quận Đống Đa, Hà Nội',
  'Quận Ba Đình, Hà Nội',
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Quận Bình Thạnh, TP. Hồ Chí Minh',
  'Quận Hải Châu, Đà Nẵng',
  'Quận Ninh Kiều, Cần Thơ',
  'TP. Biên Hòa, Đồng Nai',
  'TP. Thủ Đức, TP. Hồ Chí Minh'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const prefixes = ['090', '091', '098', '097', '086', '088', '038', '039'];
  const prefix = getRandomItem(prefixes);
  const rest = Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  return prefix + rest;
}

// Xác định lượt bán phù hợp theo độ hot của sản phẩm
function getRealisticSoldCount(productName, catName = '') {
  const name = (productName || '').toLowerCase();
  const cat = (catName || '').toLowerCase();

  // Top hot gaming CPU
  if (name.includes('7800x3d')) return 892;
  if (name.includes('14600k')) return 765;
  if (name.includes('14700k')) return 684;
  if (name.includes('14900k')) return 528;
  if (name.includes('14100f')) return 615;
  if (name.includes('13600k')) return 642;
  if (name.includes('7600x')) return 583;
  if (name.includes('7950x')) return 418;
  if (name.includes('9950x')) return 352;
  if (name.includes('13900ks')) return 315;
  if (name.includes('ultra 9 285k') || name.includes('285k')) return 276;
  if (name.includes('14700f')) return 490;

  // Top GPUs
  if (name.includes('4060')) return 845;
  if (name.includes('4070 super') || name.includes('4070s')) return 672;
  if (name.includes('4070')) return 590;
  if (name.includes('5060')) return 385;
  if (name.includes('4080')) return 295;
  if (name.includes('4090')) return 188;
  if (name.includes('7800 xt')) return 320;
  if (name.includes('rx 6600') || name.includes('6600')) return 630;

  // Top RAM & SSD
  if (name.includes('990 pro')) return 920;
  if (name.includes('kingston nv2') || name.includes('nv2')) return 885;
  if (name.includes('vengeance')) return 750;
  if (name.includes('fury beast') || name.includes('fury')) return 815;
  if (name.includes('sn850x')) return 640;
  if (name.includes('trident z')) return 580;

  // Top Mainboards
  if (name.includes('b760')) return 610;
  if (name.includes('b650')) return 590;
  if (name.includes('z790')) return 395;
  if (name.includes('x670')) return 280;

  // Top Monitors
  if (name.includes('ultragear') || name.includes('lg')) return 460;
  if (name.includes('odyssey') || name.includes('samsung')) return 425;
  if (name.includes('tuf') || name.includes('asus')) return 480;

  // Categories base
  if (cat.includes('cpu')) return Math.floor(Math.random() * 250) + 180;
  if (cat.includes('gpu') || cat.includes('card')) return Math.floor(Math.random() * 220) + 160;
  if (cat.includes('ram') || cat.includes('ssd') || cat.includes('storage')) return Math.floor(Math.random() * 300) + 200;
  if (cat.includes('mainboard')) return Math.floor(Math.random() * 180) + 120;
  if (cat.includes('man-hinh') || cat.includes('màn hình')) return Math.floor(Math.random() * 160) + 100;
  if (cat.includes('ban-phim') || cat.includes('chuot') || cat.includes('tai-nghe')) return Math.floor(Math.random() * 250) + 150;
  if (cat.includes('psu') || cat.includes('nguồn') || cat.includes('case') || cat.includes('cooling')) return Math.floor(Math.random() * 180) + 90;

  // Generic fallback
  return Math.floor(Math.random() * 90) + 35;
}

async function seedSalesData() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/winnotech';
  console.log('🔄 Đang kết nối MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Kết nối MongoDB thành công!');

  // 1. Lấy toàn bộ sản phẩm kèm danh mục
  const products = await Product.find({}).populate('cat_id').lean();
  console.log(`📦 Tìm thấy tổng cộng ${products.length} sản phẩm.`);

  // 2. Lấy biến thể của tất cả sản phẩm
  const allVariants = await ProductVariant.find({}).lean();
  const productVariantMap = {};
  allVariants.forEach(v => {
    if (v.p_id) {
      const pidStr = v.p_id.toString();
      if (!productVariantMap[pidStr]) productVariantMap[pidStr] = [];
      productVariantMap[pidStr].push(v);
    }
  });

  // 3. Lấy hoặc tạo user mẫu để gán vào Order
  let sampleUser = await User.findOne({ role: 'user' }).lean();
  if (!sampleUser) {
    sampleUser = await User.findOne({}).lean();
  }
  const sampleUserId = sampleUser ? sampleUser._id : new mongoose.Types.ObjectId();

  // 4. Chuẩn bị bulk update cho Product và orders
  const bulkProductOps = [];
  const newOrders = [];
  const newOrderItems = [];

  let totalSalesAssigned = 0;
  const topProductsSummary = [];

  // Tạo mốc thời gian trải dài trong 6 tháng qua
  const now = Date.now();
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

  for (const prod of products) {
    const pIdStr = prod._id.toString();
    const catName = prod.cat_id?.name || '';
    const sold = getRealisticSoldCount(prod.name, catName);
    totalSalesAssigned += sold;

    bulkProductOps.push({
      updateOne: {
        filter: { _id: prod._id },
        update: {
          $set: {
            sold_count: sold,
            sold_quantity: sold,
          }
        }
      }
    });

    if (sold >= 500) {
      topProductsSummary.push({ name: prod.name, sold });
    }

    // Tạo các record OrderItem thực tế cho sản phẩm (chọn ngẫu nhiên một biến thể)
    const variants = productVariantMap[pIdStr] || [];
    const variant = variants[0];
    if (variant) {
      // Tạo 1 - 3 đơn hàng thực tế đại diện cho mỗi sản phẩm
      const orderCountForProd = Math.min(3, Math.max(1, Math.floor(sold / 100)));
      const qtyPerOrder = Math.max(1, Math.floor(sold / orderCountForProd));

      for (let i = 0; i < orderCountForProd; i++) {
        const orderId = new mongoose.Types.ObjectId();
        const randomTime = new Date(sixMonthsAgo + Math.random() * (now - sixMonthsAgo));
        const price = variant.sale_price > 0 ? variant.sale_price : (variant.price || prod.price || 500000);
        const qty = (i === 0) ? (sold - qtyPerOrder * (orderCountForProd - 1)) : qtyPerOrder;

        newOrders.push({
          _id: orderId,
          user_id: sampleUserId,
          code: `ORD-${Date.now()}-${newOrders.length}-${Math.floor(Math.random() * 10000)}`,
          status: 'completed',
          Name: getRandomItem(CUSTOMER_NAMES),
          Phone: getRandomPhone(),
          Adress: `${Math.floor(Math.random() * 200) + 1} ${getRandomItem(CITIES)}`,
          total_amount: price * qty,
          payment_status: 'paid',
          date: randomTime,
          createdAt: randomTime,
          updatedAt: randomTime,
        });

        newOrderItems.push({
          order_id: orderId,
          variants_id: variant._id,
          Quantity: qty,
          price: price,
        });
      }
    }
  }

  console.log(`💾 Đang cập nhật sold_count & sold_quantity cho ${bulkProductOps.length} sản phẩm...`);
  await Product.bulkWrite(bulkProductOps);
  console.log(`✅ Cập nhật thành công ${bulkProductOps.length} sản phẩm! Tổng lượt bán: ${totalSalesAssigned}`);

  console.log(`📝 Đang tạo ${newOrders.length} đơn hàng thực tế và ${newOrderItems.length} chi tiết đơn hàng (OrderItem)...`);
  // Insert theo chunk 500 để an toàn
  const CHUNK_SIZE = 500;
  for (let i = 0; i < newOrders.length; i += CHUNK_SIZE) {
    const orderChunk = newOrders.slice(i, i + CHUNK_SIZE);
    await Order.insertMany(orderChunk, { ordered: false });
  }
  for (let i = 0; i < newOrderItems.length; i += CHUNK_SIZE) {
    const itemChunk = newOrderItems.slice(i, i + CHUNK_SIZE);
    await OrderItem.insertMany(itemChunk, { ordered: false });
  }
  console.log(`✅ Tạo thành công ${newOrders.length} đơn hàng và ${newOrderItems.length} OrderItem vào DB!`);

  console.log('\n🏆 TOP SẢN PHẨM BÁN CHẠY NHẤT VỪA ĐƯỢC TẠO:');
  topProductsSummary.sort((a, b) => b.sold - a.sold).slice(0, 15).forEach((p, idx) => {
    console.log(`  ${idx + 1}. [Đã bán: ${p.sold}] ${p.name}`);
  });

  await mongoose.disconnect();
  console.log('\n🎉 HOÀN TẤT SEED LƯỢT BÁN THẬT VÀO DATABASE!');
}

seedSalesData().catch(err => {
  console.error('❌ Lỗi khi seed sales data:', err);
  process.exit(1);
});
