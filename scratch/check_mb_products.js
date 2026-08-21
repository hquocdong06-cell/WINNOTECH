const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkMbProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const mbCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('mainboard')) || 
      (c.name && c.name.toLowerCase().includes('bo mạch')) ||
      (c.slug && c.slug.toLowerCase().includes('mainboard'))
    );
    console.log('Mainboard categories:', mbCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const mbCatIds = mbCats.map(c => c._id);
    const mbProducts = await Product.find({
      $or: [
        { cat_id: { $in: mbCatIds } },
        { name: { $regex: /mainboard|z790|b760|b650|x670|a520|h610/i } }
      ]
    });

    console.log(`Found ${mbProducts.length} Mainboard products in DB:`);
    for (const p of mbProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkMbProducts();
