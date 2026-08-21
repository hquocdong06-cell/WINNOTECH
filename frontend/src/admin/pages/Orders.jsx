import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, RefreshCw, FileText, Trash2, X, MessageSquare, Send, Clock, CheckCircle2, Package, MapPin, CreditCard, User, Phone, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminOrders, fetchAdminOrderDetail, updateAdminOrderStatus, addAdminOrderNote, deleteAdminOrder, getOrderPdfUrl, API_BASE } from '../services/adminService';

const STATUS_LABELS = {
  pending:      'Chờ xác nhận',
  preparing:    'Đang chuẩn bị hàng',
  handed_over:  'Đã bàn giao vận chuyển',
  handover:     'Đã bàn giao vận chuyển',
  shipping:     'Đang vận chuyển',
  shipped:      'Đang vận chuyển',
  delivering:   'Đang giao hàng',
  delivered:    'Đã giao hàng',
  completed:    'Hoàn thành',
  canceled:     'Đã hủy',
  cancelled:    'Đã hủy',
};

const STATUS_FLOW = ['pending','preparing','handed_over','shipping','delivering','delivered','completed'];

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Chờ xác nhận' },
  { value: 'preparing',   label: 'Đang chuẩn bị hàng' },
  { value: 'handed_over', label: 'Đã bàn giao vận chuyển' },
  { value: 'shipping',    label: 'Đang vận chuyển' },
  { value: 'delivering',  label: 'Đang giao hàng' },
  { value: 'delivered',   label: 'Đã giao hàng' },
  { value: 'completed',   label: 'Hoàn thành' },
  { value: 'canceled',    label: 'Đã hủy' },
];

