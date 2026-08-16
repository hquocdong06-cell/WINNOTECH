const connectDB = require('../config/db');
const ProductModel = require('../models/Product');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');
const { OrderItem } = require('../models/Order');

async function checkSales() {
  await connectDB();
  const products = await ProductModel.find({ status: 'active' }).lean();
  console.log(`Total active products: ${products.length}`);

  // Fetch all variants
  const variants = await ProductVariantModel.find({}).lean();
  const variantToProduct = {};
  variants.forEach(v => {
    if (v.p_id) variantToProduct[v._id.toString()] = v.p_id.toString();
  });

  // Aggregate order items
  const orderItems = await OrderItem.find({}).lean();
  const productSalesMap = {};
  
  orderItems.forEach(item => {
    if (item.variants_id) {
      const pId = variantToProduct[item.variants_id.toString()];
      if (pId) {
        productSalesMap[pId] = (productSalesMap[pId] || 0) + (item.Quantity || 0);
      }
    }
  });

  console.log("Sample Product Sales Map:", productSalesMap);

  // Map total sold to each product
  const productsWithSales = products.map(p => {
    const pIdStr = p._id.toString();
    const sold = productSalesMap[pIdStr] || p.sold_quantity || p.buyturn || 0;
    return {
      _id: p._id,
      name: p.name,
      sold_count: sold
    };
  });

  // Sort ascending by sold count (lowest first)
  productsWithSales.sort((a, b) => a.sold_count - b.sold_count);

  console.log("Top 5 lowest sold products:");
  productsWithSales.slice(0, 5).forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} - Sold: ${p.sold_count}`);
  });

  process.exit(0);
}

checkSales();
