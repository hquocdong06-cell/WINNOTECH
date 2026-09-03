const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WINNOTECH');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'Product');
  const ProductVariant = mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false }), 'ProductVariant');
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'Category');

  const ramCats = await Category.find({ $or: [{ slug: /ram/i }, { name: /ram/i }] });
  const ramCatIds = ramCats.map(c => c._id);

  const ramProducts = await Product.find({
    $or: [
      { cat_id: { $in: ramCatIds } },
      { name: /ram/i }
    ]
  }).sort({ createdAt: -1 });

  console.log(`Found ${ramProducts.length} RAM products:`);
  for (const p of ramProducts) {
    const vars = await ProductVariant.find({ p_id: p._id });
    console.log(`- [${p._id}] slug: "${p.slug}" | Name: "${p.name}"`);
    console.log(`  Price: ${p.price}, Sale: ${p.sale}, ${vars.length} variants:`);
    for (const v of vars) {
      console.log(`     * [${v._id}] "${v.variant_name}", SKU: ${v.sku}, Price: ${v.price}, Sale: ${v.sale_price}, Stock: ${v.stock_quantity}`);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
