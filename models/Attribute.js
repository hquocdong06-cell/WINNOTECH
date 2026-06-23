// models/Attribute.js
const mongoose = require('mongoose');
const AttributeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id_variants: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }
},{ collection: "Attribute" });

//-----------------------------------
// models/AttributeValue.js
const AttributeValueSchema = new mongoose.Schema({
    value: { type: String, required: true },
    id_attribute: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' }
},{ collection: "AttributeValue" });

module.exports = {
    Attribute: mongoose.model('Attribute', AttributeSchema),
    AttributeValue: mongoose.model('AttributeValue', AttributeValueSchema)
};