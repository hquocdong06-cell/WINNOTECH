const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const monitorCats = await Category.find({
    $or: [
      { name: { $regex: /màn\s*hình/i } },
      { slug: { $regex: /man-hinh|monitor/i } }
    ]
  });
  console.log('Monitor Cats:', monitorCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));
  
  const prods = await Product.find({ cat_id: { $in: monitorCats.map(c => c._id) } }).populate('brand_id cat_id');
  console.log('Total Monitor Products in category:', prods.length);
  prods.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p._id}] "${p.name}" | Brand: ${p.brand_id?.name || 'N/A'}`);
  });
  await mongoose.disconnect();
}
run().catch(console.error);
