import React, { useState, useMemo } from 'react';
import { Plus, Search, Settings2, Edit, Trash2 } from 'lucide-react';
import { mockProducts, mockCategories, mockBrands } from '../mockData';
import ProductFormModal from '../components/ProductFormModal';
import VariantManagementModal from '../components/VariantManagementModal';

const Products = () => {
  const [products] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory ? p.category === selectedCategory : true;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Sản phẩm</h1>
          <p className="text-gray-400 text-sm">Giao diện UI (chưa gắn chức năng API)</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
        >
          <Plus className="w-5 h-5" /> Thêm Sản phẩm
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1e1e1e] border border-[#333] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Sản phẩm</th>
              <th className="px-6 py-4 font-medium">Danh mục</th>
              <th className="px-6 py-4 font-medium">Giá bán</th>
              <th className="px-6 py-4 font-medium">Tồn kho / Biến thể</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-[#333]" />
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{product.category}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-[#d4ff00]">{product.salePrice ? product.salePrice.toLocaleString('vi-VN') : product.price.toLocaleString('vi-VN')}đ</div>
                  {product.salePrice && <div className="text-xs text-gray-500 line-through">{product.price.toLocaleString('vi-VN')}đ</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-300">{product.stock} trong kho</div>
                  <div className="text-xs text-gray-500 mt-1">{product.variants?.length || 0} biến thể</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'Active' ? 'bg-[#d4ff00]/10 text-[#d4ff00]' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {product.status === 'Active' ? 'Đang bán' : 'Đã ẩn'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingProduct(product); setIsVariantModalOpen(true); }} 
                      className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-[#d4ff00] transition-colors" 
                      title="Quản lý biến thể"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setEditingProduct(product); setIsFormModalOpen(true); }} 
                      className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" 
                      title="Sửa sản phẩm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" 
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} product={editingProduct} />
      <VariantManagementModal isOpen={isVariantModalOpen} onClose={() => setIsVariantModalOpen(false)} product={editingProduct} />
    </div>
  );
};

export default Products;
