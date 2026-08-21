const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Attribute, AttributeValue } = require('../models/Attribute');

async function checkMouseProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    const categories = await Category.find();
    console.log('Categories:', categories.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

    const mouseCats = categories.filter(c => 
      (c.name && c.name.toLowerCase().includes('chuột')) || 
      (c.name && c.name.toLowerCase().includes('mouse')) ||
      (c.slug && c.slug.toLowerCase().includes('chuot'))
    );
    console.log('Mouse categories found:', mouseCats.map(c => c.name));

    const mouseCatIds = mouseCats.map(c => c._id);
    const mouseProducts = await Product.find({
      $or: [
        { cat_id: { $in: mouseCatIds } },
        { name: { $regex: /chuột|mouse/i } }
      ]
    }).populate('cat_id brand_id');

    console.log(`Found ${mouseProducts.length} mouse products in DB:`);
    for (const p of mouseProducts) {
      const variants = await ProductVariant.find({ p_id: p._id });
      console.log(`- Product: "${p.name}" (Brand: ${p.brand_id?.name || 'N/A'}, Category: ${p.cat_id?.name || 'N/A'}, Variants: ${variants.length})`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking mouse products:', err);
  }
}

checkMouseProducts();
