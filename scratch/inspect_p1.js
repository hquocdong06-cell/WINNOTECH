const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { Image: ImageModel } = require('../models/BannerPaymentImage');

async function checkP() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  
  const product = await ProductModel.findOne({ name: /Intel Core i9-14900K Box Chính Hãng V1/i }).lean();
  if (!product) {
    console.log('Product not found!');
    process.exit(1);
  }

  console.log('--- PRODUCT ---');
  console.log('ID:', product._id);
  console.log('Name:', product.name);
  console.log('Thumbnail:', product.thumnail);

  const images = await ImageModel.find({ p_id: product._id }).lean();
  console.log('--- IMAGES count:', images.length);
  images.forEach(img => console.log('  Img:', img.url, 'is_main:', img.is_main));

  const variants = await ProductVariantModel.find({ p_id: product._id }).lean();
  console.log('--- VARIANTS count:', variants.length);
  variants.forEach(v => console.log('  Var:', v.variant_name, 'price:', v.price, 'sale_price:', v.sale_price, 'stock:', v.stock_quantity));

  process.exit(0);
}

checkP();
