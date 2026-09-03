const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');

async function trimOrders() {
  console.log('🔄 Đang kết nối MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');

  const totalBefore = await Order.countDocuments();
  console.log(`📊 Tổng số đơn hàng hiện tại: ${totalBefore}`);

  // Lấy danh sách tất cả các đơn hàng 'completed'
  const completedOrders = await Order.find({ status: 'completed' }).sort({ createdAt: -1 }).select('_id');
  console.log(`📦 Số đơn hàng 'completed' hiện tại: ${completedOrders.length}`);

  const TARGET_COMPLETED = 277; // Giữ lại 277 đơn completed + 23 đơn khác = ~300 đơn tổng cộng
  if (completedOrders.length > TARGET_COMPLETED) {
    const keepCompleted = completedOrders.slice(0, TARGET_COMPLETED);
    const keepCompletedIds = new Set(keepCompleted.map(o => o._id.toString()));

    const deleteCompleted = completedOrders.slice(TARGET_COMPLETED);
    const deleteCompletedIds = deleteCompleted.map(o => o._id);

    console.log(`🗑️ Đang xóa ${deleteCompletedIds.length} đơn hàng completed dư thừa...`);

    // Xóa các đơn completed thừa
    await Order.deleteMany({ _id: { $in: deleteCompletedIds } });

    // Xóa OrderItem liên quan
    const deleteItemsRes = await OrderItem.deleteMany({ order_id: { $in: deleteCompletedIds } });
    console.log(`🗑️ Đã xóa ${deleteItemsRes.deletedCount} OrderItem thừa.`);
  }

  const totalAfter = await Order.countDocuments();
  console.log(`✅ Tổng số đơn hàng sau khi giảm: ${totalAfter}`);

  // Cập nhật lại sold_count & sold_quantity trên Product từ OrderItem còn lại
  console.log('🔄 Đang tính toán và cập nhật lại sold_count & sold_quantity cho tất cả Sản phẩm...');
  
  // Reset tất cả sold_count, sold_quantity về 0
  await Product.updateMany({}, { $set: { sold_count: 0, sold_quantity: 0 } });

  // Lấy tổng sold_count từ các OrderItem thuộc đơn completed
  const remainingCompletedOrders = await Order.find({ status: 'completed' }).select('_id');
  const remainingCompletedIds = remainingCompletedOrders.map(o => o._id);

  const salesAgg = await OrderItem.aggregate([
    { $match: { order_id: { $in: remainingCompletedIds } } },
    {
      $lookup: {
        from: 'productvariants',
        localField: 'variants_id',
        foreignField: '_id',
        as: 'variant'
      }
    },
    { $unwind: '$variant' },
    {
      $group: {
        _id: '$variant.product_id',
        totalSoldQty: { $sum: '$Quantity' },
        totalSoldOrders: { $sum: 1 }
      }
    }
  ]);

  const bulkOps = salesAgg.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        $set: {
          sold_count: item.totalSoldOrders,
          sold_quantity: item.totalSoldQty
        }
      }
    }
  }));

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
    console.log(`✅ Đã cập nhật lượt bán thật cho ${bulkOps.length} sản phẩm.`);
  }

  console.log('\n🎉 Hoàn tất giảm dữ liệu đơn hàng xuống ~300!');
  await mongoose.disconnect();
}

trimOrders().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
