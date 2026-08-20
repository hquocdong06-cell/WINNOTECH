const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { OrderItem: OrderItemModel } = require('../models/Order');
const { Review: ReviewModel } = require('../models/FavoriteCompareReview');

async function testFetchProductReviews() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const p = await ProductModel.findOne({ name: /Intel Core i9-14900K Box Chính Hãng V1/i }).lean();
  console.log('Product ID:', p._id, 'Slug:', p.slug);

  const variants = await ProductVariantModel.find({ p_id: p._id }).select('_id').lean();
  const variantIds = variants.map(v => v._id);
  console.log('Variant IDs count:', variantIds.length);

  const orderItems = await OrderItemModel.find({ variants_id: { $in: variantIds } }).select('_id').lean();
  const orderItemIds = orderItems.map(item => item._id);
  console.log('OrderItem IDs count:', orderItemIds.length);

  const reviews = await ReviewModel.find({
    $or: [
      { id_oderitems: { $in: orderItemIds } },
      { p_id: p._id }
    ]
  }).populate({
    path: 'id_oderitems',
    populate: [
      { path: 'order_id', populate: { path: 'user_id', select: 'name email avatar' } },
      { path: 'variants_id', select: 'variant_name price' }
    ]
  }).lean();

  console.log('Found reviews count:', reviews.length);
  reviews.forEach(r => console.log(' Review content:', r.content, 'Stars:', r.star_number));

  process.exit(0);
}

testFetchProductReviews();
