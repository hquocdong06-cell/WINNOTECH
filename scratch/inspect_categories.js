const connectDB = require('../config/db');
const CategoryModel = require('../models/Category');

async function inspectCategories() {
  await connectDB();
  const categories = await CategoryModel.find({}).lean();
  console.log('Categories in DB:');
  categories.forEach(c => console.log(`- ID: ${c._id}, Name: ${c.name}, Slug: ${c.slug}`));
  process.exit(0);
}

inspectCategories();
