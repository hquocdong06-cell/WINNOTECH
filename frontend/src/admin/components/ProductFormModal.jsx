import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createProduct, updateProduct, uploadImage, fetchCategories, fetchBrands,
} from '../services/adminService';

const ProductFormModal = ({ isOpen, onClose, product, categories: categoriesProp, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', description: '', short_desc: '',
    status: 'active', cat_id: '', brand_id: '',
    price: '', sale: '', stock: '', thumnail: '',
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const fileInputRef = useRef(null);

  // Load categories + brands khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    // Dùng prop nếu có, nếu không tự fetch
    if (categoriesProp?.length) {
      setCategories(categoriesProp);
    } else {
      fetchCategories().then(setCategories).catch(() => {});
    }
    fetchBrands().then(setBrands).catch(() => {});

    // Điền dữ liệu nếu là edit
    if (product) {
      const defaultVariant = product.Variants?.find(v => v.variant_name === 'Mặc định') || product.Variants?.[0];
      const imgUrl = product.thumnail || product.AnhSP?.find(i => i.is_main)?.url || product.AnhSP?.[0]?.url || '';
      setForm({
        name: product.name || '',
        description: product.description || '',
        short_desc: product.short_desc || '',
        status: product.status || 'active',
        cat_id: product.cat_id?._id || product.cat_id || '',
        brand_id: product.brand_id?._id || product.brand_id || '',
        price: defaultVariant?.price || '',
        sale: product.sale || '',
        stock: defaultVariant?.stock_quantity || '',
        thumnail: imgUrl,
      });
      setPreviewUrl(imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `http://localhost:3000${imgUrl}`) : '');
    } else {
      setForm({ name: '', description: '', short_desc: '', status: 'active', cat_id: '', brand_id: '', price: '', sale: '', stock: '', thumnail: '' });
      setPreviewUrl('');
    }
  }, [isOpen, product, categoriesProp]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setField('thumnail', result.url);
      toast.success('Upload ảnh thành công!');
    } catch (err) {
      toast.error('Upload ảnh thất bại: ' + err.message);
      setPreviewUrl('');
      setField('thumnail', '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm!'); return; }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        short_desc: form.short_desc,
        status: form.status,
        cat_id: form.cat_id || null,
        brand_id: form.brand_id || null,
        price: Number(form.price) || 0,
        sale: Number(form.sale) || 0,
        stock: Number(form.stock) || 0,
        thumnail: form.thumnail,
      };
      if (product) {
        await updateProduct(product._id, payload);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await createProduct(payload);
        toast.success('Thêm sản phẩm thành công!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-white">

        {/* Header */}
        <div className="sticky top-0 bg-[#141414] border-b border-[#333] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">
            {product ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cột trái: Thông tin chính */}
            <div className="lg:col-span-2 space-y-6">

              {/* Thông tin cơ bản */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px]">Thông tin cơ bản</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tên sản phẩm <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="VD: VGA ASUS TUF Gaming RTX 4070..."
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] focus:ring-1 focus:ring-[#d4ff00]/30 outline-none text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={form.short_desc}
                    onChange={(e) => setField('short_desc', e.target.value)}
                    placeholder="Mô tả ngắn gọn..."
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mô tả chi tiết</label>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Thông số kỹ thuật, tính năng nổi bật..."
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white transition-all"
                  />
                </div>
              </div>

              {/* Upload ảnh */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px]">Ảnh sản phẩm</h3>
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-xl transition-all cursor-pointer group
                    ${isUploading ? 'border-[#d4ff00]/60 bg-[#d4ff00]/5' : 'border-[#444] hover:border-[#d4ff00] bg-[#141414] hover:bg-[#d4ff00]/5'}`}
                >
                  {previewUrl ? (
                    <div className="p-4 flex flex-col items-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-40 object-contain rounded-lg mb-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-[#d4ff00] text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang upload...</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 group-hover:text-[#d4ff00] transition-colors">
                          Click hoặc kéo thả để đổi ảnh
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-[#1e1e1e] group-hover:bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                        {isUploading
                          ? <Loader2 className="w-8 h-8 text-[#d4ff00] animate-spin" />
                          : <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#d4ff00]" />
                        }
                      </div>
                      <p className="text-sm font-medium text-white mb-1">
                        {isUploading ? 'Đang upload...' : 'Click để tải ảnh lên'}
                      </p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG, WEBP (Tối đa 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {form.thumnail && !isUploading && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                    Ảnh đã được lưu trên server
                  </p>
                )}
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-6">

              {/* Trạng thái & Danh mục */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px]">Tổ chức</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  >
                    <option value="active">Đang bán (Active)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="hidden">Đã ẩn (Hidden)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Danh mục</label>
                  <select
                    value={form.cat_id}
                    onChange={(e) => setField('cat_id', e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thương hiệu</label>
                  <select
                    value={form.brand_id}
                    onChange={(e) => setField('brand_id', e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giá */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-[15px]">Giá bán mặc định</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Giảm giá (%)</label>
                  <input
                    type="number"
                    value={form.sale}
                    onChange={(e) => setField('sale', e.target.value)}
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  />
                  {form.sale > 0 && form.price > 0 && (
                    <p className="text-xs text-[#d4ff00] mt-1">
                      Giá sau KM: {(form.price * (1 - form.sale / 100)).toLocaleString('vi-VN')}đ
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tồn kho</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setField('stock', e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full bg-[#141414] border border-[#333] rounded-md px-4 py-2.5 text-sm focus:border-[#d4ff00] outline-none text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] px-6 py-4 flex justify-end gap-3 bg-[#141414] rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white border border-[#444] rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-black bg-[#d4ff00] rounded-lg hover:bg-[#bce600] transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {product ? 'Cập nhật Sản phẩm' : 'Lưu Sản phẩm'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductFormModal;
