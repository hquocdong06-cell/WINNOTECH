const mongoose = require('mongoose');
require('dotenv').config();
const { Order } = require('../models/Order');

async function checkRevenue() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winnotech');
  const sepOrders = await Order.find({
    createdAt: { $gte: new Date('2026-09-01T00:00:00Z'), $lte: new Date('2026-09-30T23:59:59Z') },
    status: 'completed'
  }).lean();
  let sum = 0;
  sepOrders.forEach(o => sum += o.total_amount || 0);
  console.log('September 2026 Completed Orders Count:', sepOrders.length);
  console.log('September 2026 Total Revenue:', sum.toLocaleString('vi-VN') + '₫');
  await mongoose.disconnect();
}

checkRevenue();
