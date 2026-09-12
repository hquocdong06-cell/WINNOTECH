import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Loader2, Plus, Trash2, Layers, Edit2, Check, RotateCcw, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createProduct, updateProduct, uploadImage, fetchCategories, fetchBrands,
  fetchCategoryAttributes, createCategoryAttribute,
  fetchAttributes, createAttribute,
  fetchProductSpecifications, deleteSpecification, toggleSpecificationStatus,
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

  // Bảng categories_attribute và attribute_value theo ERD
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedAttrValId, setSelectedAttrValId] = useState('');

  // Tạo nhanh 2 bảng categories_attribute & attribute_value cùng lúc tại popup
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCatMode, setQuickCatMode] = useState('existing'); // 'existing' | 'new'
  const [quickNewCatName, setQuickNewCatName] = useState('');
  const [quickSelectedCatId, setQuickSelectedCatId] = useState('');
  const [quickNewValue, setQuickNewValue] = useState('');
  const [isCreatingQuick, setIsCreatingQuick] = useState(false);

  // Chỉnh sửa inline thông số
  const [editingSpecIdx, setEditingSpecIdx] = useState(null);
  const [editingAttrValId, setEditingAttrValId] = useState('');
  
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

  // Load categories + brands + categoryAttributes + attributes khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    if (categoriesProp?.length) {
      setCategories(categoriesProp);
    } else {
      fetchCategories().then(setCategories).catch(() => {});
    }
    fetchBrands().then(setBrands).catch(() => {});

    // Nạp danh mục thuộc tính và các giá trị thuộc tính có sẵn
    const loadAttrs = async () => {
      try {
        const [cats, attrs] = await Promise.all([
          fetchCategoryAttributes({ status: 'active' }),
          fetchAttributes({ status: 'active' }),
        ]);
        setCategoryAttributes(cats || []);
        setAllAttributes(attrs || []);
      } catch (err) {
        console.error('Lỗi nạp thuộc tính:', err);
      }
    };
    loadAttrs();

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

      // Lấy thông số từ bảng Specifications
      if (product._id) {
        fetchProductSpecifications(product._id, { include_inactive: 'true' })
          .then((specs) => {
            if (Array.isArray(specs) && specs.length > 0) {
              setSpecifications(specs.map(s => ({
                _id: s._id,
                p_id: s.p_id,
                id_attribute_value: s.id_attribute_value?._id || s.id_attribute_value,
                value: s.value || s.id_attribute_value?.value || '',
                category_id: s.category_id || s.id_attribute_value?.id_categories_attribute?._id || s.id_attribute_value?.id_categories_attribute || '',
                category_name: s.category_name || s.id_attribute_value?.id_categories_attribute?.name || 'Thông số',
                status: s.status || 'active',
                is_deleted: Boolean(s.is_deleted || s.status === 'inactive'),
              })));
            } else if (Array.isArray(product.specifications)) {
              setSpecifications(product.specifications);
            }
          })
          .catch(() => {
            setSpecifications(Array.isArray(product.specifications) ? product.specifications : []);
          });
      } else {
        setSpecifications(Array.isArray(product.specifications) ? product.specifications : []);
      }
    } else {
      setForm({ name: '', description: '', short_desc: '', status: 'active', cat_id: '', brand_id: '', thumnail: '' });
      setPreviewUrl('');
      setSubImages([]);
      setSpecifications([]);
      setSelectedCatId('');
      setSelectedAttrValId('');
      setIsQuickCreateOpen(false);
      setEditingSpecIdx(null);
    }
  }, [isOpen, product, categoriesProp]);

  if (!isOpen) return null;

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Danh sách các giá trị thuộc tính tương ứng với danh mục được chọn
  const availableValuesForSelectedCat = allAttributes.filter(attr => {
    const cId = typeof attr.id_categories_attribute === 'object'
      ? attr.id_categories_attribute?._id
      : (attr.id_categories_attribute || attr.id_attribute);
    return String(cId) === String(selectedCatId);
  });

  // 1. Thêm thông số từ thuộc tính có sẵn
  const handleAddExistingSpec = () => {
    if (!selectedCatId) {
      toast.warning('Vui lòng chọn danh mục thuộc tính!');
      return;
    }
    if (!selectedAttrValId) {
      toast.warning('Vui lòng chọn giá trị thuộc tính!');
      return;
    }

    const foundVal = allAttributes.find(a => String(a._id) === String(selectedAttrValId));
    const foundCat = categoryAttributes.find(c => String(c._id) === String(selectedCatId));
    if (!foundVal || !foundCat) return;

    // Kiểm tra xem đã có trong danh sách specifications chưa
    const existingIndex = specifications.findIndex(
      s => String(s.id_attribute_value) === String(selectedAttrValId)
    );

    if (existingIndex !== -1) {
      const existingItem = specifications[existingIndex];
      if (existingItem.status === 'active' && !existingItem.is_deleted) {
        toast.info('Thông số này đã có trong danh sách thông số của sản phẩm!');
        return;
      }
      // Nếu đang bị xóa mềm -> Phục hồi lại active
      setSpecifications(prev => prev.map((s, idx) => idx === existingIndex ? {
        ...s,
        status: 'active',
        is_deleted: false,
      } : s));
      toast.success(`Đã khôi phục lại thông số: ${foundCat.name} - ${foundVal.value}`);
      setSelectedAttrValId('');
      return;
    }

    setSpecifications(prev => [
      ...prev,
      {
        id_attribute_value: foundVal._id,
        category_id: foundCat._id,
        category_name: foundCat.name,
        value: foundVal.value,
        status: 'active',
        is_deleted: false,
      }
    ]);
    setSelectedAttrValId('');
    toast.success(`Đã thêm thông số: ${foundCat.name} - ${foundVal.value}`);
  };

  // 2. Tạo nhanh 2 bảng categories_attribute & attribute_value cùng lúc ngay tại popup
  const handleQuickCreateAndAdd = async () => {
    if (quickCatMode === 'new' && !quickNewCatName.trim()) {
      toast.warning('Vui lòng nhập tên danh mục thuộc tính mới!');
      return;
    }
    if (quickCatMode === 'existing' && !quickSelectedCatId) {
      toast.warning('Vui lòng chọn danh mục thuộc tính!');
      return;
    }
    if (!quickNewValue.trim()) {
      toast.warning('Vui lòng nhập giá trị thuộc tính mới!');
      return;
    }

    setIsCreatingQuick(true);
    try {
      let targetCatId = quickSelectedCatId;
      let targetCatName = '';

      if (quickCatMode === 'new') {
        // Tạo categories_attribute mới
        const catRes = await createCategoryAttribute({ name: quickNewCatName.trim() });
        const createdCat = catRes.data || catRes;
        targetCatId = createdCat._id;
        targetCatName = createdCat.name;
        setCategoryAttributes(prev => [createdCat, ...prev]);
      } else {
        const foundCat = categoryAttributes.find(c => String(c._id) === String(quickSelectedCatId));
        targetCatName = foundCat ? foundCat.name : '';
      }

      // Tạo attribute_value mới gắn với categories_attribute
      const attrRes = await createAttribute({
        value: quickNewValue.trim(),
        id_categories_attribute: targetCatId,
      });
      const createdAttr = attrRes.data || attrRes;
      setAllAttributes(prev => [createdAttr, ...prev]);

      // Thêm ngay vào Specifications của sản phẩm
      setSpecifications(prev => [
        ...prev,
        {
          id_attribute_value: createdAttr._id,
          category_id: targetCatId,
          category_name: targetCatName,
          value: createdAttr.value,
          status: 'active',
          is_deleted: false,
        }
      ]);

      setQuickNewValue('');
      if (quickCatMode === 'new') {
        setQuickNewCatName('');
        setQuickSelectedCatId(targetCatId);
        setQuickCatMode('existing');
      }
      setIsQuickCreateOpen(false);
      toast.success(`Đã tạo và thêm thông số: ${targetCatName} - ${createdAttr.value}`);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tạo danh mục hoặc thuộc tính');
    } finally {
      setIsCreatingQuick(false);
    }
  };

  // 3. Xóa mềm thông số (Soft Delete: chuyển status sang inactive)
  const handleSoftDeleteSpec = async (index) => {
    const spec = specifications[index];
    if (!spec) return;

    if (spec._id) {
      // Đã lưu trong DB -> gọi API xóa mềm
      try {
        await deleteSpecification(spec._id);
        setSpecifications(prev => prev.map((s, idx) => idx === index ? {
          ...s,
          status: 'inactive',
          is_deleted: true,
        } : s));
        toast.info(`Đã xóa mềm thông số: ${spec.category_name} - ${spec.value}`);
      } catch (err) {
        toast.error('Lỗi khi xóa mềm: ' + err.message);
      }
    } else {
      // Bản ghi nháp mới thêm trong popup -> loại bỏ khỏi danh sách
      setSpecifications(prev => prev.filter((_, idx) => idx !== index));
      toast.info(`Đã xóa thông số: ${spec.category_name} - ${spec.value}`);
    }
  };

  // 4. Khôi phục thông số đã xóa mềm
  const handleRestoreSpec = async (index) => {
    const spec = specifications[index];
    if (!spec) return;

    if (spec._id) {
      try {
        await toggleSpecificationStatus(spec._id, 'active');
        setSpecifications(prev => prev.map((s, idx) => idx === index ? {
          ...s,
          status: 'active',
          is_deleted: false,
        } : s));
        toast.success(`Đã khôi phục thông số: ${spec.category_name} - ${spec.value}`);
      } catch (err) {
        toast.error('Lỗi khôi phục: ' + err.message);
      }
    } else {
      setSpecifications(prev => prev.map((s, idx) => idx === index ? {
        ...s,
        status: 'active',
        is_deleted: false,
      } : s));
    }
  };

  // 5. Sửa thông số (đổi sang giá trị thuộc tính khác cùng danh mục)
  const handleStartEditSpec = (index) => {
    setEditingSpecIdx(index);
    setEditingAttrValId(specifications[index].id_attribute_value || '');
  };

  const handleSaveEditSpec = (index) => {
    if (!editingAttrValId) return;
    const newAttr = allAttributes.find(a => String(a._id) === String(editingAttrValId));
    if (!newAttr) return;

    setSpecifications(prev => prev.map((s, idx) => idx === index ? {
      ...s,
      id_attribute_value: newAttr._id,
      value: newAttr.value,
    } : s));
    setEditingSpecIdx(null);
    toast.success('Đã cập nhật giá trị thông số!');
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
        .filter(s => s.id_attribute_value || s.value || s.name)
        .map(s => ({
          _id: s._id,
          id_attribute_value: s.id_attribute_value,
          name: s.category_name || s.name || '',
          value: s.value || '',
          status: s.status || 'active',
          is_deleted: Boolean(s.is_deleted || s.status === 'inactive'),
          group: 'detail',
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

          {/* Khối Thông số kỹ thuật (Specifications) theo ERD */}
          <div className="mt-6 bg-[#1e1e1e] border border-[#333] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333] pb-3">
              <div>
                <h3 className="font-semibold text-[15px] text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#d4ff00]" />
                  Thông số kỹ thuật chi tiết (Bảng Specifications theo ERD)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Dữ liệu được lưu trực tiếp vào bảng <strong>Specifications</strong> và hiển thị tại trang chi tiết sản phẩm.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all border ${
                    isQuickCreateOpen
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-[#262626] hover:bg-[#333] text-gray-200 border-[#444]'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isQuickCreateOpen ? 'Đóng tạo nhanh 2 bảng' : '+ Tạo mới 2 bảng cùng lúc'}
                </button>
              </div>
            </div>

            {/* Khối TẠO NHANH 2 BẢNG CÙNG LÚC (categories_attribute & attribute_value) */}
            {isQuickCreateOpen && (
              <div className="bg-[#141414] border border-amber-500/40 rounded-lg p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Tạo 1 lúc cả 2 bảng (Danh mục thuộc tính & Giá trị thuộc tính)
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-300 flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="quickCatMode"
                        checked={quickCatMode === 'existing'}
                        onChange={() => setQuickCatMode('existing')}
                        className="accent-[#d4ff00]"
                      />
                      Chọn DM có sẵn
                    </label>
                    <label className="text-xs text-gray-300 flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="quickCatMode"
                        checked={quickCatMode === 'new'}
                        onChange={() => setQuickCatMode('new')}
                        className="accent-[#d4ff00]"
                      />
                      Tạo DM mới
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">
                      {quickCatMode === 'new' ? 'Tên danh mục thuộc tính mới *' : 'Chọn danh mục thuộc tính *'}
                    </label>
                    {quickCatMode === 'new' ? (
                      <input
                        type="text"
                        value={quickNewCatName}
                        onChange={(e) => setQuickNewCatName(e.target.value)}
                        placeholder="VD: Chuẩn PCIe, Bus RAM, Socket..."
                        className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-amber-400"
                      />
                    ) : (
                      <select
                        value={quickSelectedCatId}
                        onChange={(e) => setQuickSelectedCatId(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Chọn danh mục thuộc tính --</option>
                        {categoryAttributes.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">
                      Giá trị thuộc tính mới *
                    </label>
                    <input
                      type="text"
                      value={quickNewValue}
                      onChange={(e) => setQuickNewValue(e.target.value)}
                      placeholder="VD: PCIe 5.0 x16, 6000MHz, LGA1700..."
                      className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      disabled={isCreatingQuick}
                      onClick={handleQuickCreateAndAdd}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {isCreatingQuick ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Tạo & Thêm ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Thanh CHỌN CÓ SẴN (CategoryAttribute + AttributeValue) */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                <span>Chọn thuộc tính & giá trị có sẵn để thêm vào thông số:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-5">
                  <select
                    value={selectedCatId}
                    onChange={(e) => {
                      setSelectedCatId(e.target.value);
                      setSelectedAttrValId('');
                    }}
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#d4ff00] cursor-pointer"
                  >
                    <option value="">-- Chọn danh mục thuộc tính (categories_attribute) --</option>
                    {categoryAttributes.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <select
                    value={selectedAttrValId}
                    onChange={(e) => setSelectedAttrValId(e.target.value)}
                    disabled={!selectedCatId}
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#d4ff00] disabled:opacity-40 cursor-pointer"
                  >
                    <option value="">
                      {selectedCatId ? '-- Chọn giá trị thuộc tính (attribute_value) --' : '-- Hãy chọn danh mục trước --'}
                    </option>
                    {availableValuesForSelectedCat.map((attr) => (
                      <option key={attr._id} value={attr._id}>{attr.value}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddExistingSpec}
                    disabled={!selectedCatId || !selectedAttrValId}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#d4ff00] hover:bg-[#bce600] text-black text-xs font-bold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm thông số
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách các dòng thông số trong bảng Specifications */}
            {specifications.length === 0 ? (
              <div className="text-center py-7 border border-dashed border-[#333] rounded-lg bg-[#141414]/40">
                <p className="text-xs text-gray-400">Chưa có thông số kỹ thuật nào trong bảng Specifications.</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Chọn <strong>thuộc tính có sẵn</strong> ở trên hoặc bấm <strong>"Tạo mới 2 bảng cùng lúc"</strong> để thêm thông số.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                  <div className="col-span-4">Danh mục thuộc tính</div>
                  <div className="col-span-4">Giá trị thuộc tính</div>
                  <div className="col-span-2 text-center">Trạng thái</div>
                  <div className="col-span-2 text-center">Thao tác</div>
                </div>

                {specifications.map((item, idx) => {
                  const isSoftDeleted = item.status === 'inactive' || item.is_deleted === true;
                  const isEditing = editingSpecIdx === idx;

                  return (
                    <div
                      key={item._id || idx}
                      className={`flex flex-col sm:grid sm:grid-cols-12 gap-2 p-2.5 rounded-lg border transition-colors items-center ${
                        isSoftDeleted
                          ? 'bg-[#181818]/60 border-red-900/30 opacity-60'
                          : 'bg-[#141414] border-[#333] hover:border-[#444]'
                      }`}
                    >
                      {/* Cột Tên danh mục thuộc tính */}
                      <div className="w-full sm:col-span-4 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#d4ff00]">
                          {item.category_name || item.name || 'Thông số'}
                        </span>
                      </div>

                      {/* Cột Giá trị thuộc tính */}
                      <div className="w-full sm:col-span-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={editingAttrValId}
                              onChange={(e) => setEditingAttrValId(e.target.value)}
                              className="w-full bg-[#1e1e1e] border border-[#d4ff00] rounded px-2 py-1 text-xs text-white outline-none"
                            >
                              {allAttributes
                                .filter(a => {
                                  const cId = typeof a.id_categories_attribute === 'object'
                                    ? a.id_categories_attribute?._id
                                    : (a.id_categories_attribute || a.id_attribute);
                                  return String(cId) === String(item.category_id);
                                })
                                .map(a => (
                                  <option key={a._id} value={a._id}>{a.value}</option>
                                ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleSaveEditSpec(idx)}
                              className="p-1 bg-[#d4ff00] text-black rounded hover:bg-[#bce600]"
                              title="Lưu sửa"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSpecIdx(null)}
                              className="p-1 bg-[#333] text-gray-300 rounded hover:bg-[#444]"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs ${isSoftDeleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {item.value || '—'}
                          </span>
                        )}
                      </div>

                      {/* Cột Trạng thái (hỗ trợ xóa mềm) */}
                      <div className="w-full sm:col-span-2 flex justify-center">
                        {isSoftDeleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            Đã xóa mềm (Ẩn)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Đang hoạt động
                          </span>
                        )}
                      </div>

                      {/* Cột Thao tác: Sửa, Xóa mềm, Khôi phục */}
                      <div className="w-full sm:col-span-2 flex items-center justify-center gap-1.5">
                        {!isSoftDeleted && !isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEditSpec(idx)}
                            className="p-1.5 text-gray-400 hover:text-[#d4ff00] hover:bg-[#222] rounded transition-colors"
                            title="Sửa giá trị thông số"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isSoftDeleted ? (
                          <button
                            type="button"
                            onClick={() => handleRestoreSpec(idx)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/40 rounded transition-colors"
                            title="Khôi phục thông số"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Khôi phục
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSoftDeleteSpec(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Xóa mềm thông số (chuyển sang inactive)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
