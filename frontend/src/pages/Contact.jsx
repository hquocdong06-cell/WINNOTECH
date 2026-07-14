import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import '../assets/styles/contact.css'

const API_URL = 'http://localhost:3000'

// ── FAQ Data ──────────────────────────────────────────────────
const FAQ_LIST = [
  {
    q: 'Thời gian giao hàng mất bao lâu?',
    a: 'Trong TP.HCM và Hà Nội: 1–2 ngày làm việc. Các tỉnh thành khác: 2–5 ngày làm việc. Đơn hàng trên 2 triệu được miễn phí vận chuyển.'
  },
  {
    q: 'Chính sách đổi trả như thế nào?',
    a: 'Sản phẩm lỗi do nhà sản xuất được đổi trả trong 30 ngày kể từ ngày nhận hàng. Vui lòng giữ nguyên bao bì và phụ kiện đi kèm khi gửi trả.'
  },
  {
    q: 'Sản phẩm có bảo hành không?',
    a: 'Tất cả sản phẩm tại WINNOTech đều có bảo hành chính hãng từ 12–36 tháng tuỳ sản phẩm. Thông tin bảo hành được ghi rõ trên trang chi tiết sản phẩm.'
  },
  {
    q: 'Có thể thanh toán bằng những hình thức nào?',
    a: 'Chúng tôi chấp nhận: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng, Ví MoMo và ZaloPay. Thanh toán online xử lý trong 1–5 phút.'
  },
  {
    q: 'Làm thế nào để theo dõi đơn hàng?',
    a: 'Sau khi đặt hàng thành công, bạn vào mục "Đơn hàng của tôi" trong tài khoản để xem trạng thái. Chúng tôi cũng gửi email thông báo theo từng bước xử lý đơn.'
  }
]

