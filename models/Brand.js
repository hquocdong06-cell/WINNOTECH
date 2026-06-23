const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String }
}, { timestamps: true,
    collection: 'Brand',
});

module.exports = mongoose.model('Brand', BrandSchema);