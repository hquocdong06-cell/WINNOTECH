const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkPsuProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const psuCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('psu')) || 
      (c.name && c.name.toLowerCase().includes('nguồn')) ||
      (c.slug && c.slug.toLowerCase().includes('psu'))
    );
    console.log('PSU categories:', psuCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const psuCatIds = psuCats.map(c => c._id);
    const psuProducts = await Product.find({
      $or: [
        { cat_id: { $in: psuCatIds } },
        { name: { $regex: /nguồn|psu|80 plus|850w|750w|1000w/i } }
      ]
    });

    console.log(`Found ${psuProducts.length} PSU products in DB:`);
    for (const p of psuProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkPsuProducts();
