const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Review: ReviewModel } = require('../models/FavoriteCompareReview');
const { OrderItem: OrderItemModel } = require('../models/Order');

async function testReview() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const orderItem = await OrderItemModel.findOne({});
  if (!orderItem) {
    console.log('No OrderItem found to review!');
    process.exit(0);
  }

  const review = await ReviewModel.create({
    id_oderitems: orderItem._id,
    content: '🚀 Giao hàng siêu nhanh - Sản phẩm dùng mượt tuyệt vời, đóng gói rất cẩn thận!',
    star_number: 5,
    status: 'active'
  });

  console.log('✅ Created test review successfully!');

  const reviews = await ReviewModel.find({});
  console.log('Total reviews count in DB:', reviews.length);

  process.exit(0);
}

testReview();
