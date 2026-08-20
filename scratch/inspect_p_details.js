const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');

async function inspectProductFields() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  
  const p = await ProductModel.findOne({ name: /Intel Core i9-14900K Box Chính Hãng V1/i }).lean();
  console.log('--- PRODUCT DOCUMENT ---');
  console.log('  _id:', p._id);
  console.log('  name:', p.name);
  console.log('  price:', p.price);
  console.log('  sale:', p.sale);
  console.log('  stock:', p.stock);
  console.log('  thumnail:', p.thumnail);

  const variants = await ProductVariantModel.find({ p_id: p._id }).lean();
  console.log('--- VARIANTS DOCUMENT ---');
  variants.forEach(v => {
    console.log(`  Name: "${v.variant_name}", Price: ${v.price}, SalePrice: ${v.sale_price}, Stock: ${v.stock_quantity}`);
  });

  process.exit(0);
}

inspectProductFields();
