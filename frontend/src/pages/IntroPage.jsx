import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gamerImg from '../assets/images/esport_gamer_intro.jpg'
import '../assets/styles/intro.css'

export default function IntroPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const handleEnterSite = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      navigate('/home')
    }, 550)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          handleEnterSite()
          return 100
        }
        return prev + 2.2
      })
    }, 90)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`intro-container ${isFadingOut ? 'fade-out' : ''}`} style={{ opacity: isFadingOut ? 0 : 1 }}>
      {/* Floating RGB Embers */}
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="intro-ember"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Esports Gamer Setup Artwork Wrap */}
      <div className="intro-gamer-wrap">
        <img src={gamerImg} alt="WinNoTech Esports Gamer Setup" className="intro-gamer-img" />
      </div>

      {/* WINNOTECH Brand Title below Esports Setup */}
      <div className="intro-brand-container">
        <h1 className="intro-logo-text">
          WINNO<span className="highlight">TECH</span>
        </h1>
        <p className="intro-sub-tag">PRO ESPORTS & HIGH-END PC ECOSYSTEM</p>
      </div>

      {/* Footer Progress & Entrance Button */}
      <div className="intro-footer-action">
        <div className="intro-progress-bar-wrap">
          <div className="intro-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <button className="btn-skip-intro" onClick={handleEnterSite}>
          VÀO TRANG CHỦ ➔
        </button>
      </div>
    </div>
  )
}
