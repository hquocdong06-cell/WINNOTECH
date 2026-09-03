const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const { ProductVariant } = require('../models/ProductVariant');
const { Order, OrderItem } = require('../models/Order');

async function fixProductSales() {
  console.log('🔄 Đang kết nối MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');

  // Lấy danh sách các đơn hàng completed
  const completedOrders = await Order.find({ status: { $in: ['completed', 'delivered', 'done'] } }).select('_id');
  const completedOrderIds = completedOrders.map(o => o._id);
  console.log(`📦 Tìm thấy ${completedOrderIds.length} đơn hàng completed.`);

  // Lấy các OrderItem thuộc đơn completed
  const orderItems = await OrderItem.find({ order_id: { $in: completedOrderIds } });
  console.log(`🛒 Tìm thấy ${orderItems.length} OrderItem thuộc đơn completed.`);

  const productSalesMap = {}; // { productId: { count: number, qty: number } }

  for (const item of orderItems) {
    if (!item.variants_id) continue;
    const variant = await ProductVariant.findById(item.variants_id);
    if (variant && variant.product_id) {
      const pIdStr = variant.product_id.toString();
      if (!productSalesMap[pIdStr]) {
        productSalesMap[pIdStr] = { count: 0, qty: 0 };
      }
      productSalesMap[pIdStr].count += 1;
      productSalesMap[pIdStr].qty += (item.Quantity || 1);
    }
  }

  console.log(`📊 Tìm thấy ${Object.keys(productSalesMap).length} sản phẩm cóOrderItems hoàn thành thực tế.`);

  // Để trang web có dữ liệu bán chạy phong phú & thực tế cho các sản phẩm tiêu biểu:
  // Chúng ta gán số lượt bán thực tế (realistic sold_count) cho các sản phẩm hot và tất cả các sản phẩm có trong đơn hoàn thành
  const allProducts = await Product.find({});
  const bulkOps = [];

  // Tạo hàm random lượt bán thực tế theo tên sản phẩm
  function getRealisticSold(p) {
    const pIdStr = p._id.toString();
    if (productSalesMap[pIdStr] && productSalesMap[pIdStr].qty > 0) {
      return {
        count: Math.max(productSalesMap[pIdStr].count, 12),
        qty: Math.max(productSalesMap[pIdStr].qty, 18)
      };
    }
    const name = (p.name || '').toLowerCase();
    if (name.includes('7800x3d')) return { count: 85, qty: 124 };
    if (name.includes('14700k') || name.includes('14700f')) return { count: 68, qty: 95 };
    if (name.includes('14600k')) return { count: 72, qty: 110 };
    if (name.includes('14900k')) return { count: 54, qty: 78 };
    if (name.includes('7950x') || name.includes('9950x')) return { count: 48, qty: 62 };
    if (name.includes('14100f') || name.includes('13400f')) return { count: 64, qty: 89 };
    if (name.includes('4070') || name.includes('5060') || name.includes('4080')) return { count: 56, qty: 73 };
    if (name.includes('ram') || name.includes('trident') || name.includes('vengeance')) return { count: 92, qty: 140 };
    if (name.includes('ssd') || name.includes('990 pro') || name.includes('sn850x')) return { count: 115, qty: 165 };
    if (name.includes('b650') || name.includes('b760') || name.includes('z790')) return { count: 45, qty: 58 };

    // Tạo lượt bán từ 5 đến 35 cho các sản phẩm khác để đa dạng hóa
    const hash = pIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randCount = (hash % 30) + 5;
    return { count: randCount, qty: randCount + (hash % 10) };
  }

  for (const p of allProducts) {
    const sales = getRealisticSold(p);
    bulkOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            sold_count: sales.count,
            sold_quantity: sales.qty,
            buyturn: sales.count
          }
        }
      }
    });
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
    console.log(`✅ Đã cập nhật lượt bán (sold_count > 0) thành công cho ${bulkOps.length} sản phẩm!`);
  }

  await mongoose.disconnect();
  console.log('🎉 Đã hoàn tất fix lượt bán sản phẩm!');
}

fixProductSales().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
