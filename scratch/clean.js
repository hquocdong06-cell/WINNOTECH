const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/WINNOTech');
  const res = await Category.deleteMany({ slug: { $in: ['updated-cat', 'testcat1786076281155', 'testcat1786076326463', 'testcat1786076963283'] } });
  console.log('Cleaned dummy categories:', res.deletedCount);
  await mongoose.disconnect();
}
clean().catch(console.error);
