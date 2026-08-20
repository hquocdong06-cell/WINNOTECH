const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UserModel = require('../models/User');

async function testUser() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const user = await UserModel.findOne({ email: 'vudong060306@gmail.com' });
  if (!user) {
    console.log('USER NOT FOUND!');
  } else {
    console.log('USER FOUND:');
    console.log('  _id:', user._id);
    console.log('  email:', user.email);
    console.log('  role:', user.role);
    console.log('  status:', user.status);
  }

  process.exit(0);
}

testUser();
