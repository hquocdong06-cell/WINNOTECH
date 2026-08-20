const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { OrderItem: OrderItemModel } = require('../models/Order');
const { Review: ReviewModel } = require('../models/FavoriteCompareReview');

async function fixReviewLink() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  
  const p = await ProductModel.findOne({ name: /Intel Core i9-14900K Box Chính Hãng V1/i }).lean();
  console.log('Product ID:', p._id);

  const reviews = await ReviewModel.find({});
  console.log('Reviews count:', reviews.length);

  for (const r of reviews) {
    r.p_id = p._id;
    await r.save();
  }

  console.log('✅ Updated all test reviews with p_id:', p._id);
  process.exit(0);
}

fixReviewLink();
