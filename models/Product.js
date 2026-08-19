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
    // ── Compatibility metadata (Smart Filter Build PC) ─────────
    compatibility_meta: {
      socket:       { type: String, default: null },   // AM4 | AM5 | LGA1700 | LGA1851
      ram_type:     { type: String, default: null },   // DDR4 | DDR5
      form_factor:  { type: String, default: null },   // ATX | mATX | ITX (mainboard)
      supported_ff: { type: [String], default: [] },   // Case: form factors được hỗ trợ
      tdp:          { type: Number, default: null },    // CPU watts
      wattage:      { type: Number, default: null },    // PSU watts
      gpu_tier:     { type: Number, default: null },    // GPU tier 1-5
    },
    // Foreign Keys
    cat_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  },
  {
    timestamps: true,
    collection: "Product",
  },
);

module.exports = mongoose.model("Product", ProductSchema);

