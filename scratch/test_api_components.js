const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BrandModel = require("../models/Brand");
const ProductModel = require("../models/Product");
const CategoryModel = require("../models/Category");

async function testQuery() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const category = 'cpu';
  const cat = await CategoryModel.findOne({
    $or: [
      { slug: category },
      { slug: category === 'tan-nhiet' ? 'cooling' : category === 'cooling' ? 'tan-nhiet' : category }
    ]
  });

  console.log('Found category:', cat ? cat.name + ' (' + cat.slug + ')' : 'NULL');

  if (!cat) {
    console.log('Category not found!');
    process.exit(1);
  }

  let filter = { cat_id: cat._id };
  const products = await ProductModel.find(filter).populate('cat_id brand_id').lean();
  console.log('Products found count:', products.length);

  if (products.length > 0) {
    console.log('Sample product 0 name:', products[0].name);
    console.log('Sample product 0 status:', products[0].status);
  }

  process.exit(0);
}

testQuery();
