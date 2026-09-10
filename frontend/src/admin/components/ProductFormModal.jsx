import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Loader2, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createProduct, updateProduct, uploadImage, fetchCategories, fetchBrands,
} from '../services/adminService';

import { API_BASE } from '../../services/apiService';

const ProductFormModal = ({ isOpen, onClose, product, categories: categoriesProp, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', description: '', short_desc: '',
    status: 'active', cat_id: '', brand_id: '',
    thumnail: '',
  });
  const [specifications, setSpecifications] = useState([]);
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
        thumnail: imgUrl,
      });
      setPreviewUrl(imgUrl ? getFullUrl(imgUrl) : '');
      setSubImages(secondaryImgs.slice(0, 4));
      setSpecifications(Array.isArray(product.specifications) ? product.specifications : []);
    } else {
      setForm({ name: '', description: '', short_desc: '', status: 'active', cat_id: '', brand_id: '', thumnail: '' });
      setPreviewUrl('');
      setSubImages([]);
      setSpecifications([]);
    }
  }, [isOpen, product, categoriesProp]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Xử lý Thông số kỹ thuật (Specifications)
  const handleAddSpec = () => {
    setSpecifications(prev => [...prev, { name: '', value: '', group: 'detail' }]);
  };

  const handleSpecChange = (index, field, val) => {
    setSpecifications(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: val } : item));
  };

  const handleRemoveSpec = (index) => {
    setSpecifications(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleApplyTemplate = (type) => {
    const templates = {
      'CPU': [
        { name: 'Socket Hỗ Trợ', value: '', group: 'detail' },
        { name: 'Số Nhân / Số Luồng', value: '', group: 'detail' },
        { name: 'Xung Nhịp Cơ Bản', value: '', group: 'detail' },
        { name: 'Xung Nhịp Tối Đa (Boost)', value: '', group: 'detail' },
        { name: 'Bộ Nhớ Đệm (Cache)', value: '', group: 'detail' },
        { name: 'Công Suất Tiêu Thụ (TDP)', value: '', group: 'detail' },
        { name: 'Chuẩn RAM Hỗ Trợ', value: '', group: 'detail' },
        { name: 'Đồ Họa Tích Hợp (iGPU)', value: '', group: 'detail' },
      ],
      'VGA / Card màn hình': [
        { name: 'Chipset Đồ Họa', value: '', group: 'detail' },
        { name: 'Dung Lượng Bộ Nhớ (VRAM)', value: '', group: 'detail' },
        { name: 'Chuẩn Bộ Nhớ', value: 'GDDR6X', group: 'detail' },
        { name: 'Chuẩn Băng Thông', value: 'PCIe 4.0 x16', group: 'detail' },
        { name: 'Nguồn Khuyến Nghị', value: '', group: 'detail' },
        { name: 'Cổng Xuất Hình', value: '3x DisplayPort, 1x HDMI', group: 'detail' },
        { name: 'Chiều Dài Card', value: '', group: 'dimension' },
      ],
      'RAM': [
        { name: 'Dung Lượng', value: '', group: 'detail' },
        { name: 'Chuẩn RAM', value: 'DDR5', group: 'detail' },
        { name: 'Bus RAM', value: '', group: 'detail' },
        { name: 'Độ Trễ (Timing)', value: '', group: 'detail' },
        { name: 'Điện Áp (Voltage)', value: '', group: 'detail' },
        { name: 'Đèn LED', value: 'RGB', group: 'general' },
        { name: 'Bảo Hành', value: '36 Tháng', group: 'general' },
      ],
      'Mainboard': [
        { name: 'Chuẩn Kích Thước (Form Factor)', value: 'ATX', group: 'detail' },
        { name: 'Socket Hỗ Trợ', value: '', group: 'detail' },
        { name: 'Chipset', value: '', group: 'detail' },
        { name: 'Số Khe Cắm RAM', value: '4 Khe DDR5', group: 'detail' },
        { name: 'Số Khe M.2 NVMe', value: '', group: 'detail' },
        { name: 'Cổng Kết Nối Phía Sau', value: '', group: 'detail' },
        { name: 'Kết Nối Không Dây', value: 'Wi-Fi 6E + Bluetooth 5.3', group: 'detail' },
      ],
      'SSD / Ổ cứng': [
        { name: 'Dung Lượng', value: '', group: 'detail' },
        { name: 'Chuẩn Giao Tiếp', value: 'PCIe Gen4 x4 M.2 NVMe', group: 'detail' },
        { name: 'Kích Thước', value: 'M.2 2280', group: 'detail' },
        { name: 'Tốc Độ Đọc Tối Đa', value: '', group: 'detail' },
        { name: 'Tốc Độ Ghi Tối Đa', value: '', group: 'detail' },
        { name: 'Độ Bền (TBW)', value: '', group: 'detail' },
      ],
      'Nguồn (PSU)': [
        { name: 'Công Suất Tối Đa', value: '', group: 'detail' },
        { name: 'Chuẩn Hiệu Suất', value: '80 Plus Gold', group: 'detail' },
        { name: 'Kiểu Dây Cáp', value: 'Full Modular', group: 'detail' },
        { name: 'Kích Thước Quạt', value: '120mm / 135mm', group: 'detail' },
        { name: 'Bảo Hành', value: '60 Tháng', group: 'general' },
      ],
      'Màn hình': [
        { name: 'Kích Thước Màn Hình', value: '', group: 'detail' },
        { name: 'Độ Phân Giải', value: '', group: 'detail' },
        { name: 'Tần Số Quét', value: '', group: 'detail' },
        { name: 'Thời Gian Phản Hồi', value: '1ms (GTG)', group: 'detail' },
        { name: 'Tấm Nền', value: 'Fast IPS', group: 'detail' },
        { name: 'Độ Phủ Màu', value: '99% sRGB', group: 'detail' },
        { name: 'Cổng Kết Nối', value: 'HDMI, DisplayPort', group: 'detail' },
      ],
    };

    const tplList = templates[type] || [];
    if (tplList.length === 0) return;

    setSpecifications(prev => {
      const existingNames = new Set(prev.map(p => (p.name || '').trim().toLowerCase()));
      const toAdd = tplList.filter(t => !existingNames.has(t.name.trim().toLowerCase()));
      return [...prev, ...toAdd];
    });
    toast.info(`Đã nạp bộ thông số mẫu cho ${type}`);
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
      const validSpecs = specifications
        .filter(s => (s.name && s.name.trim()) || (s.value && s.value.trim()))
        .map(s => ({
          name: (s.name || '').trim(),
          value: (s.value || '').trim(),
          group: s.group || 'detail'
        }));

      const payload = {
        name: form.name.trim(),
        description: form.description,
        short_desc: form.short_desc,
        status: form.status,
        cat_id: form.cat_id || null,
        brand_id: form.brand_id || null,
        thumnail: form.thumnail,
        sub_images: validSubImages,
        specifications: validSpecs,
      };

      if (product) {
        await updateProduct(product._id, payload);
        toast.success('Cập nhật sản phẩm thành công!');
        onSuccess?.();
      } else {
        const res = await createProduct(payload);
        toast.success('Thêm sản phẩm thành công!');
        onSuccess?.(res?.data);
      }
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

            </div>

          </div>

          {/* Khối Thông số kỹ thuật (Specifications) ĐỘNG */}
          <div className="mt-6 bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333] pb-3">
              <div>
                <h3 className="font-semibold text-[15px] text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#d4ff00]" />
                  Thông số kỹ thuật chi tiết (Specifications)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Các thông số này sẽ hiển thị trực tiếp tại bảng "THÔNG SỐ KỸ THUẬT" ngoài trang chi tiết sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4ff00] hover:bg-[#bce600] text-black text-xs font-bold rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm thông số
                </button>
              </div>
            </div>

            {/* Thanh Nạp mẫu nhanh theo loại linh kiện */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d4ff00]" />
                <span className="font-medium text-gray-300">Nạp mẫu thông số nhanh theo danh mục:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['CPU', 'VGA / Card màn hình', 'RAM', 'Mainboard', 'SSD / Ổ cứng', 'Nguồn (PSU)', 'Màn hình'].map(tpl => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 text-[11px] bg-[#222] hover:bg-[#2e2e2e] border border-[#444] hover:border-[#d4ff00] text-gray-300 hover:text-[#d4ff00] rounded transition-all font-medium"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách các dòng thông số */}
            {specifications.length === 0 ? (
              <div className="text-center py-7 border border-dashed border-[#333] rounded-lg bg-[#141414]/40">
                <p className="text-xs text-gray-400">Chưa có thông số kỹ thuật nào được nhập.</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Bấm <strong>"+ Thêm thông số"</strong> hoặc chọn <strong>"Nạp mẫu nhanh"</strong> theo loại linh kiện ở trên.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                  <div className="col-span-5">Tên thông số</div>
                  <div className="col-span-4">Giá trị</div>
                  <div className="col-span-2">Nhóm hiển thị</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                {specifications.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 bg-[#141414] border border-[#333] p-2.5 rounded-lg hover:border-[#444] transition-colors items-center">
                    <div className="w-full sm:col-span-5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                        placeholder="Tên thông số (VD: Socket Hỗ Trợ, Xung Nhịp...)"
                        className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#d4ff00] transition-colors"
                      />
                    </div>
                    <div className="w-full sm:col-span-4">
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="Giá trị (VD: AM5, 5.0 GHz, 120W...)"
                        className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#d4ff00] transition-colors"
                      />
                    </div>
                    <div className="w-full sm:col-span-2">
                      <select
                        value={item.group || 'detail'}
                        onChange={(e) => handleSpecChange(idx, 'group', e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-2 py-1.5 text-xs text-gray-300 outline-none focus:border-[#d4ff00] cursor-pointer"
                        title="Chọn nhóm hiển thị"
                      >
                        <option value="detail">Cấu hình chi tiết</option>
                        <option value="general">Thông tin chung</option>
                        <option value="dimension">Kích thước - Khối lượng</option>
                      </select>
                    </div>
                    <div className="w-full sm:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Xóa thông số này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
