const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Review: ReviewModel } = require('../models/FavoriteCompareReview');

async function activateReviews() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  await ReviewModel.updateMany({}, { $set: { status: 'active' } });
  console.log('✅ Updated all reviews status to active!');
  process.exit(0);
}

activateReviews();
