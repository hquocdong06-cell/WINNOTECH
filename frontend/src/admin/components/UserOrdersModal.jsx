import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Clock,
  ChevronDown,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminUserOrders, getOrderPdfUrl, API_BASE } from '../services/adminService';

// Canonical status labels & styles
const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
  handed_over: 'Đang giao hàng',
  handover: 'Đang giao hàng',
  shipped: 'Đang giao hàng',
  delivering: 'Đang giao hàng',
  done: 'Hoàn thành',
};

const normalizeOrderStatus = (s) => {
  if (!s) return 'pending';
  if (['handed_over', 'handover', 'shipped', 'delivering'].includes(s)) return 'shipping';
  if (s === 'done') return 'completed';
  if (s === 'canceled') return 'cancelled';
  return s;
};

const StatusBadge = ({ status }) => {
  const canonical = normalizeOrderStatus(status);
  const label = STATUS_LABELS[status] || status;
  const cfg = {
    pending: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    preparing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    shipping: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    delivered: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
        cfg[canonical] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      }`}
    >
      {label}
    </span>
  );
};

const PaymentBadge = ({ payment_status }) => {
  const isPaid = payment_status === 'paid';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
        isPaid
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }`}
    >
      {isPaid ? '✔ Đã thanh toán' : '⧘ Chưa thanh toán'}
    </span>
  );
};

