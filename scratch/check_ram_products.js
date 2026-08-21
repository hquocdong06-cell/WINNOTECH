const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkRamProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const ramCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('ram')) || 
      (c.slug && c.slug.toLowerCase().includes('ram'))
    );
    console.log('RAM categories:', ramCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const ramCatIds = ramCats.map(c => c._id);
    const ramProducts = await Product.find({
      $or: [
        { cat_id: { $in: ramCatIds } },
        { name: { $regex: /ram|ddr4|ddr5/i } }
      ]
    });

    console.log(`Found ${ramProducts.length} RAM products in DB:`);
    for (const p of ramProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkRamProducts();
