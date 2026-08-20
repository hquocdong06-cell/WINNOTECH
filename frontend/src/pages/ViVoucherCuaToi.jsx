import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import { toast } from 'react-toastify';
import { Ticket, Copy, Clock, ArrowRight, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { API_BASE as API_URL } from '../services/apiService';

const fmtPrice = (n) => (n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (d) => {
  if (!d) return 'Không thời hạn';
  const dt = new Date(d);
  return dt.toLocaleDateString('vi-VN');
};

export default function ViVoucherCuaToi() {
  const [vouchersData, setVouchersData] = useState({ available: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'history'

  const fetchMyVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vouchers/my-vouchers`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setVouchersData(data.data || { available: [], history: [] });
      } else {
        toast.error(data.message || "Vui lòng đăng nhập để xem ví voucher");
      }
    } catch (err) {
      console.error("Lỗi ví voucher:", err);
      toast.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVouchers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã [${code}]! Dùng ngay tại Checkout`, { position: 'bottom-right' });
  };

  const list = activeTab === 'available' ? vouchersData.available : vouchersData.history;

  return (
    <DefaultLayout>
      <div style={{ background: '#0a0a12', minHeight: '100vh', color: '#fff', padding: '40px 20px 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Breadcrumb / Title */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              <Link to="/home" style={{ color: '#888', textDecoration: 'none' }}>Trang chủ</Link> / <Link to="/profile" style={{ color: '#888', textDecoration: 'none' }}>Tài khoản</Link> / Ví Voucher
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Ticket style={{ color: '#FFE500' }} size={32} /> VÍ VOUCHER CỦA TÔI
            </h1>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #232338', paddingBottom: '12px', marginBottom: '28px' }}>
            <button
              onClick={() => setActiveTab('available')}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'available' ? '#FFE500' : '#161624',
                color: activeTab === 'available' ? '#000' : '#aaa',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Ticket size={16} /> Có thể sử dụng ({vouchersData.available?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'history' ? '#FFE500' : '#161624',
                color: activeTab === 'history' ? '#000' : '#aaa',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={16} /> Đã dùng / Hết hạn ({vouchersData.history?.length || 0})
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <Ticket className="animate-spin" size={32} style={{ margin: '0 auto 12px', color: '#FFE500' }} />
              <div>Đang tải ví voucher...</div>
            </div>
          ) : list.length === 0 ? (
            <div style={{ background: '#12121e', border: '1px dashed #2d2d42', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', color: '#888' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#FFE500' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                {activeTab === 'available' ? 'Ví voucher của bạn đang trống' : 'Không có lịch sử voucher'}
              </div>
              <div style={{ fontSize: '13px', marginBottom: '20px' }}>
                {activeTab === 'available' ? 'Hãy khám phá kho ưu đãi và lưu ngay mã hot nhất!' : ''}
              </div>
              {activeTab === 'available' && (
                <Link to="/uu-dai" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#FFE500', color: '#000', fontWeight: '800', fontSize: '13px', borderRadius: '10px' }}>
                  Khám phá kho ưu đãi <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {list.map((uv) => {
                const v = uv.voucher || {};
                const isPercent = v.discountType === 'percent';
                const mainValText = isPercent ? `${v.discountValue}%` : `${(v.discountValue / 1000)}K`;
                const isUsable = activeTab === 'available';

                return (
                  <div
                    key={uv.userVoucherId || v._id}
                    style={{
                      display: 'flex',
                      height: '135px',
                      background: '#131320',
                      border: '1px solid #28283d',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      opacity: isUsable ? 1 : 0.55,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Cuts */}
                    <div style={{ position: 'absolute', left: '98px', top: '-10px', width: '18px', height: '18px', background: '#0a0a12', borderRadius: '50%', zIndex: 10 }} />
                    <div style={{ position: 'absolute', left: '98px', bottom: '-10px', width: '18px', height: '18px', background: '#0a0a12', borderRadius: '50%', zIndex: 10 }} />

                    {/* Trái */}
                    <div style={{
                      width: '108px',
                      background: isUsable ? 'linear-gradient(135deg, #FFE500 0%, #E6CE00 100%)' : '#28283a',
                      color: isUsable ? '#000' : '#888',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px',
                      flexShrink: 0,
                      textAlign: 'center',
                      borderRight: '2px dashed #0a0a12'
                    }}>
                      <Ticket size={22} style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '22px', lineHeight: '1.1', fontWeight: '900' }}>
                        {mainValText}
                      </div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', marginTop: '4px', fontWeight: '700' }}>
                        {isPercent ? 'GIẢM GIÁ' : 'GIẢM THẲNG'}
                      </div>
                    </div>

                    {/* Phải */}
                    <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '900', color: '#FFE500', fontFamily: 'monospace' }}>
                            {v.code}
                          </span>
                          {uv.is_used && (
                            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#333', color: '#aaa', borderRadius: '4px' }}>Đã dùng</span>
                          )}
                          {v.isExpired && !uv.is_used && (
                            <span style={{ fontSize: '10px', padding: '2px 6px', background: '#441515', color: '#f87171', borderRadius: '4px' }}>Hết hạn</span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#ccc', fontWeight: '600' }}>
                          Đơn tối thiểu {fmtPrice(v.minOrderValue)}
                        </div>
                        {isPercent && v.maxDiscountAmount > 0 && (
                          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                            Tối đa {fmtPrice(v.maxDiscountAmount)}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div style={{ fontSize: '10px', color: '#777' }}>
                          HSD: {fmtDate(v.endDate)}
                        </div>

                        {isUsable && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleCopyCode(v.code)}
                              style={{
                                padding: '5px 12px',
                                background: '#FFE500',
                                border: 'none',
                                color: '#000',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Copy size={11} /> Copy mã
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </DefaultLayout>
  );
}
