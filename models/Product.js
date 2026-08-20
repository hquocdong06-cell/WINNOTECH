const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sale: { type: Number, default: 0 },
    thumnail: { type: String },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    short_desc: { type: String },
    status: { type: String, default: "active" },
    // ── Compatibility metadata (Smart Filter Build PC) ─────────
    compatibility_meta: {
      socket:       { type: String, default: null },   
      ram_type:     { type: String, default: null },  
      form_factor:  { type: String, default: null },   
      supported_ff: { type: [String], default: [] },   
      tdp:          { type: Number, default: null },    
      wattage:      { type: Number, default: null },    
      gpu_tier:     { type: Number, default: null },    
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

