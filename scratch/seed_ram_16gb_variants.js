const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function seedRamVariants() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/WINNOTECH';
  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'Product');
  const ProductVariant = mongoose.model('ProductVariant', new mongoose.Schema({}, { strict: false }), 'ProductVariant');
  const VariantAttribute = mongoose.model('VariantAttribute', new mongoose.Schema({}, { strict: false }), 'VariantAttribute');
  const AttributeValue = mongoose.model('AttributeValue', new mongoose.Schema({}, { strict: false }), 'AttributeValue');
  const Attribute = mongoose.model('Attribute', new mongoose.Schema({}, { strict: false }), 'Attribute');

  // 1. Ensure Attribute "Dung lượng RAM" exists
  let ramAttr = await Attribute.findOne({ name: 'Dung lượng RAM' });
  if (!ramAttr) {
    ramAttr = await Attribute.create({ name: 'Dung lượng RAM' });
    console.log('Created Attribute "Dung lượng RAM":', ramAttr._id);
  } else {
    console.log('Found Attribute "Dung lượng RAM":', ramAttr._id);
  }

  // 2. Ensure AttributeValues "16GB" and "32GB" exist for "Dung lượng RAM"
  let val16 = await AttributeValue.findOne({ id_attribute: ramAttr._id, value: '16GB' });
  if (!val16) {
    val16 = await AttributeValue.create({ id_attribute: ramAttr._id, value: '16GB' });
    console.log('Created AttributeValue "16GB":', val16._id);
  } else {
    console.log('Found AttributeValue "16GB":', val16._id);
  }

  let val32 = await AttributeValue.findOne({ id_attribute: ramAttr._id, value: '32GB' });
  if (!val32) {
    val32 = await AttributeValue.create({ id_attribute: ramAttr._id, value: '32GB' });
    console.log('Created AttributeValue "32GB":', val32._id);
  } else {
    console.log('Found AttributeValue "32GB":', val32._id);
  }

  // Helper to link a variant to an attribute value if not already linked
  async function linkVariantAttr(variantId, attrValueId) {
    const existing = await VariantAttribute.findOne({
      id_variants: variantId,
      id_attribute_value: attrValueId
    });
    if (!existing) {
      await VariantAttribute.create({
        id_variants: variantId,
        id_attribute_value: attrValueId
      });
      console.log(`   + Linked variant ${variantId} -> attrValue ${attrValueId}`);
    }
  }

  // Helper to unlink an attribute value from a variant if needed
  async function unlinkVariantAttr(variantId, attrValueId) {
    await VariantAttribute.deleteMany({
      id_variants: variantId,
      id_attribute_value: attrValueId
    });
  }

  console.log('\n--- 1. PROCESSING TARGET PRODUCT: G.Skill Trident Z5 RGB DDR5 32GB ---');
  const targetP = await Product.findOne({ slug: 'gskill-trident-z5-rgb-ddr5-32gb' });
  if (targetP) {
    console.log(`Target product: ${targetP.name} [${targetP._id}]`);

    // Existing variants
    const v32Black = await ProductVariant.findOne({ p_id: targetP._id, sku: 'RAM-TZ5-32G-BK' });
    if (v32Black) {
      await linkVariantAttr(v32Black._id, val32._id);
    }
    const v32White = await ProductVariant.findOne({ p_id: targetP._id, sku: 'RAM-TZ5-32G-WH' });
    if (v32White) {
      await linkVariantAttr(v32White._id, val32._id);
    }

    // Check / create 16GB variant (Black)
    let v16Black = await ProductVariant.findOne({ p_id: targetP._id, sku: 'RAM-TZ5-16G-BK' });
    if (!v16Black) {
      v16Black = await ProductVariant.create({
        variant_name: 'Trident Z5 RGB DDR5 16GB (1x16GB) 6000MHz - Đen',
        price: 2190000,
        sale_price: 1971000,
        sku: 'RAM-TZ5-16G-BK',
        stock_quantity: 45,
        status: 'active',
        p_id: targetP._id
      });
      console.log('Created 16GB Black variant:', v16Black._id);
    } else {
      console.log('16GB Black variant already exists:', v16Black._id);
    }
    await linkVariantAttr(v16Black._id, val16._id);

    // Also get Màu sắc "Đen" attribute value if exists
    const colorAttr = await Attribute.findOne({ name: 'Màu sắc' });
    if (colorAttr) {
      const colorBlack = await AttributeValue.findOne({ id_attribute: colorAttr._id, value: /đen/i });
      if (colorBlack) await linkVariantAttr(v16Black._id, colorBlack._id);
    }

    // Check / create 16GB variant (White)
    let v16White = await ProductVariant.findOne({ p_id: targetP._id, sku: 'RAM-TZ5-16G-WH' });
    if (!v16White) {
      v16White = await ProductVariant.create({
        variant_name: 'Trident Z5 RGB DDR5 16GB (1x16GB) 6000MHz - Trắng',
        price: 2290000,
        sale_price: 2061000,
        sku: 'RAM-TZ5-16G-WH',
        stock_quantity: 35,
        status: 'active',
        p_id: targetP._id
      });
      console.log('Created 16GB White variant:', v16White._id);
    } else {
      console.log('16GB White variant already exists:', v16White._id);
    }
    await linkVariantAttr(v16White._id, val16._id);
    if (colorAttr) {
      const colorWhite = await AttributeValue.findOne({ id_attribute: colorAttr._id, value: /trắng/i });
      if (colorWhite) await linkVariantAttr(v16White._id, colorWhite._id);
    }
  }

  // List of other RAM products to add 16GB variants to:
  const otherRamConfigs = [
    {
      slug: 'corsair-vengeance-ddr5-32gb',
      var16Name: 'Corsair Vengeance DDR5 16GB 5600MHz',
      sku16: 'RAM-VEN-16G',
      price16: 1590000,
      sale16: 1510500,
      stock16: 40
    },
    {
      slug: 'kingston-fury-beast-ddr5-32gb-2x16gb-5600mhz',
      var16Name: 'Kingston FURY Beast DDR5 16GB 5600MHz',
      sku16: 'SKU-KINGSTON-FURY-BEAST-DDR5-16GB-0',
      price16: 1490000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'corsair-vengeance-rgb-ddr5-32gb-2x16gb-5600mhz',
      var16Name: 'Corsair Vengeance RGB DDR5 16GB 5600MHz',
      sku16: 'SKU-CORSAIR-VENGEANCE-RGB-DDR5-16GB-0',
      price16: 1790000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'gskill-trident-z5-neo-rgb-ddr5-32gb-2x16gb-6000mhz-amd',
      var16Name: 'G.Skill Trident Z5 Neo RGB DDR5 16GB 6000MHz AMD',
      sku16: 'SKU-GSKILL-TRIDENT-Z5-NEO-RGB-DDR5-16GB-0',
      price16: 2190000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'teamgroup-t-force-delta-rgb-ddr5-32gb-6000mhz',
      var16Name: 'TeamGroup T-Force Delta RGB DDR5 16GB 6000MHz',
      sku16: 'SKU-TEAMGROUP-DELTA-RGB-DDR5-16GB-0',
      price16: 1890000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'kingston-fury-beast-rgb-ddr4-32gb-2x16gb-3600mhz',
      var16Name: 'Kingston FURY Beast RGB DDR4 16GB 3600MHz',
      sku16: 'SKU-KINGSTON-FURY-BEAST-RGB-DDR4-16GB-0',
      price16: 1190000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'gskill-ripjaws-v-ddr4-32gb-2x16gb-3600mhz',
      var16Name: 'G.Skill Ripjaws V DDR4 16GB 3600MHz',
      sku16: 'SKU-GSKILL-RIPJAWS-V-DDR4-16GB-3600-0',
      price16: 1090000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'crucial-pro-ddr5-32gb-2x16gb-5600mhz',
      var16Name: 'Crucial Pro DDR5 16GB 5600MHz',
      sku16: 'SKU-CRUCIAL-PRO-DDR5-16GB-5600-0',
      price16: 1290000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'adata-xpg-lancer-rgb-ddr5-32gb',
      var16Name: 'Adata XPG LANCER RGB DDR5 16GB 6000MHz',
      sku16: 'SKU-ADATA-XPG-LANCER-RGB-DDR5-16GB-0',
      price16: 1690000,
      sale16: 1590000,
      stock16: 50
    },
    {
      slug: 'lexar-ares-rgb-ddr5-32gb-2x16gb-6000mhz',
      var16Name: 'Lexar ARES RGB DDR5 16GB 6000MHz',
      sku16: 'SKU-LEXAR-ARES-RGB-DDR5-16GB-0',
      price16: 1590000,
      sale16: 0,
      stock16: 50
    },
    {
      slug: 'geil-polaris-rgb-ddr5-32gb-2x16gb-6000mhz',
      var16Name: 'GeIL POLARIS RGB DDR5 16GB 6000MHz',
      sku16: 'SKU-GEIL-POLARIS-RGB-DDR5-16GB-0',
      price16: 1490000,
      sale16: 0,
      stock16: 50
    }
  ];

  console.log('\n--- 2. PROCESSING OTHER RAM PRODUCTS ---');
  for (const cfg of otherRamConfigs) {
    const p = await Product.findOne({ slug: cfg.slug });
    if (!p) {
      console.log(`Product not found: ${cfg.slug}`);
      continue;
    }
    console.log(`\nProduct: "${p.name}" [${p._id}]`);

    // 1. Link existing 32GB variant to val32
    const existingVars = await ProductVariant.find({ p_id: p._id, sku: { $ne: cfg.sku16 } });
    for (const ev of existingVars) {
      // If variant name is "Mặc định", rename to include 32GB
      if (ev.variant_name === 'Mặc định' || !ev.variant_name.includes('32GB')) {
        ev.variant_name = `${p.name.replace(/\(2x16GB\)/i, '').trim()} - 32GB`;
        await ev.save();
        console.log(`   Updated existing variant name to: "${ev.variant_name}"`);
      }
      await linkVariantAttr(ev._id, val32._id);
    }

    // 2. Create or find 16GB variant
    let var16 = await ProductVariant.findOne({ p_id: p._id, sku: cfg.sku16 });
    if (!var16) {
      var16 = await ProductVariant.create({
        variant_name: cfg.var16Name,
        price: cfg.price16,
        sale_price: cfg.sale16,
        sku: cfg.sku16,
        stock_quantity: cfg.stock16,
        status: 'active',
        p_id: p._id
      });
      console.log(`   Created 16GB variant [${var16._id}]: "${var16.variant_name}"`);
    } else {
      console.log(`   16GB variant exists [${var16._id}]`);
    }
    await linkVariantAttr(var16._id, val16._id);
  }

  console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
  await mongoose.disconnect();
}

seedRamVariants().catch(console.error);
