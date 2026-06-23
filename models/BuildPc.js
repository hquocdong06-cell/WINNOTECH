// models/BuildPc.js
const mongoose = require('mongoose');

const BuildPCSchema = new mongoose.Schema({
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
    summary_price: { type: Number, default: 0 }
});

const BuildItemSchema = new mongoose.Schema({
    build_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BuildPC' },
    name: { type: String, required: true }
});

const BuildPC = mongoose.model('BuildPC', BuildPCSchema);
const BuildItem = mongoose.model('BuildItem', BuildItemSchema);

module.exports = { BuildPC, BuildItem };