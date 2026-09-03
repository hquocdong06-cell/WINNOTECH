const mongoose = require('mongoose');
require('dotenv').config();

const { Order, OrderItem } = require('../models/Order');

async function fixOrderAmountsAndDates() {
  console.log('🔄 Đang kết nối MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');

  const orders = await Order.find({}).sort({ createdAt: -1 });
  console.log(`📦 Đang xử lý ${orders.length} đơn hàng...`);

  // Phân bổ thời gian ngẫu nhiên từ 6 tháng trước đến hiện tại (09/2026)
  const now = new Date('2026-09-03T22:00:00.000Z');
  const sixMonthsAgo = new Date('2026-03-01T00:00:00.000Z');
  const timeSpan = now.getTime() - sixMonthsAgo.getTime();

  let updatedCount = 0;

  for (let idx = 0; idx < orders.length; idx++) {
    const order = orders[idx];

    // Lấy các OrderItem thuộc đơn hàng này
    const items = await OrderItem.find({ order_id: order._id });

    let newTotal = 0;

    if (items.length > 0) {
      for (const item of items) {
        // Cập nhật Quantity thực tế (1 hoặc 2 chiếc)
        const safeQty = Math.min(item.Quantity || 1, 2);
        // Đảm bảo giá đơn vị hợp lý (500k - 25tr)
        let unitPrice = item.price || 5000000;
        if (unitPrice > 35000000) {
          unitPrice = Math.floor(3000000 + Math.random() * 20000000);
        }
        item.Quantity = safeQty;
        item.price = unitPrice;
        await item.save();

        newTotal += unitPrice * safeQty;
      }
    } else {
      // Đơn hàng không có order items (do seed trực tiếp Order) -> Tạo giá ngẫu nhiên hợp lý 3.500.000đ đến 24.500.000đ
      newTotal = Math.floor(3500000 + Math.random() * 21000000);
    }

    // Tạo ngày ngẫu nhiên phân bổ đều trong 6 tháng qua
    // Giữ lại ngày thật cho 5 đơn hàng mới nhất vừa đặt
    let orderDate = order.createdAt || order.date;
    if (idx >= 5) {
      const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * timeSpan;
      orderDate = new Date(randomTimestamp);
    }

    order.total_amount = newTotal;
    order.date = orderDate;
    order.createdAt = orderDate;
    order.updatedAt = orderDate;

    await order.save();
    updatedCount++;
  }

  console.log(`✅ Đã cập nhật lại tổng tiền & thời gian cho ${updatedCount} đơn hàng!`);

  // Tính lại tổng doanh thu hiện tại trong DB
  const agg = await Order.aggregate([
    { $match: { status: { $in: ['completed', 'delivered', 'done'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total_amount' }, totalCount: { $sum: 1 } } }
  ]);

  if (agg.length > 0) {
    console.log(`📈 Tổng doanh thu mới (từ ${agg[0].totalCount} đơn hoàn thành): ${agg[0].totalRevenue.toLocaleString('vi-VN')}₫`);
  }

  await mongoose.disconnect();
  console.log('🎉 Hoàn tất đồng bộ dữ liệu Dashboard!');
}

fixOrderAmountsAndDates().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
