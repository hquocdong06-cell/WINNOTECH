import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/styles/auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

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
    if (!loginForm.email) {
      newErrors.email = 'Email không được để trống'
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Email không hợp lệ'
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
      const res = await fetch('http://localhost:3000/login', {
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
        navigate('/') // Đăng nhập thành công → về trang chủ
      } else {
        setErrors({ general: data.message || 'Email hoặc mật khẩu không đúng' })
      }
    } catch (error) {
      setErrors({ general: 'Không thể kết nối server. Vui lòng thử lại!' })
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
      const res = await fetch('http://localhost:3000/register', {
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

  const handleSocialLogin = (platform) => {
    alert(`Đăng nhập với ${platform} (Mock only)`)
  }

  return (
    <div className="auth-container">
      {/* Background */}
      <div className="auth-background"></div>

      {/* Main content */}
      <div className="auth-content">
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
                <a href="#" className="forgot-link">Quên mật khẩu?</a>
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
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Facebook')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Discord')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1 .008-.128c.125-.092.25-.19.371-.287a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.098.246.195.371.288a.077.077 0 0 1 .009.127 13.072 13.072 0 0 1-1.872.892.076.076 0 0 0-.041.107c.352.699.764 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.887 19.887 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.566-.838-8.529-3.549-12.047a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.19-.964 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.965-2.157 2.157-2.157 1.192 0 2.157.964 2.157 2.157 0 1.19-.965 2.156-2.157 2.156z" />
                  </svg>
                  Discord
                </button>
              </div>

              {/* Switch to Register */}
              <div className="auth-footer">
                <span>Chưa có tài khoản? </span>
                <button type="button" onClick={() => setIsLogin(false)} className="switch-link">
                  Đăng ký →
                </button>
              </div>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <h2 className="form-title">TẠO TÀI KHOẢN</h2>


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
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Facebook')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Discord')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1 .008-.128c.125-.092.25-.19.371-.287a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.098.246.195.371.288a.077.077 0 0 1 .009.127 13.072 13.072 0 0 1-1.872.892.076.076 0 0 0-.041.107c.352.699.764 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.887 19.887 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.566-.838-8.529-3.549-12.047a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.19-.964 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.965-2.157 2.157-2.157 1.192 0 2.157.964 2.157 2.157 0 1.19-.965 2.156-2.157 2.156z" />
                  </svg>
                  Discord
                </button>
              </div>

              {/* Switch to Login */}
              <div className="auth-footer">
                <span>Đã có tài khoản? </span>
                <button type="button" onClick={() => setIsLogin(true)} className="switch-link">
                  Đăng nhập ngay →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
