const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkKeyboardProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const kbCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('bàn phím')) || 
      (c.name && c.name.toLowerCase().includes('keyboard')) ||
      (c.slug && c.slug.toLowerCase().includes('ban-phim'))
    );
    console.log('Keyboard categories:', kbCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const kbCatIds = kbCats.map(c => c._id);
    const kbProducts = await Product.find({
      $or: [
        { cat_id: { $in: kbCatIds } },
        { name: { $regex: /bàn phím|keyboard/i } }
      ]
    }).populate('cat_id brand_id');

    console.log(`Found ${kbProducts.length} keyboard products in DB:`);
    for (const p of kbProducts) {
      console.log(`- Product: "${p.name}" (Brand: ${p.brand_id?.name || 'N/A'}, Category: ${p.cat_id?.name || 'N/A'})`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkKeyboardProducts();
