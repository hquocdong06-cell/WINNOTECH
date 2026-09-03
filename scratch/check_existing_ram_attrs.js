const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/WINNOTECH');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'Product');
  const ProductVariant = mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false }), 'ProductVariant');
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'Category');
  const VariantAttribute = mongoose.model('VariantAttribute', new mongoose.Schema({}, { strict: false }), 'VariantAttribute');
  const AttributeValue = mongoose.model('AttributeValue', new mongoose.Schema({}, { strict: false }), 'AttributeValue');
  const Attribute = mongoose.model('Attribute', new mongoose.Schema({}, { strict: false }), 'Attribute');

  const ramCats = await Category.find({ $or: [{ slug: /ram/i }, { name: /ram/i }] });
  const ramCatIds = ramCats.map(c => c._id);

  const ramProducts = await Product.find({
    $or: [
      { cat_id: { $in: ramCatIds } },
      { name: /ram/i }
    ]
  });

  console.log(`Checking ${ramProducts.length} RAM products for existing attributes...`);
  for (const p of ramProducts) {
    const vars = await ProductVariant.find({ p_id: p._id });
    const varInfos = [];
    for (const v of vars) {
      const vas = await VariantAttribute.find({ id_variants: v._id });
      const attrTexts = [];
      for (const va of vas) {
        const val = await AttributeValue.findById(va.id_attribute_value);
        if (val) {
          const attr = await Attribute.findById(val.id_attribute);
          attrTexts.push(`${attr?.name}: ${val.value}`);
        }
      }
      varInfos.push(`Var "${v.variant_name}" (${attrTexts.join(', ') || 'No attrs'})`);
    }
    console.log(`- [${p.slug}] ${p.name}`);
    varInfos.forEach(vi => console.log(`   ${vi}`));
  }

  await mongoose.disconnect();
}

check().catch(console.error);
