const connectDB = require('../config/db');
const { Order } = require('../models/Order');
const { ProductVariant } = require('../models/ProductVariant');

async function check() {
  await connectDB();
  const order = await Order.findOne({ code: 'WN14202002' }).lean();
  console.log('ORDER_IN_DB:', JSON.stringify(order, null, 2));

  const variant = await ProductVariant.findById('6a79ded9d9c7c632c6aed804').lean();
  console.log('UPDATED_PRODUCT_STOCK:', variant.stock_quantity);

  process.exit(0);
}
check();
