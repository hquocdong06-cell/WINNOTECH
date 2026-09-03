const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Attribute, AttributeValue } = require('../models/Attribute');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const cats = await Category.find();
  console.log('Categories:', cats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));
  
  const monitorCats = cats.filter(c => /màn\s*hình|monitor/i.test(c.name) || /man-hinh|monitor/i.test(c.slug));
  console.log('Monitor Categories:', monitorCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

  const monitorProducts = await Product.find({
    $or: [
      { cat_id: { $in: monitorCats.map(c => c._id) } },
      { name: { $regex: /màn\s*hình|monitor/i } }
    ]
  }).populate('brand_id cat_id');
  
  console.log(`Found ${monitorProducts.length} monitor products:`);
  for (const p of monitorProducts) {
    console.log(`\nProduct: [${p._id}] "${p.name}" (Brand: ${p.brand_id?.name}, Cat: ${p.cat_id?.name})`);
    const variants = await ProductVariant.find({ p_id: p._id });
    console.log(`  Variants count: ${variants.length}`);
    for (const v of variants) {
      const vaList = await VariantAttribute.find({ id_variants: v._id }).populate({
        path: 'id_attribute_value',
        populate: { path: 'id_attribute' }
      });
      console.log(`  - Variant: ${v._id} (SKU: ${v.sku}): ${vaList.length} attributes:`);
      vaList.forEach(va => {
        console.log(`      ${va.id_attribute_value?.id_attribute?.name}: ${va.id_attribute_value?.value}`);
      });
    }
  }

  await mongoose.disconnect();
}
check().catch(console.error);
