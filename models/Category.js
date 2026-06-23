const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    status: { type: String, default: 'active' }
}, { timestamps: true,
    collection: 'Category'
});

module.exports = mongoose.model('Category', CategorySchema);

