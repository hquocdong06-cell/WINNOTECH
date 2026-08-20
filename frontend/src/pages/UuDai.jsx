import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import { toast } from 'react-toastify';
import { Tag, Ticket, CheckCircle2, Clock, AlertCircle, Copy, ArrowRight, ShieldCheck, Gift } from 'lucide-react';
import { API_BASE as API_URL } from '../services/apiService';

const fmtPrice = (n) => (n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (d) => {
  if (!d) return 'Không thời hạn';
  const dt = new Date(d);
  return dt.toLocaleDateString('vi-VN');
};

export default function UuDai() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchActiveVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vouchers/active`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setVouchers(data.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải voucher:", err);
      toast.error("Không thể tải danh sách ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVouchers();
  }, []);

  const handleSaveVoucher = async (voucherId) => {
    setSavingId(voucherId);
    try {
      const res = await fetch(`${API_URL}/api/vouchers/${voucherId}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Đã lưu mã vào ví voucher!", { position: 'bottom-right' });
        // Cập nhật trạng thái isSaved
        setVouchers(prev => prev.map(v => v._id === voucherId ? { ...v, isSaved: true } : v));
      } else {
        toast.warn(data.message || "Không thể lưu voucher", { position: 'bottom-right' });
      }
    } catch (err) {
      toast.error("Vui lòng đăng nhập để lưu mã ưu đãi", { position: 'bottom-right' });
    } finally {
      setSavingId(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã [${code}]!`, { position: 'bottom-right' });
  };

  return (
    <DefaultLayout>
      <div style={{ background: '#0a0a12', minHeight: '100vh', color: '#fff', paddingBottom: '60px' }}>
        
        {/* Banner Header */}
        <div style={{ background: 'linear-gradient(135deg, #12121f 0%, #1c1c2e 100%)', borderBottom: '1px solid #232338', padding: '48px 20px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,229,0,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255, 229, 0, 0.1)', border: '1px solid rgba(255, 229, 0, 0.3)', borderRadius: '30px', color: '#FFE500', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              <Gift size={16} /> kho mã giảm giá WINNOTECH
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 12px', color: '#fff', letterSpacing: '-0.5px' }}>
              SĂN VOUCHER <span style={{ color: '#FFE500' }}>ƯU ĐÃI KHỦNG</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>
              Lưu mã ngay vào Ví Voucher để nhận giá tốt nhất khi mua sắm PC, linh kiện & phụ kiện gaming!
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link to="/tai-khoan/voucher-cua-toi" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: '#FFE500', color: '#000', fontWeight: '800', fontSize: '13px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(255,229,0,0.2)' }}>
                <Ticket size={16} /> Ví Voucher Của Tôi <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Container Danh Sách Voucher */}
        <div style={{ maxWidth: '1140px', margin: '36px auto 0', padding: '0 20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
              <Tag style={{ color: '#FFE500' }} size={22} /> MÃ GIẢM GIÁ ĐANG HIỆU LỰC
            </h2>
            <span style={{ fontSize: '13px', color: '#888' }}>Hiển thị {vouchers.length} mã</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <Ticket className="animate-spin" size={32} style={{ margin: '0 auto 12px', color: '#FFE500' }} />
              <div>Đang tải kho voucher...</div>
            </div>
          ) : vouchers.length === 0 ? (
            <div style={{ background: '#12121e', border: '1px dashed #2d2d42', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', color: '#888' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#FFE500' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Hiện chưa có mã giảm giá mới</div>
              <div style={{ fontSize: '13px' }}>Vui lòng quay lại sau hoặc theo dõi các chương trình ưu đãi sắp tới!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {vouchers.map((v) => {
                const isPercent = v.discountType === 'percent';
                const mainValText = isPercent ? `${v.discountValue}%` : `${(v.discountValue / 1000)}K`;
                const isUsable = !v.isOut;

                return (
                  <div
                    key={v._id}
                    style={{
                      display: 'flex',
                      height: '140px',
                      background: '#131320',
                      border: '1px solid #28283d',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      opacity: isUsable ? 1 : 0.6,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={e => { if (isUsable) { e.currentTarget.style.borderColor = '#FFE500'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#28283d'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Semicircle Ticket Cut Outs */}
                    <div style={{ position: 'absolute', left: '102px', top: '-10px', width: '20px', height: '20px', background: '#0a0a12', borderRadius: '50%', zIndex: 10 }} />
                    <div style={{ position: 'absolute', left: '102px', bottom: '-10px', width: '20px', height: '20px', background: '#0a0a12', borderRadius: '50%', zIndex: 10 }} />

                    {/* BÊN TRÁI - Nền #FFE500 cuống vé */}
                    <div style={{
                      width: '112px',
                      background: isUsable ? 'linear-gradient(135deg, #FFE500 0%, #E6CE00 100%)' : '#333',
                      color: '#000',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      flexShrink: 0,
                      fontWeight: '900',
                      textAlign: 'center',
                      borderRight: '2px dashed #0a0a12'
                    }}>
                      <Ticket size={24} style={{ marginBottom: '4px', opacity: 0.8 }} />
                      <div style={{ fontSize: '24px', lineHeight: '1.1', fontWeight: '900', letterSpacing: '-0.5px' }}>
                        {mainValText}
                      </div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', marginTop: '4px', opacity: 0.85, fontWeight: '700' }}>
                        {isPercent ? 'GIẢM GIÁ' : 'GIẢM THẲNG'}
                      </div>
                    </div>

                    {/* BÊN PHẢI - Chi tiết voucher */}
                    <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', background: '#131320' }}>
                      
                      <div>
                        {/* Mã Code & Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#FFE500', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            {v.code}
                          </span>
                          {v.isOut ? (
                            <span style={{ fontSize: '10px', padding: '2px 8px', background: '#e11d48', color: '#fff', borderRadius: '20px', fontWeight: 'bold' }}>Hết lượt</span>
                          ) : (
                            <button onClick={() => handleCopyCode(v.code)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }} title="Copy mã">
                              <Copy size={13} />
                            </button>
                          )}
                        </div>

                        {/* Điều kiện */}
                        <div style={{ fontSize: '12px', color: '#ddd', fontWeight: '600', lineHeight: '1.3' }}>
                          Đơn tối thiểu {fmtPrice(v.minOrderValue)}
                        </div>
                        {isPercent && v.maxDiscountAmount > 0 && (
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                            Tối đa {fmtPrice(v.maxDiscountAmount)}
                          </div>
                        )}
                      </div>

                      {/* Hạn dùng & Nút Lưu */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                        <div style={{ fontSize: '10px', color: '#777', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> HSD: {fmtDate(v.endDate)}
                        </div>

                        {v.isSaved ? (
                          <button disabled style={{ padding: '6px 14px', background: '#222234', border: '1px solid #33334d', color: '#888', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} style={{ color: '#FFE500' }} /> Đã lưu
                          </button>
                        ) : v.isOut ? (
                          <button disabled style={{ padding: '6px 14px', background: '#1c1c28', border: '1px solid #2d2d3f', color: '#555', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'not-allowed' }}>
                            Hết lượt
                          </button>
                        ) : (
                          <button
                            disabled={savingId === v._id}
                            onClick={() => handleSaveVoucher(v._id)}
                            style={{
                              padding: '6px 16px',
                              background: '#FFE500',
                              border: 'none',
                              color: '#000',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(255,229,0,0.2)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {savingId === v._id ? 'Đang lưu...' : 'Lưu mã'}
                          </button>
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
