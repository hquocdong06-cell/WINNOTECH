import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, Eye, Edit, RefreshCw, FileText, Trash2, X, MessageSquare, Send, 
  Clock, CheckCircle2, Package, MapPin, CreditCard, User, Phone, Mail, 
  ChevronDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  RotateCcw, DollarSign, AlertCircle, Image as ImageIcon, ExternalLink, ArrowRight,
  Truck, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  fetchAdminOrders, fetchAdminOrderDetail, updateAdminOrderStatus, 
  updateAdminOrderPaymentStatus, addAdminOrderNote, deleteAdminOrder, 
  getOrderPdfUrl, reviewAdminReturnRequest, confirmAdminReturnedGoods, 
  API_BASE 
} from '../services/adminService';
import { getSocket } from '../../services/socket';

// ── Trạng thái đổi trả hàng (Return status labels) ──────────────────────────
const RETURN_STATUS_LABELS = {
  none: 'Không có',
  return_requested: 'Chờ duyệt trả hàng',
  return_approved: 'Đã duyệt trả hàng',
  return_rejected: 'Đã từ chối trả hàng',
  returning: 'Đang gửi trả hàng',
  returned_success: 'Đã nhận hàng hoàn'
};

// ── Canonical status labels ───────────────────────────────────────────────
const STATUS_LABELS = {
  pending:          'Chờ xác nhận',
  preparing:        'Đang chuẩn bị',
  shipping:         'Đang giao hàng',
  delivered:        'Đã giao hàng',
  completed:        'Hoàn thành',
  cancelled:        'Đã hủy',
  return_requested: 'Chờ duyệt trả hàng',
  return_approved:  'Đã duyệt trả hàng',
  returning:        'Đang gửi trả hàng',
  return_rejected:  'Từ chối trả hàng',
  refunded:         'Đã hoàn tiền',
  refund:           'Đã hoàn tiền',
  // Legacy aliases — chỉ dùng để hiển thị label cho data cũ:
  canceled:         'Đã hủy',
  handed_over:      'Đang giao hàng',
  handover:         'Đang giao hàng',
  shipped:          'Đang giao hàng',
  delivering:       'Đang giao hàng',
  done:             'Hoàn thành',
};

// Luồng 5 bước tuần tự — dùng cho stepper/progress bar
const STATUS_FLOW = ['pending', 'preparing', 'shipping', 'delivered', 'completed'];

// State Machine: Định nghĩa chính xác các bước chuyển đổi hợp lệ cho từng trạng thái
const ORDER_TRANSITIONS = {
  pending:          ['preparing', 'cancelled'],
  preparing:        ['shipping', 'cancelled'],
  shipping:         ['delivered'],
  delivered:        ['completed'],
  completed:        [],
  return_requested: ['return_approved', 'return_rejected', 'cancelled'],
  return_approved:  ['returning', 'refunded'],
  returning:        ['refunded'],
  return_rejected:  ['completed'],
  cancelled:        [],
  refunded:         []
};

// Helper: Xác định trạng thái hợp lệ tiếp theo (chỉ cho phép hoàn hàng khi khách yêu cầu và Admin duyệt)
const getOrderAllowedTransitions = (order) => {
  if (!order) return [];
  const status = normalizeOrderStatus(order.status);
  const retReq = order.return_request;
  const retStatus = retReq?.status;

  if (status === 'return_requested') {
    return ['return_approved', 'return_rejected', 'cancelled'];
  }
  if (status === 'return_approved') {
    return ['returning', 'refunded'];
  }
  if (status === 'returning') {
    return ['refunded'];
  }
  if (status === 'return_rejected') {
    return ['completed'];
  }

  if (status === 'pending') {
    return ['preparing', 'cancelled'];
  }
  if (status === 'preparing') {
    return ['shipping', 'cancelled'];
  }
  if (status === 'shipping') {
    return ['delivered'];
  }
  if (status === 'delivered') {
    return ['completed'];
  }
  if (status === 'completed') {
    // Chỉ cho phép chuyển sang các trạng thái hoàn hàng KHI khách hàng yêu cầu hoàn và Admin đã duyệt
    if (retStatus === 'return_approved') {
      return ['returning', 'refunded'];
    }
    if (retStatus === 'returning') {
      return ['refunded'];
    }
    if (retStatus === 'return_requested') {
      return ['return_approved', 'return_rejected'];
    }
    return [];
  }

  return [];
};

// Tất cả tùy chọn trạng thái cho Admin UI
const ALL_STATUS_OPTIONS = [
  { value: 'pending',          label: 'Chờ xác nhận' },
  { value: 'preparing',        label: 'Đang chuẩn bị hàng' },
  { value: 'shipping',         label: 'Đang giao hàng' },
  { value: 'delivered',        label: 'Đã giao hàng' },
  { value: 'completed',        label: 'Hoàn thành' },
  { value: 'return_requested', label: 'Chờ duyệt trả hàng' },
  { value: 'return_approved',  label: 'Đã duyệt trả hàng' },
  { value: 'returning',        label: 'Đang gửi trả hàng' },
  { value: 'refunded',         label: 'Đã hoàn tiền' },
  { value: 'cancelled',        label: 'Đã hủy' },
];

const fmtPrice = (n) => (n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

// Helper: normalize legacy status -> canonical
const normalizeOrderStatus = (s) => {
  if (!s) return 'pending';
  if (['handed_over', 'handover', 'shipped', 'delivering'].includes(s)) return 'shipping';
  if (s === 'done') return 'completed';
  if (s === 'canceled') return 'cancelled';
  if (s === 'refund' || s === 'refunded') return 'refunded';
  return s;
};

// Helper tính toán luồng tiến trình đơn hàng (cái dây này)
const getAdminOrderFlowData = (order) => {
  if (!order) return { steps: [], activeIndex: -1, isVisible: false };
  const norm = normalizeOrderStatus(order.status);
  const isRefunded = norm === 'refunded';
  const retStatus = order.return_request?.status;
  const isReturning = (retStatus && retStatus !== 'none') || ['return_requested', 'return_approved', 'returning', 'return_rejected', 'refunded'].includes(norm);

  if (norm === 'cancelled' || norm === 'delivery_fail') {
    return { steps: [], activeIndex: -1, isVisible: false };
  }

  if (isRefunded || isReturning) {
    let lastStepLabel = 'Hoàn tiền thành công';
    let isLastDone = false;

    if (isRefunded || retStatus === 'returned_success' || norm === 'refunded') {
      lastStepLabel = 'Hoàn tiền thành công';
      isLastDone = true;
    } else if (retStatus === 'returning' || norm === 'returning') {
      lastStepLabel = 'Đang gửi trả hàng';
    } else if (retStatus === 'return_approved' || norm === 'return_approved') {
      lastStepLabel = 'Đã duyệt trả hàng';
    } else if (retStatus === 'return_requested' || norm === 'return_requested') {
      lastStepLabel = 'Chờ duyệt trả hàng';
    } else if (retStatus === 'return_rejected' || norm === 'return_rejected') {
      lastStepLabel = 'Từ chối trả hàng';
    }

    const steps = [
      { key: 'pending',   label: 'Chờ xác nhận', status: 'done' },
      { key: 'preparing', label: 'Đang chuẩn bị', status: 'done' },
      { key: 'shipping',  label: 'Đang giao hàng', status: 'done' },
      { key: 'delivered', label: 'Đã giao hàng', status: 'done' },
      { key: 'return_step', label: lastStepLabel, status: isLastDone ? 'done' : 'active' }
    ];

    return { steps, activeIndex: 4, isCompleted: isLastDone, isVisible: true };
  }

  const canonicalSteps = ['pending', 'preparing', 'shipping', 'delivered', 'completed'];
  const currentIndex = canonicalSteps.indexOf(norm);
  if (currentIndex === -1) {
    return { steps: [], activeIndex: -1, isVisible: false };
  }

  const steps = canonicalSteps.map((key, idx) => ({
    key,
    label: STATUS_LABELS[key] || key,
    status: idx < currentIndex ? 'done' : idx === currentIndex ? 'active' : 'pending'
  }));

  return { steps, activeIndex: currentIndex, isCompleted: norm === 'completed', isVisible: true };
};

// ── Chip trạng thái ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const canonical = normalizeOrderStatus(status);
  const label = STATUS_LABELS[status] || STATUS_LABELS[canonical] || status;
  const cfg = {
    pending:          'bg-blue-500/10 text-blue-400 border-blue-500/30',
    preparing:        'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    shipping:         'bg-purple-500/10 text-purple-400 border-purple-500/30',
    delivered:        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    completed:        'bg-green-500/10 text-green-400 border-green-500/30',
    cancelled:        'bg-red-500/10 text-red-400 border-red-500/30',
    return_requested: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    return_approved:  'bg-blue-500/15 text-blue-300 border-blue-500/40',
    returning:        'bg-purple-500/15 text-purple-300 border-purple-500/40',
    return_rejected:  'bg-rose-500/15 text-rose-400 border-rose-500/40',
    refunded:         'bg-[#d4ff00]/15 text-[#d4ff00] border-[#d4ff00]/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${cfg[canonical] || cfg[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
      {label}
    </span>
  );
};

