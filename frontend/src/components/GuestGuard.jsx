import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * GuestGuard — Bảo vệ trang Login/Register
 * 
 * Logic:
 *  - Gọi API /auth/me để kiểm tra cookie có hợp lệ không
 *  - Nếu đã đăng nhập (success: true) → redirect sang trang chủ
 *  - Nếu chưa đăng nhập (401) → cho hiện children (form login/register)
 */
export default function GuestGuard({ children }) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true) // đang check thì chưa render gì

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/me', {
          method: 'GET',
          credentials: 'include', // gửi cookie lên BE
        })

        if (res.ok) {
          // Đã đăng nhập → đá về trang chủ
          const data = await res.json()
          if (data.success) {
            navigate('/', { replace: true })
            return
          }
        }

        // 401 hoặc lỗi → chưa đăng nhập → cho hiện form
        setChecking(false)

      } catch (error) {
        // Nếu BE chưa chạy thì cũng cho hiện form bình thường
        console.warn('Không thể kết nối BE để check auth:', error.message)
        setChecking(false)
      }
    }

    checkAuth()
  }, [navigate])

  // Đang check → hiện loading nhẹ
  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0f',
        color: '#7c3aed',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    )
  }

  // Chưa đăng nhập → render form login/register bình thường
  return children
}
