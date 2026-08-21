const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkCoolerProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const coolerCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('cooler')) || 
      (c.name && c.name.toLowerCase().includes('tản nhiệt')) ||
      (c.slug && c.slug.toLowerCase().includes('cooler'))
    );
    console.log('Cooler categories:', coolerCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const coolerCatIds = coolerCats.map(c => c._id);
    const coolerProducts = await Product.find({
      $or: [
        { cat_id: { $in: coolerCatIds } },
        { name: { $regex: /tản nhiệt|cooler|aio|liquid/i } }
      ]
    });

    console.log(`Found ${coolerProducts.length} CPU Cooler products in DB:`);
    for (const p of coolerProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkCoolerProducts();
