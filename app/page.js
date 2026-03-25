'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, MessageSquare, Sofa, Search, Wallet, Moon, Gamepad2, Radio, Music, 
  Calendar, Bell, Lock, X, Eye, EyeOff, Volume2, VolumeX, UserPlus, CheckCircle, 
  LogOut, Settings, Sparkles, Home, User, ChevronRight, Send, Heart, Check, Trash2,
  Play, Image as ImageIcon, Plus, Camera, Video, Type, Loader2
} from 'lucide-react'
import { useNotifications } from './contexts/NotificationContext'

// Image compression utility
const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Simple analytics tracker
const trackEvent = (eventName, data = {}) => {
  try {
    // Store analytics locally for now
    const analytics = JSON.parse(localStorage.getItem('lowkey_analytics') || '[]')
    analytics.push({
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
      userId: data.userId || 'anonymous'
    })
    // Keep last 100 events
    if (analytics.length > 100) analytics.shift()
    localStorage.setItem('lowkey_analytics', JSON.stringify(analytics))
    
    // Could send to server here
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event: eventName, data }) })
  } catch (e) {
    // Silent fail for analytics
  }
}

// Auth Context
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Animated Background Component
const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="blob blob-1" />
    <div className="blob blob-2" />
    <div className="blob blob-3" />
    <div className="blob blob-4" />
    <div className="blob blob-5" />
    <div className="blob blob-6" />
    <div className="noise-overlay" />
  </div>
)

// Logo Component - Using the uploaded logo - BIGGER
const LowKeyLogo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  }
  
  return (
    <div className="flex flex-col items-center">
      <img 
        src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" 
        alt="LowKey"
        className={`${sizes[size]} object-contain drop-shadow-2xl`}
      />
    </div>
  )
}

