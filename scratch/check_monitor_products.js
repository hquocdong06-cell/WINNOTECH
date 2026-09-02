const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/winnotech').then(async () => {
  const db = mongoose.connection.db;
  const prods1 = await db.collection('Product').find({}).toArray();
  const prods2 = await db.collection('products').find({}).toArray();
  console.log('Product count:', prods1.length, '| products count:', prods2.length);

  const all = prods1.length > 0 ? prods1 : prods2;
  const match = all.filter(p => {
    const name = (p.name || '').toLowerCase();
    return name.includes('màn hình') || name.includes('monitor') || name.includes('oc edition') || name.includes('ép xung');
  });

  console.log('Matched:', match.length);
  match.forEach(p => {
    console.log('\nID:', p._id, '| Name:', p.name, '| CatID:', p.cat_id);
    if (p.Variants) {
      p.Variants.forEach(v => {
        console.log('  Variant:', v.variant_name);
        console.log('  Attributes:', JSON.stringify(v.Attributes));
      });
    }
  });
  mongoose.disconnect();
}).catch(e => console.error(e));
