const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    logo: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true,
    collection: 'Brand',
});

// Sync logo and image (Mongoose 9 synchronous hook without next callback)
BrandSchema.pre('save', function() {
    if (this.image && !this.logo) this.logo = this.image;
    if (this.logo && !this.image) this.image = this.logo;
});

module.exports = mongoose.model('Brand', BrandSchema);