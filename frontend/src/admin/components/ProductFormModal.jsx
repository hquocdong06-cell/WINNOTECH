import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Loader2, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createProduct, updateProduct, uploadImage, fetchCategories, fetchBrands,
} from '../services/adminService';

import { API_BASE } from '../../services/apiService';

const defaultCompatMeta = {
  socket: '',
  ram_type: '',
  form_factor: '',
  supported_ff: [],
  tdp: '',
  wattage: '',
  gpu_tier: '',
};

const ProductFormModal = ({ isOpen, onClose, product, categories: categoriesProp, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', description: '', short_desc: '',
    status: 'active', cat_id: '', brand_id: '',
    price: '', sale: '', stock: '', thumnail: '',
    compatibility_meta: defaultCompatMeta,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [subImages, setSubImages] = useState([]); // mảng động chứa URL các ảnh phụ
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingSub, setIsUploadingSub] = useState(false);
  const [replacingSubIndex, setReplacingSubIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const fileInputRef = useRef(null);
  const addSubFileInputRef = useRef(null);
  const changeSubRef0 = useRef(null);
  const changeSubRef1 = useRef(null);
  const changeSubRef2 = useRef(null);
  const changeSubRef3 = useRef(null);
  const changeSubRefs = [changeSubRef0, changeSubRef1, changeSubRef2, changeSubRef3];

  const getFullUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  // Load categories + brands khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    if (categoriesProp?.length) {
      setCategories(categoriesProp);
    } else {
      fetchCategories().then(setCategories).catch(() => {});
    }
    fetchBrands().then(setBrands).catch(() => {});

    // Điền dữ liệu nếu là edit
    if (product) {
      const defaultVariant = product.Variants?.find(v => v.price > 0) || product.Variants?.find(v => v.variant_name === 'Mặc định') || product.Variants?.[0];
      const imgUrl = product.thumnail || product.AnhSP?.find(i => i.is_main)?.url || product.AnhSP?.[0]?.url || '';
      
      // Lấy danh sách ảnh phụ
      const secondaryImgs = (product.AnhSP || []).filter(i => !i.is_main).map(i => i.url);

      setForm({
        name: product.name || '',
        description: product.description || '',
        short_desc: product.short_desc || '',
        status: product.status || 'active',
        cat_id: product.cat_id?._id || product.cat_id || '',
        brand_id: product.brand_id?._id || product.brand_id || '',
        price: defaultVariant?.price || product.price || '',
        sale: product.sale || '',
        stock: defaultVariant?.stock_quantity !== undefined ? defaultVariant.stock_quantity : (product.stock || ''),
        thumnail: imgUrl,
        compatibility_meta: {
          socket: product.compatibility_meta?.socket || '',
          ram_type: product.compatibility_meta?.ram_type || '',
          form_factor: product.compatibility_meta?.form_factor || '',
          supported_ff: Array.isArray(product.compatibility_meta?.supported_ff) ? product.compatibility_meta.supported_ff : [],
          tdp: product.compatibility_meta?.tdp !== null && product.compatibility_meta?.tdp !== undefined ? product.compatibility_meta.tdp : '',
          wattage: product.compatibility_meta?.wattage !== null && product.compatibility_meta?.wattage !== undefined ? product.compatibility_meta.wattage : '',
          gpu_tier: product.compatibility_meta?.gpu_tier !== null && product.compatibility_meta?.gpu_tier !== undefined ? product.compatibility_meta.gpu_tier : '',
        },
      });
      setPreviewUrl(imgUrl ? getFullUrl(imgUrl) : '');
      setSubImages(secondaryImgs.slice(0, 4));
    } else {
      setForm({ name: '', description: '', short_desc: '', status: 'active', cat_id: '', brand_id: '', price: '', sale: '', stock: '', thumnail: '', compatibility_meta: defaultCompatMeta });
      setPreviewUrl('');
      setSubImages([]);
    }
  }, [isOpen, product, categoriesProp]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const setCompatField = (field, value) => {
    setForm(prev => ({
      ...prev,
      compatibility_meta: {
        ...(prev.compatibility_meta || defaultCompatMeta),
        [field]: value,
      },
    }));
  };

  const toggleSupportedFF = (ff) => {
    setForm(prev => {
      const current = prev.compatibility_meta?.supported_ff || [];
      const updated = current.includes(ff)
        ? current.filter(item => item !== ff)
        : [...current, ff];
      return {
        ...prev,
        compatibility_meta: {
          ...(prev.compatibility_meta || defaultCompatMeta),
          supported_ff: updated,
        },
      };
    });
  };

  // Upload ảnh chính
  const handleMainFileChange = async (e) => {
  const handleFileChange = handleMainFileChange;
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploadingMain(true);
    try {
      const result = await uploadImage(file);
      setField('thumnail', result.url);
      toast.success('Upload ảnh chính thành công!');
    } catch (err) {
      toast.error('Upload ảnh chính thất bại: ' + err.message);
      setPreviewUrl('');
      setField('thumnail', '');
    } finally {
      setIsUploadingMain(false);
    }
  };

  // Upload thêm ảnh phụ (hỗ trợ chọn 1 hoặc nhiều file cùng lúc)
  const handleAddSubImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 4 - subImages.length;
    if (availableSlots <= 0) {
      toast.warning('Đã đạt tối đa 4 ảnh phụ!');
      return;
    }
    const filesToUpload = files.slice(0, availableSlots);

    setIsUploadingSub(true);
    try {
      const uploadPromises = filesToUpload.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      setSubImages(prev => [...prev, ...newUrls].slice(0, 4));
      toast.success(`Đã thêm ${newUrls.length} ảnh phụ thành công!`);
    } catch (err) {
      toast.error('Upload ảnh phụ thất bại: ' + err.message);
    } finally {
      setIsUploadingSub(false);
      if (addSubFileInputRef.current) addSubFileInputRef.current.value = '';
    }
  };

  // Thay đổi 1 ảnh phụ cụ thể
  const handleReplaceSubImage = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacingSubIndex(index);
    try {
      const result = await uploadImage(file);
      setSubImages(prev => {
        const next = [...prev];
        next[index] = result.url;
        return next;
      });
      toast.success(`Đã cập nhật ảnh phụ ${index + 1}!`);
    } catch (err) {
      toast.error('Cập nhật ảnh phụ thất bại: ' + err.message);
    } finally {
      setReplacingSubIndex(null);
    }
  };

  // Xóa 1 ảnh phụ
  const handleRemoveSubImage = (index, e) => {
    e.stopPropagation();
    setSubImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDropMain = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleMainFileChange({ target: fileInputRef.current });
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm!'); return; }
    setIsSaving(true);
    try {
      const validSubImages = subImages.filter(url => url && typeof url === 'string' && url.trim() !== '');
      const compatMeta = {
        socket: form.compatibility_meta?.socket?.trim() || null,
        ram_type: form.compatibility_meta?.ram_type || null,
        form_factor: form.compatibility_meta?.form_factor || null,
        supported_ff: form.compatibility_meta?.supported_ff || [],
        tdp: form.compatibility_meta?.tdp !== '' && form.compatibility_meta?.tdp !== null && !isNaN(form.compatibility_meta?.tdp) ? Number(form.compatibility_meta.tdp) : null,
        wattage: form.compatibility_meta?.wattage !== '' && form.compatibility_meta?.wattage !== null && !isNaN(form.compatibility_meta?.wattage) ? Number(form.compatibility_meta.wattage) : null,
        gpu_tier: form.compatibility_meta?.gpu_tier !== '' && form.compatibility_meta?.gpu_tier !== null && !isNaN(form.compatibility_meta?.gpu_tier) ? Number(form.compatibility_meta.gpu_tier) : null,
      };
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
        sub_images: validSubImages,
        compatibility_meta: compatMeta,
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
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-5">
                <h3 className="font-semibold text-[15px]">Ảnh sản phẩm</h3>
                
                {/* 1. Ảnh chính (Thumbnail) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    1. Ảnh chính sản phẩm (Thumbnail)
                  </label>
                  <div
                    onClick={() => !isUploadingMain && fileInputRef.current?.click()}
                    onDrop={handleDropMain}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border-2 border-dashed rounded-xl transition-all cursor-pointer group
                      ${isUploadingMain ? 'border-[#d4ff00]/60 bg-[#d4ff00]/5' : 'border-[#444] hover:border-[#d4ff00] bg-[#141414] hover:bg-[#d4ff00]/5'}`}
                  >
                    {previewUrl ? (
                      <div className="p-4 flex flex-col items-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-36 object-contain rounded-lg mb-2"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {isUploadingMain ? (
                          <div className="flex items-center gap-2 text-[#d4ff00] text-xs">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang upload ảnh chính...</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 group-hover:text-[#d4ff00] transition-colors">
                            Click hoặc kéo thả để đổi ảnh chính
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-[#1e1e1e] group-hover:bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                          {isUploadingMain
                            ? <Loader2 className="w-6 h-6 text-[#d4ff00] animate-spin" />
                            : <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#d4ff00]" />
                          }
                        </div>
                        <p className="text-xs font-medium text-white mb-1">
                          {isUploadingMain ? 'Đang upload ảnh chính...' : 'Click để tải ảnh chính lên'}
                        </p>
                        <p className="text-[11px] text-gray-500">SVG, PNG, JPG, WEBP (Tối đa 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMainFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {form.thumnail && !isUploadingMain && (
                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                      Ảnh chính đã lưu trên server
                    </p>
                  )}
                </div>

                {/* 2. Danh sách Ảnh phụ ĐỘNG (Không có khung trống dư thừa) */}
                <div className="pt-3 border-t border-[#333]">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      2. Ảnh phụ sản phẩm ({subImages.length}/4 ảnh)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Hiển thị tùy thuộc số lượng ảnh đã chọn
                    </span>
                  </div>

                  {/* Hidden Input cho nút Thêm ảnh phụ */}
                  <input
                    type="file"
                    ref={addSubFileInputRef}
                    onChange={handleAddSubImages}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Hiển thị danh sách ảnh phụ ĐÃ CÓ */}
                    {subImages.map((imgUrl, idx) => {
                      const isReplacing = replacingSubIndex === idx;
                      const fullUrl = getFullUrl(imgUrl);

                      return (
                        <div key={idx} className="relative flex flex-col items-center">
                          <input
                            type="file"
                            ref={changeSubRefs[idx]}
                            onChange={(e) => handleReplaceSubImage(idx, e)}
                            accept="image/*"
                            className="hidden"
                          />
                          <div
                            onClick={() => !isReplacing && changeSubRefs[idx]?.current?.click()}
                            className="w-full h-28 border border-[#444] hover:border-[#d4ff00] bg-[#141414] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group shadow-md"
                          >
                            {isReplacing ? (
                              <Loader2 className="w-6 h-6 text-[#d4ff00] animate-spin" />
                            ) : (
                              <>
                                <img
                                  src={fullUrl}
                                  alt={`Sub ${idx + 1}`}
                                  className="w-full h-full object-cover rounded-md"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSubImage(idx, e)}
                                  className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow"
                                  title="Xóa ảnh phụ này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[11px] text-white font-medium bg-black/70 px-2 py-1 rounded">
                                    Đổi ảnh
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 font-mono">Ảnh phụ {idx + 1}</span>
                        </div>
                      );
                    })}

                    {/* Nút "+ Thêm ảnh phụ" duy nhất (Ẩn khi đã đủ 4 ảnh) */}
                    {subImages.length < 4 && (
                      <div
                        onClick={() => !isUploadingSub && addSubFileInputRef.current?.click()}
                        className={`h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-[#444] hover:border-[#d4ff00] bg-[#141414] hover:bg-[#d4ff00]/5 group
                          ${isUploadingSub ? 'border-[#d4ff00]/60 bg-[#d4ff00]/5' : ''}`}
                      >
                        {isUploadingSub ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-5 h-5 text-[#d4ff00] animate-spin mb-1" />
                            <span className="text-[11px] text-[#d4ff00]">Đang tải...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center p-2 text-center">
                            <div className="w-8 h-8 rounded-full bg-[#1e1e1e] group-hover:bg-[#d4ff00]/20 flex items-center justify-center mb-1 text-gray-400 group-hover:text-[#d4ff00] transition-colors">
                              +
                            </div>
                            <span className="text-[11px] text-gray-300 group-hover:text-white font-medium transition-colors">
                              + Thêm ảnh phụ
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                              ({subImages.length}/4)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Thông số tương thích (Build PC) */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[15px] flex items-center gap-2 text-[#d4ff00]">
                    <Cpu className="w-4 h-4" /> Thông số tương thích (Build PC)
                  </h3>
                  <span className="text-[11px] text-gray-400 bg-[#141414] px-2 py-0.5 rounded border border-[#333]">
                    Smart Filter Meta
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Socket */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Socket (CPU / Mainboard)</label>
                    <input
                      type="text"
                      list="socket-options"
                      value={form.compatibility_meta?.socket || ''}
                      onChange={(e) => setCompatField('socket', e.target.value)}
                      placeholder="VD: LGA1700, AM5, LGA1851..."
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    />
                    <datalist id="socket-options">
                      <option value="LGA1700" />
                      <option value="LGA1851" />
                      <option value="AM4" />
                      <option value="AM5" />
                    </datalist>
                  </div>

                  {/* RAM Type */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Chuẩn RAM (RAM / Mainboard)</label>
                    <select
                      value={form.compatibility_meta?.ram_type || ''}
                      onChange={(e) => setCompatField('ram_type', e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    >
                      <option value="">-- Không chọn --</option>
                      <option value="DDR4">DDR4</option>
                      <option value="DDR5">DDR5</option>
                    </select>
                  </div>

                  {/* Form Factor */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Kích thước Mainboard</label>
                    <select
                      value={form.compatibility_meta?.form_factor || ''}
                      onChange={(e) => setCompatField('form_factor', e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    >
                      <option value="">-- Không chọn --</option>
                      <option value="ATX">ATX</option>
                      <option value="mATX">mATX (Micro-ATX)</option>
                      <option value="ITX">ITX (Mini-ITX)</option>
                    </select>
                  </div>

                  {/* GPU Tier */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Bậc Card đồ họa (GPU Tier)</label>
                    <select
                      value={form.compatibility_meta?.gpu_tier !== null && form.compatibility_meta?.gpu_tier !== undefined ? form.compatibility_meta.gpu_tier : ''}
                      onChange={(e) => setCompatField('gpu_tier', e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    >
                      <option value="">-- Không chọn --</option>
                      <option value="1">Tier 1 (Nhập môn)</option>
                      <option value="2">Tier 2 (Tầm trung)</option>
                      <option value="3">Tier 3 (Cận cao cấp)</option>
                      <option value="4">Tier 4 (Cao cấp)</option>
                      <option value="5">Tier 5 (Flagship)</option>
                    </select>
                  </div>

                  {/* TDP (CPU) */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">TDP (CPU - Watts)</label>
                    <input
                      type="number"
                      value={form.compatibility_meta?.tdp !== null && form.compatibility_meta?.tdp !== undefined ? form.compatibility_meta.tdp : ''}
                      onChange={(e) => setCompatField('tdp', e.target.value)}
                      placeholder="VD: 65, 125, 253"
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    />
                  </div>

                  {/* Wattage (PSU) */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Công suất Nguồn (PSU - Watts)</label>
                    <input
                      type="number"
                      value={form.compatibility_meta?.wattage !== null && form.compatibility_meta?.wattage !== undefined ? form.compatibility_meta.wattage : ''}
                      onChange={(e) => setCompatField('wattage', e.target.value)}
                      placeholder="VD: 650, 750, 850, 1000"
                      className="w-full bg-[#141414] border border-[#333] rounded-md px-3 py-2 text-xs focus:border-[#d4ff00] outline-none text-white"
                    />
                  </div>
                </div>

                {/* Supported FF (Case) */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Form Factor hỗ trợ (Hộp máy / Vỏ Case)</label>
                  <div className="flex items-center gap-4">
                    {['ATX', 'mATX', 'ITX'].map(ff => {
                      const isSelected = form.compatibility_meta?.supported_ff?.includes(ff);
                      return (
                        <button
                          key={ff}
                          type="button"
                          onClick={() => toggleSupportedFF(ff)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                            isSelected
                              ? 'bg-[#d4ff00]/15 border-[#d4ff00] text-[#d4ff00]'
                              : 'bg-[#141414] border-[#333] text-gray-400 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{ff}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
            disabled={isSaving || isUploadingMain || isUploadingSub}
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