const fmtPrice = (n) => (n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const UserOrdersModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);

  const loadUserOrders = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetchAdminUserOrders(user._id);
      if (res.success) {
        const orderList = res.data || [];
        setOrders(orderList);
        if (orderList.length > 0) {
          setExpandedOrders({ [orderList[0]._id]: true });
        }
      } else {
        toast.error(res.message || 'Không thể tải đơn hàng của người dùng');
      }
    } catch (err) {
      toast.error('Lỗi khi tải đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isOpen && user?._id) {
      loadUserOrders();
    }
  }, [isOpen, user?._id, loadUserOrders]);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã đơn: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#12121a] border border-[#2d2d3d] rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-[#252535] bg-[#171722] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={
                  user.avatar
                    ? user.avatar.startsWith('http')
                      ? user.avatar
                      : `${API_BASE}${user.avatar}`
                    : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`
                }
                alt={user.name || user.email}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#3b3b4f]"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#171722] ${
                  user.status === 'locked'
                    ? 'bg-red-500'
                    : user.status === 'inactive'
                    ? 'bg-gray-500'
                    : 'bg-green-500'
                }`}
                title={`Trạng thái: ${user.status || 'active'}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {user.name || 'Chưa đặt tên'}
                </h3>
                {user.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 inline-flex items-center gap-1 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700 inline-flex items-center whitespace-nowrap">
                    Khách hàng
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-500" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500" /> {user.phone}
                  </span>
                )}
                <span className="text-gray-500">ID: {user._id?.slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={loadUserOrders}
              disabled={loading}
              title="Tải lại đơn hàng"
              className="p-2 rounded-xl bg-[#222230] hover:bg-[#2d2d40] border border-[#333348] text-gray-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#222230] hover:bg-red-500/20 hover:text-red-400 border border-[#333348] text-gray-400 transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE ORDER LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 text-[#d4ff00] animate-spin" />
              <p className="text-sm font-medium">Đang tải toàn bộ đơn hàng chi tiết...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1c1c28] border border-[#2b2b3a] flex items-center justify-center text-gray-500 mb-4 shadow-inner">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Khách hàng này chưa có đơn hàng nào
              </h4>
              <p className="text-gray-400 text-xs max-w-sm">
                Khi người dùng tiến hành đặt hàng trên hệ thống, toàn bộ thông tin chi tiết và sản phẩm sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const isExpanded = !!expandedOrders[ord._id];
              const items = ord.items || [];
              const itemCount = items.reduce((sum, it) => sum + (it.Quantity || 1), 0);

              return (
                <div
                  key={ord._id}
                  className="bg-[#181824] border border-[#28283a] hover:border-[#383850] rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* CARD HEADER / CLICK TO EXPAND */}
                  <div
                    onClick={() => toggleExpand(ord._id)}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none hover:bg-[#1e1e2d] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#d4ff00]" /> #{ord.code}
                        </span>
                        <button
                          onClick={(e) => handleCopyCode(e, ord.code)}
                          className="p-1 rounded hover:bg-[#2b2b3d] text-gray-400 hover:text-white transition-colors"
                          title="Sao chép mã đơn"
                        >
                          {copiedCode === ord.code ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <StatusBadge status={ord.status} />
                      <PaymentBadge payment_status={ord.payment_status} />
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-5">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-gray-400 font-mono flex items-center lg:justify-end gap-1">
                          <Clock className="w-3 h-3 text-gray-500" /> {fmtDate(ord.createdAt || ord.date)}
                        </div>
                        <div className="text-sm sm:text-base font-extrabold text-[#d4ff00] mt-0.5">
                          {fmtPrice(ord.total_amount)}
                          <span className="text-xs text-gray-400 font-normal ml-1.5">
                            ({itemCount} sản phẩm)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getOrderPdfUrl(ord._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1.5 rounded-xl bg-[#222233] hover:bg-[#2d2d42] border border-[#333348] text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                          title="In hóa đơn PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">In PDF</span>
                        </a>

                        <div
                          className={`w-8 h-8 rounded-xl bg-[#222233] border border-[#333348] flex items-center justify-center text-gray-300 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#d4ff00]' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-[#252538] bg-[#14141e]/70 space-y-5">
                      {/* THÔNG TIN NGƯỜI NHẬN & VẬN CHUYỂN */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                        <div className="bg-[#1a1a27] border border-[#2a2a3d] rounded-xl p-3.5">
                          <div className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#d4ff00]" /> Thông tin nhận hàng
                          </div>
                          <div className="text-sm font-bold text-white mb-1">
                            {ord.Name || user.name}{' '}
                            <span className="font-mono text-xs text-gray-400 font-normal">
                              ({ord.Phone || user.phone || 'Chưa có SĐT'})
                            </span>
                          </div>
                          <div className="text-xs text-gray-300 leading-relaxed">
                            {ord.Adress || 'Chưa cung cấp địa chỉ'}
                          </div>
                        </div>

                        <div className="bg-[#1a1a27] border border-[#2a2a3d] rounded-xl p-3.5 flex flex-col justify-between">
                          <div>
                            <div className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Phương thức thanh toán
                            </div>
                            <div className="text-sm font-bold text-white mb-1">
                              {ord.payment_method?.name ||
                                ord.payment_method?.type ||
                                (ord.payment_status === 'paid' ? 'Thanh toán trực tuyến (VNPAY/Online)' : 'Thanh toán khi nhận hàng (COD)')}
                            </div>
                          </div>
                          {ord.voucher_code && (
                            <div className="mt-2 text-xs bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] px-2.5 py-1 rounded-lg flex items-center justify-between font-mono">
                              <span>Mã voucher: <strong>{ord.voucher_code}</strong></span>
                              <span>-{fmtPrice(ord.voucher_value || 0)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                      <div>
                        <div className="text-xs text-gray-400 font-semibold mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-gray-400" /> Sản phẩm trong đơn hàng (
                          {items.length})
                        </div>

                        <div className="space-y-2">
                          {items.map((item, idx) => {
                            const prod = item.product || {};
                            const variant = item.variant || {};
                            const firstImage =
                              item.images?.[0]?.url ||
                              item.AnhSP?.[0]?.url ||
                              prod.image ||
                              '/public/images/placeholder.png';

                            const imgSrc = firstImage.startsWith('http')
                              ? firstImage
                              : `${API_BASE}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;

                            const variantAttrs =
                              variant.attributes && Array.isArray(variant.attributes)
                                ? variant.attributes.join(' • ')
                                : '';

                            const unitPrice = item.price || variant.price || 0;
                            const itemTotal = unitPrice * (item.Quantity || 1);

                            return (
                              <div
                                key={item._id || idx}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1a1a28] border border-[#27273a]"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={imgSrc}
                                    alt={prod.name || 'Sản phẩm'}
                                    onError={(e) => {
                                      e.target.src =
                                        'https://placehold.co/80x80/222/999?text=SP';
                                    }}
                                    className="w-12 h-12 rounded-lg object-cover border border-[#333] shrink-0 bg-black/40"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">
                                      {prod.name || 'Sản phẩm #' + (item.variants_id || idx + 1)}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {variantAttrs && (
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#252536] text-gray-300 font-mono">
                                          {variantAttrs}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400 font-mono">
                                        Đơn giá: {fmtPrice(unitPrice)} × {item.Quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="text-sm font-bold text-white font-mono">
                                    {fmtPrice(itemTotal)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* TỔNG KẾT TÍNH TIỀN */}
                      <div className="pt-2 border-t border-[#252538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs text-gray-400">
                          {ord.cancel_reason && (
                            <span className="text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Lý do hủy: {ord.cancel_reason}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto text-sm">
                          <span className="text-gray-400">Tổng thanh toán:</span>
                          <span className="text-lg font-extrabold text-[#d4ff00]">
                            {fmtPrice(ord.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersModal;
