require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const catCpu = await db.collection('Category').findOne({ slug: 'cpu' });
  const cpus = await db.collection('Product').find({ cat_id: catCpu._id, status: 'active' }).limit(3).toArray();
  for (const p of cpus) {
    const brand = p.brand_id ? await db.collection('Brand').findOne({ _id: p.brand_id }) : null;
    console.log('--- NAME:', p.name);
    console.log('    brand:', brand?.name, '| slug:', brand?.slug);
    console.log('    short_desc:', p.short_desc);
    console.log('    compat_meta:', JSON.stringify(p.compatibility_meta));
  }
  mongoose.disconnect();
}).catch(console.error);
