import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const mockCategories = [
  { 
    id: "CAT-01", 
    name: 'Card đồ họa (GPU)', 
    slug: 'gpu', 
    count: 45, 
    image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop' 
  },
  { 
    id: "CAT-02", 
    name: 'CPU - Bộ vi xử lý', 
    slug: 'cpu', 
    count: 32, 
    image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop' 
  },
  { 
    id: "CAT-03", 
    name: 'RAM - Bộ nhớ', 
    slug: 'ram', 
    count: 28, 
    image: 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop' 
  },
];

const Categories = () => {
  const [categories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Danh mục</h1>
          <p className="text-gray-400 text-sm">Giao diện UI (chưa gắn chức năng API)</p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
        >
          <Plus className="w-5 h-5" /> Thêm Danh mục
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#141414] border border-[#333] rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-sm focus:border-[#d4ff00] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Hình ảnh</th>
              <th className="px-6 py-4 font-medium">Tên danh mục</th>
              <th className="px-6 py-4 font-medium">Đường dẫn (Slug)</th>
              <th className="px-6 py-4 font-medium">Số sản phẩm</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
              <tr key={cat.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-6 py-4">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-lg object-cover border border-[#333]" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-base">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{cat.id}</div>
                </td>
                <td className="px-6 py-4 text-gray-300">/{cat.slug}</td>
                <td className="px-6 py-4 text-gray-300">{cat.count} sản phẩm</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" 
                      title="Sửa danh mục"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" 
                      title="Xóa danh mục"
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
    </div>
  );
};

export default Categories;
