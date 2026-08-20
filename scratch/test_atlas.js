const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('Testing Atlas URI:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to Atlas MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
