const connectDB = require('../config/db');
const ProductModel = require('../models/Product');
const CategoryModel = require('../models/Category');
const BrandModel = require('../models/Brand');
const { ProductVariant: ProductVariantModel } = require('../models/ProductVariant');

async function inspectProducts() {
  await connectDB();
  const products = await ProductModel.find({}).populate('cat_id').populate('brand_id').lean();
  console.log(`Total products in DB: ${products.length}\n`);

  for (const p of products) {
    const variants = await ProductVariantModel.find({ p_id: p._id }).lean();
    console.log(`========================================`);
    console.log(`ID: ${p._id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Category: ${p.cat_id?.name || 'No Cat'} (slug: ${p.cat_id?.slug})`);
    console.log(`Brand: ${p.brand_id?.name || 'No Brand'}`);
    console.log(`Description preview: ${(p.description || '').slice(0, 150)}...`);
    console.log(`Short desc: ${p.short_desc || 'None'}`);
    console.log(`Variants count: ${variants.length}`);
  }

  process.exit(0);
}

inspectProducts();
