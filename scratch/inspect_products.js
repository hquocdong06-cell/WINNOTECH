const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('--- DB INSPECTION ---');
  
  const cats = await Category.find();
  console.log('Categories count:', cats.length);
  
  for (const cat of cats) {
    const pCount = await Product.countDocuments({ cat_id: cat._id });
    console.log(`Cat: [${cat.slug}] "${cat.name}" -> Products: ${pCount}`);
  }
  
  const totalProducts = await Product.countDocuments();
  console.log('TOTAL PRODUCTS IN DB:', totalProducts);
  
  process.exit(0);
}

inspect();
