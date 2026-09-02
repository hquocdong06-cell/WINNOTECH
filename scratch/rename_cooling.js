const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/winnotech').then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('Category').updateOne(
    { slug: 'cooling' },
    { $set: { name: 'Tản nhiệt PC' } }
  );
  console.log('Updated:', result.modifiedCount);
  const cat = await db.collection('Category').findOne({ slug: 'cooling' });
  console.log('After:', cat.name, '|', cat.slug);
  mongoose.disconnect();
}).catch(e => console.error(e));
