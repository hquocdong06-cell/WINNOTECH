import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import { API_BASE as API_URL } from '../services/adminService';

export default function AdminFlashSale() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('active')
  const [durationHours, setDurationHours] = useState(8)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [selectionMode, setSelectionMode] = useState('auto') // 'auto' | 'custom'
  const [customProductIds, setCustomProductIds] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load current settings from backend
  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/flash-sale`)
      const data = await res.json()
      if (data.success && data.data) {
        setStatus(data.data.status || 'active')
        const totalSecs = data.data.durationSeconds || 28800
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        setDurationHours(h)
        setDurationMinutes(m)
        if (data.data.customProductIds && data.data.customProductIds.length === 5) {
          setSelectionMode('custom')
          setCustomProductIds(data.data.customProductIds)
        } else {
          setSelectionMode('auto')
          setCustomProductIds([])
        }
      }
      if (data.allProducts) {
        setAllProducts(data.allProducts)
      }
    } catch (err) {
      toast.error('Lỗi khi tải cấu hình Flash Sale: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleToggleProduct = (id) => {
    if (customProductIds.includes(id)) {
      setCustomProductIds(customProductIds.filter((pId) => pId !== id))
    } else {
      if (customProductIds.length >= 5) {
        toast.warning('Bạn chỉ được chọn tối đa đúng 5 sản phẩm cho Flash Sale!')
        return
      }
      setCustomProductIds([...customProductIds, id])
    }
  }

  const handleSave = async () => {
    const totalSecs = durationHours * 3600 + durationMinutes * 60
    if (totalSecs <= 0 || totalSecs > 28800) {
      toast.error('Thời gian sale phải lớn hơn 0 và không vượt quá 8 tiếng (28,800 giây)!')
      return
    }

    if (selectionMode === 'custom' && customProductIds.length !== 5) {
      toast.error('Nếu chọn thủ công, bạn BẮT BUỘC phải chọn ĐỦ ĐÚNG 5 sản phẩm!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        status,
        durationSeconds: totalSecs,
        customProductIds: selectionMode === 'custom' ? customProductIds : [],
      }

      const res = await fetch(`${API_URL}/api/admin/flash-sale`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Cập nhật cấu hình Flash Sale 8h thành công!')
        loadSettings()
      } else {
        toast.error(data.message || 'Cập nhật thất bại!')
      }
    } catch (err) {
      toast.error('Lỗi kết nối server: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Đang tải cấu hình Flash Sale...</div>
  }

  return (
    <div style={{ padding: '24px', color: '#fff', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔥 Quản Lý Section Flash Sale 8 Giờ
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
            Điều chỉnh thời gian, bật/tắt hiển thị section và tùy chọn 5 sản phẩm Flash Sale ở trang chủ.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            cursor: saving ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
          }}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu Cấu Hình'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* CARD 1: TRẠNG THÁI & THỜI GIAN SALE */}
        <div
          style={{
            background: '#1e293b',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>
            ⚡ 1. Bật / Tắt & Cấu Hình Thời Gian
          </h3>

          {/* BẬT / TẮT SECTION */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#cbd5e1' }}>
              Trạng thái hiển thị ở Trang Chủ:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStatus('active')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: status === 'active' ? '2px solid #22c55e' : '1px solid #475569',
                  background: status === 'active' ? 'rgba(34, 197, 94, 0.2)' : '#0f172a',
                  color: status === 'active' ? '#4ade80' : '#94a3b8',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ✅ Đang Bật (Hiển thị)
              </button>

              <button
                type="button"
                onClick={() => setStatus('disabled')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: status === 'disabled' ? '2px solid #ef4444' : '1px solid #475569',
                  background: status === 'disabled' ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                  color: status === 'disabled' ? '#f87171' : '#94a3b8',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ⛔ Tắt Hoàn Toàn (Ẩn khỏi Trang chủ)
              </button>
            </div>
          </div>

          {/* THỜI GIAN ĐẾM NGƯỢC (Tối đa 8 tiếng) */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#cbd5e1' }}>
              Thời gian đếm ngược (Tối đa 8 tiếng = 28,800s):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Giờ (0 - 8h):</span>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.min(8, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: '#fff',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Phút (0 - 59m):</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: '#fff',
                    marginTop: '4px',
                  }}
                />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>
              ⏱️ Tổng thời gian thiết lập: <strong>{durationHours} giờ {durationMinutes} phút</strong> ({durationHours * 3600 + durationMinutes * 60} giây)
            </p>
          </div>
        </div>

        {/* CARD 2: CHỌN SẢN PHẨM FLASH SALE */}
        <div
          style={{
            background: '#1e293b',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f43f5e' }}>
            🎯 2. Chọn Sản Phẩm Flash Sale (Luôn đúng 5 sản phẩm)
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="radio"
                name="selectionMode"
                checked={selectionMode === 'auto'}
                onChange={() => setSelectionMode('auto')}
              />
              <span style={{ fontSize: '14px' }}>Tự động chọn Top 5 sản phẩm có lượt bán thấp nhất (Xả kho)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="selectionMode"
                checked={selectionMode === 'custom'}
                onChange={() => setSelectionMode('custom')}
              />
              <span style={{ fontSize: '14px' }}>Tự chọn thủ công đúng 5 sản phẩm bên dưới</span>
            </label>
          </div>

          {selectionMode === 'custom' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Tìm sản phẩm:</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: customProductIds.length === 5 ? '#22c55e' : '#ef4444',
                  }}
                >
                  Đã chọn: {customProductIds.length} / 5 sản phẩm
                </span>
              </div>

              <input
                type="text"
                placeholder="Nhập tên sản phẩm để lọc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#0f172a',
                  border: '1px solid #475569',
                  color: '#fff',
                  marginBottom: '12px',
                }}
              />

              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px', padding: '8px' }}>
                {filteredProducts.map((p) => {
                  const isSelected = customProductIds.includes(p._id)
                  return (
                    <div
                      key={p._id}
                      onClick={() => handleToggleProduct(p._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={isSelected} readOnly />
                        <span style={{ fontSize: '13px' }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#38bdf8' }}>
                        {p.price ? p.price.toLocaleString('vi-VN') + 'đ' : '0đ'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
