import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../assets/styles/auth.css'

// ✅ THAY "YOUR_GOOGLE_CLIENT_ID" bằng Client ID thật từ Google Cloud Console
//    https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
import { API_BASE } from '../services/apiService';

export default function Auth() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const isLogin    = location.pathname !== '/register'
  const googleBtnLoginRef    = useRef(null)
  const googleBtnRegisterRef = useRef(null)
  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors]                           = useState({})
  const [googleLoading, setGoogleLoading]             = useState(false)

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal]        = useState(false)
  const [forgotStep, setForgotStep]                  = useState(1) // 1: enter email, 2: enter OTP & new password
  const [forgotForm, setForgotForm]                  = useState({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
  const [forgotLoading, setForgotLoading]            = useState(false)
  const [forgotError, setForgotError]                = useState('')
  const [forgotSuccess, setForgotSuccess]            = useState('')

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [registerForm, setRegisterForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validatePhone = (phone) => {
    const regex = /^(\+84|0)[0-9]{9,10}$/
    return regex.test(phone)
  }

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, type, value, checked } = e.target
    setLoginForm({
      ...loginForm,
      [name]: type === 'checkbox' ? checked : value
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateLoginForm = () => {
    const newErrors = {}
    const inputVal = (loginForm.email || '').trim()
    if (!inputVal) {
      newErrors.email = 'Email hoặc Số điện thoại không được để trống'
    } else if (!validateEmail(inputVal) && !validatePhone(inputVal)) {
      newErrors.email = 'Vui lòng nhập Email hoặc Số điện thoại hợp lệ'
    }
    if (!loginForm.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (!validatePassword(loginForm.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    return newErrors
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateLoginForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // gửi/nhận cookie
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      })

      const data = await res.json()

      if (data.success) {
        if (data.user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else {
        setErrors({ general: data.message || 'Email hoặc mật khẩu không đúng' })
      }
    } catch (error) {
      setErrors({ general: 'Không thể kết nối server. Vui lòng thử lại!' })
    }
  }

  // Forgot password handlers
  const handleForgotSendOtp = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    const inputEmail = forgotForm.identifier.trim()
    if (!inputEmail) {
      setForgotError('Vui lòng nhập địa chỉ Email')
      return
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail)
    if (!isEmail) {
      setForgotError('Vui lòng nhập đúng định dạng Email (Ví dụ: account@gmail.com). Hệ thống không hỗ trợ số điện thoại.')
      return
    }
    setForgotLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotForm.identifier.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setForgotSuccess(data.message)
        setForgotStep(2)
        // Reset các ô nhập ở bước 2 để đảm bảo các ô đều trống
        setForgotForm(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }))
      } else {
        setForgotError(data.message || 'Lỗi gửi mã OTP')
      }
    } catch {
      setForgotError('Không thể kết nối tới server')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotResetPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    if (!forgotForm.otp.trim() || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      setForgotError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp')
      return
    }
    setForgotLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotForm.identifier.trim(),
          otp: forgotForm.otp.trim(),
          newPassword: forgotForm.newPassword,
          confirmPassword: forgotForm.confirmPassword
        })
      })
      const data = await res.json()
      if (data.success) {
        setForgotSuccess(data.message || 'Đổi mật khẩu thành công!')
        setTimeout(() => {
          setShowForgotModal(false)
          setForgotStep(1)
          setForgotForm({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
          setForgotSuccess('')
        }, 2000)
      } else {
        setForgotError(data.message || 'Đặt lại mật khẩu thất bại')
      }
    } catch {
      setForgotError('Lỗi kết nối server')
    } finally {
      setForgotLoading(false)
    }
  }

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, type, value, checked } = e.target
    setRegisterForm({
      ...registerForm,
      [name]: type === 'checkbox' ? checked : value
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateRegisterForm = () => {
    const newErrors = {}
    if (!registerForm.email) {
      newErrors.email = 'Email không được để trống'
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!registerForm.phone) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!validatePhone(registerForm.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    if (!registerForm.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (!validatePassword(registerForm.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống'
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không trùng khớp'
    }
    if (!registerForm.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản'
    }
    return newErrors
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateRegisterForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: registerForm.phone,
          email: registerForm.email,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        navigate('/') // Đăng ký xong → về trang chủ luôn (vì BE đã set cookie)
      } else {
        setErrors({ general: data.message || 'Đăng ký thất bại' })
      }
    } catch (error) {
      setErrors({ general: 'Không thể kết nối server. Vui lòng thử lại!' })
    }
  }

  // === GOOGLE IDENTITY SERVICES ===
  // Load Google GSI script và khởi tạo nút đăng nhập/đăng ký
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      // Render nút Google đẹp vào các ref container
      if (googleBtnLoginRef.current) {
        window.google.accounts.id.renderButton(googleBtnLoginRef.current, {
          type:  'standard',
          shape: 'rectangular',
          theme: 'filled_black',
          text:  'signin_with',
          size:  'large',
          width: '100%',
          logo_alignment: 'left',
        })
      }
      if (googleBtnRegisterRef.current) {
        window.google.accounts.id.renderButton(googleBtnRegisterRef.current, {
          type:  'standard',
          shape: 'rectangular',
          theme: 'filled_black',
          text:  'signup_with',
          size:  'large',
          width: '100%',
          logo_alignment: 'left',
        })
      }
    }

    // Load script nếu chưa có
    if (!document.getElementById('gsi-script')) {
      const script = document.createElement('script')
      script.id  = 'gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogle
      document.body.appendChild(script)
    } else if (window.google) {
      initGoogle()
    }
  }, [isLogin]) // chạy lại khi chuyển giữa login / register

  // Callback nhận credential từ Google popup
  const handleGoogleCallback = async (response) => {
    if (!response?.credential) {
      setErrors({ general: 'Không nhận được thông tin từ Google. Vui lòng thử lại!' })
      return
    }
    setGoogleLoading(true)
    setErrors({})
    try {
      const res  = await fetch(`${API_BASE}/api/auth/google`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()

      if (data.success) {
        if (data.user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else {
        setErrors({ general: data.message || 'Đăng nhập Google thất bại' })
      }
    } catch (err) {
      setErrors({ general: 'Không thể kết nối server. Vui lòng thử lại!' })
    } finally {
      setGoogleLoading(false)
    }
  }

  // Fallback khi chưa cài Client ID
  const handleSocialLogin = (platform) => {
    if (platform === 'Google') {
      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        alert('⚠️ Chưa cài đặt Google Client ID!\n\nVui lòng xem hướng dẫn bên dưới để tạo và cài đặt.')
        return
      }
      if (window.google) {
        window.google.accounts.id.prompt()
      }
      return
    }
    alert(`Đăng nhập với ${platform} (chưa hỗ trợ)`)
  }

  return (
    <div className="auth-container">
      {/* Background */}
      <div className="auth-background"></div>

      {/* Main content */}
      <div className={`auth-content ${isLogin ? 'content-login' : 'content-register'}`}>
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              WINNO<span>TECH</span>
            </div>
            <div className="auth-tagline">BUILD. PERFORM. DOMINATE.</div>
          </div>

          {/* Forms */}
          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <h2 className="form-title">Đăng nhập</h2>

              {/* Email hoặc Số điện thoại */}
              <div className="form-group">
                <label>Email hoặc Số điện thoại</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    name="email"
                    placeholder="Nhập email hoặc số điện thoại"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className={errors.password ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Remember & Forgot */}
              <div className="form-footer-top">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginForm.rememberMe}
                    onChange={handleLoginChange}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="forgot-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => {
                    setShowForgotModal(true)
                    setForgotStep(1)
                    setForgotForm({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
                    setForgotError('')
                    setForgotSuccess('')
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit */}
              {errors.general && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '8px'
                }}>
                  {errors.general}
                </div>
              )}
              <button type="submit" className="btn-submit">ĐĂNG NHẬP</button>

              {/* Social Login */}
              <div className="social-divider">HOẶC ĐĂNG NHẬP VỚI</div>
              <div className="social-buttons">
                {/* Nút Google thực sự — render bằng Google GSI */}
                {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ? (
                  <div ref={googleBtnLoginRef} id="google-btn-login" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                ) : (
                  <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                )}

              </div>

              {/* Switch to Register */}
              <div className="auth-footer">
                <span>Chưa có tài khoản? </span>
                <button type="button" onClick={() => navigate('/register')} className="switch-link">
                  Đăng ký →
                </button>
              </div>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <h2 className="form-title">TẠO TÀI KHOẢN</h2>


              <div className="register-grid">
                {/* Email */}
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      placeholder="Nhập email của bạn"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      className={errors.email ? 'input-error' : ''}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={registerForm.phone}
                      onChange={handleRegisterChange}
                      className={errors.phone ? 'input-error' : ''}
                    />
                  </div>
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      className={errors.password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      className={errors.confirmPassword ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={registerForm.agreeTerms}
                  onChange={handleRegisterChange}
                />
                <span>Tôi đồng ý với điều khoản sử dụng</span>
              </label>
              {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}

              {/* Submit */}
              <button type="submit" className="btn-submit">ĐĂNG KÝ</button>

              {/* Social Login */}
              <div className="social-divider">HOẶC ĐĂNG KÝ VỚI</div>
              <div className="social-buttons">
                {/* Nút Google thực sự — render bằng Google GSI */}
                {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ? (
                  <div ref={googleBtnRegisterRef} id="google-btn-register" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                ) : (
                  <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                )}

              </div>

              {/* Switch to Login */}
              <div className="auth-footer">
                <span>Đã có tài khoản? </span>
                <button type="button" onClick={() => navigate('/login')} className="switch-link">
                  Đăng nhập ngay →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* MODAL QUÊN MẬT KHẨU VIA OTP */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#161821', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            width: '100%', maxWidth: '440px', padding: '28px', color: '#fff', position: 'relative'
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#d4ff00', marginBottom: '8px' }}>
              KHÔI PHỤC MẬT KHẨU
            </h3>
            <p style={{ fontSize: '13px', color: '#a0aec0', marginBottom: '20px' }}>
              {forgotStep === 1
                ? 'Nhập địa chỉ Email đăng ký để nhận mã OTP khôi phục.'
                : `Nhập mã OTP vừa gửi tới ${forgotForm.identifier} và tạo mật khẩu mới.`}
            </p>

            {forgotError && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSendOtp} autoComplete="off">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Địa chỉ Email (*)</label>
                  <input
                    type="email"
                    name="forgot_email"
                    autoComplete="off"
                    placeholder="Nhập email đăng ký (Ví dụ: name@example.com)"
                    value={forgotForm.identifier}
                    onChange={e => setForgotForm({ ...forgotForm, identifier: e.target.value })}
                    style={{ width: '100%', background: '#0f1015', border: '1px solid rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{ width: '100%', background: '#d4ff00', color: '#000', fontWeight: 700, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: forgotLoading ? 0.6 : 1 }}
                >
                  {forgotLoading ? 'ĐANG GỬI OTP...' : 'GỬI MÃ OTP VIA EMAIL'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} autoComplete="off">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Mã OTP (6 chữ số)</label>
                  <input
                    type="text"
                    name="forgot_otp_code"
                    maxLength="6"
                    autoComplete="off"
                    placeholder="Nhập mã OTP 6 chữ số"
                    value={forgotForm.otp}
                    onChange={e => setForgotForm({ ...forgotForm, otp: e.target.value })}
                    style={{ width: '100%', background: '#0f1015', border: '1px solid rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="forgot_new_password"
                    autoComplete="new-password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={forgotForm.newPassword}
                    onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    style={{ width: '100%', background: '#0f1015', border: '1px solid rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="forgot_confirm_password"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={forgotForm.confirmPassword}
                    onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                    style={{ width: '100%', background: '#0f1015', border: '1px solid rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ flex: 2, background: '#d4ff00', color: '#000', fontWeight: 700, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: forgotLoading ? 0.6 : 1 }}
                  >
                    {forgotLoading ? 'ĐANG ĐỔI...' : 'ĐỔI MẬT KHẨU'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
