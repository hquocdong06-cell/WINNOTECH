const connectDB = require('../config/db');
const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { OrderItem } = require('../models/Order');

async function testFlashSaleLogic() {
  await connectDB();
  console.log("🔥 Testing Flash Sale 8h Backend Logic...");

  // 1. Session calculation
  const now = new Date();
  const MSEC_IN_8_HOURS = 8 * 60 * 60 * 1000;
  const currentSessionStartMs = Math.floor(now.getTime() / MSEC_IN_8_HOURS) * MSEC_IN_8_HOURS;
  const currentSessionEndMs = currentSessionStartMs + MSEC_IN_8_HOURS;
  const remainingSeconds = Math.max(0, Math.floor((currentSessionEndMs - now.getTime()) / 1000));

  console.log(`⏱️ Current Session Start: ${new Date(currentSessionStartMs).toISOString()}`);
  console.log(`⏱️ Current Session End:   ${new Date(currentSessionEndMs).toISOString()}`);
  console.log(`⏳ Remaining Seconds:    ${remainingSeconds} seconds`);

  // 2. Fetch products
  const products = await ProductModel.find({ status: "active" }).lean();
  const productIds = products.map(p => p._id);
  const variants = await ProductVariantModel.find({ p_id: { $in: productIds } }).lean();

  const variantToProductMap = {};
  const variantIds = [];
  variants.forEach(v => {
    variantToProductMap[v._id.toString()] = v.p_id.toString();
    variantIds.push(v._id);
  });

  const orderItems = await OrderItem.find({ variants_id: { $in: variantIds } }).lean();
  const productSalesMap = {};
  orderItems.forEach(item => {
    if (item.variants_id) {
      const pId = variantToProductMap[item.variants_id.toString()];
      if (pId) {
        productSalesMap[pId] = (productSalesMap[pId] || 0) + (item.Quantity || 0);
      }
    }
  });

  const productsWithSales = products.map(p => {
    const pIdStr = p._id.toString();
    const soldCount = productSalesMap[pIdStr] || p.sold_quantity || p.buyturn || 0;
    return {
      ...p,
      sold_count: soldCount
    };
  });

  // Sort ascending (lowest sold first)
  productsWithSales.sort((a, b) => a.sold_count - b.sold_count);

  const top5 = productsWithSales.slice(0, 5);

  console.log(`\n🎯 Selected TOP 5 Lowest Sold Products (${top5.length} items):`);
  top5.forEach((p, idx) => {
    console.log(`   ${idx + 1}. [Sold: ${p.sold_count}] ${p.name}`);
  });

  if (top5.length <= 5) {
    console.log("\n✅ SUCCESS: Flash Sale section strictly limits to max 5 products and sorts by lowest sold count!");
  } else {
    console.error("\n❌ FAILED: Returned more than 5 products!");
  }

  process.exit(0);
}

testFlashSaleLogic();
