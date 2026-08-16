const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { ProductVariant } = require('../models/ProductVariant');

async function main() {
  await connectDB();
  const variant = await ProductVariant.findOne({ stock_quantity: { $gt: 0 } }).lean();
  console.log('SAMPLE_VARIANT:', JSON.stringify(variant));
  process.exit(0);
}
main();