// ── Topic chips ───────────────────────────────────────────────
const TOPICS = [
  { id: 'order',    label: 'Đơn hàng',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: 'shipping', label: 'Giao hàng',    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { id: 'payment',  label: 'Thanh toán',   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: 'warranty', label: 'Bảo hành',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'product',  label: 'Sản phẩm',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
  { id: 'other',    label: 'Khác',         icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
]

// ─────────────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', topic: '', content: '' })
  const [sending, setSending] = useState(false)
  const [status, setStatus]   = useState(null) // null | 'success' | 'error'
  const [errMsg, setErrMsg]   = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleTopic  = (id) => setForm({ ...form, topic: id === form.topic ? '' : id })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setErrMsg('')

    if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
      setStatus('error')
      setErrMsg('Vui lòng điền đầy đủ Họ tên, Email và Nội dung liên hệ!')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setStatus('error')
      setErrMsg('Địa chỉ email không hợp lệ!')
      return
    }

    setSending(true)

    // Build nội dung gửi lên server
    const topicLabel = TOPICS.find(t => t.id === form.topic)?.label || ''
    const fullContent = [
      form.topic ? `[Chủ đề: ${topicLabel}]` : '',
      form.phone  ? `Số điện thoại: ${form.phone}` : '',
      '',
      form.content
    ].filter(Boolean).join('\n')

    try {
      const res  = await fetch(API_URL + '/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim(),
          content: fullContent
        })
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', topic: '', content: '' })
      } else {
        setStatus('error')
        setErrMsg(data.message || 'Gửi thất bại, vui lòng thử lại!')
      }
    } catch {
      setStatus('error')
      setErrMsg('Không thể kết nối máy chủ, vui lòng thử lại sau!')
    } finally {
      setSending(false)
    }
  }

  // Kiểm tra giờ mở cửa
  const now      = new Date()
  const hour     = now.getHours()
  const dayOfWeek = now.getDay() // 0=CN, 1–6=T2–T7
  const isOpen   = dayOfWeek >= 1 && dayOfWeek <= 6 && hour >= 8 && hour < 22

  return (
    <DefaultLayout>
      {/* ── Hero ── */}
      <div className="contact-hero">
        <div className="contact-hero-eyebrow">Hỗ trợ khách hàng</div>
        <h1>Liên hệ với <span>WINNOTech</span></h1>
        <p className="contact-hero-sub">
          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc.
          Phản hồi trong vòng <strong style={{ color: '#fff' }}>2–4 giờ</strong> trong giờ làm việc.
        </p>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="contact-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <span>Liên hệ hỗ trợ</span>
      </div>

      {/* ── Main grid ── */}
      <div className="contact-inner">

        {/* ════════════════ LEFT — FORM ════════════════ */}
        <div className="contact-form-card">
          <div className="contact-form-title">Gửi yêu cầu hỗ trợ</div>
          <div className="contact-form-subtitle">
            Điền thông tin bên dưới, chúng tôi sẽ phản hồi qua email của bạn sớm nhất.
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>

            {/* Name + Email */}
            <div className="contact-field-row">
              <div className="contact-field">
                <label>Họ và tên<span>*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div className="contact-field">
                <label>Địa chỉ email<span>*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="contact-field">
              <label>Số điện thoại <span style={{ color: '#555', fontWeight: 400 }}>(tuỳ chọn)</span></label>
              <input
                type="tel"
                name="phone"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            {/* Topic */}
            <div className="contact-field">
              <label>Chủ đề hỗ trợ</label>
              <div className="contact-topic-grid">
                {TOPICS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`contact-topic-chip ${form.topic === t.id ? 'active' : ''}`}
                    onClick={() => handleTopic(t.id)}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="contact-field">
              <label>Nội dung<span>*</span></label>
              <textarea
                name="content"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải để chúng tôi hỗ trợ nhanh hơn..."
                rows={6}
                value={form.content}
                onChange={handleChange}
              />
            </div>

            {/* Status messages */}
            {status === 'success' && (
              <div className="contact-alert contact-alert--success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>
                  <strong>Gửi thành công!</strong> Chúng tôi đã nhận được yêu cầu của bạn và sẽ
                  phản hồi sớm nhất qua email. Cảm ơn bạn đã liên hệ WINNOTech!
                </span>
              </div>
            )}

            {status === 'error' && (
              <div className="contact-alert contact-alert--error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{errMsg}</span>
              </div>
            )}

            {/* Submit */}
            <div className="contact-submit">
              <button
                type="submit"
                className={`contact-btn-submit ${sending ? 'sending' : ''}`}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <div className="contact-spinner" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    GỬI YÊU CẦU HỖ TRỢ
                  </>
                )}
              </button>

              <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', lineHeight: 1.5 }}>
                Bằng cách gửi form này, bạn đồng ý để WINNOTech liên hệ lại qua email.
              </p>
            </div>

          </form>
        </div>

        {/* ════════════════ RIGHT — INFO ════════════════ */}
        <div className="contact-info">

          {/* Contact info card */}
          <div className="contact-info-card">
            <div className="contact-info-card-title">Thông tin liên hệ</div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Hotline hỗ trợ</div>
                <div className="contact-info-value">
                  <a href="tel:19001234">1900 1234</a>
                  <br />
                  <span style={{ fontSize: '12px', color: '#555' }}>Miễn phí • 8:00–22:00 T2–T7</span>
                </div>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Email hỗ trợ</div>
                <div className="contact-info-value">
                  <a href="mailto:contact.winnotech@gmail.com">contact.winnotech@gmail.com</a>
                  <br />
                  <span style={{ fontSize: '12px', color: '#555' }}>Phản hồi trong 2–4 giờ</span>
                </div>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Địa chỉ showroom</div>
                <div className="contact-info-value">
                  123 Nguyễn Huệ, Q.1<br />
                  TP. Hồ Chí Minh
                </div>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2H3v16h5l4 4 4-4h5V2z"/>
                  <line x1="9" y1="10" x2="15" y2="10"/>
                  <line x1="12" y1="7" x2="12" y2="13"/>
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Mạng xã hội</div>
                <div className="contact-info-value" style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                  <a href="#" style={{ color: '#3b82f6' }}>Facebook</a>
                  <a href="#" style={{ color: '#e1306c' }}>Instagram</a>
                  <a href="#" style={{ color: '#ff0000' }}>YouTube</a>
                </div>
              </div>
            </div>
          </div>

          {/* Hours card */}
          <div className="contact-hours-card">
            <div className="contact-hours-title">Giờ làm việc</div>
            {[
              { day: 'Thứ 2 – Thứ 6', time: '08:00 – 22:00', active: dayOfWeek >= 1 && dayOfWeek <= 5 },
              { day: 'Thứ 7',          time: '08:00 – 22:00', active: dayOfWeek === 6 },
              { day: 'Chủ nhật',       time: 'Nghỉ',          active: false, closed: true },
            ].map((row, i) => (
              <div key={i} className="contact-hours-row">
                <span className="contact-hours-day">{row.day}</span>
                <span className={`contact-hours-time ${row.closed ? 'closed' : row.active ? 'open' : ''}`}>
                  {row.time}
                </span>
              </div>
            ))}

            <div className={`contact-live-badge`} style={!isOpen ? { background: 'rgba(100,100,100,0.06)', borderColor: '#333', color: '#555' } : {}}>
              <div className="contact-live-dot" style={!isOpen ? { background: '#555', animation: 'none' } : {}} />
              {isOpen ? 'Đang hoạt động — Phản hồi ngay' : 'Ngoài giờ — Sẽ phản hồi vào ngày làm việc tiếp theo'}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="contact-map">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
          </div>

          {/* FAQ card */}
          <div className="contact-faq-card">
            <div className="contact-faq-title">Câu hỏi thường gặp</div>
            {FAQ_LIST.map((item, i) => (
              <div key={i} className="contact-faq-item">
                <div
                  className={`contact-faq-q ${openFaq === i ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <svg
                    className="contact-faq-chevron"
                    width="14" height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div className={`contact-faq-a ${openFaq === i ? 'visible' : ''}`}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </DefaultLayout>
  )
}
