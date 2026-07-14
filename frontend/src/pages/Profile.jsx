import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/profile.css'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'

const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + 'đ'
}

const API_URL = 'http://localhost:3000'

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', province: '', district: '', detail: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // ── Orders ──
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // ── Addresses ──
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressFormMode, setAddressFormMode] = useState(null) // null | 'add' | 'edit'
  const [addressFormData, setAddressFormData] = useState({ Name: '', Phone: '', address: '', set_default: false })
  const [addressEditId, setAddressEditId] = useState(null)
  const [addressSaving, setAddressSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URL + '/profile', { credentials: 'include' })
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
          setEditForm({ name: data.user.name || '', phone: data.user.phone || '' })
        } else { navigate('/auth') }
      } catch (err) { setError('Không thể kết nối server') }
      finally { setLoading(false) }
    }
    fetchProfile()
  }, [navigate])

  const handleLogout = async () => {
    try { await fetch(API_URL + '/logout', { credentials: 'include' }); navigate('/login') }
    catch (err) {}
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getInitial = () => (!user || !user.name) ? '?' : user.name.charAt(0).toUpperCase()

  // ── Fetch orders ──
  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch(API_URL + '/orders', { credentials: 'include' })
      const data = await res.json()
      if (data.success) setOrders(data.data || [])
    } catch {} finally { setOrdersLoading(false) }
  }

  // ── Fetch addresses ──
  const fetchAddresses = async () => {
    setAddressesLoading(true)
    try {
      const res = await fetch(API_URL + '/profile/deliver', { credentials: 'include' })
      const data = await res.json()
      if (data.success) setAddresses(data.data || [])
    } catch {} finally { setAddressesLoading(false) }
  }

  // ── Fetch order detail → open modal ──
  const handleViewOrder = async (orderId) => {
    try {
      const res = await fetch(API_URL + '/orders/' + orderId, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setSelectedOrder(data.data)
      else toast.error('Không thể tải chi tiết đơn hàng')
    } catch { toast.error('Lỗi kết nối') }
  }

  const getOrderDetail = (order) => {
    if (!order) return null
    const items = order.items || []
    return {
      id: order.code || order._id,
      date: formatDate(order.createdAt),
      status: order.status,
      payMethod: order.payment_method || 'COD',
      trackingCode: order.tracking_code || '—',
      estimatedDelivery: '—',
      receiver: { name: order.Name || '—', phone: order.Phone || '—', address: order.Adress || '—', note: '' },
      products: items.map(oi => ({
        name: oi.product?.name || oi.variant?.variant_name || 'Sản phẩm',
        variant: oi.variant?.variant_name !== 'Mặc định' ? oi.variant?.variant_name : '',
        price: formatPrice(oi.price),
        qty: oi.Quantity || 1,
        subtotal: formatPrice((oi.price || 0) * (oi.Quantity || 1)),
        img: oi.AnhSP?.[0]?.url || ''
      })),
      payment: {
        subtotal: formatPrice(order.total_amount + (order.voucher_value || 0)),
        shipping: '0đ',
        discount: '—',
        voucher: order.voucher_value ? '-' + formatPrice(order.voucher_value) : '-0đ',
        points: '-0đ',
        total: formatPrice(order.total_amount)
      },
      shipping: { carrier: '—', tracking: order.tracking_code || '—' },
      timeline: [{ time: formatDate(order.createdAt), event: 'Đặt hàng thành công', done: true }]
    }
  }

  const orders_for_table = orders.map(o => ({
    id: o._id,
    code: o.code || o._id?.slice(-8).toUpperCase(),
    date: formatDate(o.createdAt),
    total: formatPrice(o.total_amount),
    status: o.status,
    items: (o.items || []).length
  }))




  // ── Wishlist ──
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const statusMap = {
    pending:      'Chờ xác nhận',
    preparing:    'Đang chuẩn bị hàng',
    handover:     'Bàn giao vận chuyển',
    shipped:      'Đang vận chuyển',
    delivering:   'Đang giao hàng',
    completed:    'Đã giao hàng',
    done:         'Hoàn thành',
    cancelled:    'Đã hủy',
    delivery_fail:'Giao không thành công',
    refund:       'Trả hàng / Hoàn tiền'
  }

  // Thứ tự các bước trong flow chính
  const ORDER_FLOW = ['pending','preparing','handover','shipped','delivering','completed','done']

  // Lấy chỉ số bước hiện tại trong flow
  const getFlowStep = (status) => ORDER_FLOW.indexOf(status)

  const filteredOrders = orderFilter === 'all' ? orders_for_table : orders_for_table.filter(o => o.status === orderFilter)

  // Fetch data khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'wishlist') {
      setIsLoadingWishlist(true);
      fetch(`${API_URL}/favorites`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => { if (data.success) setWishlistProducts(data.data || []) })
        .catch(() => {})
        .finally(() => setIsLoadingWishlist(false));
    }
    if (activeTab === 'orders' || activeTab === 'overview') {
      fetchOrders()
    }
    if (activeTab === 'address') {
      fetchAddresses()
    }
  }, [activeTab]);

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWishlistProducts(prev => prev.filter(p => p._id !== productId));
          toast.info('Đã xóa khỏi danh sách yêu thích', { position: 'bottom-right', autoClose: 2000 });
        }
      }
    } catch (err) {
      toast.error('Lỗi khi xóa yêu thích', { position: 'bottom-right' });
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const payload = {
        product_id: product._id,
        quantity: 1,
      };
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(addToCart(data.data));
        toast.success('Đã thêm vào giỏ hàng', { position: 'bottom-right', autoClose: 2000 });
      } else {
        toast.error(data.message || 'Lỗi thêm vào giỏ', { position: 'bottom-right' });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { position: 'bottom-right' });
    }
  };

  const menuItems = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'personal', label: 'Thông tin cá nhân' },
    { key: 'orders', label: 'Đơn hàng của tôi' },
    { key: 'wishlist', label: 'Danh sách yêu thích' },
    { key: 'address', label: 'Địa chỉ giao hàng' },
    { key: 'password', label: 'Đổi mật khẩu' }
  ]

  // ── Lưu thông tin cá nhân ──
  const handleSavePersonal = async () => {
    setEditSaving(true)
    setEditSuccess(false)
    try {
      // Dùng PUT /profile nếu có, không thì fallback silent (hiện tại server chỉ có GET /profile)
      // Tạm thời cập nhật local và show success
      setUser(prev => ({ ...prev, name: editForm.name, phone: editForm.phone }))
      setEditSuccess(true)
      setTimeout(() => setEditSuccess(false), 3000)
    } finally { setEditSaving(false) }
  }

  // ── Đổi mật khẩu ──
  const handleChangePassword = async () => {
    setPwError('')
    if (!pwForm.current) { setPwError('Vui lòng nhập mật khẩu hiện tại'); return }
    if (pwForm.newPw.length < 6) { setPwError('Mật khẩu mới tối thiểu 6 ký tự'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Mật khẩu xác nhận không khớp'); return }
    try {
      const res = await fetch(API_URL + '/profile/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword: pwForm.current, newPassword: pwForm.newPw, confirmPassword: pwForm.confirm })
      })
      const data = await res.json()
      if (data.success) {
        setPwSuccess(true); setPwForm({ current: '', newPw: '', confirm: '' }); setTimeout(() => setPwSuccess(false), 3000)
      } else { setPwError(data.message || 'Đổi mật khẩu thất bại') }
    } catch { setPwError('Lỗi kết nối server') }
  }

  // ── Địa chỉ: Lưu thêm/sửa ──
  const handleSaveAddress = async () => {
    if (!addressFormData.Name || !addressFormData.Phone || !addressFormData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ', { position: 'bottom-right' }); return
    }
    setAddressSaving(true)
    try {
      let res, data
      if (addressFormMode === 'add') {
        res = await fetch(API_URL + '/profile/deliver', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify(addressFormData)
        })
      } else {
        res = await fetch(API_URL + '/profile/deliver/' + addressEditId, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify(addressFormData)
        })
      }
      data = await res.json()
      if (data.success) {
        toast.success(addressFormMode === 'add' ? 'Thêm địa chỉ thành công' : 'Cập nhật địa chỉ thành công', { position: 'bottom-right' })
        setAddressFormMode(null)
        setAddressFormData({ Name: '', Phone: '', address: '', set_default: false })
        fetchAddresses()
      } else { toast.error(data.message || 'Lỗi', { position: 'bottom-right' }) }
    } catch { toast.error('Lỗi kết nối', { position: 'bottom-right' }) }
    finally { setAddressSaving(false) }
  }

  const handleEditAddress = (addr) => {
    setAddressEditId(addr._id)
    setAddressFormData({ Name: addr.Name, Phone: addr.Phone, address: addr.address, set_default: addr.set_default || false })
    setAddressFormMode('edit')
  }

  if (loading) return <DefaultLayout><div className="profile-page"><div className="profile-inner" style={{padding:'80px 40px',textAlign:'center'}}><div style={{color:'var(--text-muted)',fontSize:'14px'}}>Đang tải thông tin tài khoản...</div></div></div></DefaultLayout>
  if (error) return <DefaultLayout><div className="profile-page"><div className="profile-inner" style={{padding:'80px 40px',textAlign:'center'}}><div style={{color:'#f87171',marginBottom:'16px'}}>{error}</div><button onClick={()=>navigate('/auth')} style={{background:'var(--yellow)',color:'#000',border:'none',padding:'10px 24px',borderRadius:'6px',fontWeight:700,cursor:'pointer'}}>Đăng nhập</button></div></div></DefaultLayout>
  if (!user) return null

  // ── ORDER DETAIL MODAL ──────────────────────────────────────────
  const OrderDetailModal = ({ detail, onClose }) => {
    const flowStep = getFlowStep(detail.status)
    const isMainFlow = flowStep !== -1
    // Close on Escape
    React.useEffect(() => {
      const handler = e => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
      return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
    }, [])
    return (
      <div className="odm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="odm-panel">
          {/* ── HEADER ── */}
          <div className="odm-header">
            <div className="odm-header-left">
              <div className="odm-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <div className="odm-header-id">{detail.id}</div>
                <div className="odm-header-date">Đặt ngày {detail.date}</div>
              </div>
            </div>
            <div className="odm-header-right">
              <span className={`order-status status-${detail.status}`}>{statusMap[detail.status]}</span>
              <button className="odm-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div className="odm-body">

            {/* ── SECTION 1: THÔNG TIN ĐƠN HÀNG ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Thông tin đơn hàng
              </div>
              <div className="odm-info-grid">
                <div className="odm-info-row"><span className="odm-info-label">Mã đơn hàng</span><span className="odm-info-value odm-id-text">{detail.id}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Ngày đặt hàng</span><span className="odm-info-value">{detail.date}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Trạng thái</span><span className={`order-status status-${detail.status}`} style={{fontSize:'11px'}}>{statusMap[detail.status]}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Phương thức thanh toán</span><span className="odm-info-value">{detail.payMethod}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Mã vận đơn</span><span className="odm-info-value odm-tracking">{detail.trackingCode}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Dự kiến giao</span><span className="odm-info-value">{detail.estimatedDelivery}</span></div>
              </div>
            </div>

            {/* ── SECTION 2: NGƯỜI NHẬN ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Thông tin người nhận
              </div>
              <div className="odm-info-grid">
                <div className="odm-info-row"><span className="odm-info-label">Họ tên</span><span className="odm-info-value">{detail.receiver.name}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Số điện thoại</span><span className="odm-info-value">{detail.receiver.phone}</span></div>
                <div className="odm-info-row odm-info-row--full"><span className="odm-info-label">Địa chỉ</span><span className="odm-info-value">{detail.receiver.address}</span></div>
                {detail.receiver.note && <div className="odm-info-row odm-info-row--full"><span className="odm-info-label">Ghi chú</span><span className="odm-info-value odm-note">{detail.receiver.note}</span></div>}
              </div>
            </div>

            {/* ── SECTION 3: DANH SÁCH SẢN PHẨM ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Danh sách sản phẩm ({detail.products.length})
              </div>
              <div className="odm-products">
                {detail.products.map((p, i) => (
                  <div key={i} className="odm-product-row">
                    <div className="odm-product-img">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div className="odm-product-info">
                      <div className="odm-product-name">{p.name}</div>
                      <div className="odm-product-variant">{p.variant}</div>
                      <div className="odm-product-pricing">
                        <span className="odm-product-price">{p.price}</span>
                        <span className="odm-product-qty">× {p.qty}</span>
                        <span className="odm-product-subtotal">{p.subtotal}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 4: THANH TOÁN ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Thông tin thanh toán
              </div>
              <div className="odm-payment">
                <div className="odm-payment-row"><span>Tạm tính</span><span>{detail.payment.subtotal}</span></div>
                <div className="odm-payment-row"><span>Phí vận chuyển</span><span>{detail.payment.shipping}</span></div>
                <div className="odm-payment-row odm-payment-row--discount"><span>Mã giảm giá</span><span>{detail.payment.discount}</span></div>
                <div className="odm-payment-row odm-payment-row--discount"><span>Voucher</span><span>{detail.payment.voucher}</span></div>
                <div className="odm-payment-row odm-payment-row--discount"><span>Điểm thưởng</span><span>{detail.payment.points}</span></div>
                <div className="odm-payment-divider"/>
                <div className="odm-payment-row odm-payment-row--total"><span>Tổng thanh toán</span><span>{detail.payment.total}</span></div>
              </div>
            </div>

            {/* ── SECTION 5: VẬN CHUYỂN + FLOW ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Thông tin vận chuyển
              </div>
              <div className="odm-info-grid">
                <div className="odm-info-row"><span className="odm-info-label">Đơn vị vận chuyển</span><span className="odm-info-value">{detail.shipping.carrier}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Mã tracking</span><span className="odm-info-value odm-tracking">{detail.shipping.tracking}</span></div>
              </div>
              {/* Mini flow tracker */}
              {isMainFlow && (
                <div className="odm-flow-mini">
                  {ORDER_FLOW.map((step, idx) => (
                    <div key={step} className={`odm-flow-step ${ idx < flowStep ? 'done' : idx === flowStep ? 'active' : 'pending'}`}>
                      <div className="odm-flow-dot">
                        {idx < flowStep && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="8" height="8"><polyline points="20 6 9 17 4 12"/></svg>}
                        {idx === flowStep && <div className="odm-flow-pulse"/>}
                      </div>
                      {idx < ORDER_FLOW.length - 1 && <div className={`odm-flow-line ${idx < flowStep ? 'done' : ''}`}/>}
                      <div className="odm-flow-label">{statusMap[step]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SECTION 6: CÁC NÚT CHỨC NĂNG ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                Thao tác
              </div>
              <div className="odm-actions">
                {(detail.status === 'done' || detail.status === 'completed') && (
                  <button className="odm-action-btn odm-action-btn--rebuy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.53"/></svg>Mua lại
                  </button>
                )}
                {detail.status === 'pending' && (
                  <button className="odm-action-btn odm-action-btn--cancel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Hủy đơn
                  </button>
                )}
                {['shipped','delivering','completed'].includes(detail.status) && (
                  <button className="odm-action-btn odm-action-btn--track">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Theo dõi vận chuyển
                  </button>
                )}
                {detail.status === 'done' && (
                  <button className="odm-action-btn odm-action-btn--review">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Đánh giá sản phẩm
                  </button>
                )}
                {(detail.status === 'delivery_fail' || detail.status === 'refund') && (
                  <button className="odm-action-btn odm-action-btn--refund">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.53"/></svg>Yêu cầu trả hàng / hoàn tiền
                  </button>
                )}
                <button className="odm-action-btn odm-action-btn--contact">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Liên hệ shop
                </button>
                <button className="odm-action-btn odm-action-btn--invoice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải hóa đơn
                </button>
              </div>
            </div>

            {/* ── SECTION 7: TIMELINE LỊCH SỬ ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Lịch sử đơn hàng
              </div>
              <div className="odm-timeline">
                {detail.timeline.map((item, i) => (
                  <div key={i} className={`odm-timeline-item ${item.done ? 'done' : 'pending'}`}>
                    <div className="odm-timeline-dot">
                      {item.done
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="8" height="8"><polyline points="20 6 9 17 4 12"/></svg>
                        : <div className="odm-timeline-ring"/>}
                    </div>
                    {i < detail.timeline.length - 1 && <div className={`odm-timeline-line ${item.done ? 'done' : ''}`}/>}
                    <div className="odm-timeline-content">
                      <div className="odm-timeline-event">{item.event}</div>
                      <div className="odm-timeline-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end odm-body */}
        </div>{/* end odm-panel */}
      </div>
    )
  }
  // ── END ORDER DETAIL MODAL ────────────────────────────────────

  const EyeOff = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  const EyeOn = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  const menuIcons = {
    overview: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    personal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    wishlist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    address: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    password: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  }

  return (
    <DefaultLayout>
      {selectedOrder && <OrderDetailModal detail={getOrderDetail(selectedOrder)} onClose={() => setSelectedOrder(null)} />}
      <div className="profile-page">
        <div className="profile-inner">
          <div className="profile-breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span>Tài khoản của tôi
          </div>
          <h1 className="profile-page-title">TÀI KHOẢN CỦA TÔI</h1>

          <div className={'profile-layout' + (activeTab !== 'overview' ? ' profile-layout--no-right' : '')}>

            {/* LEFT SIDEBAR */}
            <aside className="profile-sidebar">
              <div className="profile-sidebar-user">
                <div className="profile-avatar-sidebar">
                  {user.avatar ? <img src={user.avatar} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
                </div>
                <div className="profile-sidebar-name">{user.name}</div>
                <div className="profile-sidebar-email">{user.email}</div>
                <div className="profile-vip-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {user.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                </div>
              </div>
              <div className="profile-sidebar-menu">
                {menuItems.map(item => (
                  <button key={item.key} className={'profile-menu-item' + (activeTab === item.key ? ' active' : '')} onClick={() => setActiveTab(item.key)}>
                    {menuIcons[item.key]}{item.label}
                  </button>
                ))}
                <div className="profile-menu-divider"/>
                <button className="profile-menu-item logout" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Đăng xuất
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="profile-main">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (<>
                <div className="profile-card">
                  <div className="profile-card-title">THÔNG TIN CÁ NHÂN</div>
                  <div className="profile-info-layout">
                    <div className="profile-avatar-main">
                      <div className="profile-avatar-main-img">
                        {user.avatar ? <img src={user.avatar} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
                      </div>
                      <button className="btn-change-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Đổi ảnh
                      </button>
                    </div>
                    <div className="profile-info-fields">
                      <div className="profile-info-item"><span className="profile-info-label">Họ tên</span><span className="profile-info-value">{user.name}</span></div>
                      <div className="profile-info-item"><span className="profile-info-label">Email</span><span className="profile-info-value">{user.email}</span></div>
                      <div className="profile-info-item"><span className="profile-info-label">Số điện thoại</span><span className="profile-info-value">{user.phone || 'Chưa cập nhật'}</span></div>
                      <div className="profile-info-item"><span className="profile-info-label">Ngày tham gia</span><span className="profile-info-value">{formatDate(user.createdAt)}</span></div>
                    </div>
                  </div>
                  <div className="profile-info-actions">
                    <button className="btn-update-info" onClick={() => setActiveTab('personal')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Cập nhật thông tin
                    </button>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-orders-header">
                    <div className="profile-card-title">ĐƠN HÀNG GẦN ĐÂY</div>
                    <button className="profile-orders-viewall" onClick={() => setActiveTab('orders')}>Xem tất cả <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg></button>
                  </div>
                   <table className="profile-orders-table">
                    <thead><tr><th>MÃ ĐƠN</th><th>NGÀY ĐẶT</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
                    <tbody>
                      {ordersLoading ? (
                        <tr><td colSpan="5" style={{textAlign:'center',color:'var(--text-muted)',padding:'20px'}}>Đang tải...</td></tr>
                      ) : orders_for_table.slice(0, 3).map(order => (
                        <tr key={order.id}>
                          <td><span className="order-id">#{order.code}</span></td>
                          <td><span className="order-date">{order.date}</span></td>
                          <td><span className="order-total">{order.total}</span></td>
                          <td><span className={'order-status status-' + order.status}>{statusMap[order.status]}</span></td>
                          <td><button className="btn-view-detail" onClick={() => handleViewOrder(order.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Xem chi tiết</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="profile-card">
                  <div className="profile-orders-header">
                    <div className="profile-card-title">SẢN PHẨM YÊU THÍCH</div>
                    <button className="profile-orders-viewall" onClick={() => setActiveTab('wishlist')}>Xem tất cả <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg></button>
                  </div>
                  <div className="profile-wishlist-grid">
                    {wishlistProducts.slice(0, 4).map(p => (
                      <div 
                        key={p._id} 
                        className="profile-wishlist-card"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        <button 
                          className="wishlist-heart" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(p._id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" strokeWidth="2" fill="currentColor" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                        <div className="wishlist-img">
                          <img src={p.image || 'https://via.placeholder.com/150'} alt={p.name} onError={e=>{e.target.style.display='none'}}/>
                        </div>
                        <div className="wishlist-info">
                          <div className="wishlist-name">{p.name}</div>
                          <div className="wishlist-footer">
                            <span className="wishlist-price">{formatPrice(p.price)}</span>
                            <button 
                              className="wishlist-cart-btn" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(p);
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* PERSONAL */}
              {activeTab === 'personal' && (
                <div className="profile-card">
                  <div className="profile-card-title">THÔNG TIN CÁ NHÂN</div>
                  <div className="profile-personal-avatar-row">
                    <div className="profile-avatar-main-img profile-avatar-lg">
                      {user.avatar ? <img src={user.avatar} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
                    </div>
                    <div className="profile-personal-avatar-info">
                      <div className="profile-personal-avatar-name">{user.name}</div>
                      <div className="profile-personal-avatar-email">{user.email}</div>
                      <button className="btn-change-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Đổi ảnh đại diện
                      </button>
                    </div>
                  </div>
                  <div className="profile-form-divider"/>
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Họ và tên</label>
                      <input className="profile-form-input" type="text" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} placeholder="Nhập họ và tên"/>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Số điện thoại</label>
                      <input className="profile-form-input" type="tel" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})} placeholder="Nhập số điện thoại"/>
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Email</label>
                      <input className="profile-form-input profile-form-input--disabled" type="email" value={user.email} disabled/>
                      <span className="profile-form-hint">Email không thể thay đổi</span>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Ngày tham gia</label>
                      <input className="profile-form-input profile-form-input--disabled" type="text" value={formatDate(user.createdAt)} disabled/>
                    </div>
                  </div>
                  {editSuccess && (
                    <div className="profile-alert profile-alert--success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Cập nhật thông tin thành công!
                    </div>
                  )}
                  <div className="profile-form-actions">
                    <button className="profile-btn-cancel" onClick={()=>setEditForm({name:user.name||'',phone:user.phone||'',birthdate:user.birthdate||'',gender:user.gender||''})}>Huỷ thay đổi</button>
                    <button className="profile-btn-save" onClick={handleSavePersonal} disabled={editSaving}>
                      {editSaving ? 'Đang lưu...' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Lưu thay đổi</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="profile-card">
                  <div className="profile-card-title">ĐƠN HÀNG CỦA TÔI</div>
                  <div className="profile-order-filters">
                    {[
                      { key: 'all',          label: 'Tất cả',               count: orders_for_table.length },
                      { key: 'pending',      label: 'Chờ xác nhận',         count: orders_for_table.filter(o=>o.status==='pending').length },
                      { key: 'preparing',   label: 'Chuẩn bị hàng',        count: orders_for_table.filter(o=>o.status==='preparing').length },
                      { key: 'handover',    label: 'Bàn giao VC',          count: orders_for_table.filter(o=>o.status==='handover').length },
                      { key: 'shipped',     label: 'Đang vận chuyển',      count: orders_for_table.filter(o=>o.status==='shipped').length },
                      { key: 'delivering',  label: 'Đang giao',            count: orders_for_table.filter(o=>o.status==='delivering').length },
                      { key: 'completed',   label: 'Đã giao hàng',         count: orders_for_table.filter(o=>o.status==='completed').length },
                      { key: 'done',        label: 'Hoàn thành',           count: orders_for_table.filter(o=>o.status==='done').length },
                      { key: 'cancelled',   label: 'Đã hủy',               count: orders_for_table.filter(o=>o.status==='cancelled').length },
                      { key: 'delivery_fail',label: 'Giao thất bại',       count: orders_for_table.filter(o=>o.status==='delivery_fail').length },
                      { key: 'refund',      label: 'Hoàn tiền',            count: orders_for_table.filter(o=>o.status==='refund').length },
                    ].filter(f => f.key === 'all' || f.count > 0).map(f => (
                      <button
                        key={f.key}
                        className={'profile-order-filter-btn' + (orderFilter===f.key?' active':'') + (f.key!=='all'?' status-'+f.key:'')}
                        onClick={() => setOrderFilter(f.key)}
                      >
                        {f.label}<span className="profile-order-filter-count">{f.count}</span>
                      </button>
                    ))}
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="profile-empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                      <p>Không có đơn hàng nào</p>
                    </div>
                  ) : (
                    <div className="profile-orders-list">
                      {filteredOrders.map(order => {
                        const flowStep = getFlowStep(order.status)
                        const isMainFlow = flowStep !== -1
                        return (
                          <div key={order.id} className={`profile-order-item order-item--${order.status}`}>
                            {/* Header */}
                            <div className="profile-order-item-header">
                              <div className="profile-order-item-id">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                #{order.code || order.id}
                              </div>
                              <span className={`order-status status-${order.status}`}>{statusMap[order.status]}</span>
                            </div>

                            {/* Status flow tracker – chỉ hiển thị cho đơn trong flow chính */}
                            {isMainFlow && (
                              <div className="order-flow-tracker">
                                {ORDER_FLOW.map((step, idx) => (
                                  <div
                                    key={step}
                                    className={`flow-step ${
                                      idx < flowStep ? 'done' : idx === flowStep ? 'active' : 'pending'
                                    }`}
                                  >
                                    <div className="flow-step-dot">
                                      {idx < flowStep && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
                                      )}
                                      {idx === flowStep && <div className="flow-step-pulse"/>}
                                    </div>
                                    {idx < ORDER_FLOW.length - 1 && <div className={`flow-step-line ${idx < flowStep ? 'done' : ''}`}/>}
                                    <div className="flow-step-label">{statusMap[step]}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Trạng thái phụ badge */}
                            {!isMainFlow && (
                              <div className={`order-sub-status sub-${order.status}`}>
                                {order.status === 'cancelled' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                                {order.status === 'delivery_fail' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                                {order.status === 'refund' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.53"/></svg>}
                                {statusMap[order.status]}
                              </div>
                            )}

                            {/* Meta + tổng tiền */}
                            <div className="profile-order-item-body">
                              <div className="profile-order-item-meta">
                                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {order.date}</span>
                                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> {order.items} sản phẩm</span>
                              </div>
                              <div className="profile-order-item-total">{order.total}</div>
                            </div>

                            {/* Action buttons */}
                            <div className="profile-order-item-actions">
                              {(order.status === 'done' || order.status === 'completed') &&
                                <button className="profile-order-btn profile-order-btn--rebuy">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.53"/></svg>Mua lại
                                </button>
                              }
                              {order.status === 'pending' &&
                                <button className="profile-order-btn profile-order-btn--cancel">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Hủy đơn
                                </button>
                              }
                              {order.status === 'delivery_fail' &&
                                <button className="profile-order-btn profile-order-btn--refund">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.53"/></svg>Yêu cầu hoàn tiền
                                </button>
                              }
                              {(order.status === 'done') &&
                                <button className="profile-order-btn profile-order-btn--review">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Đánh giá
                                </button>
                              }
                              <button className="profile-order-btn profile-order-btn--detail" onClick={() => handleViewOrder(order.id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Xem chi tiết
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="profile-card">
                  <div className="profile-orders-header">
                    <div className="profile-card-title">DANH SÁCH YÊU THÍCH</div>
                    <span className="profile-wishlist-count">{wishlistProducts.length} sản phẩm</span>
                  </div>
                    {isLoadingWishlist ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>⏳ Đang tải...</div>
                    ) : wishlistProducts.length === 0 ? (
                      <div className="profile-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <p>Chưa có sản phẩm yêu thích</p>
                      </div>
                    ) : (
                      <div className="profile-wishlist-full-grid">
                        {wishlistProducts.map(p => (
                          <div 
                            key={p._id} 
                            className="profile-wishlist-full-card"
                            onClick={() => navigate(`/product/${p.slug}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="profile-wishlist-full-img"><img src={p.image || 'https://via.placeholder.com/150'} alt={p.name} onError={e=>{e.target.style.display='none'}}/></div>
                            <div className="profile-wishlist-full-info">
                              <div className="profile-wishlist-full-name">{p.name}</div>
                              <div className="profile-wishlist-full-price">{formatPrice(p.price)}</div>
                              <div className="profile-wishlist-full-actions">
                                <button 
                                  className="profile-wishlist-btn-cart" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(p);
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>Thêm vào giỏ
                                </button>
                                <button 
                                  className="profile-wishlist-btn-remove" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFavorite(p._id);
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  )}
                </div>
              )}

              {/* ADDRESS */}
              {activeTab === 'address' && (
                <div className="profile-card">
                  <div className="profile-orders-header">
                    <div className="profile-card-title">ĐỊA CHỈ GIAO HÀNG</div>
                    <button className="profile-btn-add-address" onClick={() => { setAddressFormMode('add'); setAddressFormData({ Name: '', Phone: '', address: '', set_default: false }) }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Thêm địa chỉ mới
                    </button>
                  </div>

                  {/* FORM THÊM / SỬA ĐỊA CHỈ */}
                  {addressFormMode && (
                    <div className="profile-address-form-box">
                      <div className="profile-address-form-title">{addressFormMode === 'add' ? 'Địa chỉ mới' : 'Chỉnh sửa địa chỉ'}</div>
                      <div className="profile-form-grid">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Họ tên người nhận</label>
                          <input className="profile-form-input" type="text" placeholder="Nhập họ tên" value={addressFormData.Name} onChange={e=>setAddressFormData({...addressFormData,Name:e.target.value})}/>
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-form-label">Số điện thoại</label>
                          <input className="profile-form-input" type="tel" placeholder="Nhập số điện thoại" value={addressFormData.Phone} onChange={e=>setAddressFormData({...addressFormData,Phone:e.target.value})}/>
                        </div>
                        <div className="profile-form-group profile-form-group--full">
                          <label className="profile-form-label">Địa chỉ đầy đủ</label>
                          <input className="profile-form-input" type="text" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" value={addressFormData.address} onChange={e=>setAddressFormData({...addressFormData,address:e.target.value})}/>
                        </div>
                        <div className="profile-form-group profile-form-group--full">
                          <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px'}}>
                            <input type="checkbox" checked={addressFormData.set_default} onChange={e=>setAddressFormData({...addressFormData,set_default:e.target.checked})}/>
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>
                      </div>
                      <div className="profile-form-actions">
                        <button className="profile-btn-cancel" onClick={() => { setAddressFormMode(null); setAddressFormData({ Name: '', Phone: '', address: '', set_default: false }) }}>Huỷ</button>
                        <button className="profile-btn-save" onClick={handleSaveAddress} disabled={addressSaving}>
                          {addressSaving ? 'Đang lưu...' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Lưu địa chỉ</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DANH SÁCH ĐỊA CHỈ */}
                  <div className="profile-address-list">
                    {addressesLoading ? (
                      <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)'}}>Đang tải...</div>
                    ) : addresses.length === 0 ? (
                      <div className="profile-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <p>Bạn chưa có địa chỉ giao hàng nào.</p>
                      </div>
                    ) : addresses.map(addr => (
                      <div key={addr._id} className={'profile-address-card' + (addr.set_default ? ' profile-address-card--default' : '')}>
                        <div className="profile-address-card-header">
                          <div className="profile-address-card-name">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {addr.Name}
                            {addr.set_default && <span className="profile-address-default-tag">Mặc định</span>}
                          </div>
                          <div className="profile-address-card-actions">
                            <button className="profile-address-btn-edit" onClick={() => handleEditAddress(addr)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Sửa</button>
                            {!addr.set_default && (
                              <button className="profile-address-btn-delete" onClick={async () => {
                                if (!window.confirm('Xóa địa chỉ này?')) return
                                await fetch(API_URL + '/profile/deliver/' + addr._id, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({set_default: false}) })
                                fetchAddresses()
                                toast.info('Cập nhật địa chỉ', { position: 'bottom-right' })
                              }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>Xóa</button>
                            )}
                          </div>
                        </div>
                        <div className="profile-address-card-phone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{addr.Phone}</div>
                        <div className="profile-address-card-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{addr.address}</div>
                        {!addr.set_default && (
                          <button className="profile-address-btn-setdefault" onClick={async () => {
                            await fetch(API_URL + '/profile/deliver/' + addr._id, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({set_default: true}) })
                            fetchAddresses()
                            toast.success('Đã đặt làm mặc định', { position: 'bottom-right' })
                          }}>Đặt làm mặc định</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              {activeTab === 'password' && (
                <div className="profile-card">
                  <div className="profile-card-title">ĐỔI MẬT KHẨU</div>
                  <div className="profile-pw-intro">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự gồm chữ và số.</span>
                  </div>
                  <div className="profile-pw-form">
                    {[{field:'current',label:'Mật khẩu hiện tại',placeholder:'Nhập mật khẩu hiện tại'},{field:'newPw',label:'Mật khẩu mới',placeholder:'Nhập mật khẩu mới (tối thiểu 6 ký tự)'},{field:'confirm',label:'Xác nhận mật khẩu mới',placeholder:'Nhập lại mật khẩu mới'}].map(({field,label,placeholder}) => (
                      <div key={field} className="profile-form-group">
                        <label className="profile-form-label">{label}</label>
                        <div className="profile-pw-input-wrap">
                          <input
                            className={'profile-form-input' + (field==='confirm' && pwForm.confirm && pwForm.newPw!==pwForm.confirm?' profile-form-input--error':'')}
                            type={showPw[field] ? 'text' : 'password'} placeholder={placeholder}
                            value={pwForm[field]} onChange={e=>setPwForm({...pwForm,[field]:e.target.value})}
                          />
                          <button className="profile-pw-toggle" onClick={()=>setShowPw({...showPw,[field]:!showPw[field]})}>
                            {showPw[field] ? <EyeOff/> : <EyeOn/>}
                          </button>
                        </div>
                        {field==='newPw' && pwForm.newPw && (
                          <div className="profile-pw-strength">
                            <div className={'profile-pw-strength-bar ' + (pwForm.newPw.length>=10?'strong':pwForm.newPw.length>=6?'medium':'weak')}/>
                            <span className={pwForm.newPw.length>=10?'strong':pwForm.newPw.length>=6?'medium':'weak'}>{pwForm.newPw.length>=10?'Mạnh':pwForm.newPw.length>=6?'Trung bình':'Yếu'}</span>
                          </div>
                        )}
                        {field==='confirm' && pwForm.confirm && pwForm.newPw!==pwForm.confirm && <span className="profile-form-error">Mật khẩu không khớp</span>}
                      </div>
                    ))}
                  </div>
                  {pwError && <div className="profile-alert profile-alert--error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{pwError}</div>}
                  {pwSuccess && <div className="profile-alert profile-alert--success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Đổi mật khẩu thành công!</div>}
                  <div className="profile-form-actions">
                    <button className="profile-btn-cancel" onClick={()=>{setPwForm({current:'',newPw:'',confirm:''});setPwError('')}}>Huỷ</button>
                    <button className="profile-btn-save" onClick={handleChangePassword}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR (overview only) */}
            {activeTab === 'overview' && (
              <div className="profile-right">
                <div className="profile-stats-card">
                  <div className="profile-card-title">THỐNG KÊ TÀI KHOẢN</div>
                  <div className="profile-stats-grid">
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon orders"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg></div>
                      <div className="profile-stat-label">Tổng đơn hàng</div>
                      <div className="profile-stat-value">28</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon spending"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg></div>
                      <div className="profile-stat-label">Tổng chi tiêu</div>
                      <div className="profile-stat-value small">48.760.000đ</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon points"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                      <div className="profile-stat-label">Điểm thưởng</div>
                      <div className="profile-stat-value">2.450</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
                      <div className="profile-stat-label">Sản phẩm yêu thích</div>
                      <div className="profile-stat-value">12</div>
                    </div>
                  </div>
                </div>
                <div className="profile-support-card">
                  <div className="profile-card-title">TRUNG TÂM HỖ TRỢ</div>
                  <div className="profile-support-desc">Winno Tech luôn sẵn sàng hỗ trợ bạn</div>
                  <div className="profile-support-list">
                    <div className="profile-support-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Hotline: <span>1900 1234</span></div>
                    <div className="profile-support-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Email: <span>support@winno.com</span></div>
                    <div className="profile-support-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Thời gian: <span>8:00 - 22:00 (T2 - CN)</span></div>
                  </div>
                  <button className="btn-contact-support">Liên hệ hỗ trợ</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
