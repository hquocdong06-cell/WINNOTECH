const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const { ProductVariant } = require('../models/ProductVariant');
const { Order, OrderItem } = require('../models/Order');

async function syncRecent() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');
  const recentOrder = await Order.findOne({ code: 'ORD-1788451120549' });
  if (recentOrder) {
    const items = await OrderItem.find({ order_id: recentOrder._id });
    for (const item of items) {
      const v = await ProductVariant.findById(item.variants_id);
      if (v) {
        const pId = v.product_id || v.p_id;
        const updatedProduct = await Product.findByIdAndUpdate(
          pId,
          { $inc: { sold_count: 1, sold_quantity: item.Quantity || 1, buyturn: 1 } },
          { new: true }
        );
        console.log('✅ Đã cập nhật sản phẩm:', updatedProduct.name, '| Lượt bán mới (sold_count):', updatedProduct.sold_count);
      }
    }
  }
  await mongoose.disconnect();
}

syncRecent();
