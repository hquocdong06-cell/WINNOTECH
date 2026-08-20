const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UserModel = require('../models/User');

async function makeAdmin() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const res = await UserModel.updateMany(
    { email: 'vudong060306@gmail.com' },
    { $set: { role: 'admin' } }
  );

  console.log('Update result:', res);

  const updatedUsers = await UserModel.find({ email: 'vudong060306@gmail.com' });
  console.log('Updated user records:');
  updatedUsers.forEach(u => {
    console.log(`- ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`);
  });

  process.exit(0);
}

makeAdmin();
