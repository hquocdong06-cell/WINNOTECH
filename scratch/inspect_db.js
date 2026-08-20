const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Image } = require('../models/BannerPaymentImage');
const { Post, PostCategory } = require('../models/Post');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/WINNOTech');
  const cats = await Category.find();
  console.log('Categories count:', cats.length);
  for (const c of cats) {
    const pCount = await Product.countDocuments({ cat_id: c._id });
    console.log(`Cat: [${c.slug}] '${c.name}' -> ${pCount} products`);
  }
  const postCats = await PostCategory.find();
  console.log('PostCategories count:', postCats.length);
  for (const pc of postCats) {
    const count = await Post.countDocuments({ categories_post_id: pc._id });
    console.log(`PostCat: [${pc.slug}] '${pc.name}' -> ${count} posts`);
  }
  const totalVariants = await ProductVariant.countDocuments();
  const totalImages = await Image.countDocuments();
  console.log(`Total Variants: ${totalVariants}, Total Images: ${totalImages}`);
  await mongoose.disconnect();
  process.exit(0);
}
inspect().catch(err => { console.error(err); process.exit(1); });
