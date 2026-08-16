import React, { useState, useRef, useEffect } from 'react'
import { chatbotAPI } from '../services/apiService'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickContact, setShowQuickContact] = useState(false)
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
    
    // Tạo history gửi API
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
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 100px)',
            background: '#121621',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '16px',
            animation: 'fadeInUp 0.25s ease-out forwards',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d4ff00 0%, #a3e635 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#0f172a',
                  boxShadow: '0 4px 12px rgba(212, 255, 0, 0.3)',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>
                  Trợ Lý Virtual AI
                </div>
                <div style={{ color: '#a3e635', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#a3e635',
                      display: 'inline-block',
                    }}
                  />
                  Gemini 1.5 Online
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
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #d4ff00 0%, #b5e600 100%)' : '#1e293b',
                    color: msg.role === 'user' ? '#000' : '#e2e8f0',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    fontWeight: msg.role === 'user' ? '600' : '400',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '14px 14px 14px 2px',
                    background: '#1e293b',
                    color: '#94a3b8',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>AI đang suy nghĩ</span>
                  <span style={{ animation: 'blink 1.4s infinite 0.2s' }}>.</span>
                  <span style={{ animation: 'blink 1.4s infinite 0.4s' }}>.</span>
                  <span style={{ animation: 'blink 1.4s infinite 0.6s' }}>.</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTION CHIPS */}
          {messages.length <= 2 && !isLoading && (
            <div
              style={{
                padding: '8px 12px',
                background: '#0b0f19',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.replace(/^[^\s]+\s/, ''))}
                  style={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    fontSize: '11px',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <div
            style={{
              padding: '12px',
              background: '#121621',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
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
                background: input.trim() ? 'linear-gradient(135deg, #d4ff00 0%, #a3e635 100%)' : '#334155',
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

      {/* STACKED QUICK CONTACT BUTTONS (ZALO & MESSENGER) */}
      {showQuickContact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', animation: 'fadeInUp 0.3s ease-out' }}>
          
          {/* Zalo Button */}
          <a
            href="https://zalo.me/0909260436"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat qua Zalo (0909260436)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px 8px 10px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #0068FF 0%, #0044CC 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              boxShadow: '0 6px 20px rgba(0, 104, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px', flexShrink: 0 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span>Zalo: 0909260436</span>
          </a>

          {/* Messenger Button */}
          <a
            href="https://www.facebook.com/sgdeath04/"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat qua Facebook Messenger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px 8px 10px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              boxShadow: '0 6px 20px rgba(0, 132, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px', flexShrink: 0 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span>Messenger Fanpage</span>
          </a>

        </div>
      )}

      {/* FLOATING ACTION BAR: MŨI TÊN MỞ RỘNG + NÚT AI CHATBOT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Nút mũi tên đệm stack Zalo / Messenger */}
        <button
          onClick={() => setShowQuickContact(!showQuickContact)}
          title={showQuickContact ? 'Thu gọn kênh liên hệ Zalo / Messenger' : 'Mở rộng liên hệ Zalo & Messenger'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: showQuickContact ? '#ff3333' : '#1e1e2d',
            color: showQuickContact ? '#ffffff' : '#d4ff00',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {showQuickContact ? '▼' : '▲'}
        </button>

        {/* Nút AI Chatbot chính */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #d4ff00 0%, #99cc00 100%)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212, 255, 0, 0.4), 0 0 0 2px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            position: 'relative',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isOpen ? '✕' : '🤖'}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                background: '#22c55e',
                border: '2px solid #121621',
                borderRadius: '50%',
              }}
            />
          )}
        </button>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
