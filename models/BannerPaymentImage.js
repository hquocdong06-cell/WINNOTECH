const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    position: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    link: { type: String }
}, { timestamps: true });

const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    status: { type: String, default: 'active' },
});

const ImageSchema = new mongoose.Schema({
    p_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    url: { type: String, required: true },
    alt: { type: String },
    is_main: { type: Boolean, default: false }
});

const Banner = mongoose.model('Banner', BannerSchema);
const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);
const Image = mongoose.model('Image', ImageSchema);

module.exports = { Banner, PaymentMethod, Image };
