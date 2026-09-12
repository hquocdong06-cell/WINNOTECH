// models/Specification.js
const mongoose = require('mongoose');

// Bảng Specifications theo ERD:
// PK: id
// FK1: p_id (nối tới Products)
// FK2: id_attribute_value (nối tới attribute_value)
const SpecificationSchema = new mongoose.Schema(
  {
    p_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    id_attribute_value: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeValue',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'Specifications',
  }
);

// Tạo compound index để quản lý cặp (p_id, id_attribute_value)
SpecificationSchema.index({ p_id: 1, id_attribute_value: 1 });

const Specification =
  mongoose.models.Specification || mongoose.model('Specification', SpecificationSchema);

module.exports = {
  Specification,
  Specifications: Specification,
};