// Lock Modal Component
const LockModal = ({ isOpen, onClose }) => {
  const router = useRouter()
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="lock-modal">
      <div className="glass-card rounded-3xl p-8 max-w-sm mx-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/15">
            <Lock className="w-7 h-7 text-purple-400" strokeWidth={1.5} />
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-colors" data-testid="lock-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-heading font-semibold text-white mb-2">Feature Locked</h3>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Finish verification to unlock this feature. Upload your verification photo and complete the steps.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => { onClose(); router.push('/verification'); }}
            className="neon-btn w-full py-4 text-[#9333EA]"
            style={{ border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 20px rgba(147,51,234,0.12)', background: 'rgba(147,51,234,0.06)' }}
            data-testid="start-verification-btn"
          >
            Start Verification
          </button>
          <button 
            onClick={onClose}
            className="lk-btn-ghost w-full py-3"
            data-testid="maybe-later-btn"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

// Onboarding Slide Component
// Shows once after first successful login as a full-screen overlay
// Persists "seen" state in localStorage per user to never show again
const OnboardingSlide = ({ isOpen, onDismiss }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto">
      {/* Animated Background - same as app */}
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="blob blob-5" />
        <div className="blob blob-6" />
        <div className="noise-overlay" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col p-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to LowKey</h1>
          <p className="text-[#9333EA]/60 text-lg font-medium">More than dating. A private, multi-dimensional world.</p>
        </div>
        
        {/* Intro */}
        <div className="mb-8">
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Lowkey is a curated digital space where connection, creativity, and nightlife culture exist together — intentionally.
          </p>
          <p className="text-white/40 text-sm italic">
            This isn't just about matching profiles.<br />
            It's about <span className="text-white">how</span> and <span className="text-white">where</span> you connect.
          </p>
        </div>
        
        {/* What We Offer */}
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5">
          <h2 className="lk-label text-purple-400 mb-4">What Lowkey Offers</h2>
          <p className="text-white/30 text-xs mb-4">A multi-layered experience designed for different moods, moments, and levels of expression:</p>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-[#9333EA]/50 mt-0.5">•</span>
              <span><span className="text-white">Main Lounges</span> for open conversation, community, and discovery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><span className="text-white">After Dark spaces</span> that prioritise privacy, discretion, and anonymity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-pink-400 mt-0.5">•</span>
              <span><span className="text-white">Live radio & music rooms</span> to vibe, listen, and connect in real time</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><span className="text-white">Content creation spaces</span> to host, share, and build your presence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">•</span>
              <span>A calm, intentional environment designed around <span className="text-white">safety and respect</span></span>
            </li>
          </ul>
          <p className="text-gray-400 text-xs mt-4 italic">
            Whether you're here to talk, listen, create, or explore — there's a space for it.
          </p>
        </div>
        
        {/* What We Expect */}
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5">
          <h2 className="lk-label text-purple-400 mb-4">What Lowkey Expects</h2>
          <p className="text-gray-400 text-xs mb-4">To protect the experience and the people in it, Lowkey expects:</p>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>A real display photo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Honest profile information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Respectful behaviour at all times</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Patience during verification — some spaces unlock after approval</span>
            </li>
          </ul>
          <p className="text-gray-500 text-xs mt-4">
            Not everyone is accepted.<br />
            <span className="text-gray-400">That's how Lowkey stays intentional, safe, and worth being part of.</span>
          </p>
        </div>
        
        {/* Closing */}
        <div className="text-center mb-8">
          <p className="text-white font-medium">Lowkey isn't for everyone.</p>
          <p className="text-[#9333EA]/50 text-sm mt-1">It's for people who want more than surface-level connection.</p>
        </div>
        
        {/* Continue Button */}
        <div className="mt-auto">
          <button 
            onClick={onDismiss}
            className="neon-btn w-full py-4 text-[#9333EA]"
            style={{ border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 20px rgba(147,51,234,0.12)', background: 'rgba(147,51,234,0.06)' }}
            data-testid="onboarding-continue-btn"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// After Dark Disclaimer Component
// Contextual gate shown only the first time a user enters After Dark
// This is separate from main onboarding because After Dark requires explicit consent
// due to its privacy-focused and adult nature
const AfterDarkDisclaimer = ({ isOpen, onAccept }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f]" data-testid="afterdark-disclaimer">
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="blob blob-5" />
        <div className="blob blob-6" />
        <div className="noise-overlay" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/15">
            <Moon className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-white mb-2">After Dark on Lowkey</h1>
          <p className="text-orange-400 text-sm mb-8">Private. Discreet. Anonymous.</p>
          
          <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5 text-left">
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              After Dark spaces are designed for privacy, discretion, and anonymous expression.
            </p>
            
            <div className="border-l-2 border-orange-500/50 pl-4 mb-4">
              <p className="text-white text-sm font-medium mb-2">
                Respect and consent are mandatory at all times.
              </p>
              <p className="text-white/40 text-sm">
                Harassment, coercion, or non-consensual behaviour is not tolerated and will result in removal.
              </p>
            </div>
            
            <p className="text-white/25 text-xs italic">
              After Dark is optional and unlocked only after verification.
            </p>
          </div>
          
          <button 
            onClick={onAccept}
            className="neon-btn w-full py-4 text-[#E8364E]"
            style={{ border: '1.5px solid rgba(232,54,78,0.4)', boxShadow: '0 0 20px rgba(232,54,78,0.12)', background: 'rgba(232,54,78,0.06)' }}
            data-testid="afterdark-accept-btn"
          >
            I Understand · Enter After Dark
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Lounge Info Modal
// Non-blocking info panel triggered when user taps the Lounge tile
// Explains what the Main Lounge is without blocking access
// User can proceed directly or dismiss
const MainLoungeInfo = ({ isOpen, onClose, onEnter }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="lounge-info-modal">
      <div className="max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="relative glass-card rounded-3xl p-8 border border-white/5">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/15">
            <Sofa className="w-7 h-7 text-cyan-400" strokeWidth={1.5} />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-heading font-bold text-white mb-2">The Main Lounge</h2>
            <p className="text-cyan-400 text-sm mb-4">The heart of Lowkey</p>
            
            <p className="text-white/50 text-sm leading-relaxed">
              The central, open social space where conversation, culture, music, and community come together.
            </p>
            
            <p className="text-white/30 text-sm mt-3 italic">
              A place for relaxed, real-time connection.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={onEnter}
              className="neon-btn w-full py-3.5 text-[#3B82F6]"
              style={{ border: '1.5px solid rgba(59,130,246,0.4)', boxShadow: '0 0 20px rgba(59,130,246,0.12)', background: 'rgba(59,130,246,0.06)' }}
              data-testid="enter-lounge-btn"
            >
              Enter Lounge
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-white/30 text-sm hover:text-white transition-colors"
              data-testid="lounge-maybe-later-btn"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Forgot Password Modal
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="forgot-password-modal">
      <div className="glass-card rounded-3xl p-8 max-w-sm mx-auto w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading font-semibold text-white">Reset Password</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-colors" data-testid="close-forgot-modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/15">
              <CheckCircle className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            </div>
            <p className="text-white/50 text-sm">If an account exists with that email, a reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-white/40 text-sm">Enter your email and we'll send you a link to reset your password.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="lk-input w-full"
              required
              data-testid="forgot-email-input"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full py-4 text-[#9333EA] disabled:opacity-50"
              style={{ border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 20px rgba(147,51,234,0.12)', background: 'rgba(147,51,234,0.06)' }}
              data-testid="send-reset-link-btn"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Auth Page Component
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin 
        ? { identifier: email, password }
        : { email, password, displayName }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      localStorage.setItem('lowkey_user', JSON.stringify(data.user))
      localStorage.setItem('lowkey_token', data.token)
      onLogin(data.user)
    } catch (err) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" data-testid="auth-page">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <LowKeyLogo size="xl" />
          <p className="text-white/40 mt-8 text-lg font-light tracking-wide text-center" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Grown chats. Real nights. Private parties.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl" style={{ border: '1px solid rgba(147,51,234,0.12)', boxShadow: '0 0 40px rgba(147,51,234,0.06), 0 8px 40px rgba(0,0,0,0.5)' }} data-testid="auth-card">
          {/* Tabs */}
          <div className="flex mb-8 bg-white/[0.03] rounded-full p-1 border border-white/[0.04]">
            <button
              onClick={() => setIsLogin(true)}
              data-testid="auth-signin-tab"
              className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 font-heading text-sm ${
                isLogin 
                  ? 'text-white' 
                  : 'text-white/25 hover:text-white/50'
              }`}
              style={isLogin ? { background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', boxShadow: '0 0 16px rgba(147,51,234,0.1)' } : { border: '1px solid transparent' }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              data-testid="auth-join-tab"
              className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 font-heading text-sm ${
                !isLogin 
                  ? 'text-white' 
                  : 'text-white/25 hover:text-white/50'
              }`}
              style={!isLogin ? { background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', boxShadow: '0 0 16px rgba(147,51,234,0.1)' } : { border: '1px solid transparent' }}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="lk-label block mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="lk-input-neon w-full"
                  placeholder="Your display name"
                  required={!isLogin}
                  data-testid="auth-display-name-input"
                />
              </div>
            )}

            <div>
              <label className="lk-label block mb-2">Email</label>
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lk-input-neon w-full uppercase"
                placeholder={isLogin ? 'Email or display name' : 'your@email.com'}
                required
                data-testid="auth-email-input"
              />
            </div>

            <div>
              <label className="lk-label block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lk-input-neon w-full pr-12"
                  placeholder="••••••••"
                  required
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#141420] text-[#9333EA] focus:ring-[#9333EA]"
                  />
                  <span className="text-white/40 text-sm">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[#9333EA]/60 text-sm hover:text-[#9333EA] transition-colors"
                  data-testid="auth-forgot-password-btn"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" data-testid="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full py-4 text-[#9333EA] text-base font-bold disabled:opacity-50"
              style={{ 
                border: '1.5px solid rgba(147,51,234,0.5)',
                boxShadow: '0 0 20px rgba(147,51,234,0.15), 0 0 40px rgba(147,51,234,0.05)',
                background: 'rgba(147,51,234,0.06)'
              }}
              data-testid="auth-submit-btn"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Join Now')}
            </button>
          </form>

          <p className="text-center text-white/10 text-xs mt-8 tracking-wider">
            Powered by <span className="text-[#9333EA]/30">3DK</span> + <span className="text-[#9333EA]/30">King Tense</span>
          </p>
        </div>
      </div>
      
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  )
}

// Tile Component - Horizontal rectangular with colored left border (matching screenshot)
const Tile = ({ icon: Icon, label, colorClass, isLocked, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`tile ${colorClass} relative w-full h-14 rounded-xl flex items-center gap-3 px-4 group`}
    >
      <Icon className="w-5 h-5 text-white/90" />
      <span className="text-white/90 font-medium text-sm">{label}</span>
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3.5 h-3.5 text-white/60" />
        </div>
      )}
    </button>
  )
}

// Notification Bell Component - Enhanced with animation
const NotificationBell = ({ count, onClick, hasNew }) => (
  <button 
    onClick={onClick} 
    className={`relative p-2 rounded-full hover:bg-white/5 transition-all duration-300 ${hasNew ? 'animate-pulse-soft' : ''}`}
    data-testid="notification-bell"
  >
    <Bell className={`w-5 h-5 transition-colors ${count > 0 ? 'text-[#9333EA]' : 'text-white/20'}`} strokeWidth={1.5} />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-[#E8364E] flex items-center justify-center text-white text-[9px] font-bold px-1" style={{ boxShadow: '0 2px 8px rgba(232,54,78,0.45)' }}>
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
)

// Home Page Component
const HomePage = ({ user, onLogout, setUser }) => {
  const [showLockModal, setShowLockModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAfterDarkDisclaimer, setShowAfterDarkDisclaimer] = useState(false)
  const [showLoungeInfo, setShowLoungeInfo] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [noticeUnreadCount, setNoticeUnreadCount] = useState(0)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [pendingFriendRequests, setPendingFriendRequests] = useState([])
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [showAddStory, setShowAddStory] = useState(false)
  const [storyType, setStoryType] = useState('photo') // photo, video, text
  const [storyFile, setStoryFile] = useState(null)
  const [storyPreview, setStoryPreview] = useState(null)
  const [storyText, setStoryText] = useState('')
  const [storyPrivacy, setStoryPrivacy] = useState('everyone')
  const [storyBgColor, setStoryBgColor] = useState('#1a1a2e')
  const [uploadingStory, setUploadingStory] = useState(false)
  const storyFileInputRef = useRef(null)
  const router = useRouter()
  const pollRef = useRef(null)
  const prevNotificationCount = useRef(0)
  const { soundEnabled, toggleSound, playSound, requestPermission, notifyFriendRequest, notifyMessage } = useNotifications()
  
  const lockedFeatures = ['radio', 'music', 'afterdark']
  
  useEffect(() => {
    // Initial fetch - staggered to avoid blocking
    fetchNotifications()
    
    // Delay other fetches to improve initial load
    const timer1 = setTimeout(() => fetchNoticeUnreadCount(), 500)
    const timer2 = setTimeout(() => fetchPendingFriendRequests(), 1000)
    const timer3 = setTimeout(() => fetchStories(), 1500)
    const timer4 = setTimeout(() => {
      checkOnboarding()
      requestPermission()
    }, 2000)
    
    // Polling every 30 seconds instead of 10 (less aggressive)
    pollRef.current = setInterval(() => {
      fetchNotifications()
      fetchPendingFriendRequests()
      fetchStories()
    }, 30000)
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Check if user has seen onboarding
  const checkOnboarding = () => {
    const onboardingKey = `lowkey_onboarding_${user.id}`
    const hasSeenOnboarding = localStorage.getItem(onboardingKey)
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }

  // Dismiss onboarding and mark as seen
  const dismissOnboarding = () => {
    const onboardingKey = `lowkey_onboarding_${user.id}`
    localStorage.setItem(onboardingKey, 'true')
    setShowOnboarding(false)
  }

  // Check if user has acknowledged After Dark disclaimer
  const hasAcknowledgedAfterDark = () => {
    const key = `lowkey_afterdark_acknowledged_${user.id}`
    return localStorage.getItem(key) === 'true'
  }

  // Accept After Dark disclaimer and proceed
  const acceptAfterDarkDisclaimer = () => {
    const key = `lowkey_afterdark_acknowledged_${user.id}`
    localStorage.setItem(key, 'true')
    setShowAfterDarkDisclaimer(false)
    router.push('/afterdark')
  }

  // Check if user has seen lounge info (show once as intro, not blocking)
  const hasSeenLoungeInfo = () => {
    const key = `lowkey_lounge_info_${user.id}`
    return localStorage.getItem(key) === 'true'
  }

  // Enter lounge and mark info as seen
  const enterLounge = () => {
    const key = `lowkey_lounge_info_${user.id}`
    localStorage.setItem(key, 'true')
    setShowLoungeInfo(false)
    router.push('/lounge')
  }

  // Close lounge info without entering
  const closeLoungeInfo = () => {
    const key = `lowkey_lounge_info_${user.id}`
    localStorage.setItem(key, 'true')
    setShowLoungeInfo(false)
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        
        // Check for new notifications and play sound
        const unreadCount = data.filter(n => !n.read).length
        if (unreadCount > prevNotificationCount.current && prevNotificationCount.current > 0) {
          // New notification arrived
          setHasNewNotification(true)
          playSound()
          
          // Find the newest notification for specific sound
          const newest = data[0]
          if (newest && !newest.read) {
            if (newest.type === 'friend_request') {
              notifyFriendRequest(newest.fromName || 'Someone')
            } else if (newest.type === 'message' || newest.type === 'dm') {
              notifyMessage(newest.fromName || 'Someone', newest.content || newest.message)
            }
          }
          
          // Reset animation after 3 seconds
          setTimeout(() => setHasNewNotification(false), 3000)
        }
        prevNotificationCount.current = unreadCount
        
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  const fetchPendingFriendRequests = async () => {
    try {
      const res = await fetch(`/api/friends/requests/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setPendingFriendRequests(data.pending || [])
      }
    } catch (err) {
      console.error('Failed to fetch friend requests')
    }
  }

  const acceptFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      if (res.ok) {
        setPendingFriendRequests(prev => prev.filter(r => r.fromUserId !== friendId))
        // Update user's friend list
        const updatedUser = { ...user, friends: [...(user.friends || []), friendId] }
        setUser(updatedUser)
        localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
        fetchNotifications()
      }
    } catch (err) {
      console.error('Failed to accept friend request')
    }
  }

  const declineFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      if (res.ok) {
        setPendingFriendRequests(prev => prev.filter(r => r.fromUserId !== friendId))
      }
    } catch (err) {
      console.error('Failed to decline friend request')
    }
  }

  const fetchStories = async () => {
    try {
      const res = await fetch(`/api/stories?viewerId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setStories(data)
      }
    } catch (err) {
      console.error('Failed to fetch stories')
    }
  }

  const viewStory = async (storyGroup) => {
    setSelectedStory(storyGroup)
    trackEvent('story_view', { userId: user.id, storyOwnerId: storyGroup.userId })
    // Mark stories as viewed
    for (const story of storyGroup.stories) {
      if (!story.viewedBy?.includes(user.id)) {
        try {
          await fetch(`/api/stories/${story.id}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          })
        } catch (err) {
          console.error('Failed to mark story as viewed')
        }
      }
    }
  }

  // Handle story file selection
  const handleStoryFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB video, 10MB image
    
    if (file.size > maxSize) {
      alert(`File too large. Max ${isVideo ? '50MB' : '10MB'} allowed.`)
      return
    }
    
    setStoryType(isVideo ? 'video' : 'photo')
    setStoryFile(file)
    setStoryPreview(URL.createObjectURL(file))
  }

  // Create and upload story
  const createStory = async () => {
    if (storyType === 'text' && !storyText.trim()) {
      alert('Please enter some text for your story')
      return
    }
    if (storyType !== 'text' && !storyFile) {
      alert('Please select a photo or video')
      return
    }
    
    setUploadingStory(true)
    trackEvent('story_create_start', { userId: user.id, type: storyType })
    
    try {
      let content = storyText
      
      if (storyFile) {
        // Compress images before upload
        if (storyType === 'photo') {
          content = await compressImage(storyFile, 1200, 0.8)
        } else {
          // For video, convert to base64 (consider chunked upload for large videos)
          content = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(storyFile)
          })
        }
      }
      
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: storyType,
          content: content,
          privacy: storyPrivacy,
          backgroundColor: storyBgColor
        })
      })
      
      if (res.ok) {
        trackEvent('story_create_success', { userId: user.id, type: storyType })
        setShowAddStory(false)
        resetStoryForm()
        fetchStories()
      } else {
        throw new Error('Failed to create story')
      }
    } catch (err) {
      console.error('Story creation failed:', err)
      alert('Failed to create story. Please try again.')
      trackEvent('story_create_error', { userId: user.id, error: err.message })
    }
    setUploadingStory(false)
  }

  // Reset story form
  const resetStoryForm = () => {
    setStoryType('photo')
    setStoryFile(null)
    setStoryPreview(null)
    setStoryText('')
    setStoryPrivacy('everyone')
    setStoryBgColor('#1a1a2e')
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId })
      })
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (err) {
      console.error('Failed to mark notification as read')
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all notifications as read')
    }
  }

  const fetchNoticeUnreadCount = async () => {
    try {
      const res = await fetch(`/api/notices/unread/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNoticeUnreadCount(data.count || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notice unread count')
    }
  }
  
  const handleTileClick = (tileId, path) => {
    // Check if feature is locked for unverified users
    if (lockedFeatures.includes(tileId) && !user.verified) {
      setShowLockModal(true)
      return
    }
    
    // Special handling for After Dark - show disclaimer on first entry
    if (tileId === 'afterdark' && !hasAcknowledgedAfterDark()) {
      setShowAfterDarkDisclaimer(true)
      return
    }
    
    // Special handling for Lounge - show info on first visit (non-blocking)
    if (tileId === 'lounge' && !hasSeenLoungeInfo()) {
      setShowLoungeInfo(true)
      return
    }
    
    router.push(path)
  }

  const unreadCount = notifications.filter(n => !n.read).length + pendingFriendRequests.length

  // Fetch members for "People Online" section
  const [members, setMembers] = useState([])
  const [loungesList, setLoungesList] = useState([])

  useEffect(() => {
    if (!user) return
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()
          setMembers(data.filter(u => u.id !== user.id))
        }
      } catch (err) { /* silent */ }
    }
    const fetchLounges = async () => {
      try {
        const res = await fetch('/api/lounges')
        if (res.ok) {
          const data = await res.json()
          setLoungesList(data)
        }
      } catch (err) { /* silent */ }
    }
    fetchMembers()
    fetchLounges()
  }, [user])

  // Lounge accent palette
  const loungeAccents = ['#3B82F6', '#D4A54A', '#E8364E', '#9333EA', '#E84393', '#10B981']
  const getLoungeAccent = (idx) => loungeAccents[idx % loungeAccents.length]

  return (
    <div className="min-h-screen bg-[#08080D] relative page-enter" data-testid="home-page">
      {/* Ambient background — very subtle neon blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#9333EA]/[0.03] blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-40 right-0 w-[350px] h-[350px] rounded-full bg-[#3B82F6]/[0.02] blur-[130px] pointer-events-none z-0" />
      
      {/* Header */}
      <header className="lk-page-header relative z-10 flex items-center justify-between" data-testid="home-header">
        <div className="flex items-center">
          <div className="lk-logoSlot">
            <img 
              src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" 
              alt="LowKey" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Credit Balance Indicator */}
          <button
            onClick={() => router.push('/wallet')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#D4A54A]/[0.06] border border-[#D4A54A]/15 hover:border-[#D4A54A]/30 transition-colors mr-0.5"
            data-testid="credit-balance-btn"
          >
            <Wallet className="w-3.5 h-3.5 text-[#D4A54A]/70" strokeWidth={1.5} />
            <span className="text-[#D4A54A]/80 text-[11px] font-bold font-heading">{user.credits || 0}</span>
          </button>
          {user.verified && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9333EA]/8 border border-[#9333EA]/15 text-[#9333EA]/70 text-[10px] font-semibold tracking-wide">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            title={soundEnabled ? 'Mute notification sounds' : 'Enable notification sounds'}
            data-testid="sound-toggle-btn"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#9333EA]/60" strokeWidth={1.5} />
            ) : (
              <VolumeX className="w-4 h-4 text-white/15" strokeWidth={1.5} />
            )}
          </button>
          <NotificationBell 
            count={unreadCount} 
            onClick={() => setShowNotifications(!showNotifications)} 
            hasNew={hasNewNotification}
          />
          <button onClick={() => router.push('/admin')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="settings-btn">
            <Settings className="w-4 h-4 text-white/25" strokeWidth={1.5} />
          </button>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="logout-btn">
            <LogOut className="w-4 h-4 text-white/25" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] lk-card-elevated rounded-2xl overflow-hidden animate-fade-in" data-testid="notifications-dropdown">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1A1A24]/95 backdrop-blur-md">
            <h3 className="text-white font-heading font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {notifications.some(n => !n.read) && (
                <button 
                  onClick={markAllNotificationsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  data-testid="mark-all-read-btn"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-white/5"
                data-testid="close-notifications-btn"
              >
                <X className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
            {/* Friend Requests Section */}
            {pendingFriendRequests.length > 0 && (
              <div className="border-b border-white/10">
                <div className="px-4 py-2 bg-pink-500/10">
                  <p className="text-pink-400 text-xs font-medium flex items-center gap-2">
                    <Heart className="w-3 h-3" />
                    Friend Requests ({pendingFriendRequests.length})
                  </p>
                </div>
                {pendingFriendRequests.map((req) => (
                  <div 
                    key={req.id || req.fromUserId} 
                    className="p-4 border-b border-white/5 bg-pink-500/5 hover:bg-pink-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {req.fromAvatar ? (
                          <img src={req.fromAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{req.fromName || 'Unknown User'}</p>
                        <p className="text-gray-400 text-xs">Wants to be your friend</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button 
                          onClick={() => acceptFriendRequest(req.fromUserId)}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => declineFriendRequest(req.fromUserId)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Regular Notifications */}
            {notifications.length === 0 && pendingFriendRequests.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-gray-500 text-xs mt-1">You'll see friend requests, messages, and activity here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => {
                    markNotificationRead(notif.id)
                    if (notif.type === 'dm' || notif.type === 'message') {
                      router.push(`/inbox?conversation=${notif.conversationId || notif.data?.conversationId}`)
                    } else if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
                      router.push('/friends')
                    } else if (notif.type === 'comment') {
                      router.push('/profile')
                    } else if (notif.type === 'tip') {
                      router.push('/wallet')
                    }
                    setShowNotifications(false)
                  }}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'friend_request' ? 'bg-pink-500/20' :
                      notif.type === 'friend_accepted' ? 'bg-green-500/20' :
                      notif.type === 'message' || notif.type === 'dm' ? 'bg-[#3B82F6]/15' :
                      notif.type === 'tip' ? 'bg-yellow-500/20' :
                      notif.type === 'comment' ? 'bg-blue-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      {notif.type === 'friend_request' && <UserPlus className="w-4 h-4 text-pink-400" />}
                      {notif.type === 'friend_accepted' && <Check className="w-4 h-4 text-green-400" />}
                      {(notif.type === 'message' || notif.type === 'dm') && <MessageSquare className="w-4 h-4 text-[#3B82F6]" />}
                      {notif.type === 'tip' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                      {notif.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-400" />}
                      {!['friend_request', 'friend_accepted', 'message', 'dm', 'tip', 'comment'].includes(notif.type) && (
                        <Bell className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{notif.title}</p>
                      <p className="text-gray-400 text-xs truncate">{notif.message || notif.content}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Stories Panel */}
      <div className="relative z-[5] px-5 pt-5">
        <div 
          className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5"
          style={{ 
            WebkitOverflowScrolling: 'touch', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
          data-testid="stories-panel"
        >
          {/* Add Story Button */}
          <button
            onClick={() => setShowAddStory(true)}
            className="flex-none flex flex-col items-center gap-1.5"
            style={{ scrollSnapAlign: 'start' }}
            data-testid="add-story-btn"
          >
            <div className="relative w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-br from-[#9333EA] to-[#3B82F6]">
              <div className="w-full h-full rounded-full bg-[#08080D] flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#9333EA]" strokeWidth={1.5} />
              </div>
            </div>
            <span className="text-white/35 text-[10px] font-medium">Add Story</span>
          </button>
          
          {/* User Stories */}
          {stories.map((storyGroup) => {
            const hasUnviewed = storyGroup.stories?.some(s => !s.viewedBy?.includes(user.id))
            const isOwn = storyGroup.userId === user.id
            const latestStory = storyGroup.stories?.[0]
            const isVideo = latestStory?.type === 'video' || latestStory?.mediaType === 'video'
            
            return (
              <button
                key={storyGroup.userId}
                onClick={() => viewStory(storyGroup)}
                className="flex-none flex flex-col items-center gap-1.5 scroll-snap-align-start"
                style={{ scrollSnapAlign: 'start' }}
                data-testid={`story-${storyGroup.userId}`}
              >
                <div className={`relative w-[68px] h-[68px] rounded-full p-[2px] ${hasUnviewed ? 'bg-gradient-to-br from-[#9333EA] via-[#E84393] to-[#3B82F6]' : 'bg-white/8'}`}>
                  <div className="w-full h-full rounded-full bg-[#08080D] p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#141420] flex items-center justify-center">
                      {storyGroup.avatar ? (
                        <img src={storyGroup.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  {isVideo && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#12121A] flex items-center justify-center border border-white/10">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                  {!isVideo && latestStory?.mediaUrl && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#12121A] flex items-center justify-center border border-white/10">
                      <ImageIcon className="w-3 h-3 text-white/60" />
                    </div>
                  )}
                </div>
                <span className="text-white/50 text-[10px] font-medium truncate w-[68px] text-center">
                  {isOwn ? 'You' : storyGroup.displayName?.split(' ')[0] || 'User'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hidden file input for story */}
      <input
        type="file"
        ref={storyFileInputRef}
        onChange={handleStoryFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Add Story Modal */}
      {showAddStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => { setShowAddStory(false); resetStoryForm(); }}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white font-semibold">Create Story</h2>
              <button onClick={() => { setShowAddStory(false); resetStoryForm(); }} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Story Type Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setStoryType('photo'); setStoryFile(null); setStoryPreview(null); }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  storyType === 'photo' ? 'bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/25' : 'bg-white/5 text-white/30 border border-white/5'
                }`}
              >
                <Camera className="w-4 h-4" /> Photo
              </button>
              <button
                onClick={() => { setStoryType('video'); setStoryFile(null); setStoryPreview(null); }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  storyType === 'video' ? 'bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/25' : 'bg-white/5 text-white/30 border border-white/5'
                }`}
              >
                <Video className="w-4 h-4" /> Video
              </button>
              <button
                onClick={() => { setStoryType('text'); setStoryFile(null); setStoryPreview(null); }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  storyType === 'text' ? 'bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/25' : 'bg-white/5 text-white/30 border border-white/5'
                }`}
              >
                <Type className="w-4 h-4" /> Text
              </button>
            </div>
            
            {/* Content Area */}
            {storyType === 'text' ? (
              <div className="mb-6">
                <div 
                  className="aspect-[9/16] max-h-64 rounded-xl flex items-center justify-center p-6 mb-4"
                  style={{ backgroundColor: storyBgColor }}
                >
                  <textarea
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-full bg-transparent text-white text-xl text-center resize-none focus:outline-none placeholder-white/50"
                    maxLength={200}
                  />
                </div>
                
                {/* Background Color Picker */}
                <div className="flex gap-2 justify-center">
                  {['#1a1a2e', '#2d1b4e', '#1a365d', '#3d1c02', '#0d2818', '#3d2b2b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setStoryBgColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${storyBgColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {storyPreview ? (
                  <div className="aspect-[9/16] max-h-64 rounded-xl overflow-hidden bg-black mb-4 relative">
                    {storyType === 'video' ? (
                      <video src={storyPreview} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={storyPreview} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <button
                      onClick={() => { setStoryFile(null); setStoryPreview(null); }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => storyFileInputRef.current?.click()}
                    className="w-full aspect-[9/16] max-h-64 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-[#9333EA]/30 transition-colors"
                  >
                    {storyType === 'photo' ? (
                      <Camera className="w-12 h-12 text-gray-500" />
                    ) : (
                      <Video className="w-12 h-12 text-gray-500" />
                    )}
                    <span className="text-gray-400">Tap to select {storyType}</span>
                  </button>
                )}
              </div>
            )}
            
            {/* Privacy Setting */}
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Who can see this?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStoryPrivacy('everyone')}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    storyPrivacy === 'everyone' ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  Everyone
                </button>
                <button
                  onClick={() => setStoryPrivacy('friends')}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    storyPrivacy === 'friends' ? 'bg-[#9333EA]/15 text-[#9333EA] border border-[#9333EA]/25' : 'bg-white/5 text-white/30 border border-white/5'
                  }`}
                >
                  Friends Only
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={createStory}
              disabled={uploadingStory || (storyType === 'text' ? !storyText.trim() : !storyFile)}
              className="neon-btn w-full py-4 text-[#9333EA] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1.5px solid rgba(147,51,234,0.4)', boxShadow: '0 0 20px rgba(147,51,234,0.12)', background: 'rgba(147,51,234,0.06)' }}
            >
              {uploadingStory ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Share Story'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Story Viewer Modal - Full Screen Mobile Optimized */}
      {selectedStory && (
        <div 
          className="fixed inset-0 z-50 bg-black flex flex-col" 
          onClick={() => setSelectedStory(null)}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {selectedStory.avatar ? (
                    <img src={selectedStory.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{selectedStory.displayName || 'User'}</p>
                  <p className="text-gray-400 text-xs">
                    {selectedStory.stories?.[0]?.createdAt && 
                      new Date(selectedStory.stories[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedStory(null); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Progress bars for multiple stories */}
            {selectedStory.stories?.length > 1 && (
              <div className="flex gap-1 mt-3">
                {selectedStory.stories.map((_, idx) => (
                  <div key={idx} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white ${idx === 0 ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {selectedStory.stories?.[0] && (
              <>
                {(selectedStory.stories[0].type === 'video' || selectedStory.stories[0].mediaType === 'video') ? (
                  <video 
                    src={selectedStory.stories[0].mediaUrl || selectedStory.stories[0].content} 
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                    playsInline
                    controls
                    loop
                  />
                ) : selectedStory.stories[0].type === 'text' ? (
                  <div 
                    className="w-full h-full flex items-center justify-center p-8"
                    style={{ backgroundColor: selectedStory.stories[0].backgroundColor || '#1a1a2e' }}
                  >
                    <p className="text-white text-2xl text-center font-medium">
                      {selectedStory.stories[0].content || selectedStory.stories[0].text}
                    </p>
                  </div>
                ) : (
                  <img 
                    src={selectedStory.stories[0].mediaUrl || selectedStory.stories[0].content} 
                    alt="" 
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </>
            )}
          </div>
          
          {/* Caption Footer */}
          {(selectedStory.stories?.[0]?.caption || selectedStory.stories?.[0]?.text) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm">
                {selectedStory.stories[0].caption || selectedStory.stories[0].text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== SCROLL-BASED HOME EXPERIENCE ===== */}
      <main className="relative z-[5] pb-28">

        {/* --- PEOPLE ONLINE --- */}
        <section className="pt-6 pb-1" data-testid="people-online-section">
          <div className="px-5 flex items-baseline justify-between mb-4">
            <h2 className="text-white text-[17px] font-heading font-bold tracking-tight">People Online</h2>
            <button onClick={() => router.push('/search')} className="text-[11px] text-[#9333EA]/60 hover:text-[#9333EA] font-semibold transition-colors" data-testid="see-all-members">
              See all
            </button>
          </div>

          <div 
            className="flex gap-4 overflow-x-auto pb-3 px-5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            data-testid="people-online-scroll"
          >
            {members.slice(0, 20).map((m, i) => {
              const gradients = [
                'linear-gradient(135deg, #9333EA 0%, #6366F1 100%)',
                'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)',
                'linear-gradient(135deg, #E84393 0%, #9333EA 100%)',
                'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                'linear-gradient(135deg, #D4A54A 0%, #E84393 100%)',
              ]
              return (
                <button
                  key={m.id}
                  onClick={() => router.push(`/search?view=${m.id}`)}
                  className="flex-none flex flex-col items-center gap-2 group"
                  data-testid={`online-user-${m.id}`}
                >
                  <div className="relative">
                    <div className="avatar-ring" style={{ width: 58, height: 58 }}>
                      <div className="avatar-inner">
                        {m.avatar || m.profilePicture ? (
                          <img src={m.avatar || m.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/70 text-lg font-bold" style={{ background: gradients[i % gradients.length] }}>
                            {m.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] ring-[2px] ring-[#08080D]" />
                  </div>
                  <span className="text-white/40 text-[10px] font-medium truncate w-[58px] text-center group-hover:text-white/65 transition-colors">
                    {m.displayName?.split(' ')[0]?.slice(0, 8) || 'User'}
                  </span>
                </button>
              )
            })}
            {members.length === 0 && (
              <div className="flex items-center justify-center w-full py-10 text-white/15 text-sm italic">
                No one online right now
              </div>
            )}
          </div>
        </section>

        <div className="section-divider my-2" />

        <div className="mx-5 my-5 h-px bg-white/[0.03]" />

        {/* --- NEW MATCHES / FRIEND REQUESTS --- */}
        {pendingFriendRequests.length > 0 && (
          <section className="px-5 mb-5" data-testid="new-matches-section">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />
                <span className="text-white/70 text-sm font-heading font-semibold">New Matches</span>
              </div>
              <button onClick={() => router.push('/friends')} className="text-[11px] text-[#9333EA]/60 hover:text-[#9333EA] font-medium transition-colors" data-testid="see-all-matches">
                See all
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingFriendRequests.map((req) => (
                <div key={req.id || req.fromUserId} className="relative flex items-center gap-3 p-4 rounded-2xl bg-[#101018] border border-[#E84393]/10 hover:border-[#E84393]/20 transition-colors" data-testid={`match-${req.fromUserId}`}>
                  {/* NEW badge */}
                  <div className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-[#9333EA] text-white text-[9px] font-bold tracking-wider" style={{ boxShadow: '0 2px 8px rgba(147,51,234,0.4)' }}>
                    NEW
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#141420] overflow-hidden border-2 border-white/[0.06] flex-shrink-0">
                    {req.fromAvatar ? (
                      <img src={req.fromAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#E84393] text-base font-semibold">
                        {req.fromName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{req.fromName || 'Unknown'}</p>
                    <p className="text-white/25 text-xs">Wants to connect</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => acceptFriendRequest(req.fromUserId)}
                      className="px-3.5 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold border border-[#10B981]/15 hover:bg-[#10B981]/25 transition-colors"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => declineFriendRequest(req.fromUserId)}
                      className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/30 text-xs border border-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 h-px bg-white/[0.03]" />
          </section>
        )}

        {/* --- ACTIVE LOUNGES --- */}
        <section className="px-5 pt-4 pb-2" data-testid="active-lounges-section">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-white text-[17px] font-heading font-bold tracking-tight">Active Lounges</h2>
            <button onClick={() => handleTileClick('lounge', '/lounge')} className="text-[11px] text-[#9333EA]/60 hover:text-[#9333EA] font-semibold transition-colors" data-testid="see-all-lounges">
              See all
            </button>
          </div>

          <div className="space-y-3">
            {loungesList.slice(0, 3).map((lounge, idx) => {
              const accents = ['#9333EA', '#3B82F6', '#22D3EE', '#D4A54A', '#E84393', '#10B981']
              const accentNames = ['purple', 'blue', 'cyan', 'gold', 'pink', 'emerald']
              const accent = accents[idx % accents.length]
              const accentName = accentNames[idx % accentNames.length]
              const memberCount = lounge.memberCount || lounge.members?.length || 0
              const desc = lounge.description || 'Open conversation space'
              return (
                <button
                  key={lounge.id}
                  onClick={() => router.push(`/lounge?id=${lounge.id}`)}
                  className="lounge-card w-full text-left px-5 py-[18px]"
                  data-accent={accentName}
                  data-testid={`home-lounge-${lounge.id}`}
                >
                  <div className="flex items-start justify-between relative z-[2]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="text-white font-heading font-bold text-[15px] truncate">{lounge.name || 'Main Lounge'}</h3>
                        {memberCount > 0 && (
                          <span className="flex items-center gap-1 shrink-0">
                            <span className="live-dot" style={{ background: accent }} />
                            <span className="text-[10px] font-semibold" style={{ color: `${accent}99` }}>Live</span>
                          </span>
                        )}
                      </div>
                      <p className="text-white/25 text-[13px] leading-snug truncate">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-white/18 text-xs pl-3 shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{memberCount}</span>
                    </div>
                  </div>
                </button>
              )
            })}
            {loungesList.length === 0 && (
              <button
                onClick={() => handleTileClick('lounge', '/lounge')}
                className="lounge-card w-full text-left px-5 py-[18px]"
                data-accent="purple"
                data-testid="home-lounge-main"
              >
                <div className="flex items-start justify-between relative z-[2]">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-white font-heading font-bold text-[15px]">Main Lounge</h3>
                      <span className="live-dot" style={{ background: '#9333EA' }} />
                      <span className="text-[10px] font-semibold text-[#9333EA]/60">Live</span>
                    </div>
                    <p className="text-white/25 text-[13px]">Conversation, culture, music</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </section>

        <div className="section-divider my-2" />

        <div className="mx-5 my-5 h-px bg-white/[0.03]" />

        {/* --- QUICK ACCESS — compact row, not a dashboard --- */}
        <section className="px-5 pt-3 pb-3" data-testid="quick-access">
          <div className="flex items-center justify-between rounded-xl bg-[#0e0e18] border border-white/[0.03] px-2 py-2">
            {[
              { icon: MessageSquare, label: 'Inbox', color: '#3B82F6', path: '/inbox', id: 'inbox' },
              { icon: Moon, label: 'After Dark', color: '#D4A54A', path: '/afterdark', id: 'afterdark' },
              { icon: Gamepad2, label: 'Games', color: '#10B981', path: '/games', id: 'games' },
              { icon: Radio, label: 'Radio', color: '#E8364E', path: '/radio', id: 'radio' },
              { icon: Calendar, label: 'Events', color: '#F59E0B', path: '/events', id: 'events' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleTileClick(item.id, item.path)}
                  className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                  data-testid={`quick-${item.id}`}
                >
                  <Icon className="w-[17px] h-[17px]" style={{ color: `${item.color}66` }} strokeWidth={1.5} />
                  <span className="text-white/25 text-[9px] font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="px-5 mt-6 border-l border-[#9333EA]/10 pl-4" data-testid="home-tagline">
          <p className="text-white/12 text-xs italic leading-relaxed">A private space for adults. Connection at your own pace.</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-2xl border-t border-white/[0.04]" style={{ background: 'rgba(8,8,13,0.88)' }} data-testid="bottom-nav">
        <div className="flex items-center justify-around py-2.5 max-w-lg mx-auto">
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5" data-testid="nav-home">
            <Home className="w-5 h-5 text-[#9333EA]" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-[#9333EA]">Home</span>
          </button>
          <button onClick={() => router.push('/lounge')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-[#3B82F6] transition-colors" data-testid="nav-lounge">
            <Sofa className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Lounge</span>
          </button>
          <button onClick={() => handleTileClick('afterdark', '/afterdark')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-[#D4A54A] transition-colors" data-testid="nav-afterdark">
            <Moon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">After Dark</span>
          </button>
          <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-white/50 transition-colors" data-testid="nav-profile">
            <User className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <LockModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
      <OnboardingSlide isOpen={showOnboarding} onDismiss={dismissOnboarding} />
      <AfterDarkDisclaimer isOpen={showAfterDarkDisclaimer} onAccept={acceptAfterDarkDisclaimer} />
      <MainLoungeInfo isOpen={showLoungeInfo} onClose={closeLoungeInfo} onEnter={enterLounge} />
    </div>
  )
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('lowkey_user')
    localStorage.removeItem('lowkey_token')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse">
          <LowKeyLogo size="lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout }}>
      <HomePage user={user} onLogout={handleLogout} setUser={setUser} />
    </AuthContext.Provider>
  )
}

// v2