const fmtPrice = (n) => (n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

// ── Chip trạng thái ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;
  const cfg = {
    pending:     'bg-blue-500/10 text-blue-400 border-blue-500/30',
    preparing:   'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    handed_over: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    handover:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
    shipping:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
    shipped:     'bg-purple-500/10 text-purple-400 border-purple-500/30',
    delivering:  'bg-teal-500/10 text-teal-400 border-teal-500/30',
    delivered:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    completed:   'bg-green-500/10 text-green-400 border-green-500/30',
    canceled:    'bg-red-500/10 text-red-400 border-red-500/30',
    cancelled:   'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
      {label}
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

  // Admin note
  const [noteInput, setNoteInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetchAdminOrderDetail(orderId);
      if (res.success) {
        setOrder(res.data);
        setEditStatus(res.data.status);
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
      await updateAdminOrderStatus(orderId, editStatus, statusNote);
      toast.success('Đã cập nhật trạng thái!');
      setStatusNote('');
      onStatusUpdated?.();
      await load();
    } catch (e) { toast.error(e.message || 'Cập nhật thất bại'); }
    setUpdatingStatus(false);
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

  const flowStep = STATUS_FLOW.indexOf(order?.status);
  const isMainFlow = flowStep !== -1;
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
                  {isMainFlow && (
                    <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Tiến trình đơn hàng</div>
                      <div className="flex items-start gap-0">
                        {STATUS_FLOW.map((step, idx) => {
                          const isDone = idx < flowStep;
                          const isActive = idx === flowStep;
                          return (
                            <div key={step} className="flex-1 flex flex-col items-center relative">
                              <div className="flex items-center w-full">
                                {idx > 0 && (
                                  <div className={`flex-1 h-0.5 -mt-0 ${isDone || isActive ? 'bg-[#d4ff00]' : 'bg-[#2a2a3d]'}`} />
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
                                {idx < STATUS_FLOW.length - 1 && (
                                  <div className={`flex-1 h-0.5 ${isDone ? 'bg-[#d4ff00]' : 'bg-[#2a2a3d]'}`} />
                                )}
                              </div>
                              <div className={`text-[9px] mt-2 text-center leading-tight px-1 ${isActive ? 'text-[#d4ff00] font-bold' : isDone ? 'text-gray-300' : 'text-gray-600'}`}>
                                {STATUS_LABELS[step] || step}
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
                          <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-400' : order.payment_status === 'refund_pending' ? 'text-orange-400' : 'text-yellow-400'}`}>
                            {order.payment_status === 'paid' ? '✓ Đã thanh toán' :
                             order.payment_status === 'refund_pending' ? '⏳ Chờ hoàn tiền' :
                             'Chưa thanh toán'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Mã vận đơn</span>
                          <span className="text-white font-mono">{order.tracking_code || '—'}</span>
                        </div>
                        {order.cancel_reason && (
                          <div className="pt-2 border-t border-[#222234]">
                            <span className="text-gray-500">Lý do hủy:</span>
                            <p className="text-red-400 mt-1">{order.cancel_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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
                  {/* Cập nhật trạng thái */}
                  <div className="bg-[#13131e] border border-[#222234] rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Edit className="w-3.5 h-3.5" /> Cập nhật trạng thái đơn hàng
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Trạng thái mới</label>
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          className="w-full bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#13131e]">{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Ghi chú (hiển thị trong lịch sử)</label>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={e => setStatusNote(e.target.value)}
                          placeholder="VD: Đã bàn giao đơn vị vận chuyển GHN..."
                          className="w-full bg-[#1a1a27] border border-[#2a2a3d] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] placeholder-gray-600"
                        />
                      </div>
                      <button
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus || editStatus === order.status}
                        className="w-full py-2.5 bg-[#d4ff00] hover:bg-[#bce600] disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl text-sm transition-colors"
                      >
                        {updatingStatus ? 'Đang lưu...' : editStatus === order.status ? 'Chọn trạng thái khác để cập nhật' : 'Lưu thay đổi trạng thái'}
                      </button>
                    </div>
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
  const [status, setStatus] = useState(order?.status || 'pending');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) { setStatus(order.status); setNote(''); }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAdminOrderStatus(order.id, status, note);
      toast.success('Cập nhật trạng thái thành công!');
      onSuccess();
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
        <p className="text-xs text-gray-300 mb-5">Mã đơn: <span className="font-mono text-[#d4ff00] font-bold">#{order.code}</span></p>

        <label className="block text-xs font-semibold text-gray-300 mb-2">Chọn trạng thái mới:</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full bg-[#252536] text-white border border-[#44445e] font-semibold text-sm rounded-xl px-4 py-3 outline-none focus:border-[#d4ff00] mb-3 cursor-pointer"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#1c1c28] text-white">{opt.label}</option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-gray-300 mb-2">Ghi chú (tùy chọn):</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Thêm ghi chú vào lịch sử..."
          className="w-full bg-[#252536] text-white border border-[#44445e] text-sm rounded-xl px-4 py-3 outline-none focus:border-[#d4ff00] mb-6 placeholder-gray-600"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-[#2b2b3b] border border-[#444] rounded-xl text-xs font-semibold text-gray-200 hover:bg-[#38384d] transition-colors">
            Hủy
          </button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2.5 bg-[#d4ff00] hover:bg-[#bce600] text-black font-bold rounded-xl text-xs transition-colors shadow-[0_0_12px_rgba(212,255,0,0.3)]"
          >
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
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
  const [counts, setCounts] = useState({});

  const [selectedOrderId, setSelectedOrderId] = useState(null); // cho detail modal
  const [selectedOrderEdit, setSelectedOrderEdit] = useState(null); // cho status modal

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders();
      if (data.success) {
        const mapped = (data.data || []).map(o => ({
          id: o._id,
          code: o.code || o._id?.slice(-8).toUpperCase(),
          customer: o.Name || o.user_id?.name || 'Khách vãng lai',
          phone: o.Phone || o.user_id?.phone || '—',
          total: o.total_amount || 0,
          status: o.status,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—',
          payment_method: o.payment_method,
          itemCount: (o.items || []).length,
          rawOrder: o,
        }));
        setOrders(mapped);
        // Tính counts
        const c = {};
        mapped.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
        setCounts(c);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone?.includes(searchQuery);
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-400 text-sm">Dữ liệu thời gian thực — Tổng: <strong>{orders.length}</strong> đơn</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:bg-[#333] text-white font-medium rounded-xl transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">{error}</div>
      )}

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3 rounded-2xl border text-center transition-all ${filterStatus === 'all' ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#333] bg-[#14141d] hover:bg-[#1a1a24]'}`}
        >
          <div className="text-xl font-bold text-white">{orders.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Tất cả</div>
        </button>
        {Object.entries(STATUS_LABELS).filter(([k]) => !['handover','shipped'].includes(k)).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`p-3 rounded-2xl border text-center transition-all ${filterStatus === key ? 'border-[#d4ff00] bg-[#d4ff00]/10' : 'border-[#333] bg-[#14141d] hover:bg-[#1a1a24]'}`}
          >
            <div className="text-xl font-bold text-white">{counts[key] || 0}</div>
            <div className="text-[10px] text-gray-400 mt-1 leading-tight">{label}</div>
          </button>
        ))}
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e2d] border border-[#333] rounded-xl text-sm outline-none focus:border-[#d4ff00] text-white placeholder-gray-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#1e1e2d] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] min-w-[200px] text-white"
        >
          <option value="all">Tất cả trạng thái ({orders.length})</option>
          {Object.entries(STATUS_LABELS).filter(([k]) => !['handover','shipped'].includes(k)).map(([k, label]) => (
            <option key={k} value={k}>{label} ({counts[k] || 0})</option>
          ))}
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-[#14141d] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e1e2d] text-gray-400 text-xs uppercase border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-semibold">MÃ ĐƠN</th>
                <th className="px-6 py-4 font-semibold">KHÁCH HÀNG</th>
                <th className="px-6 py-4 font-semibold">SĐT</th>
                <th className="px-6 py-4 font-semibold">TỔNG TIỀN</th>
                <th className="px-6 py-4 font-semibold">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-semibold">NGÀY TẠO</th>
                <th className="px-6 py-4 font-semibold text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Đang tải...
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#1a1a24] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#d4ff00] font-mono text-xs">{order.code}</td>
                    <td className="px-6 py-4 font-semibold text-white">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{order.phone}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.total.toLocaleString('vi-VN')}₫</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{order.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-2 bg-[#222] hover:bg-[#d4ff00]/10 border border-[#444] hover:border-[#d4ff00]/40 rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderEdit(order)}
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-[#d4ff00] transition-colors"
                          title="Cập nhật trạng thái"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={getOrderPdfUrl(order.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-gray-300 hover:text-blue-400 transition-colors"
                          title="In hóa đơn PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        {!['canceled','cancelled','completed'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Hủy đơn hàng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default Orders;
