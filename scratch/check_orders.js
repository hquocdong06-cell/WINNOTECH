const mongoose = require('mongoose');
require('dotenv').config();
const { Order, OrderItem } = require('../models/Order');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');
  const count = await Order.countDocuments();
  console.log('Total orders count:', count);
  const agg = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  console.log('Orders by status:', agg);
  const itemCount = await OrderItem.countDocuments();
  console.log('Total order items count:', itemCount);
  await mongoose.disconnect();
}

run();
