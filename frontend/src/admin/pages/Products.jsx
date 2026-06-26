import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cat_id: '',
    brand_id: '',
    price: '',
    sale: '0',
    thumnail: '',
    short_desc: '',
    description: '',
    stock: '10',
    status: 'active'
  });

  const [submitting, setSubmitting] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch Products
      const resProd = await fetch(`${API_URL}/products`);
      const dataProd = await resProd.json();
      if (dataProd.success) {
        setProducts(dataProd.data);
      }

      // Fetch Categories
      const resCat = await fetch(`${API_URL}/categories`);
      const dataCat = await resCat.json();
      if (dataCat.success) {
        setCategories(dataCat.data);
      }

      // Fetch Brands
      const resBrand = await fetch(`${API_URL}/brands`);
      const dataBrand = await resBrand.json();
      if (dataBrand.success) {
        setBrands(dataBrand.data);
      }
    } catch (err) {
      console.error('Lỗi fetch dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      cat_id: '',
      brand_id: '',
      price: '',
      sale: '0',
      thumnail: '',
      short_desc: '',
      description: '',
      stock: '10',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    const variant = p.Variants && p.Variants.length > 0 ? p.Variants[0] : null;
    setFormData({
      name: p.name,
      cat_id: p.cat_id?._id || p.cat_id || '',
      brand_id: p.brand_id?._id || p.brand_id || '',
      price: variant ? variant.price : '',
      sale: p.sale !== undefined ? p.sale.toString() : '0',
      thumnail: p.AnhSP && p.AnhSP.length > 0 ? p.AnhSP[0].url : p.thumnail || '',
      short_desc: p.short_desc || '',
      description: p.description || '',
      stock: variant ? variant.stock_quantity.toString() : '0',
      status: p.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    try {
      setSubmitting(true);
      const url = editingProduct ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
          sale: Number(formData.sale) || 0,
          stock: Number(formData.stock) || 0
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          cat_id: '',
          brand_id: '',
          price: '',
          sale: '0',
          thumnail: '',
          short_desc: '',
          description: '',
          stock: '10',
          status: 'active'
        });
        fetchInitialData();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Lỗi khi submit sản phẩm:', error);
      alert('Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Xóa sản phẩm thành công!');
        fetchInitialData();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      alert('Đã xảy ra lỗi hệ thống');
    }
  };

  // Filter products based on search, cat, brand
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat ? (p.cat_id?._id === selectedCat || p.cat_id === selectedCat) : true;
    const matchesBrand = selectedBrand ? (p.brand_id?._id === selectedBrand || p.brand_id === selectedBrand) : true;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Quản lý sản phẩm</h1>
          <div style={{ fontSize: '13px', color: '#666' }}>Trang chủ &gt; Sản phẩm &gt; Danh sách sản phẩm</div>
        </div>
        <button className="btn-primary" onClick={handleOpenAddModal}>
          <span>+</span> Thêm sản phẩm
        </button>
      </div>

      <div className="filters-wrapper">
        <div className="header-search" style={{ flex: 1.5, minWidth: '250px' }}>
          <i>🔍</i>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            style={{ background: '#1e1e1e' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Danh mục</label>
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Hãng</label>
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="">Tất cả hãng</option>
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-btn" title="Làm mới" onClick={fetchInitialData}>🔄</button>
        </div>
      </div>

      <div className="content-card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>⏳ Đang tải danh sách...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}><input type="checkbox" /></th>
                <th>HÌNH ẢNH</th>
                <th>TÊN SẢN PHẨM</th>
                <th>DANH MỤC</th>
                <th>HÃNG</th>
                <th>GIÁ</th>
                <th>TỒN KHO</th>
                <th>TRẠNG THÁI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const imgUrl = p.AnhSP && p.AnhSP.length > 0 ? p.AnhSP[0].url : p.thumnail;
                const variant = p.Variants && p.Variants.length > 0 ? p.Variants[0] : null;
                const price = variant ? variant.price : 0;
                const stock = variant ? variant.stock_quantity : 0;
                
                return (
                  <tr key={p._id}>
                    <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                    <td>
                      <img 
                        src={imgUrl || 'https://images.unsplash.com/photo-1591485121907-26859ff93e37?q=80&w=2670&auto=format&fit=crop'} 
                        alt={p.name} 
                        className="product-img" 
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '4px' }}>
                        {p.short_desc ? p.short_desc.slice(0, 50) + '...' : 'Không có mô tả phụ'}
                      </div>
                    </td>
                    <td>{p.cat_id?.name || 'N/A'}</td>
                    <td>{p.brand_id?.name || 'N/A'}</td>
                    <td style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{formatPrice(price)}</td>
                    <td>{stock}</td>
                    <td>
                      <span className={`status-badge ${p.status === 'active' ? 'status-success' : 'status-danger'}`}>
                        {p.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons">
                        <button className="icon-btn edit" onClick={() => handleOpenEditModal(p)}>✏️</button>
                        <button className="icon-btn delete" onClick={() => handleDeleteProduct(p._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Không tìm thấy sản phẩm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#121212',
            border: '1px solid #333',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '25px',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: '#999', fontSize: '20px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Tên Sản Phẩm *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    placeholder="Ví dụ: ASUS TUF Gaming GeForce RTX 4070"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Danh mục *</label>
                    <select 
                      name="cat_id"
                      value={formData.cat_id}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Thương hiệu *</label>
                    <select 
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      required
                    >
                      <option value="">-- Chọn hãng --</option>
                      {brands.map(brand => (
                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Giá bán gốc *</label>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      placeholder="Giá trị VNĐ"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Sale (%)</label>
                    <input 
                      type="number" 
                      name="sale"
                      value={formData.sale}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      placeholder="Ví dụ: 10"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Số lượng tồn *</label>
                    <input 
                      type="number" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>URL hình ảnh (Thumbnail)</label>
                    <input 
                      type="text" 
                      name="thumnail"
                      value={formData.thumnail}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Trạng thái</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="active">Đang bán</option>
                      <option value="inactive">Ngừng bán</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Mô tả ngắn</label>
                  <input 
                    type="text" 
                    name="short_desc"
                    value={formData.short_desc}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    placeholder="Tóm tắt thông số chính hoặc điểm nổi bật"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#aaa' }}>Mô tả chi tiết</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    style={{ width: '100%', padding: '10px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
                    placeholder="Thông tin đầy đủ chi tiết về sản phẩm..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: '10px 20px', background: '#222', border: '1px solid #333', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ padding: '10px 20px', background: 'var(--accent-color, #fbbf24)', border: 'none', borderRadius: '4px', color: '#000', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}
                  >
                    {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
