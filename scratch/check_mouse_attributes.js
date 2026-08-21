const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const { ProductVariant, VariantAttribute } = require('../models/ProductVariant');
const { Attribute, AttributeValue } = require('../models/Attribute');

async function checkMouseAttributes() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const mouseCat = await Category.findOne({ slug: 'chuot-gaming' });
    const product = await Product.findOne({ cat_id: mouseCat._id }).populate('brand_id');
    console.log('Sample Mouse Product:', product.name);

    const variants = await ProductVariant.find({ p_id: product._id });
    for (const v of variants) {
      console.log('Variant:', v.variant_name);
      const vas = await VariantAttribute.find({ id_variants: v._id }).populate({
        path: 'id_attribute_value',
        populate: { path: 'id_attribute' }
      });
      for (const va of vas) {
        console.log(` - ${va.id_attribute_value?.id_attribute?.name}: ${va.id_attribute_value?.value}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkMouseAttributes();
