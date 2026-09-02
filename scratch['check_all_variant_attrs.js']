const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/winnotech').then(async () => {
  const db = mongoose.connection.db;
  const prods = await db.collection('Product').find({}).toArray();

  prods.forEach(p => {
    if (p.Variants && p.Variants.length > 0) {
      p.Variants.forEach(v => {
        if (v.Attributes && v.Attributes.length > 0) {
          v.Attributes.forEach(a => {
            console.log(`Product: "${p.name}" | Variant: "${v.variant_name}" | AttrName: "${a.attribute_name || a.name}" | AttrVal: "${a.value_name || a.value}"`);
          });
        }
      });
    }
  });

  mongoose.disconnect();
}).catch(e => console.error(e));
