const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Attribute = require('./Attribute');
const Specification = require('./Specification');
const Category = require('./Category');
const Brand = require('./Brand');

module.exports = {
  Product,
  ...ProductVariant,
  ...Attribute,
  ...Specification,
  Category,
  Brand,
};
