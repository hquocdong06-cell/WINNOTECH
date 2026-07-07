import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

/**
 * useAuth — Hook kiểm tra trạng thái đăng nhập qua cookie JWT
 *
 * Returns:
 *   isLoggedIn  {boolean|null}  null = đang check, true/false = kết quả
 *   user        {object|null}   thông tin user nếu đã login
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        })
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setIsLoggedIn(true)
            setUser(data.data || null)
            return
          }
        }
        setIsLoggedIn(false)
      } catch {
        if (!cancelled) setIsLoggedIn(false)
      }
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  return { isLoggedIn, user }
}
