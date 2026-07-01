import React, { useState } from 'react';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import PromotionFormModal from '../components/PromotionFormModal';

const Promotions = () => {
  const [promos] = useState([
    { id: 1, name: 'Hè Rực Rỡ', code: 'HELLO2024', discount: '10%', start: '01/06/2024', end: '30/06/2024', status: 'Sắp diễn ra' },
    { id: 2, name: 'Khách hàng mới', code: 'NEWBIE', discount: '50k', start: '01/01/2024', end: '31/12/2024', status: 'Đang chạy' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const handleOpenAddModal = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Khuyến mãi & Mã giảm giá</h1>
          <p className="text-gray-400 text-sm">Quản lý các chương trình khuyến mãi</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,255,0,0.2)]"
        >
          <Plus className="w-5 h-5" /> Tạo mã mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] border-b border-[#333] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Tên chương trình</th>
              <th className="px-6 py-4 font-medium">Mã code</th>
              <th className="px-6 py-4 font-medium">Giảm giá</th>
              <th className="px-6 py-4 font-medium">Thời gian</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-[#1e1e1e] transition-colors">
                <td className="px-6 py-4 font-semibold">{p.name}</td>
                <td className="px-6 py-4">
                  <code className="bg-[#333] px-2 py-1 rounded text-[#d4ff00] font-mono">{p.code}</code>
                </td>
                <td className="px-6 py-4 text-gray-300">{p.discount}</td>
                <td className="px-6 py-4 text-gray-300">{p.start} - {p.end}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'Đang chạy' ? 'bg-[#d4ff00]/10 text-[#d4ff00]' : 
                    p.status === 'Sắp diễn ra' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-blue-400 transition-colors" 
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-md text-gray-300 hover:text-white transition-colors" 
                      title="Ẩn/Hiện"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-[#222] hover:bg-red-500/20 border border-[#444] hover:border-red-500/50 rounded-md text-gray-300 hover:text-red-500 transition-colors" 
                      title="Xóa"
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

      <PromotionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promo={editingPromo} 
      />
    </div>
  );
};

export default Promotions;
