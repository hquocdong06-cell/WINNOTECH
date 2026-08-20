const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Image } = require('../models/BannerPaymentImage');
const { Post, PostCategory } = require('../models/Post');

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/WINNOTech');
  
  console.log('=== CATEGORY AUDIT ===');
  const cats = await Category.find();
  for (const cat of cats) {
    const products = await Product.find({ cat_id: cat._id });
    let withNoVariants = 0;
    let withLessThan3Images = 0;
    for (const p of products) {
      const vCount = await ProductVariant.countDocuments({ p_id: p._id });
      const imgCount = await Image.countDocuments({ p_id: p._id });
      if (vCount < 1) withNoVariants++;
      if (imgCount < 3) withLessThan3Images++;
    }
    console.log(`[${cat.slug}] "${cat.name}": total=${products.length}, <1 variant: ${withNoVariants}, <3 images: ${withLessThan3Images}`);
  }

  console.log('\n=== POST AUDIT ===');
  const postCount = await Post.countDocuments();
  const publishedPostCount = await Post.countDocuments({ status: 'published' });
  console.log(`Total Posts: ${postCount} (Published: ${publishedPostCount})`);

  const postCats = await PostCategory.find();
  for (const pc of postCats) {
    const count = await Post.countDocuments({ categories_post_id: pc._id });
    console.log(`Post Category [${pc.slug}] "${pc.name}": ${count} posts`);
  }

  await mongoose.disconnect();
}
audit().catch(console.error);
