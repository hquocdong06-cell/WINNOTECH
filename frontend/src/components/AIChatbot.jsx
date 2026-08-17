import React, { useState, useRef, useEffect } from 'react'
import { chatbotAPI } from '../services/apiService'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showGreetingPill, setShowGreetingPill] = useState(true)
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Xin chào! Mình là Trợ lý AI của WINNOTech. 🤖\nBạn cần tư vấn cấu hình PC, chọn CPU, VGA hay linh kiện máy tính nào hôm nay?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto scroll xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isLoading])

  // Gợi ý câu hỏi nhanh
  const suggestions = [
    '💡 Tư vấn PC 15 triệu chơi game',
    '⚡ Gợi ý CPU tốt nhất tầm trung',
    '🎨 Cấu hình PC làm đồ họa 3D',
    '🔌 Chọn PSU phù hợp RTX 3060',
  ]

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query || !query.trim() || isLoading) return

    const userMsg = { role: 'user', text: query.trim() }
    
    const currentHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await chatbotAPI.chat(query.trim(), currentHistory)
      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: res.reply }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: 'Rất tiếc, có lỗi xảy ra khi kết nối máy chủ AI. Vui lòng thử lại!',
          },
        ])
      }
    } catch (err) {
      console.error('AIChatbot error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: err.message || 'Không thể kết nối đến Trợ lý AI. Vui lòng kiểm tra lại kết nối mạng!',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999, fontFamily: 'sans-serif' }}>
      
      {/* CHAT WINDOW POPUP (NGAY GÓC PHẢI DƯỚI) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '20px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            background: '#121621',
            borderRadius: '16px',
            border: '1px solid rgba(200, 230, 0, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(200, 230, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease-out forwards',
            zIndex: 100000,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #182232 0%, #0f172a 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1.5px solid var(--accent-color, #c8e600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(200, 230, 0, 0.3)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <circle cx="14" cy="8" r="2.5" fill="#c8e600" />
                  <line x1="14" y1="8" x2="18" y2="15" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="34" cy="8" r="2.5" fill="#c8e600" />
                  <line x1="34" y1="8" x2="30" y2="15" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" />
                  <rect x="10" y="14" width="28" height="24" rx="12" fill="#2d3748" stroke="#c8e600" strokeWidth="2" />
                  <rect x="14" y="20" width="20" height="12" rx="6" fill="#0f172a" stroke="#c8e600" strokeWidth="1.5" />
                  <path d="M17 25 Q19 22 21 25" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M27 25 Q29 22 31 25" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M21 29 Q24 32 27 29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                  Trợ Lý AI WinNoTech
                </div>
                <div style={{ color: 'var(--accent-color, #c8e600)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #22c55e'
                    }}
                  />
                  Sẵn sàng hỗ trợ 24/7
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setMessages([{ role: 'model', text: 'Đã xóa lịch sử trò chuyện. Mình có thể giúp gì thêm cho bạn?' }])}
                title="Xóa lịch sử chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#0b0f19',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #c8e600 0%, #86efac 100%)' : '#1e293b',
                    color: msg.role === 'user' ? '#000000' : '#f8fafc',
                    fontWeight: msg.role === 'user' ? '600' : '400',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 2px',
                    background: '#1e293b',
                    color: 'var(--accent-color, #c8e600)',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTIONS */}
          <div
            style={{
              padding: '8px 12px',
              background: '#121621',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                style={{
                  background: 'rgba(200, 230, 0, 0.08)',
                  border: '1px solid rgba(200, 230, 0, 0.25)',
                  color: 'var(--accent-color, #c8e600)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200, 230, 0, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(200, 230, 0, 0.08)')}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div
            style={{
              padding: '12px 14px',
              background: '#121621',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi tư vấn (Enter để gửi)..."
              rows={1}
              style={{
                flex: 1,
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                padding: '10px 12px',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                maxHeight: '80px',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: input.trim() ? 'linear-gradient(135deg, #c8e600 0%, #86efac 100%)' : '#334155',
                color: input.trim() ? '#000' : '#64748b',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
            >
              ➔
            </button>
          </div>
        </div>
      )}

      {/* VERTICAL FLOATING STACK OF 3 EQUAL SIZED ICONS (MESSENGER, ZALO, CHATBOT) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        
        {/* 1. Messenger Button (52px x 52px) */}
        <a
          href="https://www.facebook.com/sgdeath04/"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat qua Facebook Messenger"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
            boxShadow: '0 6px 18px rgba(0, 132, 255, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
            alt="Messenger"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        </a>

        {/* 2. Zalo Button (52px x 52px) */}
        <a
          href="https://zalo.me/0909260436"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat qua Zalo (0909260436)"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0068FF 0%, #0044CC 100%)',
            boxShadow: '0 6px 18px rgba(0, 104, 255, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
            alt="Zalo"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        </a>

        {/* 3. AI Chatbot Main Button (52px x 52px) + Greeting Pill */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          
          {/* Greeting Pill "Bạn cần hỗ trợ gì?" (nằm bên trái nút chatbot) */}
          {showGreetingPill && !isOpen && (
            <div
              style={{
                position: 'absolute',
                right: '64px',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #c8e600 0%, #a3e635 100%)',
                color: '#0a0a0f',
                padding: '9px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 6px 20px rgba(200, 230, 0, 0.4)',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                animation: 'bounceIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onClick={() => setIsOpen(true)}
            >
              <span>Bạn cần hỗ trợ gì?</span>
              
              {/* Small Close (x) Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGreetingPill(false)
                }}
                title="Đóng thông báo"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#334155')}
              >
                ✕
              </button>
            </div>
          )}

          {/* Robot Round Avatar Button (Kích thước 52px x 52px) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            title="Chat với Trợ Lý Virtual AI"
            style={{
              position: 'relative',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* White Speech Bubble (...) on Top-Right */}
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-2px',
                zIndex: 3,
                background: '#ffffff',
                border: '1.5px solid #0f172a',
                borderRadius: '8px',
                padding: '2px 4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="12" height="9" viewBox="0 0 20 12" fill="#0f172a">
                <circle cx="4" cy="6" r="2" />
                <circle cx="10" cy="6" r="2" />
                <circle cx="16" cy="6" r="2" />
              </svg>
            </div>

            {/* Main Round Avatar Circle (Kích thước 52px x 52px) */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isOpen ? '#1e293b' : 'linear-gradient(135deg, #1e293b 0%, #0b0f19 100%)',
                border: '2.5px solid var(--accent-color, #c8e600)',
                boxShadow: '0 8px 24px rgba(200, 230, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {isOpen ? (
                <span style={{ fontSize: '20px', color: 'var(--accent-color, #c8e600)', fontWeight: 'bold' }}>✕</span>
              ) : (
                <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                  {/* Antennas */}
                  <circle cx="14" cy="8" r="2.5" fill="#c8e600" />
                  <line x1="14" y1="8" x2="18" y2="15" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="34" cy="8" r="2.5" fill="#c8e600" />
                  <line x1="34" y1="8" x2="30" y2="15" stroke="#c8e600" strokeWidth="2" strokeLinecap="round" />

                  {/* Robot Head Outer */}
                  <rect x="10" y="14" width="28" height="24" rx="12" fill="#1e293b" stroke="#c8e600" strokeWidth="2" />
                  
                  {/* Visor Screen */}
                  <rect x="14" y="20" width="20" height="12" rx="6" fill="#0f172a" stroke="#c8e600" strokeWidth="1.5" />

                  {/* Happy Arc Eyes */}
                  <path d="M17 25 Q19 22 21 25" stroke="#c8e600" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M27 25 Q29 22 31 25" stroke="#c8e600" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                  {/* Cute Smile Mouth */}
                  <path d="M21 29 Q24 32 27 29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </div>

            {/* Online Green Indicator Dot */}
            {!isOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #0f172a',
                  boxShadow: '0 0 6px #22c55e'
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
