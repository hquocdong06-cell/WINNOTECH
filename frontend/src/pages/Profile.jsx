import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/profile.css'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import { userVoucherAPI } from '../services/apiService'
import { RotateCcw, AlertTriangle, CheckCircle2, Image as ImageIcon, X, RefreshCw, Upload, DollarSign } from 'lucide-react'

const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + 'đ'
}

import { API_BASE as API_URL } from '../services/apiService';

const RETURN_REASONS = [
  { key: 'damaged', label: 'Sản phẩm bị hư hỏng / bể vỡ khi nhận' },
  { key: 'defective', label: 'Sản phẩm lỗi kỹ thuật / không hoạt động' },
  { key: 'wrong_item', label: 'Giao sai sản phẩm / sai mẫu mã, màu sắc' },
  { key: 'not_as_described', label: 'Sản phẩm không đúng với mô tả / hình ảnh' },
  { key: 'missing_parts', label: 'Thiếu linh kiện, phụ kiện hoặc quà tặng kèm' },
  { key: 'other', label: 'Lý do khác' }
];

const RETURN_STATUS_CONFIG = {
  none: null,
  return_requested: {
    label: 'Chờ duyệt trả hàng',
    desc: 'Shop đang xử lý yêu cầu đổi trả của bạn',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  return_approved: {
    label: 'Đã chấp thuận trả hàng',
    desc: 'Shop đã duyệt, vui lòng gửi hàng theo hướng dẫn',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  return_rejected: {
    label: 'Bị từ chối trả hàng',
    desc: 'Yêu cầu trả hàng không được chấp thuận',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  returning: {
    label: 'Đang gửi trả hàng',
    desc: 'Hàng đang trên đường gửi về kho shop',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  returned_success: {
    label: 'Đã nhận hàng trả & hoàn tất',
    desc: 'Shop đã nhận lại hàng và kiểm tra hoàn tất',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  }
};

const isOrderEligibleForReturn = (order) => {
  if (!order) return false;
  const status = order.status;
  const isDelivered = ['delivered', 'completed', 'done'].includes(status);
  if (!isDelivered) return false;

  // Nếu đã có yêu cầu đổi trả thì không tạo mới
  if (order.return_request && order.return_request.status && order.return_request.status !== 'none') {
    return false;
  }

  // Kiểm tra thời hạn 7 ngày
  const baseDateStr = order.rawOrder?.delivered_at || order.rawOrder?.updatedAt || order.rawOrder?.createdAt || order.createdAt;
  if (!baseDateStr) return true;
  const daysDiff = (Date.now() - new Date(baseDateStr).getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7;
};

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all')
  const [orderSearchCode, setOrderSearchCode] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', province: '', district: '', detail: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // ── States cho Quên mật khẩu qua OTP ──
  const [isOtpMode, setIsOtpMode] = useState(false)
  const [otpForm, setOtpForm] = useState({ otp: '', newPw: '', confirm: '' })
  const [showOtpPw, setShowOtpPw] = useState({ newPw: false, confirm: false })
  const [sendingOtp, setSendingOtp] = useState(false)
  const [resettingPw, setResettingPw] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [otpCountdown])

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

  // ── Voucher cá nhân ──
  const [myVouchers, setMyVouchers] = useState([])
  const [vouchersLoading, setVouchersLoading] = useState(false)

  // ── Review modal ──
  const [reviewModal, setReviewModal] = useState(null) // { orderId, items: [] }
  const [reviewForm, setReviewForm] = useState({})    // { [orderItemId]: { star: 5, content: '' } }
  const [expandedReviewItems, setExpandedReviewItems] = useState({}) // { [orderItemId]: boolean }
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // ── Cancel confirm modal ──
  const [cancelModal, setCancelModal] = useState(null) // { orderId, orderCode, isPaid }
  const [cancelReason, setCancelReason] = useState('')
  const [cancelBankName, setCancelBankName] = useState('')
  const [cancelAccountNumber, setCancelAccountNumber] = useState('')
  const [cancelAccountHolder, setCancelAccountHolder] = useState('')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  // ── Return request modal ──
  const [returnRequestModal, setReturnRequestModal] = useState(null) // { orderId, orderCode, total }
  const [returnReason, setReturnReason] = useState('damaged')
  const [returnDescription, setReturnDescription] = useState('')
  const [returnImages, setReturnImages] = useState([])
  const [returnImagePreviews, setReturnImagePreviews] = useState([])
  const [returnBankName, setReturnBankName] = useState('')
  const [returnAccountNumber, setReturnAccountNumber] = useState('')
  const [returnAccountHolder, setReturnAccountHolder] = useState('')
  const [returnSubmitting, setReturnSubmitting] = useState(false)

  const handleReturnImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length + returnImages.length > 5) {
      toast.error('Chỉ được đính kèm tối đa 5 hình ảnh bằng chứng', { position: 'bottom-right' })
      return
    }
    const validFiles = []
    const validPreviews = []
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        toast.error(`Tệp "${f.name}" không phải hình ảnh hợp lệ`, { position: 'bottom-right' })
        continue
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`Ảnh "${f.name}" vượt quá dung lượng 5MB`, { position: 'bottom-right' })
        continue
      }
      validFiles.push(f)
      validPreviews.push(URL.createObjectURL(f))
    }
    setReturnImages(prev => [...prev, ...validFiles])
    setReturnImagePreviews(prev => [...prev, ...validPreviews])
  }

  const handleRemoveReturnImage = (index) => {
    if (returnImagePreviews[index]) URL.revokeObjectURL(returnImagePreviews[index])
    setReturnImages(prev => prev.filter((_, i) => i !== index))
    setReturnImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const closeReturnRequestModal = () => {
    returnImagePreviews.forEach(u => URL.revokeObjectURL(u))
    setReturnRequestModal(null)
    setReturnReason('damaged')
    setReturnDescription('')
    setReturnImages([])
    setReturnImagePreviews([])
    setReturnBankName('')
    setReturnAccountNumber('')
    setReturnAccountHolder('')
  }

  const handleReturnSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!returnDescription.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết lý do và tình trạng sản phẩm', { position: 'bottom-right' })
      return
    }
    if (!returnBankName.trim() || !returnAccountNumber.trim() || !returnAccountHolder.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn', { position: 'bottom-right' })
      return
    }
    if (returnImages.length === 0) {
      toast.error('Vui lòng đính kèm ít nhất 1 hình ảnh bằng chứng sản phẩm', { position: 'bottom-right' })
      return
    }

    setReturnSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('reason', returnReason)
      formData.append('description', returnDescription)
      formData.append('bank_name', returnBankName)
      formData.append('account_number', returnAccountNumber)
      formData.append('account_holder', returnAccountHolder)
      returnImages.forEach(img => formData.append('images', img))

      const res = await fetch(`${API_URL}/orders/${returnRequestModal.orderId}/return-request`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Gửi yêu cầu trả hàng thành công! Shop sẽ kiểm tra trong 24h.', { position: 'bottom-right' })
        closeReturnRequestModal()
        fetchOrders()
      } else {
        toast.error(data.message || 'Không thể gửi yêu cầu trả hàng', { position: 'bottom-right' })
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi gửi yêu cầu trả hàng', { position: 'bottom-right' })
    } finally {
      setReturnSubmitting(false)
    }
  }

  // ── Thống kê tài khoản ──
  const [stats, setStats] = useState({ totalOrders: 0, totalSpending: 0, totalFavorites: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URL + '/profile', { credentials: 'include' })
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
          setEditForm({ name: data.user.name || '', phone: data.user.phone || '', email: data.user.email || '' })
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

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    if (avatar.startsWith('/image/avatar_user/')) return `${API_URL}${avatar}`;
    if (avatar.startsWith('/')) return `${API_URL}${avatar}`;
    return `${API_URL}/image/avatar_user/${avatar}`;
  }

  const avatarInputRef = React.useRef(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (jpg, png, webp...)', { position: 'bottom-right' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 5MB', { position: 'bottom-right' })
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    setAvatarUploading(true)
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(prev => ({ ...prev, ...data.user }))
        toast.success('Đã cập nhật ảnh đại diện thành công!', { position: 'bottom-right' })
      } else {
        toast.error(data.message || 'Cập nhật ảnh đại diện thất bại', { position: 'bottom-right' })
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh đại diện lên server', { position: 'bottom-right' })
    } finally {
      setAvatarUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  // ── Fetch stats ──
  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch(API_URL + '/profile/stats', { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Lỗi tải thống kê:', err)
    } finally {
      setStatsLoading(false)
    }
  }

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

  const handleOpenReview = (targetOrder) => {
    if (!targetOrder) return
    const orderId = targetOrder.id || targetOrder._id
    const fullOrder = orders.find(o => o._id === orderId || o.code === orderId || o._id === targetOrder.rawOrder?._id) || targetOrder.rawOrder || targetOrder
    const rawItems = fullOrder?.items || targetOrder.products || targetOrder.rawOrder?.items || []

    const items = rawItems.map((oi, idx) => {
      const pName = oi.product?.name || oi.variants_id?.p_id?.name || oi.variant?.variant_name || oi.name || 'Sản phẩm'
      const vName = oi.variant?.variant_name && oi.variant?.variant_name !== 'Mặc định' ? ` (${oi.variant.variant_name})` : ''
      return {
        orderItemId: oi._id || `item_${idx}`,
        name: pName + vName
      }
    })

    setReviewModal({ orderId, items })
    setExpandedReviewItems({})
    const initForm = {}
    items.forEach(it => {
      initForm[it.orderItemId] = { star: 5, content: '' }
    })
    setReviewForm(initForm)
  }

  const getOrderDetail = (order) => {
    if (!order) return null
    const items = order.items || []
    return {
      id: order.code || order._id,
      _id: order._id,           // MongoDB ObjectId thật — dùng cho PDF URL
      isReviewed: !!order.isReviewed,
      date: formatDate(order.createdAt),
      status: order.status,
      payMethod: (order.payment_method && typeof order.payment_method === 'object') ? order.payment_method.name : (order.payment_method || 'COD'),
      trackingCode: order.tracking_code || '—',
      estimatedDelivery: '—',
      receiver: { name: order.Name || '—', phone: order.Phone || '—', address: order.Adress || '—', note: '' },
      products: items.map(oi => {
        const rawImg = oi.AnhSP?.[0]?.url || oi.product?.thumnail || oi.product?.AnhSP?.[0]?.url || ''
        const img = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : ''
        return {
          name: oi.product?.name || oi.variant?.variant_name || 'Sản phẩm',
          variant: oi.variant?.variant_name && oi.variant?.variant_name !== 'Mặc định' ? oi.variant?.variant_name : '',
          price: formatPrice(oi.price),
          qty: oi.Quantity || 1,
          subtotal: formatPrice((oi.price || 0) * (oi.Quantity || 1)),
          img
        }
      }),
      payment: {
        subtotal: formatPrice(order.total_amount + (order.voucher_value || 0)),
        shipping: '0đ',
        discount: '—',
        voucher: order.voucher_value ? '-' + formatPrice(order.voucher_value) : '-0đ',
        total: formatPrice(order.total_amount)
      },
      payment_status: order.payment_status || 'unpaid',
      shipping: { carrier: '—', tracking: order.tracking_code || '—' },
      timeline: (order.statusHistory && order.statusHistory.length > 0)
        ? order.statusHistory.map(h => ({
            time: formatDate(h.changed_at),
            event: h.note || `Trạng thái: ${h.status}`,
            done: true
          }))
        : [{ time: formatDate(order.createdAt), event: 'Đặt hàng thành công', done: true }],
      return_request: order.return_request,
      refund_info: order.refund_info,
      cancel_reason: order.cancel_reason,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      delivered_at: order.delivered_at,
      rawOrder: order
    }
  }

  const orders_for_table = orders.map(o => {
    const itemsList = (o.items || []).map(oi => {
      const pName = oi.product?.name || oi.variant?.variant_name || oi.product_name || oi.name || 'Sản phẩm'
      const vName = oi.variant?.variant_name && oi.variant?.variant_name !== 'Mặc định' ? oi.variant?.variant_name : ''
      const qty = oi.Quantity || oi.quantity || 1
      return {
        name: pName,
        variant: vName,
        qty: qty
      }
    })
    return {
      id: o._id,
      code: o.code || o._id?.slice(-8).toUpperCase(),
      date: formatDate(o.createdAt),
      total: formatPrice(o.total_amount),
      status: (o.isReviewed && o.status === 'delivered') ? 'completed' : o.status,
      payment_status: o.payment_status || 'unpaid',
      isReviewed: !!o.isReviewed,
      items: (o.items || []).length,
      itemsList,
      voucherCode: o.voucher_code || '',
      voucherValue: o.voucher_value || 0,
      return_request: o.return_request,
      refund_info: o.refund_info,
      cancel_reason: o.cancel_reason,
      statusHistory: o.statusHistory,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      delivered_at: o.delivered_at,
      rawOrder: o
    }
  })




  // ── Wishlist ──
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const statusMap = {
    // Canonical 5 bước
    pending:     'Chờ xác nhận',
    preparing:   'Đang chuẩn bị hàng',
    shipping:    'Đang giao hàng',
    delivered:   'Đã giao hàng',
    completed:   'Hoàn thành',
    cancelled:   'Đã hủy',
    // Legacy aliases — chỉ để hiển thị label cho data cũ:
    handover:    'Đang giao hàng',
    handed_over: 'Đang giao hàng',
    shipped:     'Đang giao hàng',
    shipping_old:'Đang giao hàng',
    delivering:  'Đang giao hàng',
    done:        'Hoàn thành',
    canceled:    'Đã hủy',
    delivery_fail: 'Giao không thành công',
    refund:        'Trả hàng / Hoàn tiền'
  }

  // Normalize legacy -> canonical (dùng cho getFlowStep)
  const normalizeStatus = (s) => {
    if (!s) return s;
    if (['handed_over','handover','shipped','delivering'].includes(s)) return 'shipping';
    if (s === 'done') return 'completed';
    if (s === 'canceled') return 'cancelled';
    return s;
  }

  // Luồng 5 bước tuần tự
  const ORDER_FLOW = ['pending', 'preparing', 'shipping', 'delivered', 'completed']

  // Lấy chỉ số bước hiện tại trong flow
  const getFlowStep = (status) => {
    return ORDER_FLOW.indexOf(normalizeStatus(status))
  }

  const filteredOrders = orders_for_table.filter(o => {
    // 1. Lọc theo tab trạng thái
    if (orderFilter === 'returns') {
      if (!o.return_request || !o.return_request.status || o.return_request.status === 'none') return false;
    } else if (orderFilter === 'refund_pending') {
      if (o.payment_status !== 'refund_pending') return false;
    } else {
      const passStatus = orderFilter === 'all' || o.status === orderFilter;
      if (!passStatus) return false;
    }

    // 2. Tra cứu mã đơn hàng (khắt khe, phải khớp chính xác hoàn toàn từ chữ)
    const search = orderSearchCode.trim();
    if (!search) return true;

    // Chuẩn hóa chuỗi tìm kiếm (bỏ ký tự # ở đầu nếu có)
    const q = search.replace(/^#/, '').trim().toLowerCase();
    const code = (o.code || '').trim().toLowerCase();
    const rawId = (o.id || o._id || '').toString().trim().toLowerCase();
    const shortId = rawId.slice(-8).toLowerCase();

    return code === q || rawId === q || shortId === q;
  });

  // Fetch data khi tab thay đổi
  useEffect(() => {
    fetchStats()
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
      fetch(`${API_URL}/favorites`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => { if (data.success) setWishlistProducts(data.data || []) })
        .catch(() => {});
    }
    if (activeTab === 'address') {
      fetchAddresses()
    }
    if (activeTab === 'voucher') {
      setVouchersLoading(true)
      fetch(`${API_URL}/api/vouchers/my-vouchers`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const avail = (data.data.available || []).map(item => ({
              ...item,
              is_used: false,
              voucher: item.voucher || item.voucher_id || item
            }))
            const hist = (data.data.history || []).map(item => ({
              ...item,
              is_used: true,
              voucher: item.voucher || item.voucher_id || item
            }))
            setMyVouchers([...avail, ...hist])
          }
        })
        .catch(err => console.error('Lỗi tải ví voucher:', err))
        .finally(() => setVouchersLoading(false))
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
          setStats(prev => ({ ...prev, totalFavorites: Math.max(0, prev.totalFavorites - 1) }));
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
    { key: 'voucher', label: 'Ví Voucher' },
    { key: 'address', label: 'Địa chỉ giao hàng' },
    { key: 'password', label: 'Đổi mật khẩu' }
  ]

  // ── Lưu thông tin cá nhân ──
  const handleSavePersonal = async () => {
    setEditSaving(true)
    setEditSuccess(false)
    try {
      const res = await fetch(API_URL + '/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editForm.name, phone: editForm.phone, email: editForm.email }),
      })
      const data = await res.json()
      if (data.success) {
        setUser(prev => ({ ...prev, ...data.user }))
        setEditForm({ name: data.user.name || '', phone: data.user.phone || '', email: data.user.email || '' })
        setEditSuccess(true)
        setTimeout(() => setEditSuccess(false), 3000)
      } else {
        // Nếu thông tin đã tồn tại / trùng lặp -> lập tức khôi phục dữ liệu cũ trên ô nhập
        setEditForm({
          name: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || ''
        })
        toast.error(data.message || 'Cập nhật thất bại', { position: 'bottom-right' })
      }
    } catch {
      // Lỗi hệ thống -> khôi phục lại dữ liệu cũ trên ô nhập
      setEditForm({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
      })
      toast.error('Lỗi kết nối server', { position: 'bottom-right' })
    } finally {
      setEditSaving(false)
    }
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

  // ── Yêu cầu gửi OTP quên mật khẩu ──
  const handleRequestOtp = async () => {
    setPwError('')
    if (!user?.email) {
      setPwError('Tài khoản của bạn chưa đăng ký email để nhận mã OTP!')
      return
    }
    setSendingOtp(true)
    try {
      const res = await fetch(API_URL + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user.email })
      })
      const data = await res.json()
      if (data.success) {
        setIsOtpMode(true)
        setOtpCountdown(60)
        setOtpForm({ otp: '', newPw: '', confirm: '' }) // Đảm bảo tất cả các ô đều trống khi hiện bảng đổi mật khẩu
        toast.success(data.message || 'Mã OTP đã được gửi tới email của bạn!', { position: 'bottom-right' })
      } else {
        setPwError(data.message || 'Gửi OTP thất bại!')
      }
    } catch {
      setPwError('Lỗi kết nối server, không thể gửi mã OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  // ── Đổi mật khẩu bằng mã OTP ──
  const handleResetPasswordWithOtp = async () => {
    setPwError('')
    if (!otpForm.otp.trim()) { setPwError('Vui lòng nhập mã OTP (6 chữ số)'); return }
    if (otpForm.newPw.length < 6) { setPwError('Mật khẩu mới tối thiểu 6 ký tự'); return }
    if (otpForm.newPw !== otpForm.confirm) { setPwError('Mật khẩu xác nhận không khớp'); return }

    setResettingPw(true)
    try {
      const res = await fetch(API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user.email,
          otp: otpForm.otp.trim(),
          newPassword: otpForm.newPw,
          confirmPassword: otpForm.confirm
        })
      })
      const data = await res.json()
      if (data.success) {
        setPwSuccess(true)
        toast.success(data.message || 'Đổi mật khẩu thành công!', { position: 'bottom-right' })
        setOtpForm({ otp: '', newPw: '', confirm: '' })
        setTimeout(() => {
          setPwSuccess(false)
          setIsOtpMode(false)
        }, 2500)
      } else {
        setPwError(data.message || 'Đổi mật khẩu thất bại!')
      }
    } catch {
      setPwError('Lỗi kết nối server khi xác nhận OTP')
    } finally {
      setResettingPw(false)
    }
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
                <div className="odm-info-row"><span className="odm-info-label">Trạng thái thanh toán</span><span style={{
                  fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px',
                  background: detail.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.15)' :
                              detail.payment_status === 'refund_pending' ? 'rgba(245, 158, 11, 0.15)' :
                              detail.payment_status === 'refunded' ? 'rgba(168, 85, 247, 0.15)' :
                              detail.payment_status === 'canceled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: detail.payment_status === 'paid' ? '#34d399' :
                         detail.payment_status === 'refund_pending' ? '#fbbf24' :
                         detail.payment_status === 'refunded' ? '#c084fc' :
                         detail.payment_status === 'canceled' ? '#f87171' : '#9ca3af',
                  border: '1px solid currentColor'
                }}>
                  {detail.payment_status === 'paid' ? '✔ Đã thanh toán' :
                   detail.payment_status === 'refund_pending' ? '⏳ Chờ hoàn tiền' :
                   detail.payment_status === 'refunded' ? '↩ Đã hoàn tiền' :
                   detail.payment_status === 'canceled' ? '✕ Đã hủy' : '⧘ Chưa thanh toán'}
                </span></div>
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
                      {p.img ? (
                        <img 
                          src={p.img} 
                          alt={p.name} 
                          onError={(e) => { 
                            e.target.style.display = 'none'; 
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block'; 
                          }} 
                        />
                      ) : null}
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        width="28" 
                        height="28" 
                        opacity="0.3" 
                        style={{ display: p.img ? 'none' : 'block' }}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div className="odm-product-info">
                      <div className="odm-product-name">{p.name}</div>
                      {p.variant && <div className="odm-product-variant">{p.variant}</div>}
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
                <div className="odm-payment-divider"/>
                <div className="odm-payment-row odm-payment-row--total"><span>Tổng thanh toán</span><span>{detail.payment.total}</span></div>
              </div>
            </div>

            {/* ── SECTION 4B: THÔNG TIN HOÀN TIỀN (NẾU CÓ) ── */}
            {(detail.payment_status === 'refund_pending' || detail.payment_status === 'refunded') && (
              <div className="odm-section" style={{
                background: detail.payment_status === 'refunded' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${detail.payment_status === 'refunded' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div className="odm-section-title" style={{ color: detail.payment_status === 'refunded' ? '#d8b4fe' : '#fbbf24', margin: 0, paddingBottom: '8px' }}>
                  <DollarSign className="w-4 h-4" />
                  {detail.payment_status === 'refunded' ? 'Đã quyết toán hoàn tiền thành công' : 'Đơn hàng đang chờ hoàn tiền'}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc', marginTop: '6px', lineHeight: '1.5' }}>
                  {detail.payment_status === 'refund_pending' ? (
                    <div>
                      Hệ thống đã tiếp nhận yêu cầu hoàn tiền cho đơn hàng này. Bộ phận kế toán WINNOTECH đang tiến hành xử lý hoàn trả tiền vào tài khoản ngân hàng của bạn.
                      {detail.refund_info?.account_number && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #333' }}>
                          <div><strong>Ngân hàng thụ hưởng:</strong> {detail.refund_info.bank_name || '—'}</div>
                          <div><strong>Số tài khoản:</strong> {detail.refund_info.account_number}</div>
                          <div><strong>Chủ tài khoản:</strong> {detail.refund_info.account_holder}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '6px' }}>
                        <div><strong>Số tiền đã hoàn:</strong> <span style={{ color: '#d8b4fe', fontWeight: 700 }}>{formatPrice(detail.refund_info?.refund_amount)}</span></div>
                        <div><strong>Hình thức hoàn:</strong> {detail.refund_info?.refund_method === 'vnpay' ? 'Cổng thanh toán VNPay' : 'Chuyển khoản ngân hàng'}</div>
                        {detail.refund_info?.refund_transaction_code && (
                          <div><strong>Mã GD hoàn tiền:</strong> <code style={{ color: '#fff', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>{detail.refund_info.refund_transaction_code}</code></div>
                        )}
                        {detail.refund_info?.refunded_at && (
                          <div><strong>Thời gian:</strong> {formatDate(detail.refund_info.refunded_at)}</div>
                        )}
                      </div>
                      {detail.refund_info?.note && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                          <strong>Ghi chú từ kế toán:</strong> {detail.refund_info.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION 4C: THÔNG TIN YÊU CẦU TRẢ HÀNG (NẾU CÓ) ── */}
            {detail.return_request && detail.return_request.status && detail.return_request.status !== 'none' && (
              <div className="odm-section" style={{
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div className="odm-section-title" style={{ color: '#93c5fd', margin: 0, paddingBottom: '8px' }}>
                  <RotateCcw className="w-4 h-4" />
                  Chi tiết Yêu cầu Đổi trả hàng
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                    background: detail.return_request.status === 'return_approved' ? 'rgba(34, 197, 94, 0.2)' :
                                detail.return_request.status === 'return_rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                detail.return_request.status === 'returned_success' ? 'rgba(16, 185, 129, 0.2)' :
                                'rgba(168, 85, 247, 0.2)',
                    color: detail.return_request.status === 'return_approved' ? '#4ade80' :
                           detail.return_request.status === 'return_rejected' ? '#f87171' :
                           detail.return_request.status === 'returned_success' ? '#34d399' :
                           '#c084fc',
                    border: '1px solid currentColor'
                  }}>
                    {RETURN_STATUS_CONFIG[detail.return_request.status]?.label || detail.return_request.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Gửi yêu cầu lúc: {formatDate(detail.return_request.requested_at)}
                  </span>
                </div>

                <div className="odm-info-grid">
                  <div className="odm-info-row odm-info-row--full">
                    <span className="odm-info-label">Lý do trả hàng:</span>
                    <span className="odm-info-value" style={{ fontWeight: 600, color: '#fff' }}>
                      {RETURN_REASONS.find(r => r.key === detail.return_request.reason)?.label || detail.return_request.reason}
                    </span>
                  </div>
                  <div className="odm-info-row odm-info-row--full">
                    <span className="odm-info-label">Mô tả chi tiết:</span>
                    <span className="odm-info-value" style={{ whiteSpace: 'pre-wrap' }}>
                      {detail.return_request.description || '—'}
                    </span>
                  </div>
                  {detail.return_request.bank_info?.account_number && (
                    <div className="odm-info-row odm-info-row--full">
                      <span className="odm-info-label">Tài khoản nhận tiền hoàn:</span>
                      <span className="odm-info-value">
                        {detail.return_request.bank_info.bank_name} — <strong>{detail.return_request.bank_info.account_number}</strong> ({detail.return_request.bank_info.account_holder})
                      </span>
                    </div>
                  )}
                </div>

                {/* Hình ảnh bằng chứng */}
                {detail.return_request.images && detail.return_request.images.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>Hình ảnh bằng chứng đính kèm:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {detail.return_request.images.map((imgUrl, imgIdx) => {
                        const fullImg = imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`;
                        return (
                          <a key={imgIdx} href={fullImg} target="_blank" rel="noopener noreferrer">
                            <img
                              src={fullImg}
                              alt="Bằng chứng trả hàng"
                              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #3b3b4f' }}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Phản hồi từ Shop nếu bị từ chối */}
                {detail.return_request.status === 'return_rejected' && detail.return_request.rejected_reason && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', color: '#fca5a5', fontSize: '12px' }}>
                    <strong>Lý do từ chối từ Shop:</strong> {detail.return_request.rejected_reason}
                  </div>
                )}

                {/* Hướng dẫn từ Shop nếu đã duyệt */}
                {detail.return_request.admin_note && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: '8px', color: '#bfdbfe', fontSize: '12px' }}>
                    <strong>Thông báo / Hướng dẫn từ Shop:</strong> {detail.return_request.admin_note}
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION 5: VẬN CHUYỂN + FLOW ── */}
            <div className="odm-section">
              <div className="odm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Thông tin vận chuyển
              </div>
              <div className="odm-info-grid">
                <div className="odm-info-row"><span className="odm-info-label">Đơn vị vận chuyển</span><span className="odm-info-value">{detail.shipping.carrier}</span></div>
                <div className="odm-info-row"><span className="odm-info-label">Trạng thái đơn hàng</span><span className="odm-info-value odm-tracking">{statusMap[detail.status] || detail.shipping.tracking}</span></div>
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
                {(detail.status === 'done' || detail.status === 'completed' || detail.status === 'delivered') && (
                  <button
                    className={`odm-action-btn odm-action-btn--review ${detail.isReviewed ? 'disabled' : ''}`}
                    disabled={detail.isReviewed}
                    onClick={() => {
                      if (!detail.isReviewed) {
                        onClose()
                        handleOpenReview(detail)
                      }
                    }}
                    style={detail.isReviewed ? {
                      opacity: 0.45,
                      cursor: 'not-allowed',
                      borderColor: '#374151',
                      color: '#6b7280',
                      background: 'rgba(255,255,255,0.02)',
                      pointerEvents: 'none'
                    } : {}}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {detail.isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                  </button>
                )}
                {(detail.status === 'pending' || detail.status === 'preparing') && (
                  <button
                    className="odm-action-btn odm-action-btn--cancel"
                    onClick={() => {
                      onClose()
                      setCancelModal({
                        orderId: detail._id || detail.id,
                        orderCode: detail.id,
                        isPaid: detail.payment_status === 'paid'
                      })
                      setCancelReason('')
                      setCancelBankName('')
                      setCancelAccountNumber('')
                      setCancelAccountHolder('')
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Hủy đơn
                  </button>
                )}
                {isOrderEligibleForReturn(detail) && (
                  <button
                    className="odm-action-btn odm-action-btn--return"
                    onClick={() => {
                      onClose()
                      setReturnRequestModal({
                        orderId: detail._id || detail.id,
                        orderCode: detail.id,
                        total: detail.payment?.total
                      })
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu trả hàng / hoàn tiền
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
                <a
                  href={`${API_URL}/orders/${detail._id}/export-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="odm-action-btn odm-action-btn--invoice"
                  title="Tải hóa đơn PDF"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Tải hóa đơn
                </a>
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
    voucher: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    password: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  }

  return (
    <DefaultLayout>
      {selectedOrder && <OrderDetailModal detail={getOrderDetail(selectedOrder)} onClose={() => setSelectedOrder(null)} />}

      {/* ── REVIEW MODAL (Shopee Style) ── */}
      {reviewModal && (
        <div style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
          <div style={{ background:'#181824',border:'1px solid #3b3b4f',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'580px',maxHeight:'85vh',overflowY:'auto',color:'#fff',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Modal Header */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'16px',borderBottom:'1px solid #2d2d3f',marginBottom:'20px' }}>
              <div>
                <h3 style={{ fontSize:'20px',fontWeight:700,margin:0,color:'#fff',display:'flex',alignItems:'center',gap:'8px' }}>
                  ⭐ Đánh giá sản phẩm
                </h3>
                <span style={{ fontSize:'12px',color:'#aaa',marginTop:'2px',display:'block' }}>
                  Chia sẻ trải nghiệm sử dụng để nhận voucher ưu đãi từ WINNOTECH!
                </span>
              </div>
              <button onClick={() => setReviewModal(null)} style={{ background:'#252536',border:'none',borderRadius:'50%',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',cursor:'pointer',color:'#aaa' }}>✕</button>
            </div>

            {reviewModal.items.length === 0 ? (
              <p style={{ color:'#aaa',textAlign:'center',padding:'20px 0' }}>Không tìm thấy sản phẩm trong đơn hàng này để đánh giá.</p>
            ) : (
              reviewModal.items.map(item => {
                const itemState = reviewForm[item.orderItemId] || { star: 5, content: '' }
                const isExpanded = Boolean(expandedReviewItems[item.orderItemId])
                const hasContent = Boolean(itemState.content && itemState.content.trim())
                const quickTags = ['Giao hàng siêu nhanh', 'Đóng gói cẩn thận', 'Sản phẩm chính hãng', 'Tư vấn nhiệt tình']

                const toggleExpand = () => {
                  setExpandedReviewItems(prev => ({
                    ...prev,
                    [item.orderItemId]: !prev[item.orderItemId]
                  }))
                }

                return (
                  <div 
                    key={item.orderItemId} 
                    style={{ 
                      marginBottom:'16px',
                      padding:'16px 18px',
                      background:'#20202e',
                      border: `1px solid ${isExpanded ? '#9ca3af' : '#33334d'}`,
                      borderRadius:'14px',
                      transition:'all 0.2s'
                    }}
                  >
                    {/* Header dòng SP kèm nút Cây viết */}
                    <div 
                      style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',cursor:'pointer' }}
                      onClick={toggleExpand}
                    >
                      <div style={{ fontWeight:700,fontSize:'14px',color:'#fff',display:'flex',alignItems:'center',gap:'8px',flex:1 }}>
                        <span>🛒</span>
                        <span>{item.name}</span>
                        {hasContent && (
                          <span style={{ fontSize:'11px',padding:'2px 8px',borderRadius:'999px',background:'rgba(34,197,94,0.15)',color:'#22c55e',border:'1px solid rgba(34,197,94,0.3)',fontWeight:600 }}>✓ Đã nhập đánh giá</span>
                        )}
                      </div>

                      {/* Nút cây viết Đánh giá (Toggle) */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpand() }}
                        title={isExpanded ? "Ẩn phần đánh giá" : "Viết đánh giá sản phẩm"}
                        style={{
                          display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                          padding:'6px 12px',borderRadius:'8px',
                          background: isExpanded ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isExpanded ? '#e5e7eb' : '#4b5563'}`,
                          color: isExpanded ? '#ffffff' : '#9ca3af',
                          cursor:'pointer',fontSize:'12px',fontWeight:600,transition:'all 0.2s'
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>{isExpanded ? 'Ẩn' : 'Viết đánh giá'}</span>
                      </button>
                    </div>

                    {/* Chi tiết form đánh giá (Hiển thị khi click cây viết) */}
                    {isExpanded && (
                      <div style={{ marginTop:'14px',paddingTop:'14px',borderTop:'1px solid #2d2d3f' }}>
                        {/* Star rating */}
                        <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px' }}>
                          <div style={{ display:'flex',gap:'4px' }}>
                            {[1,2,3,4,5].map(star => (
                              <button 
                                key={star} 
                                type="button"
                                onClick={() => setReviewForm(f => ({ ...f, [item.orderItemId]: { ...f[item.orderItemId], star } }))}
                                style={{ background:'none',border:'none',fontSize:'26px',cursor:'pointer',color: (itemState.star || 5) >= star ? '#f5a623' : '#444',transition:'transform 0.1s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Tags */}
                        <div style={{ display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px' }}>
                          {quickTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const curText = itemState.content || ''
                                const newText = curText ? `${curText} - ${tag}` : tag
                                setReviewForm(f => ({ ...f, [item.orderItemId]: { ...f[item.orderItemId], content: newText } }))
                              }}
                              style={{ fontSize:'11px',padding:'4px 10px',background:'#2a2a3d',border:'1px solid #444460',borderRadius:'20px',color:'#ddd',cursor:'pointer' }}
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>

                        {/* Review text */}
                        <textarea
                          placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng sản phẩm, dịch vụ giao hàng..."
                          rows={3}
                          value={itemState.content || ''}
                          onChange={e => setReviewForm(f => ({ ...f, [item.orderItemId]: { ...f[item.orderItemId], content: e.target.value } }))}
                          style={{ width:'100%',padding:'12px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'10px',fontSize:'13px',color:'#fff',resize:'vertical',boxSizing:'border-box',outline:'none' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Modal Actions */}
            <div style={{ display:'flex',gap:'12px',justifyContent:'flex-end',marginTop:'16px',paddingTop:'16px',borderTop:'1px solid #2d2d3f' }}>
              <button 
                onClick={() => setReviewModal(null)} 
                style={{ padding:'10px 20px',border:'1px solid #444',borderRadius:'10px',background:'#252536',color:'#ddd',cursor:'pointer',fontSize:'13px',fontWeight:600 }}
              >
                Hủy
              </button>
              <button
                disabled={reviewSubmitting || reviewModal.items.length === 0}
                onClick={async () => {
                  setReviewSubmitting(true)
                  let successCount = 0, failCount = 0

                  const itemsToSubmit = reviewModal.items.filter(item => {
                    const form = reviewForm[item.orderItemId]
                    return form && form.content && form.content.trim().length > 0
                  })

                  if (itemsToSubmit.length === 0) {
                    toast.info('Vui lòng nhấn vào cây viết và nhập nội dung đánh giá cho sản phẩm bạn muốn đánh giá.', { position: 'bottom-right' })
                    setReviewSubmitting(false)
                    return
                  }

                  for (const item of itemsToSubmit) {
                    const { star, content } = reviewForm[item.orderItemId] || { star: 5, content: '' }
                    try {
                      const formData = new FormData()
                      formData.append('order_item_id', item.orderItemId)
                      formData.append('star_number', star)
                      formData.append('content', content)

                      const res = await fetch(API_URL + '/reviews', {
                        method: 'POST', 
                        credentials: 'include',
                        body: formData
                      })
                      const data = await res.json()
                      if (data.success) successCount++
                      else failCount++
                    } catch { failCount++ }
                  }

                  setReviewSubmitting(false)
                  if (successCount > 0) {
                    toast.success(`🎉 Đã gửi ${successCount} đánh giá sản phẩm thành công!`, { position: 'bottom-right' })
                    if (reviewModal?.orderId) {
                      setOrders(prev => prev.map(o => (o._id === reviewModal.orderId || o.code === reviewModal.orderId || o.id === reviewModal.orderId) ? { ...o, status: 'completed', isReviewed: true } : o))
                    }
                    setReviewModal(null)
                  } else if (failCount > 0) {
                    toast.warn('Không thể gửi đánh giá. Vui lòng thử lại sau.', { position: 'bottom-right' })
                  }
                }}
                style={{ 
                  padding:'10px 28px',
                  border:'none',
                  borderRadius:'10px',
                  background: reviewSubmitting ? '#555' : '#d4ff00',
                  color: reviewSubmitting ? '#aaa' : '#000',
                  cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight:800,
                  fontSize:'14px',
                  boxShadow:'0 0 15px rgba(212,255,0,0.3)'
                }}
              >
                {reviewSubmitting ? 'Đang cập nhật...' : 'Cập nhật toàn bộ đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelModal && (
        <div style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
          <div style={{ background:'#181824',border:'1px solid #3b3b4f',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'500px',maxHeight:'90vh',overflowY:'auto',color:'#fff',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Header */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'16px',borderBottom:'1px solid #2d2d3f',marginBottom:'20px' }}>
              <div>
                <h3 style={{ fontSize:'18px',fontWeight:700,margin:0,color:'#ef4444',display:'flex',alignItems:'center',gap:'8px' }}>
                  ⚠️ Xác nhận hủy đơn hàng
                </h3>
                <span style={{ fontSize:'12px',color:'#aaa',marginTop:'2px',display:'block' }}>
                  #{cancelModal.orderCode} — Hành động này không thể hoàn tác
                </span>
              </div>
              <button onClick={() => setCancelModal(null)} style={{ background:'#252536',border:'none',borderRadius:'50%',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',cursor:'pointer',color:'#aaa' }}>✕</button>
            </div>

            {/* Thông báo nếu đã thanh toán */}
            {cancelModal.isPaid && (
              <div style={{ padding:'12px 14px',background:'rgba(245, 158, 11, 0.12)',border:'1px solid rgba(245, 158, 11, 0.35)',borderRadius:'12px',marginBottom:'18px' }}>
                <div style={{ fontSize:'13px',fontWeight:700,color:'#fbbf24',display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px' }}>
                  <DollarSign className="w-4 h-4 text-amber-400" /> Đơn hàng này đã thanh toán
                </div>
                <div style={{ fontSize:'12px',color:'#d1d5db',lineHeight:'1.4' }}>
                  Sau khi hủy đơn, WINNOTECH sẽ hoàn lại 100% tiền qua chuyển khoản ngân hàng. Vui lòng cung cấp thông tin tài khoản nhận hoàn tiền:
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'12px' }}>
                  <div style={{ gridColumn:'span 2' }}>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Tên ngân hàng (VD: Vietcombank, MB Bank, ACB...) <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Nhập tên ngân hàng"
                      value={cancelBankName}
                      onChange={e => setCancelBankName(e.target.value)}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Số tài khoản ngân hàng <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Nhập số tài khoản"
                      value={cancelAccountNumber}
                      onChange={e => setCancelAccountNumber(e.target.value)}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Tên chủ tài khoản (in hoa) <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={cancelAccountHolder}
                      onChange={e => setCancelAccountHolder(e.target.value.toUpperCase())}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'13px',color:'#aaa',display:'block',marginBottom:'8px' }}>Lý do hủy đơn (không bắt buộc)</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px' }}>
                {['Đặt nhầm sản phẩm', 'Muốn thay đổi địa chỉ', 'Tìm được giá rẻ hơn', 'Không có nhu cầu nữa'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setCancelReason(r)}
                    style={{ fontSize:'11px',padding:'4px 10px',background: cancelReason===r ? '#ef4444' : '#2a2a3d',border:`1px solid ${cancelReason===r ? '#ef4444' : '#444460'}`,borderRadius:'20px',color:'#fff',cursor:'pointer' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Hoặc nhập lý do khác..."
                rows={2}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ width:'100%',padding:'10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'10px',fontSize:'13px',color:'#fff',resize:'none',boxSizing:'border-box',outline:'none' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display:'flex',gap:'12px',justifyContent:'flex-end' }}>
              <button
                onClick={() => setCancelModal(null)}
                style={{ padding:'10px 20px',border:'1px solid #444',borderRadius:'10px',background:'#252536',color:'#ddd',cursor:'pointer',fontSize:'13px',fontWeight:600 }}
              >
                Giữ đơn hàng
              </button>
              <button
                disabled={cancelSubmitting}
                onClick={async () => {
                  if (cancelModal.isPaid && (!cancelBankName.trim() || !cancelAccountNumber.trim() || !cancelAccountHolder.trim())) {
                    toast.error('Vui lòng điền thông tin tài khoản ngân hàng để nhận tiền hoàn!', { position: 'bottom-right' })
                    return
                  }
                  setCancelSubmitting(true)
                  try {
                    const res = await fetch(`${API_URL}/orders/${cancelModal.orderId}/cancel`, {
                      method: 'PUT',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        reason: cancelReason,
                        bank_name: cancelBankName,
                        account_number: cancelAccountNumber,
                        account_holder: cancelAccountHolder
                      })
                    })
                    const data = await res.json()
                    if (data.success) {
                      toast.success(data.message || 'Đã hủy đơn hàng thành công!', { position: 'bottom-right' })
                      setOrders(prev => prev.map(o => (o._id === cancelModal.orderId || o.id === cancelModal.orderId)
                        ? {
                            ...o,
                            status: 'cancelled',
                            payment_status: cancelModal.isPaid ? 'refund_pending' : (o.payment_status === 'paid' ? 'refund_pending' : 'canceled')
                          }
                        : o
                      ))
                      setCancelModal(null)
                      fetchOrders()
                    } else {
                      toast.error(data.message || 'Không thể hủy đơn hàng', { position: 'bottom-right' })
                    }
                  } catch {
                    toast.error('Lỗi kết nối, vui lòng thử lại', { position: 'bottom-right' })
                  } finally {
                    setCancelSubmitting(false)
                  }
                }}
                style={{ padding:'10px 24px',border:'none',borderRadius:'10px',background: cancelSubmitting ? '#555' : '#ef4444',color:'#fff',cursor: cancelSubmitting ? 'not-allowed' : 'pointer',fontWeight:700,fontSize:'13px',display:'flex',alignItems:'center',gap:'6px' }}
              >
                {cancelSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {cancelSubmitting ? 'Đang hủy...' : '🗑 Xác nhận hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETURN REQUEST MODAL ── */}
      {returnRequestModal && (
        <div style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(5px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
          <div style={{ background:'#181824',border:'1px solid #3b3b4f',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto',color:'#fff',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.6)' }}>
            
            {/* Header */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'16px',borderBottom:'1px solid #2d2d3f',marginBottom:'18px' }}>
              <div>
                <h3 style={{ fontSize:'18px',fontWeight:700,margin:0,color:'#c084fc',display:'flex',alignItems:'center',gap:'8px' }}>
                  <RotateCcw className="w-5 h-5 text-purple-400" /> Yêu cầu Trả hàng & Hoàn tiền
                </h3>
                <span style={{ fontSize:'12px',color:'#aaa',marginTop:'3px',display:'block' }}>
                  Đơn hàng #{returnRequestModal.orderCode} — Thời hạn đổi trả trong vòng 7 ngày
                </span>
              </div>
              <button onClick={closeReturnRequestModal} style={{ background:'#252536',border:'none',borderRadius:'50%',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',cursor:'pointer',color:'#aaa' }}>✕</button>
            </div>

            <form onSubmit={handleReturnSubmit} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
              
              {/* Lưu ý chính sách */}
              <div style={{ padding:'10px 14px',background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.25)',borderRadius:'12px',fontSize:'12px',color:'#d8b4fe',lineHeight:'1.4' }}>
                💡 <strong>Chính sách hoàn tiền WINNOTECH:</strong> Sau khi shop duyệt và nhận lại kiện hàng, tiền sẽ được hoàn 100% về số tài khoản ngân hàng bạn cung cấp bên dưới.
              </div>

              {/* 1. Lý do trả hàng */}
              <div>
                <label style={{ fontSize:'13px',fontWeight:600,color:'#e5e7eb',display:'block',marginBottom:'6px' }}>
                  1. Chọn lý do trả hàng <span style={{ color:'#ef4444' }}>*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  style={{ width:'100%',padding:'10px 12px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'10px',fontSize:'13px',color:'#fff',outline:'none',cursor:'pointer' }}
                >
                  {RETURN_REASONS.map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* 2. Mô tả chi tiết */}
              <div>
                <label style={{ fontSize:'13px',fontWeight:600,color:'#e5e7eb',display:'block',marginBottom:'6px' }}>
                  2. Mô tả chi tiết vấn đề / tình trạng sản phẩm <span style={{ color:'#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả cụ thể tình trạng hàng hóa, lỗi gặp phải hoặc lý do bạn không hài lòng..."
                  value={returnDescription}
                  onChange={e => setReturnDescription(e.target.value)}
                  style={{ width:'100%',padding:'10px 12px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'10px',fontSize:'13px',color:'#fff',outline:'none',resize:'vertical',boxSizing:'border-box' }}
                />
              </div>

              {/* 3. Tải ảnh bằng chứng */}
              <div>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px' }}>
                  <label style={{ fontSize:'13px',fontWeight:600,color:'#e5e7eb' }}>
                    3. Hình ảnh / Video bằng chứng lỗi (tối đa 5 ảnh) <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize:'11px',color:'#9ca3af' }}>{returnImages.length}/5 ảnh</span>
                </div>

                {/* Previews */}
                {returnImagePreviews.length > 0 && (
                  <div style={{ display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px' }}>
                    {returnImagePreviews.map((url, idx) => (
                      <div key={idx} style={{ position:'relative',width:'70px',height:'70px',borderRadius:'8px',overflow:'hidden',border:'1px solid #4b5563' }}>
                        <img src={url} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveReturnImage(idx)}
                          style={{ position:'absolute',top:'2px',right:'2px',width:'18px',height:'18px',borderRadius:'50%',background:'rgba(0,0,0,0.7)',border:'none',color:'#fff',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {returnImages.length < 5 && (
                  <label style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'6px',padding:'16px',background:'#161622',border:'1px dashed #4b5563',borderRadius:'10px',cursor:'pointer',transition:'border-color 0.2s' }}>
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span style={{ fontSize:'12px',color:'#ccc' }}>Bấm để chọn hình ảnh chụp sản phẩm (JPG, PNG, WebP &le; 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReturnImageChange}
                      style={{ display:'none' }}
                    />
                  </label>
                )}
              </div>

              {/* 4. Thông tin tài khoản nhận hoàn tiền */}
              <div style={{ padding:'14px',background:'rgba(255,255,255,0.02)',border:'1px solid #33334d',borderRadius:'12px' }}>
                <div style={{ fontSize:'13px',fontWeight:700,color:'#fff',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px' }}>
                  <DollarSign className="w-4 h-4 text-emerald-400" /> 4. Thông tin tài khoản nhận hoàn tiền
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
                  <div style={{ gridColumn:'span 2' }}>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Tên ngân hàng (VD: Vietcombank, MB Bank, Techcombank...) <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên ngân hàng của bạn"
                      value={returnBankName}
                      onChange={e => setReturnBankName(e.target.value)}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Số tài khoản ngân hàng <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập số tài khoản"
                      value={returnAccountNumber}
                      onChange={e => setReturnAccountNumber(e.target.value)}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px',color:'#9ca3af',display:'block',marginBottom:'4px' }}>Tên chủ tài khoản (in hoa) <span style={{ color:'#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="NGUYEN VAN A"
                      value={returnAccountHolder}
                      onChange={e => setReturnAccountHolder(e.target.value.toUpperCase())}
                      style={{ width:'100%',padding:'8px 10px',background:'#161622',border:'1px solid #3d3d56',borderRadius:'8px',fontSize:'12px',color:'#fff',outline:'none',boxSizing:'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex',gap:'12px',justifyContent:'flex-end',marginTop:'8px' }}>
                <button
                  type="button"
                  onClick={closeReturnRequestModal}
                  style={{ padding:'10px 18px',border:'1px solid #444',borderRadius:'10px',background:'#252536',color:'#ddd',cursor:'pointer',fontSize:'13px',fontWeight:600 }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  style={{ padding:'10px 24px',border:'none',borderRadius:'10px',background: returnSubmitting ? '#555' : 'linear-gradient(135deg, #9333ea, #7e22ce)',color:'#fff',cursor: returnSubmitting ? 'not-allowed' : 'pointer',fontWeight:700,fontSize:'13px',display:'flex',alignItems:'center',gap:'6px' }}
                >
                  {returnSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {returnSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu trả hàng'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <div className="profile-page">
        <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
        <div className="profile-inner">
          <div className="profile-breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span>Tài khoản của tôi
          </div>
          <h1 className="profile-page-title">TÀI KHOẢN CỦA TÔI</h1>

          <div className={'profile-layout' + (activeTab !== 'overview' ? ' profile-layout--no-right' : '')}>

            {/* LEFT SIDEBAR */}
            <aside className="profile-sidebar">
              <div className="profile-sidebar-user">
                <div className="profile-avatar-sidebar" onClick={() => avatarInputRef.current?.click()} style={{ cursor: 'pointer' }} title="Bấm để đổi ảnh đại diện">
                  {user.avatar ? <img src={getAvatarUrl(user.avatar)} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
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
                      <div className="profile-avatar-main-img" onClick={() => avatarInputRef.current?.click()} style={{ cursor: 'pointer' }} title="Bấm để đổi ảnh">
                        {user.avatar ? <img src={getAvatarUrl(user.avatar)} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
                      </div>
                      <button className="btn-change-avatar" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        {avatarUploading ? 'Đang tải...' : 'Đổi ảnh'}
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
                  <div className="profile-table-wrapper">
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
                        onClick={() => navigate(`/product/${p.slug || p._id}`)}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                className="btn-buy-now-card"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const price = p.sale_price > 0 ? p.sale_price : (p.price || 0);
                                  const buyNowItem = {
                                    cartItem: {
                                      _id: p._id,
                                      variant_id: p._id,
                                      quantity: 1,
                                      price: price
                                    },
                                    variant: {
                                      _id: p._id,
                                      price: price,
                                      sale_price: price,
                                      variant_name: ''
                                    },
                                    product: {
                                      _id: p._id,
                                      name: p.name
                                    },
                                    AnhSP: p.images?.[0] ? [{ url: p.images[0] }] : [],
                                    _localPrice: price,
                                    _variantId: p._id,
                                    _isBuyNow: true
                                  };
                                  sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
                                  navigate('/checkout', { state: { buyNowItem } });
                                }}
                                style={{
                                  background: 'var(--yellow)',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Mua ngay"
                              >
                                Mua ngay
                              </button>
                              <button 
                                className="wishlist-cart-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(p);
                                }}
                                title="Thêm vào giỏ"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                                </svg>
                              </button>
                            </div>
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
                    <div className="profile-avatar-main-img profile-avatar-lg" onClick={() => avatarInputRef.current?.click()} style={{ cursor: 'pointer' }} title="Bấm để đổi ảnh đại diện">
                      {user.avatar ? <img src={getAvatarUrl(user.avatar)} alt={user.name}/> : <span className="avatar-initials">{getInitial()}</span>}
                    </div>
                    <div className="profile-personal-avatar-info">
                      <div className="profile-personal-avatar-name">{user.name}</div>
                      <div className="profile-personal-avatar-email">{user.email}</div>
                      <button className="btn-change-avatar" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        {avatarUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
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
                      <input className="profile-form-input" type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} placeholder="Nhập email"/>
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
                    <button className="profile-btn-cancel" onClick={()=>setEditForm({name:user.name||'',phone:user.phone||'',email:user.email||''})}>Huỷ thay đổi</button>
                    <button className="profile-btn-save" onClick={handleSavePersonal} disabled={editSaving}>
                      {editSaving ? 'Đang lưu...' : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Lưu thay đổi</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="profile-card">
                  <div className="profile-orders-header-row">
                    <div className="profile-card-title" style={{ margin: 0 }}>ĐƠN HÀNG CỦA TÔI</div>
                    
                    {/* Thanh Tra Cứu Đơn Hàng Khắt Khe */}
                    <div className="profile-order-search-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="search-icon">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Tra cứu chính xác mã đơn (VD: ORD12345)..." 
                        value={orderSearchCode}
                        onChange={(e) => setOrderSearchCode(e.target.value)}
                      />
                      {orderSearchCode && (
                        <button className="clear-search-btn" onClick={() => setOrderSearchCode('')} title="Xóa mã tìm kiếm">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="profile-order-filters">
                    {[
                      { key: 'all',       label: 'Tất cả',         count: orders_for_table.length },
                      { key: 'pending',   label: 'Chờ xác nhận',  count: orders_for_table.filter(o=>o.status==='pending').length },
                      { key: 'preparing', label: 'Chuẩn bị hàng',  count: orders_for_table.filter(o=>o.status==='preparing').length },
                      { key: 'shipping',  label: 'Đang giao',        count: orders_for_table.filter(o=>['shipping','handed_over','handover','shipped','delivering'].includes(o.status)).length },
                      { key: 'delivered', label: 'Đã giao hàng',    count: orders_for_table.filter(o=>o.status==='delivered').length },
                      { key: 'completed', label: 'Hoàn thành',      count: orders_for_table.filter(o=>o.status==='completed'||o.status==='done').length },
                      { key: 'cancelled', label: 'Đã hủy',          count: orders_for_table.filter(o=>o.status==='cancelled'||o.status==='canceled').length },
                      { key: 'returns',   label: 'Đổi trả hàng',     count: orders_for_table.filter(o => o.return_request && o.return_request.status && o.return_request.status !== 'none').length },
                      { key: 'refund_pending', label: 'Chờ hoàn tiền', count: orders_for_table.filter(o => o.payment_status === 'refund_pending').length },
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
                    <div className="profile-empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: '#888', marginBottom: '12px' }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                      {orderSearchCode.trim() ? (
                        <>
                          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
                            Không tìm thấy đơn hàng nào khớp chính xác với mã <strong style={{ color: 'var(--yellow)' }}>"{orderSearchCode}"</strong>
                          </p>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>
                            (Tra cứu yêu cầu nhập đúng từng ký tự của mã đơn hàng)
                          </div>
                          <button 
                            onClick={() => setOrderSearchCode('')}
                            style={{
                              background: 'var(--yellow)',
                              color: '#000',
                              border: 'none',
                              padding: '8px 18px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Xóa từ khóa tìm kiếm
                          </button>
                        </>
                      ) : (
                        <p>Không có đơn hàng nào</p>
                      )}
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
                              <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
                                {/* Trạng thái thanh toán */}
                                <span style={{
                                  fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'999px',
                                  background: order.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.15)' :
                                              order.payment_status === 'refund_pending' ? 'rgba(245, 158, 11, 0.15)' :
                                              order.payment_status === 'refunded' ? 'rgba(168, 85, 247, 0.15)' :
                                              order.payment_status === 'canceled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                                  color: order.payment_status === 'paid' ? '#34d399' :
                                         order.payment_status === 'refund_pending' ? '#fbbf24' :
                                         order.payment_status === 'refunded' ? '#c084fc' :
                                         order.payment_status === 'canceled' ? '#f87171' : '#9ca3af',
                                  border: '1px solid currentColor'
                                }}>
                                  {order.payment_status === 'paid' ? '✔ Đã thanh toán' :
                                   order.payment_status === 'refund_pending' ? '⏳ Chờ hoàn tiền' :
                                   order.payment_status === 'refunded' ? '↩ Đã hoàn tiền' :
                                   order.payment_status === 'canceled' ? '✕ Đã hủy' : '⧘ Chưa thanh toán'}
                                </span>

                                {/* Trạng thái đổi trả hàng nếu có */}
                                {order.return_request && order.return_request.status && order.return_request.status !== 'none' && (
                                  <span style={{
                                    fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'999px',
                                    background: order.return_request.status === 'return_approved' ? 'rgba(34, 197, 94, 0.15)' :
                                                order.return_request.status === 'return_rejected' ? 'rgba(239, 68, 68, 0.15)' :
                                                order.return_request.status === 'returned_success' ? 'rgba(16, 185, 129, 0.15)' :
                                                'rgba(168, 85, 247, 0.15)',
                                    color: order.return_request.status === 'return_approved' ? '#4ade80' :
                                           order.return_request.status === 'return_rejected' ? '#f87171' :
                                           order.return_request.status === 'returned_success' ? '#34d399' :
                                           '#c084fc',
                                    border: '1px solid currentColor',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}>
                                    <RotateCcw className="w-3 h-3" />
                                    {RETURN_STATUS_CONFIG[order.return_request.status]?.label || order.return_request.status}
                                  </span>
                                )}
                              </div>
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
                                <div className="order-meta-col order-meta-date">
                                  <span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    {order.date}
                                  </span>
                                </div>

                                {/* Tóm tắt danh sách tên SP + SL (Mỗi SP 1 dòng) */}
                                <div className="order-meta-col order-meta-products">
                                  {order.itemsList && order.itemsList.length > 0 ? (
                                    order.itemsList.map((it, idx) => (
                                      <div key={idx} className="order-product-line">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                                        <span className="order-product-name">{it.name}{it.variant ? ` (${it.variant})` : ''}</span>
                                        <span className="order-product-qty">x{it.qty}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="order-product-line">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                                      <span>{order.items || 1} sản phẩm</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="profile-order-item-total">{order.total}</div>
                            </div>

                            {/* Footer: Voucher (bên trái) + Action buttons (bên phải) ngang hàng */}
                            <div className="profile-order-item-footer">
                              <div className="profile-order-item-voucher">
                                {(Boolean(order.voucherCode) || order.voucherValue > 0) && (
                                  <div className="order-voucher-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                                    </svg>
                                    <span className="order-voucher-code">{order.voucherCode ? `Mã: ${order.voucherCode}` : 'Voucher'}</span>
                                    {order.voucherValue > 0 && (
                                      <span className="order-voucher-val">(-{formatPrice(order.voucherValue)})</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="profile-order-item-actions">
                                {(order.status === 'done' || order.status === 'completed' || order.status === 'delivered') && (
                                  <button
                                    className={`profile-order-btn profile-order-btn--review ${order.isReviewed ? 'disabled' : ''}`}
                                    disabled={order.isReviewed}
                                    onClick={() => !order.isReviewed && handleOpenReview(order)}
                                    style={order.isReviewed ? {
                                      opacity: 0.45,
                                      cursor: 'not-allowed',
                                      borderColor: '#374151',
                                      color: '#6b7280',
                                      background: 'rgba(255,255,255,0.02)',
                                      pointerEvents: 'none'
                                    } : {}}
                                  >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    {order.isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                                  </button>
                                )}
                                {isOrderEligibleForReturn(order) && (
                                  <button
                                    className="profile-order-btn profile-order-btn--return"
                                    onClick={() => setReturnRequestModal({
                                      orderId: order.id,
                                      orderCode: order.code,
                                      total: order.total
                                    })}
                                    title="Gửi yêu cầu đổi trả hàng hoặc hoàn tiền trong vòng 7 ngày"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu Trả hàng / Hoàn tiền
                                  </button>
                                )}
                                {(order.status === 'pending' || order.status === 'preparing') && (
                                  <button
                                    className="profile-order-btn profile-order-btn--cancel"
                                    onClick={() => {
                                      setCancelModal({
                                        orderId: order.id,
                                        orderCode: order.code,
                                        isPaid: order.payment_status === 'paid'
                                      });
                                      setCancelReason('');
                                      setCancelBankName('');
                                      setCancelAccountNumber('');
                                      setCancelAccountHolder('');
                                    }}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Hủy đơn
                                  </button>
                                )}
                                <button className="profile-order-btn profile-order-btn--detail" onClick={() => handleViewOrder(order.id)}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Xem chi tiết
                                </button>
                              </div>
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
                            onClick={() => navigate(`/product/${p.slug || p._id}`)}
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
                                if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return
                                try {
                                  const res = await fetch(API_URL + '/delivery-addresses/' + addr._id, {
                                    method: 'DELETE',
                                    credentials: 'include'
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success('Đã xóa địa chỉ thành công', { position: 'bottom-right' })
                                    fetchAddresses()
                                  } else {
                                    toast.error(data.message || 'Không thể xóa địa chỉ', { position: 'bottom-right' })
                                  }
                                } catch {
                                  toast.error('Lỗi kết nối server', { position: 'bottom-right' })
                                }
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
                  <div className="profile-card-title">
                    {isOtpMode ? 'ĐẶT LẠI MẬT KHẨU QUA OTP' : 'ĐỔI MẬT KHẨU'}
                  </div>

                  {!isOtpMode ? (
                    <>
                      <div className="profile-pw-intro">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span>Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự gồm chữ và số.</span>
                      </div>
                      <div className="profile-pw-form">
                        {[{field:'current',label:'Mật khẩu hiện tại',placeholder:'Nhập mật khẩu hiện tại'},{field:'newPw',label:'Mật khẩu mới',placeholder:'Nhập mật khẩu mới (tối thiểu 6 ký tự)'},{field:'confirm',label:'Xác nhận mật khẩu mới',placeholder:'Nhập lại mật khẩu mới'}].map(({field,label,placeholder}) => (
                          <div key={field} className="profile-form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label className="profile-form-label">{label}</label>
                              {field === 'current' && (
                                <button
                                  type="button"
                                  className="profile-pw-forgot-btn"
                                  onClick={handleRequestOtp}
                                  disabled={sendingOtp}
                                >
                                  {sendingOtp ? 'Đang gửi OTP...' : 'Quên mật khẩu?'}
                                </button>
                              )}
                            </div>
                            <div className="profile-pw-input-wrap">
                              <input
                                className={'profile-form-input' + (field==='confirm' && pwForm.confirm && pwForm.newPw!==pwForm.confirm?' profile-form-input--error':'')}
                                type={showPw[field] ? 'text' : 'password'} placeholder={placeholder}
                                value={pwForm[field]} onChange={e=>setPwForm({...pwForm,[field]:e.target.value})}
                              />
                              <button type="button" className="profile-pw-toggle" onClick={()=>setShowPw({...showPw,[field]:!showPw[field]})}>
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
                        <button type="button" className="profile-btn-cancel" onClick={()=>{setPwForm({current:'',newPw:'',confirm:''});setPwError('')}}>Huỷ</button>
                        <button type="button" className="profile-btn-save" onClick={handleChangePassword}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          Đổi mật khẩu
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* GIAO DIỆN NHẬP OTP XÁC THỰC */}
                      <div className="profile-otp-banner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <div>
                          <strong style={{ color: '#e2e8f0' }}>Mã OTP đã được gửi đến email!</strong>
                          <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-muted)' }}>
                            Vui lòng kiểm tra email <span style={{ color: '#d4ff00', fontWeight: 600 }}>{user?.email}</span> (kể cả thư rác/Spam) và nhập mã OTP 6 chữ số bên dưới.
                          </div>
                        </div>
                      </div>

                      <div className="profile-pw-form">
                        {/* OTP Field */}
                        <div className="profile-form-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="profile-form-label">Mã OTP (6 chữ số)</label>
                            <button
                              type="button"
                              className="profile-otp-resend-btn"
                              onClick={handleRequestOtp}
                              disabled={sendingOtp || otpCountdown > 0}
                            >
                              {otpCountdown > 0 ? `Gửi lại OTP (${otpCountdown}s)` : (sendingOtp ? 'Đang gửi...' : 'Gửi lại OTP')}
                            </button>
                          </div>
                          <div className="profile-pw-input-wrap">
                            <input
                              className="profile-form-input"
                              type="text"
                              name="profile_otp_code"
                              autoComplete="off"
                              maxLength="6"
                              placeholder="Nhập 6 chữ số mã OTP"
                              value={otpForm.otp}
                              onChange={e => setOtpForm({ ...otpForm, otp: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Mật khẩu mới */}
                        <div className="profile-form-group">
                          <label className="profile-form-label">Mật khẩu mới</label>
                          <div className="profile-pw-input-wrap">
                            <input
                              className="profile-form-input"
                              type={showOtpPw.newPw ? 'text' : 'password'}
                              name="profile_new_password"
                              autoComplete="new-password"
                              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                              value={otpForm.newPw}
                              onChange={e => setOtpForm({ ...otpForm, newPw: e.target.value })}
                            />
                            <button type="button" className="profile-pw-toggle" onClick={() => setShowOtpPw({ ...showOtpPw, newPw: !showOtpPw.newPw })}>
                              {showOtpPw.newPw ? <EyeOff/> : <EyeOn/>}
                            </button>
                          </div>
                          {otpForm.newPw && (
                            <div className="profile-pw-strength">
                              <div className={'profile-pw-strength-bar ' + (otpForm.newPw.length>=10?'strong':otpForm.newPw.length>=6?'medium':'weak')}/>
                              <span className={otpForm.newPw.length>=10?'strong':otpForm.newPw.length>=6?'medium':'weak'}>{otpForm.newPw.length>=10?'Mạnh':otpForm.newPw.length>=6?'Trung bình':'Yếu'}</span>
                            </div>
                          )}
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div className="profile-form-group">
                          <label className="profile-form-label">Xác nhận mật khẩu mới</label>
                          <div className="profile-pw-input-wrap">
                            <input
                              className={'profile-form-input' + (otpForm.confirm && otpForm.newPw !== otpForm.confirm ? ' profile-form-input--error' : '')}
                              type={showOtpPw.confirm ? 'text' : 'password'}
                              name="profile_confirm_password"
                              autoComplete="new-password"
                              placeholder="Nhập lại mật khẩu mới"
                              value={otpForm.confirm}
                              onChange={e => setOtpForm({ ...otpForm, confirm: e.target.value })}
                            />
                            <button type="button" className="profile-pw-toggle" onClick={() => setShowOtpPw({ ...showOtpPw, confirm: !showOtpPw.confirm })}>
                              {showOtpPw.confirm ? <EyeOff/> : <EyeOn/>}
                            </button>
                          </div>
                          {otpForm.confirm && otpForm.newPw !== otpForm.confirm && <span className="profile-form-error">Mật khẩu không khớp</span>}
                        </div>
                      </div>

                      {pwError && <div className="profile-alert profile-alert--error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{pwError}</div>}
                      {pwSuccess && <div className="profile-alert profile-alert--success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Đổi mật khẩu bằng OTP thành công!</div>}

                      <div className="profile-form-actions">
                        <button type="button" className="profile-btn-cancel" onClick={() => { setIsOtpMode(false); setPwError(''); }}>Quay lại</button>
                        <button type="button" className="profile-btn-save" onClick={handleResetPasswordWithOtp} disabled={resettingPw}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                          {resettingPw ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* VÍ VOUCHER */}
              {activeTab === 'voucher' && (
                <div className="profile-card">
                  <div className="profile-card-title">VÍ VOUCHER CỦA TÔI</div>
                  {vouchersLoading ? (
                    <div style={{ color: '#888', padding: '20px 0', textAlign: 'center' }}>Đang tải...</div>
                  ) : myVouchers.length === 0 ? (
                    <div style={{ color: '#666', padding: '20px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎟️</div>
                      <div>Chưa có voucher nào trong ví</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {myVouchers.map((uv, i) => {
                        const v = uv.voucher || uv.voucher_id || uv || {}
                        const now = new Date()
                        const endStr = v.endDate || v.end_day
                        const end = endStr ? new Date(endStr) : null
                        const isExpired = end && now > end
                        const isUsed = uv.is_used || uv.isUsed
                        const isPct = (v.discountType || v.discount_type) === 'percent'
                        const discountVal = v.discountValue || v.discount_value || 0
                        const minOrder = v.minOrderValue || v.min_order || 0

                        return (
                          <div key={uv.userVoucherId || uv._id || i} style={{
                            border: '1px solid', borderColor: isUsed || isExpired ? '#333' : '#d4ff00',
                            borderRadius: '10px', padding: '16px 20px', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                            background: isUsed || isExpired ? '#111' : 'rgba(212,255,0,0.03)',
                            opacity: isUsed || isExpired ? 0.6 : 1
                          }}>
                            <div>
                              <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: isUsed || isExpired ? '#666' : '#d4ff00' }}>
                                🎟 {v.code || 'N/A'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>
                                {isPct ? `Giảm ${discountVal}%` : `Giảm ${discountVal.toLocaleString('vi-VN')}đ`}
                                {minOrder > 0 && ` · Đơn tối thiểu ${minOrder.toLocaleString('vi-VN')}đ`}
                              </div>
                              {end && (
                                <div style={{ fontSize: '11px', color: isExpired ? '#ef4444' : '#888', marginTop: '2px' }}>
                                  Hạn sử dụng: {end.toLocaleDateString('vi-VN')}
                                </div>
                              )}
                            </div>
                            <span style={{
                              fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
                              background: isUsed ? 'rgba(100,100,100,0.2)' : isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(212,255,0,0.15)',
                              color: isUsed ? '#888' : isExpired ? '#ef4444' : '#d4ff00'
                            }}>
                              {isUsed ? 'Đã dùng' : isExpired ? 'Hết hạn' : 'Có thể dùng'}
                            </span>
                          </div>
                        )
                      })}

                    </div>
                  )}
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
                      <div className="profile-stat-value">{statsLoading ? '...' : stats.totalOrders}</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon spending"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg></div>
                      <div className="profile-stat-label">Tổng chi tiêu</div>
                      <div className="profile-stat-value small">{statsLoading ? '...' : formatPrice(stats.totalSpending)}</div>
                    </div>
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
                      <div className="profile-stat-label">Sản phẩm yêu thích</div>
                      <div className="profile-stat-value">{statsLoading ? '...' : stats.totalFavorites}</div>
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
