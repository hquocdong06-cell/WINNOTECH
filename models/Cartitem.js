const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    // Mixed type: hỗ trợ cả ObjectId (user đăng nhập) lẫn string (guest cart)
    u_id: { type: mongoose.Schema.Types.Mixed, required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true, collection: "CartItem" },
);

module.exports = mongoose.model("CartItem", CartItemSchema);
