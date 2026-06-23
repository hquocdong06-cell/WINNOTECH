const mongoose = require("mongoose");

const ProductVariantSchema = new mongoose.Schema(
  {
    variant_name: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String, required: true },
    sale_price: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    stock_quantity: { type: Number, default: 0 },
    // FKs
    p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    build_id: { type: mongoose.Schema.Types.ObjectId, ref: "BuildPC" },
  },
  { collection: "ProductVariant" },
);

// Bảng junction: nối ProductVariant ↔ AttributeValue
const VariantAttributeSchema = new mongoose.Schema(
  {
    id_variants: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    id_attribute_value: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeValue", required: true },
  },
  { collection: "VariantAttribute" },
);

const ProductVariant = mongoose.model("ProductVariant", ProductVariantSchema);
const VariantAttribute = mongoose.model("VariantAttribute", VariantAttributeSchema);

module.exports = { ProductVariant, VariantAttribute };
