const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Order: OrderModel, OrderItem: OrderItemModel } = require('../models/Order');
const { Review: ReviewModel } = require('../models/FavoriteCompareReview');

async function syncCompletedOrders() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const reviews = await ReviewModel.find({}).lean();
  console.log('Total reviews count:', reviews.length);

  const orderItemIds = reviews.map(r => r.id_oderitems).filter(Boolean);
  const orderItems = await OrderItemModel.find({ _id: { $in: orderItemIds } }).lean();
  const orderIds = [...new Set(orderItems.map(item => item.order_id?.toString()).filter(Boolean))];

  console.log('Order IDs to mark completed:', orderIds);

  const res = await OrderModel.updateMany(
    { _id: { $in: orderIds } },
    { $set: { status: 'completed' } }
  );

  console.log('✅ Updated orders count:', res.modifiedCount);

  process.exit(0);
}

syncCompletedOrders();
