const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkSsdProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const ssdCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('ssd')) || 
      (c.name && c.name.toLowerCase().includes('storage')) ||
      (c.name && c.name.toLowerCase().includes('ổ cứng')) ||
      (c.slug && c.slug.toLowerCase().includes('storage'))
    );
    console.log('SSD categories:', ssdCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const ssdCatIds = ssdCats.map(c => c._id);
    const ssdProducts = await Product.find({
      $or: [
        { cat_id: { $in: ssdCatIds } },
        { name: { $regex: /ssd|nvme|sata|ổ cứng/i } }
      ]
    });

    console.log(`Found ${ssdProducts.length} SSD products in DB:`);
    for (const p of ssdProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkSsdProducts();
