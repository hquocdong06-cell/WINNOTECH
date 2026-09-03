const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function check() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/WINNOTECH';
  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'Product');
  const ProductVariant = mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false }), 'ProductVariant');
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'Category');
  const Attribute = mongoose.model('Attribute', new mongoose.Schema({}, { strict: false }), 'Attribute');
  const AttributeValue = mongoose.model('AttributeValue', new mongoose.Schema({}, { strict: false }), 'AttributeValue');
  const VariantAttribute = mongoose.model('VariantAttribute', new mongoose.Schema({}, { strict: false }), 'VariantAttribute');

  // Find ram category
  const ramCats = await Category.find({ $or: [{ slug: /ram/i }, { name: /ram/i }] });
  console.log('RAM Categories:', ramCats.map(c => ({ id: c._id, name: c.name, slug: c.slug })));

  // Find G.Skill product from screenshot: slug contains 'gskill' or name contains 'G.Skill' or 'Trident'
  const targetProduct = await Product.findOne({
    $or: [
      { slug: /gskill-trident-z5-rgb-ddr5-32gb/i },
      { name: /Trident Z5/i },
      { name: /G.Skill/i }
    ]
  });

  if (targetProduct) {
    console.log('\n--- TARGET PRODUCT ---');
    console.log('ID:', targetProduct._id);
    console.log('Name:', targetProduct.name);
    console.log('Slug:', targetProduct.slug);
    console.log('Price:', targetProduct.price, 'Sale Price:', targetProduct.sale_price);
    console.log('Cat ID:', targetProduct.cat_id);

    const variants = await ProductVariant.find({ p_id: targetProduct._id });
    console.log(`Found ${variants.length} variants for this product:`);
    for (const v of variants) {
      console.log(`  - Variant [${v._id}] "${v.variant_name}", SKU: ${v.sku}, price: ${v.price}, sale_price: ${v.sale_price}, stock: ${v.stock_quantity}`);
      const vas = await VariantAttribute.find({ id_variants: v._id });
      for (const va of vas) {
        const val = await AttributeValue.findById(va.id_attribute_value);
        if (val) {
          const attr = await Attribute.findById(val.id_attribute);
          console.log(`     Attr: ${attr?.name} -> Value: ${val.value_name}`);
        }
      }
    }
  }

  // Find all RAM products
  const ramCatIds = ramCats.map(c => c._id);
  const allRamProducts = await Product.find({
    $or: [
      { cat_id: { $in: ramCatIds } },
      { name: /^ram/i },
      { name: /ram/i }
    ]
  });
  console.log(`\nFound ${allRamProducts.length} RAM products total:`);
  for (const p of allRamProducts) {
    const vars = await ProductVariant.find({ p_id: p._id });
    console.log(`[${p._id}] "${p.name}" (slug: ${p.slug}) - ${vars.length} variants (${vars.map(v => v.variant_name).join(', ')})`);
  }

  // Also check Attributes to see what attributes exist (e.g. "Dung lượng", "Dung lượng RAM")
  const attrs = await Attribute.find({});
  console.log('\nAttributes:');
  for (const a of attrs) {
    const vals = await AttributeValue.find({ id_attribute: a._id });
    console.log(`Attr [${a._id}] "${a.name}": ${vals.map(v => v.value_name).join(', ')}`);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
