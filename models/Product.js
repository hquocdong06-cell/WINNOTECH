const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sale: { type: Number, default: 0 },
    thumnail: { type: String }, // Giữ nguyên chính tả từ ERD
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    short_desc: { type: String },
    status: { type: String, default: "active" },
    // Foreign Keys
    cat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  },
  {
    timestamps: true,
    collection: "Product",
  },
);

module.exports = mongoose.model("Product", ProductSchema);
