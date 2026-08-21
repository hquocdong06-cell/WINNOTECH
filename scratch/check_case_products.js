const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkCaseProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    const caseCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('case')) || 
      (c.name && c.name.toLowerCase().includes('vỏ')) ||
      (c.slug && c.slug.toLowerCase().includes('case'))
    );
    console.log('Case categories:', caseCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const caseCatIds = caseCats.map(c => c._id);
    const caseProducts = await Product.find({
      $or: [
        { cat_id: { $in: caseCatIds } },
        { name: { $regex: /vỏ case|case/i } }
      ]
    });

    console.log(`Found ${caseProducts.length} Case products in DB:`);
    for (const p of caseProducts) {
      console.log(`- Product: "${p.name}"`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkCaseProducts();