// ── Chip trạng thái thanh toán: ĐÚNG 3 TRẠNG THÁI DUY NHẤT ─────────────────────
const PaymentBadge = ({ payment_status }) => {
  if (payment_status === 'refunded') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap bg-[#d4ff00]/15 text-[#d4ff00] border-[#d4ff00]/30">
        ↩ Hoàn tiền thành công
      </span>
    );
  }
  const isPaid = payment_status === 'paid';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
      isPaid
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }`}>
      {isPaid ? '✔ Đã thanh toán' : '⧘ Chưa thanh toán'}
    </span>
  );
};

// ── MODAL CHI TIẾT ĐƠN HÀNG ─────────────────────────────────
const OrderDetailModal = ({ isOpen, onClose, orderId, onStatusUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Status update
  const [editStatus, setEditStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Payment status update
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Shipping info update
  const [shippingCarrier, setShippingCarrier] = useState('Giao Hàng Nhanh (GHN)');
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [estimatedDeliveryInput, setEstimatedDeliveryInput] = useState('');

  // Admin note
  const [noteInput, setNoteInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const handleAutoGenerateTracking = () => {
    let prefix = 'GHN';
    if (shippingCarrier.includes('GHTK') || shippingCarrier.includes('Tiết Kiệm')) prefix = 'GHTK';
    else if (shippingCarrier.includes('Viettel')) prefix = 'VTP';
    else if (shippingCarrier.includes('Shopee')) prefix = 'SPX';
    else if (shippingCarrier.includes('Hỏa')) prefix = 'EXP';

    const orderSuffix = (order?.code || (order?._id ? String(order._id).slice(-6) : '') || Math.random().toString(36).substring(2, 8)).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}${orderSuffix}${randomDigits}`;
    setTrackingCodeInput(code);
    toast.info(`Đã tạo mã vận đơn mẫu: ${code}`);
  };

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetchAdminOrderDetail(orderId);
      if (res.success) {
        const ordData = res.data;
        setOrder(ordData);
        const normStatus = normalizeOrderStatus(ordData.status);
        const allowedNext = ORDER_TRANSITIONS[normStatus] || [];
        // Tự động chọn bước tiếp theo hợp lệ nhất nếu có
        setEditStatus(allowedNext.length > 0 ? allowedNext[0] : normStatus);
        setEditPaymentStatus(ordData.payment_status || 'unpaid');
        setStatusNote('');
        setPaymentNote('');

        setShippingCarrier(ordData.shipping_carrier || 'Giao Hàng Nhanh (GHN)');
        setTrackingCodeInput(ordData.tracking_code || '');
        if (ordData.estimated_delivery) {
          try {
            setEstimatedDeliveryInput(new Date(ordData.estimated_delivery).toISOString().split('T')[0]);
          } catch {
            setEstimatedDeliveryInput('');
          }
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 3);
          setEstimatedDeliveryInput(d.toISOString().split('T')[0]);
        }
      }
    } catch (e) {
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) { setActiveTab('info'); load(); }
  }, [isOpen, orderId, load]);

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      const shippingData = {};
      if (editStatus === 'shipping' || trackingCodeInput || shippingCarrier || estimatedDeliveryInput) {
        if (shippingCarrier) shippingData.shipping_carrier = shippingCarrier;
        if (trackingCodeInput) shippingData.tracking_code = trackingCodeInput;
        if (estimatedDeliveryInput) shippingData.estimated_delivery = estimatedDeliveryInput;
      }
      const res = await updateAdminOrderStatus(orderId, editStatus, statusNote, undefined, shippingData);
      const msg = res?.message || 'Đã cập nhật trạng thái!';
      toast.success(msg);
      setStatusNote('');
      onStatusUpdated?.();
      await load();
    } catch (e) { toast.error(e.message || 'Cập nhật thất bại'); }
    setUpdatingStatus(false);
  };

  const handleUpdatePaymentStatus = async () => {
    setUpdatingPayment(true);
    try {
      const res = await updateAdminOrderPaymentStatus(orderId, editPaymentStatus, paymentNote);
      const msg = res?.message || 'Đã cập nhật trạng thái thanh toán!';
      toast.success(msg);
      setPaymentNote('');
      onStatusUpdated?.();
      await load();
    } catch (e) { toast.error(e.message || 'Cập nhật thất bại'); }
    setUpdatingPayment(false);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setAddingNote(true);
    try {
      await addAdminOrderNote(orderId, noteInput.trim());
      toast.success('Đã thêm ghi chú!');
      setNoteInput('');
      await load();
    } catch (e) { toast.error(e.message || 'Thêm ghi chú thất bại'); }
    setAddingNote(false);
  };

  if (!isOpen) return null;

  const flowData = getAdminOrderFlowData(order);
  const subtotal = (order?.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.Quantity || 1), 0);

  const tabs = [
    { key: 'info',    label: 'Thông tin', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'items',   label: 'Sản phẩm',  icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'history', label: 'Lịch sử',   icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'actions', label: 'Hành động', icon: <Edit className="w-3.5 h-3.5" /> },
    { key: 'notes',   label: 'Ghi chú',   icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0f0f19] border border-[#2a2a3d] rounded-2xl w-full max-w-4xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)] flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2d] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#d4ff00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Chi Tiết Đơn Hàng
                <span className="font-mono text-[#d4ff00] text-sm">#{order?.code || '...'}</span>
              </h2>
              <span className="text-xs text-gray-500">{fmtDate(order?.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {order && <StatusBadge status={order.status} />}
            {order && <PaymentBadge payment_status={order.payment_status} />}
            <button onClick={onClose} className="w-8 h-8 bg-[#1e1e2d] hover:bg-[#2a2a3d] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16 text-gray-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Đang tải...
          </div>
        ) : !order ? (
          <div className="flex-1 flex items-center justify-center py-16 text-gray-500">Không tìm thấy đơn hàng</div>
        ) : (
          <>
            {/* ── Tabs ── */}
            <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === t.key
                      ? 'bg-[#d4ff00] text-black'
                      : 'bg-[#1a1a27] text-gray-400 hover:text-white hover:bg-[#222234]'
                  }`}
                >
                  {t.icon} {t.label}
                  {t.key === 'notes' && (order.admin_notes?.length > 0) && (
                    <span className="ml-1 bg-black/30 rounded-full px-1.5 text-[10px]">{order.admin_notes.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {/* ── TAB: THÔNG TIN ── */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Status Flow Tracker */}
                  {flowData.isVisible && (
                    <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Tiến trình đơn hàng</div>
                      <div className="flex items-start gap-0">
                        {flowData.steps.map((step, idx) => {
                          const isDone = step.status === 'done';
                          const isActive = step.status === 'active';
                          return (
                            <div key={step.key} className="flex-1 flex flex-col items-center relative">
                              <div className="flex items-center w-full">
                                {idx > 0 && (
                                  <div className={`flex-1 h-0.5 -mt-0 ${idx <= flowData.activeIndex ? 'bg-[#d4ff00]' : 'bg-[#2a2a3d]'}`} />
                                )}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                                  isDone ? 'bg-[#d4ff00] border-[#d4ff00]' :
                                  isActive ? 'bg-[#d4ff00]/20 border-[#d4ff00]' :
                                  'bg-[#1a1a27] border-[#333]'
                                }`}>
                                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-black" /> :
                                   isActive ? <div className="w-2 h-2 rounded-full bg-[#d4ff00] animate-pulse" /> :
                                   <div className="w-1.5 h-1.5 rounded-full bg-[#444]" />}
                                </div>
                                {idx < flowData.steps.length - 1 && (
                                  <div className={`flex-1 h-0.5 ${idx < flowData.activeIndex ? 'bg-[#d4ff00]' : 'bg-[#2a2a3d]'}`} />
                                )}
                              </div>
                              <div className={`text-[9px] mt-2 text-center leading-tight px-1 ${isActive ? 'text-[#d4ff00] font-bold' : isDone ? 'text-gray-300' : 'text-gray-600'}`}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thông tin khách hàng */}
                    <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4 space-y-3">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Thông tin khách hàng
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d4ff00]/10 flex items-center justify-center text-[#d4ff00] font-bold text-sm">
                          {(order.Name || order.user_id?.name || 'K').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{order.Name || order.user_id?.name || 'Khách vãng lai'}</div>
                          <div className="text-xs text-gray-500">Khách hàng</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          {order.Phone || order.user_id?.phone || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          {order.user_id?.email || '—'}
                        </div>
                        <div className="flex items-start gap-2 text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                          {order.Adress || order.Address || '—'}
                        </div>
                        {order.note && (
                          <div className="pt-2.5 border-t border-[#222234]">
                            <span className="text-gray-400 font-medium">Ghi chú của khách hàng:</span>
                            <p className="text-amber-300 mt-1 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 text-xs italic leading-relaxed">
                              "{order.note}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thanh toán & Vận chuyển */}
                    <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4 space-y-3">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> Thanh toán & Vận chuyển
                      </div>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phương thức TT</span>
                          <span className="font-bold text-white">{order.payment_method?.name || 'COD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trạng thái TT</span>
                          <span className={`font-bold ${
                            order.payment_status === 'paid' ? 'text-green-400' :
                            order.payment_status === 'refunded' ? 'text-[#d4ff00]' : 'text-gray-400'
                          }`}>
                            {order.payment_status === 'paid' ? '✔ Đã thanh toán' :
                             order.payment_status === 'refunded' ? '↩ Hoàn tiền thành công' : '⧘ Chưa thanh toán'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Đơn vị VC</span>
                          <span className="text-white font-medium">{order.shipping_carrier || 'Chưa bàn giao'}</span>
                        </div>
                        {order.cancel_reason && (
                          <div className="pt-2 border-t border-[#222234]">
                            <span className="text-gray-500">Lý do hủy:</span>
                            <p className="text-red-400 mt-1 font-semibold">{order.cancel_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* THÔNG TIN TRẢ HÀNG NẾU CÓ */}
                  {order.return_request && order.return_request.status && order.return_request.status !== 'none' && (
                    <div className="bg-[#1b1528] border border-purple-500/30 rounded-xl p-4 space-y-2.5">
                      <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Yêu cầu đổi trả hàng</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          {RETURN_STATUS_LABELS[order.return_request.status] || order.return_request.status}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-gray-300">
                        <p><strong className="text-gray-400">Lý do:</strong> <span className="text-white font-semibold">{order.return_request.reason}</span></p>
                        {order.return_request.description && <p><strong className="text-gray-400">Mô tả chi tiết:</strong> {order.return_request.description}</p>}
                        {order.return_request.bank_info?.account_number && (
                          <p><strong className="text-gray-400">STK hoàn tiền:</strong> {order.return_request.bank_info.account_holder} — {order.return_request.bank_info.account_number} ({order.return_request.bank_info.bank_name})</p>
                        )}
                        {order.return_request.rejected_reason && (
                          <p className="text-rose-400"><strong>Lý do từ chối:</strong> {order.return_request.rejected_reason}</p>
                        )}
                        {order.return_request.admin_note && (
                          <p className="text-blue-300"><strong>Ghi chú Admin:</strong> {order.return_request.admin_note}</p>
                        )}
                        {order.return_request.images?.length > 0 && (
                          <div className="pt-2">
                            <span className="text-gray-400 block mb-1">Ảnh minh chứng:</span>
                            <div className="flex gap-2 flex-wrap">
                              {order.return_request.images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-[#444] hover:border-[#d4ff00]">
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Tổng tiền */}
                  <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tóm tắt giá trị đơn hàng</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-300">
                        <span>Tổng tiền hàng</span>
                        <span>{fmtPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Phí vận chuyển</span>
                        <span>{fmtPrice(order.shipping_fee || 0)}</span>
                      </div>
                      {order.voucher_value > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Giảm giá ({order.voucher_code})</span>
                          <span>-{fmtPrice(order.voucher_value)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-[#222234]">
                        <span className="text-white">TỔNG THANH TOÁN</span>
                        <span className="text-[#d4ff00]">{fmtPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: SẢN PHẨM ── */}
              {activeTab === 'items' && (
                <div className="space-y-3">
                  {(order.items || []).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Không có sản phẩm nào</div>
                  ) : (
                    (order.items || []).map((item, idx) => {
                      const variant = item.variant || {};
                      const product = item.product || {};
                      const imgs = item.images || [];
                      const mainImg = imgs.find(i => i.is_main) || imgs[0];
                      const imgSrc = mainImg?.url
                        ? (mainImg.url.startsWith('http') ? mainImg.url : `${API_BASE}${mainImg.url}`)
                        : (product.thumnail ? `${API_BASE}${product.thumnail}` : null);
                      return (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-[#13131e] border border-[#222234] rounded-xl">
                          <div className="w-14 h-14 rounded-xl bg-[#1a1a27] border border-[#2a2a3d] flex-shrink-0 overflow-hidden">
                            {imgSrc ? (
                              <img src={imgSrc} alt={product.name || ''} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm truncate">{product.name || 'Sản phẩm'}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {variant.variant_name || '—'} {variant.sku ? `· SKU: ${variant.sku}` : ''}
                            </div>
                            {variant.attributes?.length > 0 && (
                              <div className="text-xs text-gray-500 mt-0.5">{variant.attributes.join(' / ')}</div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 space-y-1">
                            <div className="text-xs text-gray-400">x{item.Quantity || 1}</div>
                            <div className="text-xs text-gray-400">{fmtPrice(item.price)}</div>
                            <div className="font-bold text-[#d4ff00] text-sm">{fmtPrice((item.price || 0) * (item.Quantity || 1))}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pt-3 border-t border-[#222234] px-1">
                    <span className="text-sm text-gray-400">{order.items?.length || 0} sản phẩm</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Tổng thanh toán</div>
                      <div className="text-xl font-black text-[#d4ff00]">{fmtPrice(order.total_amount)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: LỊCH SỬ TRẠNG THÁI ── */}
              {activeTab === 'history' && (
                <div>
                  {(!order.statusHistory || order.statusHistory.length === 0) ? (
                    <div className="text-center text-gray-500 py-8 text-sm">Chưa có lịch sử thay đổi trạng thái</div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-[18px] top-5 bottom-5 w-px bg-[#2a2a3d]" />
                      <div className="space-y-4">
                        {[...order.statusHistory].reverse().map((h, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="w-9 h-9 rounded-full bg-[#1a1a27] border-2 border-[#d4ff00]/40 flex items-center justify-center flex-shrink-0 z-10">
                              <div className="w-2 h-2 rounded-full bg-[#d4ff00]" />
                            </div>
                            <div className="flex-1 bg-[#13131e] border border-[#222234] rounded-xl p-3 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <StatusBadge status={h.status} />
                                <span className="text-[10px] text-gray-500">{fmtDate(h.changedAt)}</span>
                              </div>
                              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{h.changedBy || 'Hệ thống'}</span>
                              </div>
                              {h.note && (
                                <div className="mt-2 text-xs text-gray-300 bg-[#1a1a27] rounded-lg p-2 border border-[#2a2a3d]">
                                  💬 {h.note}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: HÀNH ĐỘNG ── */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  {/* Cập nhật trạng thái đơn hàng */}
                  <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Edit className="w-3.5 h-3.5" /> Cập nhật trạng thái đơn hàng (State Machine)
                    </div>
                    
                    {(() => {
                      const currStatus = normalizeOrderStatus(order.status);
                      const allowedNext = ORDER_TRANSITIONS[currStatus] || [];
                      const isFinalState = allowedNext.length === 0;

                      return (
                        <>
                          <div className="text-[11px] text-gray-400 mb-3 ml-0.5 flex flex-wrap items-center gap-2">
                            <span>Hiện tại:</span>
                            <StatusBadge status={order.status} />
                            {order.status === 'delivered' && order.payment_status !== 'paid' && (
                              <span className="text-amber-400 font-semibold">&#9888; Cần đã thanh toán để Hoàn thành</span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Chọn trạng thái mới:</label>
                              <select
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                                disabled={isFinalState}
                                className="w-full bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {ALL_STATUS_OPTIONS.map(opt => {
                                  const isCurrent = opt.value === currStatus;
                                  const isAllowed = allowedNext.includes(opt.value);
                                  return (
                                    <option
                                      key={opt.value}
                                      value={opt.value}
                                      disabled={!isAllowed && !isCurrent}
                                      className={isAllowed ? 'bg-[#13131e] text-white font-medium' : 'bg-[#1a1a27] text-gray-500'}
                                    >
                                      {opt.label} {isCurrent ? ' (Hiện tại)' : isAllowed ? ' (Hợp lệ)' : ' 🔒 (Không thể chọn)'}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Hướng dẫn State Machine */}
                            {isFinalState ? (
                              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                                🛑 Đơn hàng đã ở trạng thái kết thúc (<strong>{STATUS_LABELS[currStatus]}</strong>). Không thể chuyển trạng thái nữa.
                              </div>
                            ) : (
                              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
                                💡 Từ <strong>"{STATUS_LABELS[currStatus]}"</strong>, chỉ có thể chuyển sang:{' '}
                                <span className="font-bold text-[#d4ff00]">
                                  {allowedNext.map(s => STATUS_LABELS[s] || s).join(' hoặc ')}
                                </span>.
                              </div>
                            )}

                            {/* Khối nhập thông tin vận chuyển khi chuyển sang 'shipping' hoặc đang ở 'shipping' */}
                            {(editStatus === 'shipping' || currStatus === 'shipping') && !isFinalState && (
                              <div className="p-3.5 bg-[#171726] border border-[#d4ff00]/30 rounded-xl space-y-3">
                                <div className="text-xs font-semibold text-[#d4ff00] uppercase tracking-wider flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5" /> Thông tin Vận chuyển & Giao hàng
                                </div>

                                {/* Đơn vị vận chuyển */}
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1 font-medium">Đơn vị vận chuyển (ĐVVC):</label>
                                  <select
                                    value={shippingCarrier}
                                    onChange={e => setShippingCarrier(e.target.value)}
                                    className="w-full bg-[#11111a] border border-[#2a2a3d] text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00]"
                                  >
                                    <option value="Giao Hàng Nhanh (GHN)">Giao Hàng Nhanh (GHN)</option>
                                    <option value="Giao Hàng Tiết Kiệm (GHTK)">Giao Hàng Tiết Kiệm (GHTK)</option>
                                    <option value="Viettel Post">Viettel Post</option>
                                    <option value="Shopee Xpress (SPX)">Shopee Xpress (SPX)</option>
                                    <option value="Hỏa tốc (Grab / AhaMove)">Hỏa tốc (Grab / AhaMove)</option>
                                  </select>
                                </div>

                                {/* Mã vận đơn */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-gray-400 font-medium">Mã vận đơn:</label>
                                    <button
                                      type="button"
                                      onClick={handleAutoGenerateTracking}
                                      className="text-[11px] text-[#d4ff00] hover:underline flex items-center gap-1 font-semibold"
                                    >
                                      <Sparkles className="w-3 h-3" /> Tự tạo mã mẫu
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={trackingCodeInput}
                                    onChange={e => setTrackingCodeInput(e.target.value)}
                                    placeholder="VD: GHN94101551 (để trống sẽ tự sinh mã)"
                                    className="w-full bg-[#11111a] border border-[#2a2a3d] text-white font-mono rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] placeholder-gray-600"
                                  />
                                </div>

                                {/* Ngày dự kiến giao */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-gray-400 font-medium">Ngày dự kiến giao:</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + 3);
                                        setEstimatedDeliveryInput(d.toISOString().split('T')[0]);
                                      }}
                                      className="text-[11px] text-[#d4ff00]/80 hover:text-[#d4ff00]"
                                    >
                                      +3 ngày tới
                                    </button>
                                  </div>
                                  <input
                                    type="date"
                                    value={estimatedDeliveryInput}
                                    onChange={e => setEstimatedDeliveryInput(e.target.value)}
                                    className="w-full bg-[#11111a] border border-[#2a2a3d] text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00]"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs text-gray-500 mb-1.5">Ghi chú (hiển thị trong lịch sử)</label>
                              <input
                                type="text"
                                value={statusNote}
                                onChange={e => setStatusNote(e.target.value)}
                                disabled={isFinalState}
                                placeholder="VD: Đã bàn giao đơn vị vận chuyển GHN..."
                                className="w-full bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] placeholder-gray-600 disabled:opacity-50"
                              />
                            </div>

                            {(() => {
                              const isShippingInfoChanged = (
                                trackingCodeInput !== (order.tracking_code || '') ||
                                shippingCarrier !== (order.shipping_carrier || 'Giao Hàng Nhanh (GHN)') ||
                                estimatedDeliveryInput !== (order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '')
                              );
                              const isStatusValidChange = (editStatus !== currStatus && allowedNext.includes(editStatus));
                              const canSave = !isFinalState && (isStatusValidChange || isShippingInfoChanged);

                              return (
                                <button
                                  onClick={handleUpdateStatus}
                                  disabled={updatingStatus || !canSave}
                                  className="w-full py-2.5 bg-[#d4ff00] hover:bg-[#bce600] disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl text-sm transition-colors"
                                >
                                  {updatingStatus ? 'Đang lưu...' : 
                                   isFinalState ? 'Trạng thái kết thúc' : 
                                   isStatusValidChange ? 'Lưu thay đổi trạng thái' : 
                                   isShippingInfoChanged ? 'Lưu thông tin vận chuyển' : 'Chọn trạng thái tiếp theo để cập nhật'}
                                </button>
                              );
                            })()}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Cập nhật trạng thái thanh toán — mục mới độc lập */}
                  <div className="bg-[#13131e] border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Cập nhật trạng thái thanh toán</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mb-3 ml-0.5 flex items-center gap-2">
                      Hiện tại: <PaymentBadge payment_status={order.payment_status} />
                      {order.status === 'delivered' && order.payment_status !== 'paid' && (
                        <span className="text-emerald-400">&#x2192; Xác nhận đã TT để tự động Hoàn thành</span>
                      )}
                    </div>
                    {(order.payment_status === 'paid' || order.payment_status === 'refunded') ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Đơn hàng đã {order.payment_status === 'paid' ? 'thanh toán' : 'hoàn tiền'} thành công. Trạng thái thanh toán đã được cố định và không thể thay đổi.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Trạng thái thanh toán</label>
                          <select
                            value={editPaymentStatus}
                            onChange={e => setEditPaymentStatus(e.target.value)}
                            className="w-full bg-[#1a1a27] border border-emerald-500/30 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                          >
                            <option value="unpaid" className="bg-[#13131e]">Chưa thanh toán</option>
                            <option value="paid" className="bg-[#13131e]">Đã thanh toán</option>
                            <option value="refunded" className="bg-[#13131e]">Hoàn tiền thành công</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">Ghi chú (tùy chọn)</label>
                          <input
                            type="text"
                            value={paymentNote}
                            onChange={e => setPaymentNote(e.target.value)}
                            placeholder="VD: Khách đã chuyển khoản..."
                            className="w-full bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 placeholder-gray-600"
                          />
                        </div>
                        <button
                          onClick={handleUpdatePaymentStatus}
                          disabled={updatingPayment || editPaymentStatus === (order.payment_status || 'unpaid')}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-sm transition-colors"
                        >
                          {updatingPayment ? 'Đang lưu...' :
                            editPaymentStatus === (order.payment_status || 'unpaid') ? 'Chọn trạng thái khác để cập nhật' :
                            'Lưu trạng thái thanh toán'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Các nút nhanh */}
                  <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Thao tác nhanh</div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={getOrderPdfUrl(order._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a27] hover:bg-[#222234] border border-[#2a2a3d] hover:border-[#d4ff00]/50 rounded-xl text-xs font-semibold text-white transition-all"
                      >
                        <FileText className="w-4 h-4 text-[#d4ff00]" /> In hóa đơn PDF
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: GHI CHÚ NỘI BỘ ── */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {/* Ghi chú từ khách hàng */}
                  {order.note && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Ghi chú từ khách hàng
                      </div>
                      <p className="text-sm text-amber-200 leading-relaxed italic">
                        "{order.note}"
                      </p>
                    </div>
                  )}

                  {/* Nhập ghi chú mới */}
                  <div className="bg-[#13131e] border border-[#d4ff00]/20 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#d4ff00]" /> Thêm ghi chú nội bộ
                      <span className="text-[10px] text-gray-600 normal-case ml-1">(chỉ admin xem)</span>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={noteInput}
                        onChange={e => setNoteInput(e.target.value)}
                        placeholder="Nhập ghi chú nội bộ (kiểm tra hàng, liên hệ khách, vv.)..."
                        rows={2}
                        className="flex-1 bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] placeholder-gray-600 resize-none"
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddNote(); }}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={addingNote || !noteInput.trim()}
                        className="px-4 bg-[#d4ff00] hover:bg-[#bce600] disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl transition-colors flex items-center gap-1.5 text-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {addingNote ? '...' : 'Gửi'}
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1.5 ml-1">Ctrl+Enter để gửi nhanh</div>
                  </div>

                  {/* Danh sách ghi chú */}
                  {(!order.admin_notes || order.admin_notes.length === 0) ? (
                    <div className="text-center text-gray-600 py-8 text-sm">Chưa có ghi chú nào</div>
                  ) : (
                    <div className="space-y-3">
                      {[...order.admin_notes].reverse().map((note, idx) => (
                        <div key={idx} className="bg-[#13131e] border border-[#222234] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <div className="w-5 h-5 rounded-full bg-[#d4ff00]/10 flex items-center justify-center text-[#d4ff00] text-[10px] font-bold">
                                {(note.author || 'A').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-300">{note.author || 'Admin'}</span>
                            </div>
                            <span className="text-[10px] text-gray-600">{fmtDate(note.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#1e1e2d] flex-shrink-0">
          <div className="text-xs text-gray-600">
            {order ? `ID: ${order._id}` : ''}
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-[#1a1a27] hover:bg-[#222234] border border-[#2a2a3d] text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MODAL CẬP NHẬT TRẠNG THÁI (giữ lại từ bảng) ─────────────
const OrderStatusModal = ({ isOpen, onClose, order, onSuccess }) => {
  const currStatus = useMemo(() => normalizeOrderStatus(order?.status), [order?.status]);
  const currPaymentStatus = order?.payment_status || 'unpaid';

  const [status, setStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const allowedNext = useMemo(() => getOrderAllowedTransitions(order), [order]);
  const isFinalState = allowedNext.length === 0;
  const canRefundPayment = allowedNext.includes('refunded') || currStatus === 'refunded' || currPaymentStatus === 'refunded';

  useEffect(() => {
    if (order) {
      const norm = normalizeOrderStatus(order.status);
      setStatus(norm);
      setPaymentStatus(order.payment_status || 'unpaid');
      setNote('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const hasStatusChange = status !== currStatus && allowedNext.includes(status);
  const hasPaymentChange = paymentStatus !== currPaymentStatus;
  const canSave = !loading && (hasStatusChange || hasPaymentChange);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateAdminOrderStatus(
        order.id,
        hasStatusChange ? status : undefined,
        note,
        hasPaymentChange ? paymentStatus : undefined
      );
      toast.success(res?.message || 'Cập nhật thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1c1c28] border border-[#3b3b4f] rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
        <h3 className="text-xl font-bold mb-2 text-white">Cập Nhật Trạng Thái Đơn Hàng</h3>
        <div className="text-xs text-gray-300 mb-4 flex flex-wrap items-center gap-2">
          <span>Mã đơn: <strong className="font-mono text-[#d4ff00]">#{order.code}</strong></span>
          <span>• Trạng thái:</span>
          <StatusBadge status={order.status} />
          <span>• Thanh toán:</span>
          <PaymentBadge payment_status={currPaymentStatus} />
        </div>

        {/* ── CẬP NHẬT TRẠNG THÁI THANH TOÁN (3 TRẠNG THÁI DUY NHẤT) ── */}
        <div className="mb-4 bg-[#14141f] border border-[#2d2d42] rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Trạng thái thanh toán:
            </label>
            <span className="text-[11px] text-gray-400">
              Hiện tại:{' '}
              <strong className={
                currPaymentStatus === 'paid'
                  ? 'text-emerald-400 font-bold'
                  : currPaymentStatus === 'refunded'
                    ? 'text-[#d4ff00] font-bold'
                    : 'text-amber-400 font-bold'
              }>
                {currPaymentStatus === 'paid'
                  ? 'Đã thanh toán'
                  : currPaymentStatus === 'refunded'
                    ? 'Hoàn tiền thành công'
                    : 'Chưa thanh toán'}
              </strong>
            </span>
          </div>

          {(currPaymentStatus === 'paid' || currPaymentStatus === 'refunded') ? (
            <div className="p-3 rounded-xl bg-[#1a1a28] border border-[#3b3b4f] text-gray-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Trạng thái thanh toán:{' '}
                <strong className={currPaymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-[#d4ff00] font-bold'}>
                  {currPaymentStatus === 'paid' ? 'Đã thanh toán' : 'Hoàn tiền thành công'}
                </strong>{' '}
                (Đã cố định, không thể thay đổi).
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('unpaid')}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  paymentStatus === 'unpaid'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
                    : 'bg-[#222233] text-gray-400 border-[#38384d] hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                <span>⧘</span> Chưa thanh toán
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('paid')}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  paymentStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40'
                    : 'bg-[#222233] text-gray-400 border-[#38384d] hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                <span>✔</span> Đã thanh toán
              </button>
              <button
                type="button"
                disabled={!canRefundPayment}
                onClick={() => {
                  if (canRefundPayment) {
                    setPaymentStatus('refunded');
                    if (allowedNext.includes('refunded')) {
                      setStatus('refunded');
                    }
                  }
                }}
                title={canRefundPayment ? 'Chuyển sang Đã hoàn tiền' : 'Chỉ có thể hoàn tiền khi khách hàng yêu cầu hoàn và Admin đã duyệt'}
                className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                  !canRefundPayment
                    ? 'bg-[#1a1a24] text-gray-600 border-[#2b2b3b] cursor-not-allowed opacity-40'
                    : paymentStatus === 'refunded'
                      ? 'bg-[#d4ff00]/20 text-[#d4ff00] border-[#d4ff00] shadow-[0_0_12px_rgba(212,255,0,0.25)] ring-1 ring-[#d4ff00]/40 cursor-pointer'
                      : 'bg-[#222233] text-gray-400 border-[#38384d] hover:border-gray-500 hover:text-gray-200 cursor-pointer'
                }`}
              >
                <span>↩</span> Đã hoàn tiền
              </button>
            </div>
          )}

          {hasPaymentChange && (
            <div className="mt-2.5 text-[11px] text-gray-300 flex items-center gap-1.5">
              <span className="text-[#d4ff00]">●</span>
              Sẽ chuyển sang:{' '}
              <strong className={
                paymentStatus === 'paid'
                  ? 'text-emerald-400 font-bold'
                  : paymentStatus === 'refunded'
                    ? 'text-[#d4ff00] font-bold'
                    : 'text-amber-400 font-bold'
              }>
                {paymentStatus === 'paid'
                  ? '✔ Đã thanh toán'
                  : paymentStatus === 'refunded'
                    ? '↩ Hoàn tiền thành công'
                    : '⧘ Chưa thanh toán'}
              </strong>
            </div>
          )}

          {currStatus === 'delivered' && paymentStatus === 'paid' && (
            <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 leading-snug">
              ✨ Đơn hàng đã giao. Khi lưu với trạng thái <strong>Đã thanh toán</strong>, hệ thống sẽ tự động hoàn thành đơn hàng!
            </div>
          )}
        </div>

        {/* ── CẬP NHẬT TRẠNG THÁI TIẾN TRÌNH ── */}
        <label className="block text-xs font-semibold text-gray-300 mb-2">Chọn trạng thái tiếp theo:</label>
        <select
          value={status}
          onChange={e => {
            const val = e.target.value;
            setStatus(val);
            if (val === 'refunded') {
              setPaymentStatus('refunded');
            }
          }}
          disabled={isFinalState}
          className="w-full bg-[#252536] text-white border border-[#44445e] font-semibold text-sm rounded-xl px-4 py-3 outline-none focus:border-[#d4ff00] mb-3 cursor-pointer disabled:opacity-50"
        >
          {ALL_STATUS_OPTIONS.map(opt => {
            const isCurrent = opt.value === currStatus;
            const isAllowed = allowedNext.includes(opt.value);
            const isReturnState = ['return_requested', 'return_approved', 'returning', 'refunded'].includes(opt.value);
            let lockLabel = '🔒 (Không thể chọn)';
            if (!isAllowed && isReturnState) {
              lockLabel = '🔒 (Cần khách yêu cầu & Admin duyệt)';
            }
            return (
              <option
                key={opt.value}
                value={opt.value}
                disabled={!isAllowed && !isCurrent}
                className={isAllowed ? 'bg-[#1c1c28] text-white font-medium' : 'bg-[#252536] text-gray-500'}
              >
                {opt.label} {isCurrent ? ' (Hiện tại)' : isAllowed ? ' (Hợp lệ)' : ` ${lockLabel}`}
              </option>
            );
          })}
        </select>

        {isFinalState ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 mb-4 leading-relaxed">
            🛑 Đơn hàng đang ở trạng thái <strong>{STATUS_LABELS[currStatus] || currStatus}</strong>.
            {currStatus === 'completed' && (
              <span className="block mt-1 text-gray-300">
                💡 Chỉ khi khách hàng gửi yêu cầu đổi trả và Admin duyệt thì mới được phép chuyển sang các trạng thái hoàn hàng.
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 mb-4 leading-relaxed">
            💡 Trạng thái hợp lệ tiếp theo: <strong className="text-[#d4ff00]">{allowedNext.map(s => STATUS_LABELS[s] || s).join(' hoặc ')}</strong>.
          </div>
        )}

        <label className="block text-xs font-semibold text-gray-300 mb-2">Ghi chú (tùy chọn):</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Thêm ghi chú vào lịch sử..."
          className="w-full bg-[#252536] text-white border border-[#44445e] text-sm rounded-xl px-4 py-3 outline-none focus:border-[#d4ff00] mb-6 placeholder-gray-600"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-[#2b2b3b] border border-[#444] rounded-xl text-xs font-semibold text-gray-200 hover:bg-[#38384d] transition-colors cursor-pointer">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-xl text-xs transition-colors shadow-[0_0_12px_rgba(212,255,0,0.3)] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── RETURN REVIEW MODAL ──────────────────────────────────────
const ReturnReviewModal = ({ order, onClose, onSuccess }) => {
  const [action, setAction] = useState('approve');
  const [rejectedReason, setRejectedReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!order) return null;
  const returnReq = order.rawOrder?.return_request || order.return_request || {};
  const currentRetStatus = returnReq.status || order.status;
  const isRequested = currentRetStatus === 'return_requested' || order.status === 'return_requested';
  const isApproved = currentRetStatus === 'return_approved' || order.status === 'return_approved';
  const isReturning = currentRetStatus === 'returning' || order.status === 'returning';
  const isDone = currentRetStatus === 'returned_success' || order.status === 'refunded';

  const handleReview = async () => {
    if (action === 'reject' && !rejectedReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối yêu cầu trả hàng');
      return;
    }
    setLoading(true);
    try {
      const res = await reviewAdminReturnRequest(order.id, action, rejectedReason, adminNote);
      toast.success(res?.message || (action === 'approve' ? 'Đã duyệt yêu cầu trả hàng' : 'Đã từ chối yêu cầu trả hàng'));
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi duyệt yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleShipReturning = async () => {
    setLoading(true);
    try {
      const res = await reviewAdminReturnRequest(order.id, 'returning');
      toast.success(res?.message || 'Đã chuyển trạng thái sang Đang gửi trả hàng');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveGoods = async () => {
    if (!window.confirm('Xác nhận đã nhận được hàng trả về kho? Hệ thống sẽ tự động hoàn lại tồn kho, cập nhật trạng thái đơn sang "Đã hoàn tiền" và tự động hoàn tiền vào số dư (cột money) của khách hàng.')) return;
    setLoading(true);
    try {
      const res = await confirmAdminReturnedGoods(order.id);
      toast.success(res?.message || 'Đã xác nhận nhận hàng, hoàn lại tồn kho và hoàn tiền vào số dư thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Lỗi xác nhận nhận hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#181824] border border-[#2e2e42] rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#2e2e42] mb-5">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white">Xử Lý Đổi Trả & Hoàn Tiền</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-[#12121c] border border-[#222234] rounded-xl p-4 mb-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Mã đơn hàng:</span>
            <span className="text-[#d4ff00] font-mono font-bold">#{order.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Khách hàng:</span>
            <span className="text-white font-semibold">{order.customer} ({order.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tổng giá trị đơn:</span>
            <span className="text-[#d4ff00] font-bold">{fmtPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trạng thái đổi trả hiện tại:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300">
              {RETURN_STATUS_LABELS[returnReq.status] || RETURN_STATUS_LABELS[order.status] || 'Đổi trả'}
            </span>
          </div>
        </div>

        {/* Chi tiết yêu cầu từ khách */}
        <div className="bg-[#1c1c2b] border border-purple-500/30 rounded-xl p-4 mb-4 text-xs space-y-2.5">
          <div>
            <span className="text-gray-400 block mb-0.5">Lý do khách hàng yêu cầu:</span>
            <span className="text-red-300 font-semibold">{returnReq.reason || '—'}</span>
          </div>
          {returnReq.description && (
            <div>
              <span className="text-gray-400 block mb-0.5">Mô tả chi tiết từ khách:</span>
              <p className="text-gray-200 bg-[#14141f] p-2.5 rounded-lg border border-[#2a2a3e]">{returnReq.description}</p>
            </div>
          )}

          {returnReq.images?.length > 0 && (
            <div className="pt-2 border-t border-[#2e2e44]">
              <span className="text-gray-400 block mb-1.5 font-semibold">Ảnh minh chứng từ khách:</span>
              <div className="flex gap-2.5 flex-wrap">
                {returnReq.images.map((img, idx) => (
                  <button key={idx} type="button" onClick={() => setSelectedImage(img)} className="group relative w-16 h-16 rounded-lg overflow-hidden border border-[#444] hover:border-[#d4ff00] transition-colors cursor-pointer">
                    <img src={img} alt="evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {returnReq.rejected_reason && (
            <div className="pt-2 border-t border-red-500/20 text-rose-400">
              <strong>Đã từ chối với lý do:</strong> {returnReq.rejected_reason}
            </div>
          )}
          {returnReq.admin_note && (
            <div className="pt-2 border-t border-blue-500/20 text-blue-300">
              <strong>Ghi chú duyệt của Admin:</strong> {returnReq.admin_note}
            </div>
          )}
        </div>

        {/* Modal phóng to ảnh */}
        {selectedImage && (
          <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-3xl max-h-[85vh]">
              <img src={selectedImage} alt="Large evidence" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Bước 1: Hành động xét duyệt khi đang chờ duyệt */}
        {isRequested && (
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${action === 'approve' ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-[#222234] text-gray-400 hover:bg-[#2c2c42]'}`}
              >
                ✔ Chấp thuận đổi trả
              </button>
              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${action === 'reject' ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-[#222234] text-gray-400 hover:bg-[#2c2c42]'}`}
              >
                ✕ Từ chối yêu cầu
              </button>
            </div>

            {action === 'approve' ? (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Ghi chú / Hướng dẫn gửi trả hàng cho khách:</label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Nhập hướng dẫn gửi hàng về cửa hàng hoặc lưu ý cho khách..."
                  className="w-full bg-[#14141f] border border-[#2e2e42] rounded-xl p-3 text-xs text-white outline-none focus:border-[#d4ff00]"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-rose-400 block mb-1 font-semibold">Lý do từ chối đổi trả (*bắt buộc):</label>
                <textarea
                  rows={2}
                  value={rejectedReason}
                  onChange={e => setRejectedReason(e.target.value)}
                  placeholder="Nhập lý do không chấp nhận yêu cầu..."
                  className="w-full bg-[#14141f] border border-rose-500/40 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={onClose} className="px-4 py-2 border border-[#3a3a4e] bg-[#222234] text-gray-300 hover:text-white hover:border-gray-400 hover:bg-[#2c2c3e] rounded-xl text-xs transition-all cursor-pointer">
                Hủy
              </button>
              <button
                onClick={handleReview}
                disabled={loading}
                className="px-5 py-2 bg-[#d4ff00] text-black font-bold rounded-xl text-xs hover:bg-[#c2eb00] disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(212,255,0,0.3)]"
              >
                {loading ? 'Đang lưu...' : 'Xác nhận xét duyệt'}
              </button>
            </div>
          </div>
        )}

        {/* Bước 2: Thao tác khi đã duyệt trả hàng */}
        {isApproved && (
          <div className="pt-3 border-t border-[#2e2e42] space-y-3">
            <p className="text-xs text-gray-300 leading-relaxed">
              💡 Đơn hàng đã được duyệt trả. Bạn có thể cập nhật trạng thái khi khách gửi hàng hoặc xác nhận khi kiện hàng đã về tới kho:
            </p>
            <div className="flex flex-wrap gap-2.5 justify-end">
              <button
                type="button"
                onClick={handleShipReturning}
                disabled={loading}
                className="px-4 py-2 bg-[#222234] hover:bg-[#2c2c40] text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                🚚 Xác nhận khách đang gửi hàng
              </button>
              <button
                type="button"
                onClick={handleReceiveGoods}
                disabled={loading}
                className="px-4 py-2 bg-[#d4ff00] hover:bg-[#c2eb00] text-black font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
              >
                {loading ? 'Đang xử lý...' : '📦 Xác nhận hàng về kho & Hoàn tiền'}
              </button>
            </div>
          </div>
        )}

        {/* Bước 3: Thao tác khi khách đang gửi hàng hoàn */}
        {isReturning && (
          <div className="pt-3 border-t border-[#2e2e42] space-y-3">
            <p className="text-xs text-gray-300 leading-relaxed">
              🚚 Kiện hàng đang trên đường gửi về cửa hàng. Khi nhận được hàng tại kho, bấm xác nhận để hệ thống tự động hoàn tiền vào số dư (cột <strong>money</strong>) của khách hàng:
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReceiveGoods}
                disabled={loading}
                className="px-5 py-2.5 bg-[#d4ff00] hover:bg-[#c2eb00] text-black font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
              >
                {loading ? 'Đang xử lý...' : '📦 Xác nhận hàng về kho & Hoàn tiền'}
              </button>
            </div>
          </div>
        )}

        {/* Bước 4: Thông báo hoàn tất */}
        {isDone && (
          <div className="pt-3 border-t border-[#2e2e42]">
            <div className="p-3 bg-[#d4ff00]/10 border border-[#d4ff00]/30 rounded-xl text-xs text-[#d4ff00] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4ff00]" />
              Hàng đã về kho và hệ thống đã hoàn tiền thành công vào số dư tài khoản khách hàng.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ──────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterReturnStatus, setFilterReturnStatus] = useState('all');
  const [counts, setCounts] = useState({});
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [openPaymentMenuId, setOpenPaymentMenuId] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null); // cho detail modal
  const [selectedOrderEdit, setSelectedOrderEdit] = useState(null); // cho status modal
  const [returnReviewModalOrder, setReturnReviewModalOrder] = useState(null); // cho return review modal

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset về trang 1 khi thay đổi tìm kiếm hoặc bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterPaymentStatus, filterReturnStatus]);

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    try {
      const data = await fetchAdminOrders();
      if (data.success) {
        const mapped = (data.data || []).map(o => ({
          id: o._id,
          code: o.code || o._id?.slice(-8).toUpperCase(),
          customer: o.Name || o.user_id?.name || 'Khách vãng lai',
          phone: o.Phone || o.user_id?.phone || '—',
          total: o.total_amount || 0,
          status: normalizeOrderStatus(o.status),  // normalize legacy
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—',
          payment_method: o.payment_method,
          payment_status: o.payment_status || 'unpaid',
          note: o.note || '',
          return_request: o.return_request,
          refund_info: o.refund_info,
          cancel_reason: o.cancel_reason,
          itemCount: (o.items || []).length,
          rawOrder: o,
        }));
        setOrders(mapped);
        // Tính counts theo canonical status
        const c = {};
        mapped.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
        setCounts(c);
      }
    } catch (err) {
      if (showLoading) setError(err.message || 'Không thể tải đơn hàng');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Đồng bộ đơn hàng thời gian thực qua Socket.io ──
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:admin');

    const handleOrderSync = (payload) => {
      console.log('⚡ [Admin Orders] Đồng bộ đơn hàng Socket:', payload);
      fetchOrders(false);
    };

    socket.on('order:updated', handleOrderSync);
    socket.on('order:change', handleOrderSync);

    return () => {
      socket.off('order:updated', handleOrderSync);
      socket.off('order:change', handleOrderSync);
    };
  }, [fetchOrders]);

  // Đóng dropdown thanh toán khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = () => setOpenPaymentMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Cập nhật nhanh trạng thái thanh toán từ bảng
  const handleQuickUpdatePayment = async (orderId, newPaymentStatus) => {
    setOpenPaymentMenuId(null);

    // Kiểm tra khóa trạng thái thanh toán
    const target = orders.find(o => o.id === orderId || o._id === orderId);
    if (target && (target.payment_status === 'paid' || target.payment_status === 'refunded')) {
      toast.warning(`Đơn hàng đã ${target.payment_status === 'paid' ? 'thanh toán' : 'hoàn tiền'} thành công, không thể thay đổi trạng thái.`);
      return;
    }

    setUpdatingPaymentId(orderId);
    try {
      const res = await updateAdminOrderPaymentStatus(orderId, newPaymentStatus, 'Cập nhật nhanh từ bảng đơn hàng');
      toast.success(res?.message || 'Cập nhật trạng thái thanh toán thành công!');
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Cập nhật thanh toán thất bại');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Bạn có chắc muốn HỦY ĐƠN HÀNG #${order.code}?`)) return;
    try {
      await deleteAdminOrder(order.id);
      toast.success('Hủy đơn hàng thành công!');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Lỗi hủy đơn');
    }
  };

  const paidCount = useMemo(() => orders.filter(o => o.payment_status === 'paid').length, [orders]);
  const unpaidCount = useMemo(() => orders.filter(o => o.payment_status === 'unpaid').length, [orders]);
  const refundPendingCount = useMemo(() => orders.filter(o => o.payment_status === 'refund_pending').length, [orders]);
  const refundedCount = useMemo(() => orders.filter(o => o.payment_status === 'refunded').length, [orders]);
  const returnRequestedCount = useMemo(() => orders.filter(o => o.return_request && o.return_request.status === 'return_requested').length, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone?.includes(searchQuery);
      // Filter theo canonical status
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      // Filter theo trạng thái thanh toán
      const matchPayment = filterPaymentStatus === 'all' || order.payment_status === filterPaymentStatus;
      // Filter theo trạng thái trả hàng
      const matchReturn = filterReturnStatus === 'all' ||
        (filterReturnStatus === 'has_return'
          ? (order.return_request && order.return_request.status && order.return_request.status !== 'none')
          : (order.return_request?.status === filterReturnStatus));

      return matchSearch && matchStatus && matchPayment && matchReturn;
    });
  }, [orders, searchQuery, filterStatus, filterPaymentStatus, filterReturnStatus]);

  // Logic phân trang
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  // Tạo danh sách số trang hiển thị
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-400 text-sm">Dữ liệu thời gian thực — Tổng: <strong>{orders.length}</strong> đơn</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">{error}</div>
      )}

      {/* Thống kê nhanh — canonical statuses + refund */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4">
        <button
          onClick={() => { setFilterStatus('all'); setFilterPaymentStatus('all'); setFilterReturnStatus('all'); }}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${filterStatus === 'all' && filterPaymentStatus === 'all' && filterReturnStatus === 'all' ? 'border-[#d4ff00] bg-[#d4ff00]/10 text-[#d4ff00]' : 'border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] text-white'}`}
        >
          <div className="text-xl font-bold">{orders.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Tất cả</div>
        </button>
        {[
          { key: 'pending',   label: 'Chờ xác nhận', color: 'text-blue-400' },
          { key: 'preparing', label: 'Đang chuẩn bị',   color: 'text-indigo-400' },
          { key: 'shipping',  label: 'Đang giao',       color: 'text-purple-400' },
          { key: 'delivered', label: 'Đã giao hàng',    color: 'text-cyan-400' },
          { key: 'completed', label: 'Hoàn thành',      color: 'text-emerald-400' },
          { key: 'cancelled', label: 'Đã hủy',          color: 'text-red-400' },
          { key: 'refunded',  label: 'Đã hoàn tiền',    color: 'text-[#d4ff00]' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => { setFilterStatus(key); setFilterReturnStatus('all'); }}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${filterStatus === key ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#262626] bg-[#141414] hover:bg-[#1a1a1a]'}`}
          >
            <div className={`text-xl font-bold ${color}`}>{counts[key] || 0}</div>
            <div className="text-[10px] text-gray-400 mt-1 leading-tight">{label}</div>
          </button>
        ))}
      </div>

      {/* Thông báo nổi bật nếu có yêu cầu trả hàng cần duyệt */}
      {returnRequestedCount > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div
            onClick={() => { setFilterReturnStatus('return_requested'); setFilterPaymentStatus('all'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Có <strong>{returnRequestedCount}</strong> yêu cầu đổi trả hàng mới cần duyệt.</span>
            <span className="underline ml-1">Xem ngay &rarr;</span>
          </div>
        </div>
      )}

      {/* Tìm kiếm & Lọc */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs outline-none focus:border-[#d4ff00] text-white placeholder-gray-400"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] min-w-[160px] text-white cursor-pointer"
          >
            <option value="all">Tất cả tiến trình ({orders.length})</option>
            <option value="pending">Chờ xác nhận ({counts['pending'] || 0})</option>
            <option value="preparing">Đang chuẩn bị ({counts['preparing'] || 0})</option>
            <option value="shipping">Đang giao hàng ({counts['shipping'] || 0})</option>
            <option value="delivered">Đã giao hàng ({counts['delivered'] || 0})</option>
            <option value="completed">Hoàn thành ({counts['completed'] || 0})</option>
            <option value="refunded">Đã hoàn tiền ({counts['refunded'] || 0})</option>
            <option value="cancelled">Đã hủy ({counts['cancelled'] || 0})</option>
          </select>

          <select
            value={filterPaymentStatus}
            onChange={e => setFilterPaymentStatus(e.target.value)}
            className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] min-w-[160px] text-white cursor-pointer"
          >
            <option value="all">Tất cả thanh toán ({orders.length})</option>
            <option value="paid">✔ Đã thanh toán ({paidCount})</option>
            <option value="unpaid">⧘ Chưa thanh toán ({unpaidCount})</option>
            <option value="refunded">↩ Hoàn tiền thành công ({refundedCount})</option>
          </select>

          <select
            value={filterReturnStatus}
            onChange={e => setFilterReturnStatus(e.target.value)}
            className="bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#d4ff00] min-w-[160px] text-white cursor-pointer"
          >
            <option value="all">Tất cả đổi trả</option>
            <option value="return_requested">⏳ Chờ duyệt trả ({returnRequestedCount})</option>
            <option value="has_return">Tất cả đơn có đổi trả</option>
          </select>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1f1f1f] text-gray-400 uppercase border-b border-[#262626]">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">MÃ ĐƠN</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">KHÁCH HÀNG</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">SĐT</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">TỔNG TIỀN</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">TRẠNG THÁI</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">THANH TOÁN</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">NGÀY TẠO</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Đang tải...
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-3 py-3 font-bold text-[#d4ff00] font-mono text-[11px] whitespace-nowrap">
                      {order.code}
                      {order.note && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-normal bg-amber-500/20 text-amber-300 border border-amber-500/30" title={`Ghi chú của khách: ${order.note}`}>
                          Ghi chú
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-white max-w-[120px] truncate" title={order.customer}>{order.customer}</td>
                    <td className="px-3 py-3 text-gray-400 font-mono text-[11px] whitespace-nowrap">{order.phone}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{order.total.toLocaleString('vi-VN')}₫</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={order.status} />
                      {order.return_request && order.return_request.status && order.return_request.status !== 'none' && order.status !== 'refunded' && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30">
                            <RotateCcw className="w-2.5 h-2.5" />
                            {RETURN_STATUS_LABELS[order.return_request.status] || order.return_request.status}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 relative" onClick={e => e.stopPropagation()}>
                      {/* Trạng thái thanh toán - đúng 3 trạng thái duy nhất */}
                      <div className="flex flex-col items-start gap-1">
                        <div className="relative inline-block">
                          {(() => {
                            const isLocked = order.payment_status === 'paid' || order.payment_status === 'refunded';
                            if (isLocked) {
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${
                                    order.payment_status === 'paid'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : 'bg-[#d4ff00]/15 text-[#d4ff00] border-[#d4ff00]/30'
                                  }`}
                                  title={`Đã ${order.payment_status === 'paid' ? 'thanh toán' : 'hoàn tiền'} (Cố định, không thể chuyển về trạng thái khác)`}
                                >
                                  <span>
                                    {order.payment_status === 'paid' ? '✔ Đã thanh toán' : '↩ Hoàn tiền thành công'}
                                  </span>
                                </span>
                              );
                            }

                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setOpenPaymentMenuId(openPaymentMenuId === order.id ? null : order.id)}
                                  disabled={updatingPaymentId === order.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all hover:scale-105 cursor-pointer shadow-sm bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25"
                                  title="Nhấn để đổi trạng thái thanh toán"
                                >
                                  {updatingPaymentId === order.id ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Đang lưu...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>⧘ Chưa thanh toán</span>
                                      <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${openPaymentMenuId === order.id ? 'rotate-180' : ''}`} />
                                    </>
                                  )}
                                </button>

                                {/* Menu dropdown đổi nhanh thanh toán cho đơn chưa thanh toán */}
                                {openPaymentMenuId === order.id && (
                                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#1c1c28] border border-[#3b3b4f] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 px-2.5 py-1 tracking-wider border-b border-[#2d2d3d] mb-1">
                                      Đổi thanh toán
                                    </div>
                                    {(() => {
                                      const canQuickRefund = ['return_approved', 'returning', 'returned_success'].includes(order.return_request?.status) || order.status === 'refunded';
                                      return [
                                        { key: 'paid', label: 'Đã thanh toán', color: 'text-emerald-400', disabled: false },
                                        { key: 'refunded', label: 'Hoàn tiền thành công', color: 'text-[#d4ff00]', disabled: !canQuickRefund, hint: ' (Cần duyệt trả hàng)' }
                                      ].map(item => (
                                        <button
                                          key={item.key}
                                          type="button"
                                          disabled={item.disabled}
                                          onClick={() => !item.disabled && handleQuickUpdatePayment(order.id, item.key)}
                                          title={item.disabled ? 'Chỉ có thể hoàn tiền khi khách yêu cầu hoàn và Admin đã duyệt' : ''}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            item.disabled
                                              ? 'opacity-40 text-gray-600 cursor-not-allowed'
                                              : 'text-gray-300 hover:bg-[#28283d] hover:text-white cursor-pointer'
                                          }`}
                                        >
                                          <span className={`flex items-center gap-1.5 ${item.color}`}>
                                            {item.label} {item.disabled && <span className="text-[10px] text-gray-500">{item.hint}</span>}
                                          </span>
                                        </button>
                                      ));
                                    })()}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Nút xem yêu cầu đổi trả hàng nếu có */}
                        {((order.return_request && order.return_request.status && order.return_request.status !== 'none') || ['return_requested', 'return_approved', 'returning'].includes(order.status)) && order.status !== 'refunded' && (
                          <button
                            type="button"
                            onClick={() => setReturnReviewModalOrder(order)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors cursor-pointer ${
                              order.return_request?.status === 'return_requested' || order.status === 'return_requested'
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30'
                            }`}
                            title="Xử lý đổi trả hàng"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {RETURN_STATUS_LABELS[order.return_request?.status] || RETURN_STATUS_LABELS[order.status] || 'Đổi trả'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-[11px] whitespace-nowrap">{order.date}</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrderEdit(order)}
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Cập nhật trạng thái & thanh toán"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getOrderPdfUrl(order._id || order.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
                          title="In hóa đơn PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang (Pagination Controls) */}
        {!loading && filteredOrders.length > 0 && (
          <div className="bg-[#191919] border-t border-[#262626] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Thông tin số lượng & Chọn dòng / trang */}
            <div className="flex items-center gap-4 text-gray-400">
              <span>
                Hiển thị <strong className="text-white">{(safePage - 1) * pageSize + 1}</strong> - <strong className="text-white">{Math.min(safePage * pageSize, filteredOrders.length)}</strong> trên tổng số <strong className="text-[#d4ff00]">{filteredOrders.length.toLocaleString('vi-VN')}</strong> đơn hàng
              </span>

              <div className="flex items-center gap-2">
                <span>Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#1f1f1f] border border-[#333] rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-[#d4ff00] cursor-pointer"
                >
                  <option value={15}>15 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                  <option value={200}>200 dòng</option>
                </select>
              </div>
            </div>

            {/* Các nút chuyển trang */}
            <div className="flex items-center gap-1.5">
              {/* Nút Đầu trang */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Nút Trước */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Các số trang */}
              {pageNumbers.map(pageNum => (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg font-bold transition-all ${
                    safePage === pageNum
                      ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                      : 'bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#555]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Nút Sau */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Nút Cuối trang */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg bg-[#1f1f1f] border border-[#333] text-gray-300 hover:text-white hover:border-[#d4ff00] disabled:opacity-30 disabled:hover:border-[#333] disabled:cursor-not-allowed transition-colors"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderDetailModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        onStatusUpdated={fetchOrders}
      />

      <OrderStatusModal
        isOpen={!!selectedOrderEdit}
        onClose={() => setSelectedOrderEdit(null)}
        order={selectedOrderEdit}
        onSuccess={() => {
          setSelectedOrderEdit(null);
          fetchOrders();
        }}
      />

      {/* Modal Review Trả Hàng */}
      <ReturnReviewModal
        order={returnReviewModalOrder}
        onClose={() => setReturnReviewModalOrder(null)}
        onSuccess={fetchOrders}
      />
    </div>
  );
};

export default Orders;

