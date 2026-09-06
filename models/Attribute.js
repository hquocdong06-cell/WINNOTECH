// models/Attribute.js
const mongoose = require('mongoose');

// Bảng categories_attribute (Danh mục thuộc tính theo ERD)
const CategoryAttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
    collection: 'categories_attribute',
  }
);

// Bảng attribute_value (Giá trị thuộc tính theo ERD)
const AttributeValueSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    id_categories_attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryAttribute',
      required: true,
    },
    // Giữ thêm id_attribute alias để tương thích ngược dữ liệu cũ nếu cần
    id_attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryAttribute',
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
    collection: 'attribute_value',
  }
);

// Tự động gán id_categories_attribute nếu có id_attribute hoặc ngược lại
AttributeValueSchema.pre('save', function () {
  if (!this.id_categories_attribute && this.id_attribute) {
    this.id_categories_attribute = this.id_attribute;
  }
  if (!this.id_attribute && this.id_categories_attribute) {
    this.id_attribute = this.id_categories_attribute;
  }
});

const CategoryAttribute = mongoose.models.CategoryAttribute || mongoose.model('CategoryAttribute', CategoryAttributeSchema);
const AttributeValue = mongoose.models.AttributeValue || mongoose.model('AttributeValue', AttributeValueSchema);

module.exports = {
  CategoryAttribute,
  CategoriesAttribute: CategoryAttribute,
  // Alias tương thích ngược cho codebase cũ
  Attribute: CategoryAttribute,
  AttributeValue,
};