const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkAll() {
  await connectDB();
  const cats = await Category.find({}).lean();
  console.log('Categories:');
  for (const c of cats) {
    const count = await Product.countDocuments({ cat_id: c._id });
    console.log(`- ${c.name} (slug: ${c.slug}, id: ${c._id}): ${count} products`);
  }
  const allProds = await Product.find({}).lean();
  console.log('\nAll Products:');
  for (const p of allProds) {
    console.log(`- [${p._id}] ${p.name} (Desc length: ${p.description?.length || 0})`);
  }
  process.exit(0);
}
checkAll();
