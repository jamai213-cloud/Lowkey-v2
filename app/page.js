'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, MessageSquare, Sofa, Search, Wallet, Moon, Gamepad2, Radio, Music, 
  Calendar, Bell, Lock, X, Eye, EyeOff, Volume2, VolumeX, UserPlus, CheckCircle, 
  LogOut, Settings, Sparkles, Home, User, ChevronRight, Send, Heart, Check, Trash2
} from 'lucide-react'
import { useNotifications } from './contexts/NotificationContext'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-500/30">
            <Lock className="w-7 h-7 text-purple-400" />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Feature Locked</h3>
        <p className="text-gray-400 mb-6">
          Finish verification to unlock this feature. Upload your verification photo and complete the steps.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => { onClose(); router.push('/verification'); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Start Verification
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-colors"
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
          <p className="text-amber-400 text-lg font-medium">More than dating. A private, multi-dimensional world.</p>
        </div>
        
        {/* Intro */}
        <div className="mb-8">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Lowkey is a curated digital space where connection, creativity, and nightlife culture exist together — intentionally.
          </p>
          <p className="text-gray-400 text-sm italic">
            This isn't just about matching profiles.<br />
            It's about <span className="text-white">how</span> and <span className="text-white">where</span> you connect.
          </p>
        </div>
        
        {/* What We Offer */}
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/10">
          <h2 className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-4">What Lowkey Offers</h2>
          <p className="text-gray-400 text-xs mb-4">A multi-layered experience designed for different moods, moments, and levels of expression:</p>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-0.5">•</span>
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
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/10">
          <h2 className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-4">What Lowkey Expects</h2>
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
          <p className="text-amber-400 text-sm mt-1">It's for people who want more than surface-level connection.</p>
        </div>
        
        {/* Continue Button - Fixed at bottom */}
        <div className="mt-auto">
          <button 
            onClick={onDismiss}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold hover:opacity-90 transition-opacity"
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
    <div className="fixed inset-0 z-50 bg-[#0a0a0f]">
      {/* Animated Background - consistent with app style */}
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
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Moon className="w-10 h-10 text-purple-400" />
          </div>
          
          {/* Header */}
          <h1 className="text-2xl font-bold text-white mb-2">After Dark on Lowkey</h1>
          <p className="text-purple-400 text-sm mb-8">Private. Discreet. Anonymous.</p>
          
          {/* Content */}
          <div className="glass-card rounded-2xl p-5 mb-6 border border-white/10 text-left">
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              After Dark spaces are designed for privacy, discretion, and anonymous expression.
            </p>
            
            <div className="border-l-2 border-purple-500 pl-4 mb-4">
              <p className="text-white text-sm font-medium mb-2">
                Respect and consent are mandatory at all times.
              </p>
              <p className="text-gray-400 text-sm">
                Harassment, coercion, or non-consensual behaviour is not tolerated and will result in removal.
              </p>
            </div>
            
            <p className="text-gray-500 text-xs italic">
              After Dark is optional and unlocked only after verification.
            </p>
          </div>
          
          {/* Accept Button */}
          <button 
            onClick={onAccept}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-90 transition-opacity"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {/* Animated Background - subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        
        <div className="relative glass-card rounded-2xl p-6 border border-white/10">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Sofa className="w-7 h-7 text-purple-400" />
          </div>
          
          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">The Main Lounge</h2>
            <p className="text-purple-400 text-sm mb-4">The heart of Lowkey</p>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              The central, open social space where conversation, culture, music, and community come together.
            </p>
            
            <p className="text-gray-400 text-sm mt-3 italic">
              A place for relaxed, real-time connection.
            </p>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <button 
              onClick={onEnter}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Enter Lounge
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-gray-400 text-sm hover:text-white transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Reset Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-300">If an account exists with that email, a reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400 text-sm">Enter your email and we'll send you a link to reset your password.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold disabled:opacity-50"
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

      console.log('Attempting login with:', endpoint)
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)

      if (!res.ok) {
        console.log('Login failed:', data.error)
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      console.log('Login successful, saving to localStorage')
      localStorage.setItem('lowkey_user', JSON.stringify(data.user))
      localStorage.setItem('lowkey_token', data.token)
      console.log('Calling onLogin')
      onLogin(data.user)
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <LowKeyLogo size="xl" />
          <p className="text-pink-200/80 mt-6 text-xl font-light tracking-wide">Grown chats. Real nights. Private parties.</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-black/30 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Join
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-300 text-sm mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Your display name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors uppercase"
                placeholder={isLogin ? 'Email or display name' : 'your@email.com'}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                    className="w-4 h-4 rounded border-gray-600 bg-black/40 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300 text-sm">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-amber-400 text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Join Now')}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            Powered by <span className="text-purple-400">3DK</span> + <span className="text-amber-400">King Tense</span>
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
    className={`relative p-2 rounded-full hover:bg-white/10 transition-all duration-300 ${hasNew ? 'animate-pulse' : ''}`}
    data-testid="notification-bell"
  >
    <Bell className={`w-5 h-5 transition-colors ${count > 0 ? 'text-amber-400' : 'text-gray-300'}`} />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold px-1 animate-bounce">
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
  const router = useRouter()
  const pollRef = useRef(null)
  const prevNotificationCount = useRef(0)
  const { soundEnabled, toggleSound, playSound, requestPermission, notifyFriendRequest, notifyMessage } = useNotifications()
  
  const lockedFeatures = ['radio', 'music', 'afterdark']
  
  useEffect(() => {
    fetchNotifications()
    fetchNoticeUnreadCount()
    fetchPendingFriendRequests()
    fetchStories()
    checkOnboarding()
    requestPermission()
    
    // Start polling for notifications every 10 seconds
    pollRef.current = setInterval(() => {
      fetchNotifications()
      fetchPendingFriendRequests()
      fetchStories()
    }, 10000)
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
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
      const res = await fetch('/api/stories')
      if (res.ok) {
        const data = await res.json()
        // Filter to show friends' stories and public stories only
        const friendIds = user.friends || []
        const filteredStories = data.filter(storyGroup => {
          // Show own stories
          if (storyGroup.userId === user.id) return true
          // Show friends' stories
          if (friendIds.includes(storyGroup.userId)) return true
          // Show public stories (non-private)
          if (storyGroup.stories?.some(s => s.privacy !== 'private')) return true
          return false
        })
        setStories(filteredStories)
      }
    } catch (err) {
      console.error('Failed to fetch stories')
    }
  }

  const viewStory = async (storyGroup) => {
    setSelectedStory(storyGroup)
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

  const tiles = [
    { id: 'friends', icon: Users, label: 'Friends', color: '#EC4899', path: '/friends' },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox', color: '#F59E0B', path: '/inbox' },
    { id: 'lounge', icon: Sofa, label: 'Lounge', color: '#8B5CF6', path: '/lounge' },
    { id: 'search', icon: Search, label: 'Search', color: '#3B82F6', path: '/search' },
    { id: 'wallet', icon: Wallet, label: 'Wallet', color: '#10B981', path: '/wallet' },
    { id: 'communities', icon: UserPlus, label: 'Groups', color: '#F59E0B', path: '/communities' },
    { id: 'notices', icon: Bell, label: 'Notices', color: '#EF4444', path: '/notices' },
    { id: 'quiet', icon: Volume2, label: 'Quiet', color: '#6366F1', path: '/quiet' },
    { id: 'afterdark', icon: Moon, label: 'After Dark', color: '#A855F7', path: '/afterdark' },
    { id: 'games', icon: Gamepad2, label: 'Games', color: '#22C55E', path: '/games' },
    { id: 'radio', icon: Radio, label: 'Radio', color: '#F97316', path: '/radio' },
    { id: 'music', icon: Music, label: 'Music', color: '#EC4899', path: '/music' },
    { id: 'events', icon: Calendar, label: 'Events', color: '#14B8A6', path: '/events' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Logo slot - responsive sizing, no shrink */}
          <div className="lk-logoSlot">
            <img 
              src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" 
              alt="LowKey" 
            />
          </div>
          <span className="lk-headerText">LowKey</span>
        </div>
        
        <div className="flex items-center gap-2">
          {user.verified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute notification sounds' : 'Enable notification sounds'}
            data-testid="sound-toggle"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <NotificationBell 
            count={unreadCount} 
            onClick={() => setShowNotifications(!showNotifications)} 
            hasNew={hasNewNotification}
          />
          <button onClick={() => router.push('/admin')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-30 w-96 glass-card rounded-xl shadow-2xl max-h-[80vh] overflow-hidden" data-testid="notifications-dropdown">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a2e]/95 backdrop-blur-sm">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.read) && (
                <button 
                  onClick={markAllNotificationsRead}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4 text-gray-400" />
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
                      notif.type === 'message' || notif.type === 'dm' ? 'bg-amber-500/20' :
                      notif.type === 'tip' ? 'bg-yellow-500/20' :
                      notif.type === 'comment' ? 'bg-blue-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      {notif.type === 'friend_request' && <UserPlus className="w-4 h-4 text-pink-400" />}
                      {notif.type === 'friend_accepted' && <Check className="w-4 h-4 text-green-400" />}
                      {(notif.type === 'message' || notif.type === 'dm') && <MessageSquare className="w-4 h-4 text-amber-400" />}
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
      {stories.length > 0 && (
        <div className="relative z-10 px-4 pt-4">
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {stories.map((storyGroup) => {
              const hasUnviewed = storyGroup.stories?.some(s => !s.viewedBy?.includes(user.id))
              const isOwn = storyGroup.userId === user.id
              
              return (
                <button
                  key={storyGroup.userId}
                  onClick={() => viewStory(storyGroup)}
                  className="flex-none flex flex-col items-center gap-1"
                >
                  <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnviewed ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-amber-500' : 'bg-white/20'}`}>
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {storyGroup.avatar ? (
                          <img src={storyGroup.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-white text-xs truncate w-16 text-center">
                    {isOwn ? 'You' : storyGroup.displayName?.split(' ')[0] || 'User'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setSelectedStory(null)}>
          <button 
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
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
          
          {selectedStory.stories?.[0] && (
            <div className="max-w-lg w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
              {selectedStory.stories[0].mediaType === 'video' ? (
                <video 
                  src={selectedStory.stories[0].mediaUrl} 
                  className="w-full h-full object-contain"
                  autoPlay
                  controls
                />
              ) : (
                <img 
                  src={selectedStory.stories[0].mediaUrl} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              )}
              {selectedStory.stories[0].caption && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 rounded-xl">
                  <p className="text-white text-sm">{selectedStory.stories[0].caption}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 p-4 pb-24">
        {/* Tiles Grid - 3 columns with consistent styling */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tiles.map((tile) => {
            const IconComponent = tile.icon
            const isLocked = lockedFeatures.includes(tile.id) && !user.verified
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id, tile.path)}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${tile.color}15, ${tile.color}05)`,
                  border: `1px solid ${tile.color}40`,
                  boxShadow: `0 4px 20px ${tile.color}10`
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tile.color}25` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: tile.color }} />
                  </div>
                  <span className="text-white text-xs font-medium">{tile.label}</span>
                </div>
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                {tile.id === 'notices' && noticeUnreadCount > 0 && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{noticeUnreadCount}</span>
                  </div>
                )}
              </button>
            )
          })}          
        </div>

        {/* Tagline */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">A private space for adults. Connection happens at your own pace.</p>
          <p className="text-gray-500 text-xs mt-1">Share what you want • Say what you feel • Respect boundaries</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-white/5">
        <div className="flex items-center justify-around py-3">
          <button className="flex flex-col items-center gap-1 px-4 py-1 text-white">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => router.push('/lounge')} className="flex flex-col items-center gap-1 px-4 py-1 text-gray-500 hover:text-white transition-colors">
            <Sofa className="w-5 h-5" />
            <span className="text-xs">Lounge</span>
          </button>
          <button onClick={() => handleTileClick('afterdark', '/afterdark')} className="flex flex-col items-center gap-1 px-4 py-1 text-gray-500 hover:text-white transition-colors">
            <Moon className="w-5 h-5" />
            <span className="text-xs">After Dark</span>
          </button>
          <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 px-4 py-1 text-gray-500 hover:text-white transition-colors">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
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

