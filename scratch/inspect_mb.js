const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { ProductVariant } = require('../models/ProductVariant');

async function check() {
  await connectDB();
  const cat = await Category.findOne({ $or: [{ slug: 'mainboard' }, { name: /mainboard/i }] });
  console.log('Cat found:', cat?._id, cat?.name);
  const products = await Product.find(cat ? { cat_id: cat._id } : { name: /mainboard|b760|b650|z790|b550|h610/i }).lean();
  console.log('Mainboard products count:', products.length);
  for (const p of products) {
    console.log('--- Product:', p.name);
    console.log('    Desc:', (p.description || '').slice(0, 200));
    const vars = await ProductVariant.find({ p_id: p._id }).lean();
    for (const v of vars) {
      console.log('    Variant:', v.name, 'Price:', v.price);
    }
  }
  process.exit(0);
}
check();
