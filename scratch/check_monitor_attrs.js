const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/winnotech').then(async () => {
  const db = mongoose.connection.db;

  const cats = await db.collection('Category').find({ $or: [{ slug: 'man-hinh' }, { name: /màn hình/i }] }).toArray();
  const catIds = cats.map(c => c._id);

  const prods = await db.collection('Product').find({ cat_id: { $in: catIds } }).toArray();
  console.log('Found monitor products in Product collection:', prods.length);

  for (const p of prods) {
    if (p.Variants && p.Variants.length > 0) {
      for (const v of p.Variants) {
        if (v.Attributes && v.Attributes.length > 0) {
          console.log(`Product: "${p.name}" | Variant: "${v.variant_name}"`);
          v.Attributes.forEach(a => console.log('   Attr:', a.attribute_name, '=', a.value_name));
        }
      }
    }
  }

  mongoose.disconnect();
}).catch(e => console.error(e));
