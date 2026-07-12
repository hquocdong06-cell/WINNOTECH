// models/Favorite.js
const mongoose = require('mongoose');
const FavoriteSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

//-----------------------------------
// models/Compare.js
const CompareSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

//-----------------------------------
// models/Review.js
const ReviewSchema = new mongoose.Schema({
    id_oderitems: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' },
    content: { type: String, required: true },
    star_number: { type: Number, required: true, min: 1, max: 5 }
});

module.exports = {
    Favorite: mongoose.model('Favorite', FavoriteSchema),
    Compare: mongoose.model('Compare', CompareSchema),
    Review: mongoose.model('Review', ReviewSchema)
};