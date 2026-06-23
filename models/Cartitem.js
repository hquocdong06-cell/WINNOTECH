const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    u_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true, collection: "CartItem" },
);

module.exports = mongoose.model("CartItem", CartItemSchema);
