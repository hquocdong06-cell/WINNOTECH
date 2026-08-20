const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { Image: ImageModel } = require('../models/BannerPaymentImage');

async function fixProduct() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const p = await ProductModel.findOne({ name: /Intel Core i9-14900K Box Chính Hãng V1/i });
  if (!p) {
    console.log('Product not found!');
    process.exit(1);
  }

  p.price = 14890000;
  p.thumnail = '/public/images/uploads/1787231198645-372582.png';
  await p.save();

  // Fix variants
  const variants = await ProductVariantModel.find({ p_id: p._id });
  for (const v of variants) {
    if (v.price === 0) {
      v.price = 14890000;
      v.sale_price = 14890000;
      v.stock_quantity = 10;
      await v.save();
    }
  }

  // Fix images
  let mainImg = await ImageModel.findOne({ p_id: p._id, is_main: true });
  if (mainImg) {
    mainImg.url = '/public/images/uploads/1787231198645-372582.png';
    await mainImg.save();
  } else {
    await ImageModel.create({
      p_id: p._id,
      url: '/public/images/uploads/1787231198645-372582.png',
      is_main: true
    });
  }

  console.log('✅ Product Intel Core i9-14900K updated successfully!');
  process.exit(0);
}

fixProduct();
