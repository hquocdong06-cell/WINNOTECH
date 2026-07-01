export const mockProducts = [
  {
    id: "PROD-001",
    name: "VGA ASUS TUF Gaming GeForce RTX 4070",
    category: "Card Màn Hình",
    brand: "ASUS",
    price: 16500000,
    salePrice: 15990000,
    stock: 12,
    status: "Active",
    image: "https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop",
    variants: [
      { id: "v1", name: "Đen", price: 15990000, stock: 10, sku: "TUF-4070-BLK" },
      { id: "v2", name: "Trắng", price: 16290000, stock: 2, sku: "TUF-4070-WHT" }
    ]
  },
  {
    id: "PROD-002",
    name: "CPU Intel Core i9-14900K",
    category: "Vi Xử Lý",
    brand: "Intel",
    price: 14500000,
    salePrice: null,
    stock: 5,
    status: "Draft",
    image: "https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop",
    variants: []
  }
];

export const mockCategories = [
  { id: "c1", name: "Card Màn Hình" },
  { id: "c2", name: "Vi Xử Lý" },
  { id: "c3", name: "Bo Mạch Chủ" }
];

export const mockBrands = [
  { id: "b1", name: "ASUS" },
  { id: "b2", name: "Intel" },
  { id: "b3", name: "Gigabyte" }
];
