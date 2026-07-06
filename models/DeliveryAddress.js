const mongoose = require('mongoose');

const DeliveryAddressSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    Phone: { type: String, required: true },
    address: { type: String, required: true },
    set_default: { type: Boolean, default: false }
}, { 
    timestamps: true, 
    collection: 'DeliveryAddress' 
});

module.exports = mongoose.model('DeliveryAddress', DeliveryAddressSchema);