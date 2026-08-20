const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Review: ReviewModel } = require('../models/FavoriteCompareReview');

async function inspectReviews() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  const reviews = await ReviewModel.find({}).lean();
  console.log('All reviews in DB count:', reviews.length);
  console.log(JSON.stringify(reviews, null, 2));

  process.exit(0);
}

inspectReviews();
