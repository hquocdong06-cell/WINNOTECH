const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');

async function testAdminProducts() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  
  const products = await ProductModel.find({ name: /Intel Core i9-14900K Box Chính Hãng V1/i }).lean();
  const productIds = products.map((p) => p._id);
  const variants = await ProductVariantModel.find({ p_id: { $in: productIds } }).lean();

  const variantMap = {};
  variants.forEach(v => {
    const pidStr = v.p_id.toString();
    if (!variantMap[pidStr]) variantMap[pidStr] = [];
    variantMap[pidStr].push(v);
  });

  const p = products[0];
  const pVariants = variantMap[p._id.toString()] || [];
  const validVariant = pVariants.find(v => v.price > 0) || pVariants[0];

  console.log('--- ADMIN PRODUCT FOR EDIT MODAL ---');
  console.log('Product ID:', p._id);
  console.log('Product Name:', p.name);
  console.log('Product Computed Price:', p.price || validVariant?.price);
  console.log('Product Computed Stock:', pVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0));
  console.log('Variants attached count:', pVariants.length);

  process.exit(0);
}

testAdminProducts();
