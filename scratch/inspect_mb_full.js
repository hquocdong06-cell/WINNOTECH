const connectDB = require('../config/db');
const Product = require('../models/Product');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Attribute, AttributeValue } = require('../models/Attribute');

async function checkMBDetails() {
  await connectDB();
  const cat = await require('../models/Category').findOne({ slug: 'mainboard' });
  const products = await Product.find({ cat_id: cat._id }).lean();
  for (const p of products) {
    console.log('====================================');
    console.log('PRODUCT:', p.name);
    console.log('FULL DESCRIPTION:\n', p.description);
    const variants = await ProductVariant.find({ p_id: p._id }).lean();
    for (const v of variants) {
      console.log('VARIANT:', v._id);
      const attrs = await VariantAttribute.find({ variant_id: v._id })
        .populate('attribute_id')
        .populate('attribute_value_id')
        .lean();
      console.log('ATTRS:', attrs.map(a => `${a.attribute_id?.name}: ${a.attribute_value_id?.value}`));
    }
  }
  process.exit(0);
}
checkMBDetails();
