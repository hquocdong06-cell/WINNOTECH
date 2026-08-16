const mongoose = require('mongoose');

const FlashSaleSettingSchema = new mongoose.Schema(
  {
    durationSeconds: {
      type: Number,
      default: 28800, // 8h = 28,800s
      min: 60,
      max: 28800,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    customProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    sessionStartMs: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlashSaleSetting', FlashSaleSettingSchema);
