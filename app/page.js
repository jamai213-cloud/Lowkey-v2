'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, MessageSquare, Sofa, Search, Wallet, Moon, Gamepad2, Radio, Music,
  Calendar, Bell, Lock, X, Eye, EyeOff, Volume2, VolumeX, UserPlus, CheckCircle,
  LogOut, Settings, Sparkles, Home, User, ChevronRight, Send, Heart, Check, Trash2,
  Play, Image as ImageIcon, Plus, Camera, Video, Type, Loader2, Crown, MapPin, Flame
} from 'lucide-react'
import { useNotifications } from './contexts/NotificationContext'

// ─── Utilities ───────────────────────────────────────────────
const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const trackEvent = (eventName, data = {}) => {
  try {
    const analytics = JSON.parse(localStorage.getItem('lowkey_analytics') || '[]')
    analytics.push({ event: eventName, data, timestamp: new Date().toISOString(), userId: data.userId || 'anonymous' })
    if (analytics.length > 100) analytics.shift()
    localStorage.setItem('lowkey_analytics', JSON.stringify(analytics))
  } catch (e) {}
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Auth Context ────────────────────────────────────────────
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ─── Stock Photos (diverse, high-quality portraits) ─────────
const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1636406269177-4827c00bb263?w=500&h=650&fit=crop&crop=face',
  'https://images.pexels.com/photos/18838688/pexels-photo-18838688.jpeg?auto=compress&w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1512503868941-bd9fa9c6b569?w=500&h=650&fit=crop&crop=face',
  'https://images.pexels.com/photos/16495772/pexels-photo-16495772.jpeg?auto=compress&w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1737091956854-d39f0655389b?w=500&h=650&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534664393936-5220914620f0?w=500&h=650&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1572852781348-4634bb3225bd?w=500&h=650&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1589723710704-3d64c57ae972?w=500&h=650&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1585807145425-793be610875c?w=500&h=650&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1672794444732-e007954a177c?w=500&h=650&fit=crop&crop=face',
]
const getPhoto = (member, idx) => member?.avatar || member?.profilePicture || STOCK_PHOTOS[idx % STOCK_PHOTOS.length]
const getBadge = (m) => {
  if (m?.isFounder || m?.role === 'founder') return { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Founder' }
  if (m?.verified) return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Verified' }
  return null
}

// ─── Animated Login Background ──────────────────────────────
const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
    <div className="blob blob-4" /><div className="blob blob-5" /><div className="blob blob-6" />
    <div className="noise-overlay" />
  </div>
)

const LowKeyLogo = ({ size = 'md' }) => {
  const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-36 h-36', xl: 'w-48 h-48' }
  return (
    <div className="flex flex-col items-center">
      <img src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" alt="LowKey" className={`${sizes[size]} object-contain drop-shadow-2xl`} />
    </div>
  )
}

// ─── Lock Modal ─────────────────────────────────────────────
const LockModal = ({ isOpen, onClose }) => {
  const router = useRouter()
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="lock-modal">
      <div className="glass-card rounded-2xl p-8 max-w-sm mx-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/15">
            <Lock className="w-7 h-7 text-purple-400" strokeWidth={1.5} />
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-colors" data-testid="lock-modal-close"><X className="w-5 h-5" /></button>
        </div>
        <h3 className="text-xl font-heading font-semibold text-white mb-2">Feature Locked</h3>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">Finish verification to unlock this feature.</p>
        <div className="space-y-3">
          <button onClick={() => { onClose(); router.push('/verification'); }} className="w-full py-4 rounded-xl font-semibold text-sm bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors" data-testid="start-verification-btn">Start Verification</button>
          <button onClick={onClose} className="w-full py-3 text-white/30 text-sm hover:text-white/50 transition-colors" data-testid="maybe-later-btn">Maybe Later</button>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding Slide ───────────────────────────────────────
const OnboardingSlide = ({ isOpen, onDismiss }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex flex-col p-6 pb-24">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to LowKey</h1>
          <p className="text-rose-400/70 text-lg font-medium">More than dating. A private, multi-dimensional world.</p>
        </div>
        <div className="mb-8">
          <p className="text-white/60 text-sm leading-relaxed mb-4">Lowkey is a curated digital space where connection, creativity, and nightlife culture exist together.</p>
          <p className="text-white/40 text-sm italic">This isn't just about matching profiles. It's about <span className="text-white">how</span> and <span className="text-white">where</span> you connect.</p>
        </div>
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5">
          <h2 className="lk-label text-rose-400 mb-4">What Lowkey Offers</h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3"><span className="text-rose-400 mt-0.5">*</span><span><span className="text-white">Main Lounges</span> for open conversation, community, and discovery</span></li>
            <li className="flex items-start gap-3"><span className="text-amber-400 mt-0.5">*</span><span><span className="text-white">After Dark spaces</span> that prioritise privacy and anonymity</span></li>
            <li className="flex items-start gap-3"><span className="text-pink-400 mt-0.5">*</span><span><span className="text-white">Live radio & music rooms</span> to vibe in real time</span></li>
            <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">*</span><span><span className="text-white">Content creation spaces</span> to host and share</span></li>
            <li className="flex items-start gap-3"><span className="text-green-400 mt-0.5">*</span><span>A calm environment designed around <span className="text-white">safety and respect</span></span></li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5">
          <h2 className="lk-label text-rose-400 mb-4">What Lowkey Expects</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-3"><span className="text-rose-400 mt-0.5">*</span><span>A real display photo</span></li>
            <li className="flex items-start gap-3"><span className="text-rose-400 mt-0.5">*</span><span>Honest profile information</span></li>
            <li className="flex items-start gap-3"><span className="text-rose-400 mt-0.5">*</span><span>Respectful behaviour at all times</span></li>
          </ul>
        </div>
        <div className="text-center mb-8">
          <p className="text-white font-medium">Lowkey isn't for everyone.</p>
          <p className="text-rose-400/50 text-sm mt-1">It's for people who want more than surface-level connection.</p>
        </div>
        <div className="mt-auto">
          <button onClick={onDismiss} className="w-full py-4 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 transition-colors" data-testid="onboarding-continue-btn">Continue</button>
        </div>
      </div>
    </div>
  )
}

// ─── After Dark Disclaimer ──────────────────────────────────
const AfterDarkDisclaimer = ({ isOpen, onAccept }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f]" data-testid="afterdark-disclaimer">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/15">
            <Moon className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">After Dark on Lowkey</h1>
          <p className="text-orange-400 text-sm mb-8">Private. Discreet. Anonymous.</p>
          <div className="glass-card rounded-2xl p-5 mb-6 border border-white/5 text-left">
            <p className="text-white/60 text-sm leading-relaxed mb-4">After Dark spaces are designed for privacy, discretion, and anonymous expression.</p>
            <div className="border-l-2 border-orange-500/50 pl-4 mb-4">
              <p className="text-white text-sm font-medium mb-2">Respect and consent are mandatory at all times.</p>
              <p className="text-white/40 text-sm">Harassment or non-consensual behaviour is not tolerated.</p>
            </div>
          </div>
          <button onClick={onAccept} className="w-full py-4 rounded-xl font-bold text-sm bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-colors" data-testid="afterdark-accept-btn">I Understand &middot; Enter After Dark</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Lounge Info Modal ─────────────────────────────────
const MainLoungeInfo = ({ isOpen, onClose, onEnter }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="lounge-info-modal">
      <div className="max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="glass-card rounded-2xl p-8 border border-white/5">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/15">
            <Sofa className="w-7 h-7 text-cyan-400" strokeWidth={1.5} />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-heading font-bold text-white mb-2">The Main Lounge</h2>
            <p className="text-cyan-400 text-sm mb-4">The heart of Lowkey</p>
            <p className="text-white/50 text-sm leading-relaxed">The central, open social space where conversation and community come together.</p>
          </div>
          <div className="space-y-3">
            <button onClick={onEnter} className="w-full py-3.5 rounded-xl font-semibold text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors" data-testid="enter-lounge-btn">Enter Lounge</button>
            <button onClick={onClose} className="w-full py-2 text-white/30 text-sm hover:text-white transition-colors" data-testid="lounge-maybe-later-btn">Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Forgot Password Modal ──────────────────────────────────
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
    } catch (err) { setError(err.message || 'Failed to send reset email') }
    setLoading(false)
  }
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose} data-testid="forgot-password-modal">
      <div className="glass-card rounded-2xl p-8 max-w-sm mx-auto w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading font-semibold text-white">Reset Password</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-colors" data-testid="close-forgot-modal"><X className="w-5 h-5" /></button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/15"><CheckCircle className="w-8 h-8 text-green-400" strokeWidth={1.5} /></div>
            <p className="text-white/50 text-sm">If an account exists with that email, a reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-white/40 text-sm">Enter your email to receive a reset link.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="lk-input w-full" required data-testid="forgot-email-input" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-sm bg-rose-500 text-white disabled:opacity-50 hover:bg-rose-600 transition-colors" data-testid="send-reset-link-btn">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Auth Page ──────────────────────────────────────────────
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
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { identifier: email, password } : { email, password, displayName }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
      localStorage.setItem('lowkey_user', JSON.stringify(data.user))
      localStorage.setItem('lowkey_token', data.token)
      onLogin(data.user)
    } catch (err) { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" data-testid="auth-page">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-12">
          <LowKeyLogo size="xl" />
          <p className="text-white/40 mt-8 text-lg font-light tracking-wide text-center" style={{ fontFamily: 'Figtree, sans-serif' }}>Grown chats. Real nights. Private parties.</p>
        </div>
        <div className="glass-card rounded-2xl p-8 shadow-2xl" style={{ border: '1px solid rgba(244,63,94,0.12)', boxShadow: '0 0 40px rgba(244,63,94,0.06), 0 8px 40px rgba(0,0,0,0.5)' }} data-testid="auth-card">
          <div className="flex mb-8 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            <button onClick={() => setIsLogin(true)} data-testid="auth-signin-tab" className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 font-heading text-sm ${isLogin ? 'text-white bg-rose-500/15 border border-rose-500/30' : 'text-white/25 hover:text-white/50 border border-transparent'}`}>Sign In</button>
            <button onClick={() => setIsLogin(false)} data-testid="auth-join-tab" className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 font-heading text-sm ${!isLogin ? 'text-white bg-rose-500/15 border border-rose-500/30' : 'text-white/25 hover:text-white/50 border border-transparent'}`}>Join</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="lk-label block mb-2">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="lk-input-neon w-full" placeholder="Your display name" required={!isLogin} data-testid="auth-display-name-input" />
              </div>
            )}
            <div>
              <label className="lk-label block mb-2">Email</label>
              <input type={isLogin ? 'text' : 'email'} value={email} onChange={(e) => setEmail(e.target.value)} className="lk-input-neon w-full uppercase" placeholder={isLogin ? 'Email or display name' : 'your@email.com'} required data-testid="auth-email-input" />
            </div>
            <div>
              <label className="lk-label block mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="lk-input-neon w-full pr-12" placeholder="--------" required data-testid="auth-password-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-[#141420] text-rose-500 focus:ring-rose-500" />
                  <span className="text-white/40 text-sm">Remember me</span>
                </label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-rose-400/60 text-sm hover:text-rose-400 transition-colors" data-testid="auth-forgot-password-btn">Forgot password?</button>
              </div>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" data-testid="auth-error">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-base font-bold bg-rose-500 text-white disabled:opacity-50 hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20" data-testid="auth-submit-btn">{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Join Now')}</button>
          </form>
          <p className="text-center text-white/10 text-xs mt-8 tracking-wider">Powered by <span className="text-rose-400/30">3DK</span> + <span className="text-rose-400/30">King Tense</span></p>
        </div>
      </div>
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  HOME PAGE — Complete Rebuild (Premium Dating App Layout)
// ═══════════════════════════════════════════════════════════════
const HomePage = ({ user, onLogout, setUser }) => {
  const router = useRouter()
  const pollRef = useRef(null)
  const prevNotificationCount = useRef(0)
  const storyFileInputRef = useRef(null)
  const { soundEnabled, toggleSound, playSound, requestPermission, notifyFriendRequest, notifyMessage } = useNotifications()

  // ─── State ──────────────────────────────
  const [members, setMembers] = useState([])
  const [loungesList, setLoungesList] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [pendingFriendRequests, setPendingFriendRequests] = useState([])
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [showAddStory, setShowAddStory] = useState(false)
  const [storyType, setStoryType] = useState('photo')
  const [storyFile, setStoryFile] = useState(null)
  const [storyPreview, setStoryPreview] = useState(null)
  const [storyText, setStoryText] = useState('')
  const [storyPrivacy, setStoryPrivacy] = useState('everyone')
  const [storyBgColor, setStoryBgColor] = useState('#1a1a2e')
  const [uploadingStory, setUploadingStory] = useState(false)
  const [noticeUnreadCount, setNoticeUnreadCount] = useState(0)
  const [showLockModal, setShowLockModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAfterDarkDisclaimer, setShowAfterDarkDisclaimer] = useState(false)
  const [showLoungeInfo, setShowLoungeInfo] = useState(false)
  const [events, setEvents] = useState([])

  const lockedFeatures = ['radio', 'music', 'afterdark']

  // ─── Data Fetching ──────────────────────
  useEffect(() => {
    fetchMembers()
    fetchLounges()
    fetchNotifications()
    fetchEvents()
    const t1 = setTimeout(() => fetchNoticeUnreadCount(), 500)
    const t2 = setTimeout(() => fetchPendingFriendRequests(), 1000)
    const t3 = setTimeout(() => fetchStories(), 1500)
    const t4 = setTimeout(() => { checkOnboarding(); requestPermission() }, 2000)
    pollRef.current = setInterval(() => { fetchNotifications(); fetchPendingFriendRequests(); fetchStories() }, 30000)
    return () => { if (pollRef.current) clearInterval(pollRef.current); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) { const data = await res.json(); setMembers(data.filter(u => u.id !== user.id)) }
    } catch (err) {}
  }
  const fetchLounges = async () => {
    try {
      const [regRes, adRes] = await Promise.all([
        fetch('/api/lounges'),
        fetch('/api/lounges?afterDark=true')
      ])
      const regular = regRes.ok ? await regRes.json() : []
      const afterDark = adRes.ok ? await adRes.json() : []
      setLoungesList([...regular, ...afterDark])
    } catch (err) {}
  }
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) { const data = await res.json(); setEvents(data) }
    } catch (err) {}
  }
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        const unreadCount = data.filter(n => !n.read).length
        if (unreadCount > prevNotificationCount.current && prevNotificationCount.current > 0) {
          setHasNewNotification(true); playSound()
          const newest = data[0]
          if (newest && !newest.read) {
            if (newest.type === 'friend_request') notifyFriendRequest(newest.fromName || 'Someone')
            else if (newest.type === 'message' || newest.type === 'dm') notifyMessage(newest.fromName || 'Someone', newest.content || newest.message)
          }
          setTimeout(() => setHasNewNotification(false), 3000)
        }
        prevNotificationCount.current = unreadCount
        setNotifications(data)
      }
    } catch (err) {}
  }
  const fetchPendingFriendRequests = async () => {
    try {
      const res = await fetch(`/api/friends/requests/${user.id}`)
      if (res.ok) { const data = await res.json(); setPendingFriendRequests(data.pending || []) }
    } catch (err) {}
  }
  const fetchStories = async () => {
    try {
      const res = await fetch(`/api/stories?viewerId=${user.id}`)
      if (res.ok) { const data = await res.json(); setStories(data) }
    } catch (err) {}
  }
  const fetchNoticeUnreadCount = async () => {
    try {
      const res = await fetch(`/api/notices/unread/${user.id}`)
      if (res.ok) { const data = await res.json(); setNoticeUnreadCount(data.count || 0) }
    } catch (err) {}
  }

  // ─── Actions ────────────────────────────
  const acceptFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, friendId }) })
      if (res.ok) {
        setPendingFriendRequests(prev => prev.filter(r => r.fromUserId !== friendId))
        const updatedUser = { ...user, friends: [...(user.friends || []), friendId] }
        setUser(updatedUser); localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
        fetchNotifications()
      }
    } catch (err) {}
  }
  const declineFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, friendId }) })
      if (res.ok) setPendingFriendRequests(prev => prev.filter(r => r.fromUserId !== friendId))
    } catch (err) {}
  }
  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, notificationId }) })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    } catch (err) {}
  }
  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {}
  }

  const checkOnboarding = () => { if (!localStorage.getItem(`lowkey_onboarding_${user.id}`)) setShowOnboarding(true) }
  const dismissOnboarding = () => { localStorage.setItem(`lowkey_onboarding_${user.id}`, 'true'); setShowOnboarding(false) }
  const hasAcknowledgedAfterDark = () => localStorage.getItem(`lowkey_afterdark_acknowledged_${user.id}`) === 'true'
  const acceptAfterDarkDisclaimer = () => { localStorage.setItem(`lowkey_afterdark_acknowledged_${user.id}`, 'true'); setShowAfterDarkDisclaimer(false); router.push('/afterdark') }
  const hasSeenLoungeInfo = () => localStorage.getItem(`lowkey_lounge_info_${user.id}`) === 'true'
  const enterLounge = () => { localStorage.setItem(`lowkey_lounge_info_${user.id}`, 'true'); setShowLoungeInfo(false); router.push('/lounge') }
  const closeLoungeInfo = () => { localStorage.setItem(`lowkey_lounge_info_${user.id}`, 'true'); setShowLoungeInfo(false) }

  const handleTileClick = (tileId, path) => {
    if (lockedFeatures.includes(tileId) && !user.verified) { setShowLockModal(true); return }
    if (tileId === 'afterdark' && !hasAcknowledgedAfterDark()) { setShowAfterDarkDisclaimer(true); return }
    if (tileId === 'lounge' && !hasSeenLoungeInfo()) { setShowLoungeInfo(true); return }
    router.push(path)
  }

  // ─── Story Handlers ────────────────────
  const viewStory = async (storyGroup) => {
    setSelectedStory(storyGroup)
    trackEvent('story_view', { userId: user.id, storyOwnerId: storyGroup.userId })
    for (const story of storyGroup.stories) {
      if (!story.viewedBy?.includes(user.id)) {
        try { await fetch(`/api/stories/${story.id}/view`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }) } catch (err) {}
      }
    }
  }
  const handleStoryFileSelect = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const isVideo = file.type.startsWith('video/')
    if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) { alert(`File too large. Max ${isVideo ? '50MB' : '10MB'}.`); return }
    setStoryType(isVideo ? 'video' : 'photo'); setStoryFile(file); setStoryPreview(URL.createObjectURL(file))
  }
  const createStory = async () => {
    if (storyType === 'text' && !storyText.trim()) { alert('Please enter some text'); return }
    if (storyType !== 'text' && !storyFile) { alert('Please select a photo or video'); return }
    setUploadingStory(true)
    try {
      let content = storyText
      if (storyFile) {
        content = storyType === 'photo' ? await compressImage(storyFile, 1200, 0.8)
          : await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(storyFile) })
      }
      const res = await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, type: storyType, content, privacy: storyPrivacy, backgroundColor: storyBgColor }) })
      if (res.ok) { setShowAddStory(false); resetStoryForm(); fetchStories() }
      else throw new Error('Failed')
    } catch (err) { alert('Failed to create story. Please try again.') }
    setUploadingStory(false)
  }
  const resetStoryForm = () => { setStoryType('photo'); setStoryFile(null); setStoryPreview(null); setStoryText(''); setStoryPrivacy('everyone'); setStoryBgColor('#1a1a2e') }

  const unreadCount = notifications.filter(n => !n.read).length + pendingFriendRequests.length

  // Build live feed from real notifications + member activity
  const liveFeedItems = (() => {
    const items = []
    // Real notifications
    notifications.slice(0, 5).forEach((n, i) => {
      items.push({ id: n.id || `n-${i}`, type: n.type, text: n.message || n.content || n.title, time: n.createdAt, photoIdx: i, userId: n.fromUserId })
    })
    // Supplement with member activity if not enough notifications
    if (items.length < 4) {
      const verbs = ['is exploring lounges', 'just came online', 'updated their profile', 'is active now', 'joined a lounge']
      members.slice(0, 5 - items.length).forEach((m, i) => {
        items.push({ id: `m-${m.id}`, type: 'activity', text: `${m.displayName?.split(' ')[0]} ${verbs[i % verbs.length]}`, time: m.updatedAt || m.createdAt, photoIdx: i, userId: m.id, displayName: m.displayName, member: m })
      })
    }
    return items.slice(0, 5)
  })()

  // ─── Lounge Theme System ────────────────
  const getLoungeTheme = (lounge) => {
    const name = (lounge.name || '').toLowerCase()
    if (name.includes('grown folk'))
      return { accent: '#FFD700', bgFrom: '#1A1608', bgTo: '#0D0B05', label: 'Grown energy. Real connections. No games.', glow: 'rgba(255,215,0,0.20)', neonBorder: 'rgba(255,215,0,0.50)', neonShadow: '0 0 30px rgba(255,215,0,0.35), 0 0 10px rgba(255,215,0,0.20), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'gfb', featured: true }
    if (name.includes('lowkey') || name.includes('chill'))
      return { accent: '#A855F7', bgFrom: '#14101F', bgTo: '#0A0818', label: 'Where everyone starts. Real people, real energy.', glow: 'rgba(168,85,247,0.15)', neonBorder: 'rgba(168,85,247,0.40)', neonShadow: '0 0 22px rgba(168,85,247,0.25), 0 0 6px rgba(59,130,246,0.12), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'lk' }
    if (name.includes('after dark'))
      return { accent: '#3B82F6', bgFrom: '#0A0D18', bgTo: '#060810', label: 'No names. No limits. Just energy.', glow: 'rgba(59,130,246,0.15)', neonBorder: 'rgba(59,130,246,0.42)', neonShadow: '0 0 22px rgba(59,130,246,0.28), 0 0 6px rgba(59,130,246,0.12), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'moon', iconAccent: '#FFD700' }
    if (name.includes('kink'))
      return { accent: '#EF4444', bgFrom: '#1A0808', bgTo: '#0F0505', label: 'Push boundaries. Find your people.', glow: 'rgba(239,68,68,0.18)', neonBorder: 'rgba(239,68,68,0.50)', neonShadow: '0 0 25px rgba(239,68,68,0.32), 0 0 8px rgba(239,68,68,0.15), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'handcuffs' }
    if (name.includes('vip') || name.includes('exclusive') || name.includes('premium'))
      return { accent: '#10B981', bgFrom: '#0A1810', bgTo: '#060F0A', label: 'Private access. Elevated connections.', glow: 'rgba(16,185,129,0.15)', neonBorder: 'rgba(16,185,129,0.42)', neonShadow: '0 0 22px rgba(16,185,129,0.28), 0 0 6px rgba(16,185,129,0.12), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'crown', iconAccent: '#FFD700' }
    if (name.includes('night') || name.includes('owl'))
      return { accent: '#F59E0B', bgFrom: '#17130D', bgTo: '#110F0B', label: 'The night is young. Step in.', glow: 'rgba(245,158,11,0.15)', neonBorder: 'rgba(245,158,11,0.35)', neonShadow: '0 0 20px rgba(245,158,11,0.22), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'default' }
    if (name.includes('late') || name.includes('talk'))
      return { accent: '#EF4444', bgFrom: '#1A0F0F', bgTo: '#140C0C', label: 'Deep conversations after midnight.', glow: 'rgba(239,68,68,0.15)', neonBorder: 'rgba(239,68,68,0.35)', neonShadow: '0 0 20px rgba(239,68,68,0.22), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'default' }
    if (name.includes('music'))
      return { accent: '#06B6D4', bgFrom: '#0E1518', bgTo: '#0B1114', label: 'Share your favourite tracks live.', glow: 'rgba(6,182,212,0.15)', neonBorder: 'rgba(6,182,212,0.35)', neonShadow: '0 0 20px rgba(6,182,212,0.22), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'default' }
    return { accent: '#6366F1', bgFrom: '#111118', bgTo: '#0D0D14', label: 'Step in and vibe.', glow: 'rgba(99,102,241,0.15)', neonBorder: 'rgba(99,102,241,0.35)', neonShadow: '0 0 20px rgba(99,102,241,0.22), 0 4px 20px rgba(0,0,0,0.4)', iconType: 'default' }
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen relative" style={{ background: '#0C0E15' }} data-testid="home-page">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 -left-20 w-[500px] h-[400px] bg-purple-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-20 w-[400px] h-[350px] bg-blue-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-[30%] w-[350px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* ─── COMPACT TOP BAR ─── */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(12,14,21,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} data-testid="home-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/profile')} className="relative" data-testid="header-avatar-btn">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-rose-500/30">
              <img src={user.avatar || user.profilePicture || STOCK_PHOTOS[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0C0E15]" />
          </button>
          <div>
            <p className="text-white text-sm font-bold leading-tight">{user.displayName?.split(' ')[0] || 'You'}</p>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-medium">Online</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => router.push('/wallet')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15 hover:border-amber-500/30 transition-colors" data-testid="credit-balance-btn">
            <Wallet className="w-3.5 h-3.5 text-amber-400/70" strokeWidth={1.5} />
            <span className="text-amber-400/90 text-xs font-bold">{user.credits || 0}</span>
          </button>
          <button onClick={toggleSound} className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="sound-toggle-btn">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400/60" strokeWidth={1.5} /> : <VolumeX className="w-4 h-4 text-white/15" strokeWidth={1.5} />}
          </button>
          <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-lg hover:bg-white/5 transition-all ${hasNewNotification ? 'animate-pulse-soft' : ''}`} data-testid="notification-bell">
            <Bell className={`w-4.5 h-4.5 transition-colors ${unreadCount > 0 ? 'text-rose-400' : 'text-white/20'}`} strokeWidth={1.5} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] font-bold px-1 shadow-lg shadow-rose-500/40">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          <button onClick={() => router.push('/admin')} className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="settings-btn">
            <Settings className="w-4 h-4 text-white/20" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ─── NOTIFICATIONS DROPDOWN ─── */}
      {showNotifications && (
        <div className="fixed top-14 right-3 z-40 w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden animate-fade-in shadow-2xl shadow-black/60" style={{ background: 'linear-gradient(180deg, #181B25 0%, #13151D 100%)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="notifications-dropdown">
          <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0" style={{ background: 'rgba(24,27,37,0.95)', backdropFilter: 'blur(12px)' }}>
            <h3 className="text-white font-heading font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-400" strokeWidth={1.5} /> Notifications
              {unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-medium">{unreadCount} new</span>}
            </h3>
            <div className="flex items-center gap-3">
              {notifications.some(n => !n.read) && <button onClick={markAllNotificationsRead} className="text-xs text-rose-400 hover:text-rose-300 transition-colors" data-testid="mark-all-read-btn">Mark all read</button>}
              <button onClick={() => setShowNotifications(false)} className="p-1 rounded-full hover:bg-white/5" data-testid="close-notifications-btn"><X className="w-4 h-4 text-white/40" strokeWidth={1.5} /></button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            {pendingFriendRequests.length > 0 && (
              <div className="border-b border-white/5">
                <div className="px-4 py-2 bg-rose-500/5"><p className="text-rose-400 text-xs font-medium flex items-center gap-2"><Heart className="w-3 h-3" /> Friend Requests ({pendingFriendRequests.length})</p></div>
                {pendingFriendRequests.map((req) => (
                  <div key={req.id || req.fromUserId} className="p-3 border-b border-white/3 bg-rose-500/3 hover:bg-rose-500/8 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {req.fromAvatar ? <img src={req.fromAvatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{req.fromName || 'Unknown'}</p>
                        <p className="text-white/30 text-xs">Wants to connect</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => acceptFriendRequest(req.fromUserId)} className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => declineFriendRequest(req.fromUserId)} className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notifications.length === 0 && pendingFriendRequests.length === 0 ? (
              <div className="p-8 text-center"><Bell className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm">No notifications yet</p></div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div key={notif.id} onClick={() => { markNotificationRead(notif.id); setShowNotifications(false); if (notif.type === 'dm' || notif.type === 'message') router.push(`/inbox?conversation=${notif.conversationId || notif.data?.conversationId}`); else if (notif.type === 'friend_request' || notif.type === 'friend_accepted') router.push('/friends'); }} className={`p-3 border-b border-white/3 hover:bg-white/3 cursor-pointer transition-colors ${!notif.read ? 'bg-rose-500/5 border-l-2 border-l-rose-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.type === 'friend_request' ? 'bg-rose-500/15' : notif.type === 'friend_accepted' ? 'bg-emerald-500/15' : (notif.type === 'message' || notif.type === 'dm') ? 'bg-indigo-500/15' : 'bg-white/5'}`}>
                      {notif.type === 'friend_request' && <UserPlus className="w-4 h-4 text-rose-400" />}
                      {notif.type === 'friend_accepted' && <Check className="w-4 h-4 text-emerald-400" />}
                      {(notif.type === 'message' || notif.type === 'dm') && <MessageSquare className="w-4 h-4 text-indigo-400" />}
                      {!['friend_request', 'friend_accepted', 'message', 'dm'].includes(notif.type) && <Bell className="w-4 h-4 text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{notif.title}</p>
                      <p className="text-white/30 text-xs truncate">{notif.message || notif.content}</p>
                      <p className="text-white/15 text-[10px] mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for story */}
      <input type="file" ref={storyFileInputRef} onChange={handleStoryFileSelect} accept="image/*,video/*" className="hidden" />

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="relative z-[5] pb-24">

        {/* ─── 1. DISCOVER (MAIN FOCUS) ─── */}
        <section className="pt-4 pb-1" data-testid="discover-section">
          <div className="px-5 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" style={{ filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' }} />
              <h2 className="text-white/90 text-sm font-bold uppercase tracking-wider">Discover</h2>
            </div>
            <button onClick={() => router.push('/search')} className="flex items-center gap-1 text-rose-400/70 text-xs font-semibold hover:text-rose-400 transition-colors" data-testid="see-all-people">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-3 scroll-horizontal" data-testid="discover-scroll">
            {members.slice(0, 12).map((m, idx) => {
              const badge = getBadge(m)
              return (
                <button key={m.id} onClick={() => router.push(`/profile/${m.id}`)} className="flex-none group" data-testid={`discover-card-${m.id}`}>
                  <div className="relative w-[170px] h-[240px] rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${['rgba(168,85,247,0.45)','rgba(59,130,246,0.45)','rgba(236,72,153,0.45)','rgba(6,182,212,0.45)','rgba(239,68,68,0.45)','rgba(168,85,247,0.45)','rgba(59,130,246,0.45)','rgba(236,72,153,0.45)','rgba(6,182,212,0.45)','rgba(239,68,68,0.45)','rgba(168,85,247,0.45)','rgba(59,130,246,0.45)'][idx%12]}`, boxShadow: `0 0 18px ${['rgba(168,85,247,0.25)','rgba(59,130,246,0.25)','rgba(236,72,153,0.25)','rgba(6,182,212,0.25)','rgba(239,68,68,0.25)','rgba(168,85,247,0.25)','rgba(59,130,246,0.25)','rgba(236,72,153,0.25)','rgba(6,182,212,0.25)','rgba(239,68,68,0.25)','rgba(168,85,247,0.25)','rgba(59,130,246,0.25)'][idx%12]}, 0 6px 28px rgba(0,0,0,0.55)` }}>
                    <img src={getPhoto(m, idx)} alt={m.displayName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    {/* Online dot */}
                    <div className="absolute top-3 right-3">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 block shadow-lg shadow-emerald-400/60 ring-2 ring-black/30" />
                    </div>
                    {/* Badge */}
                    {badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${badge.bg} ${badge.color} backdrop-blur-md`}>
                          <badge.icon className="w-2.5 h-2.5" /> {badge.label}
                        </span>
                      </div>
                    )}
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <p className="text-white text-[15px] font-bold truncate leading-tight">{m.displayName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {m.age && <span className="text-white/60 text-[11px]">{m.age}</span>}
                        <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" /> Online
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            {members.length === 0 && (
              <div className="w-full py-12 text-center"><p className="text-white/20 text-sm">Loading people...</p></div>
            )}
          </div>
        </section>

        {/* ─── 2. ACTIVE NOW (Stories + Online Strip) ─── */}
        <section className="px-5 mb-3" data-testid="active-now-section">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} /> Active Now
            </p>
            <span className="text-white/20 text-[10px]">{members.length} online</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scroll-horizontal" data-testid="stories-section">
            <button onClick={() => setShowAddStory(true)} className="flex-none flex flex-col items-center gap-1.5" data-testid="add-story-btn">
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-rose-500/15 to-amber-500/15 border-2 border-dashed border-rose-400/25 flex items-center justify-center hover:border-rose-400/50 transition-colors">
                <Plus className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-white/25 text-[9px] font-medium">Add</span>
            </button>
            {stories.map((sg) => {
              const hasNew = sg.stories?.some(s => !s.viewedBy?.includes(user.id))
              const storyIdx = members.findIndex(mm => mm.id === sg.userId)
              return (
                <button key={`st-${sg.userId}`} onClick={() => viewStory(sg)} className="flex-none flex flex-col items-center gap-1.5" data-testid={`story-${sg.userId}`}>
                  <div className={`w-[52px] h-[52px] rounded-full p-[2px] ${hasNew ? 'bg-gradient-to-br from-rose-500 via-amber-400 to-rose-500' : 'bg-gradient-to-br from-purple-500/50 via-blue-500/40 to-cyan-500/40'}`} style={hasNew ? { boxShadow: '0 0 12px rgba(244,63,94,0.4)' } : { boxShadow: '0 0 8px rgba(168,85,247,0.3)' }}>
                    <div className="w-full h-full rounded-full bg-[#0C0E15] p-[1.5px]">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src={getPhoto(sg, storyIdx >= 0 ? storyIdx : 0)} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <span className="text-white/25 text-[9px] font-medium">{sg.userId === user.id ? 'You' : sg.displayName?.split(' ')[0]?.slice(0, 6)}</span>
                </button>
              )
            })}
            {/* Show active members as avatar strip if no stories */}
            {stories.length === 0 && members.slice(0, 8).map((m, mi) => (
              <button key={`active-${m.id}`} onClick={() => router.push(`/profile/${m.id}`)} className="flex-none flex flex-col items-center gap-1.5">
                <div className="w-[52px] h-[52px] rounded-full p-[2px]" style={{ background: ['rgba(168,85,247,0.55)','rgba(59,130,246,0.55)','rgba(236,72,153,0.55)','rgba(6,182,212,0.55)','rgba(239,68,68,0.55)','rgba(245,158,11,0.55)','rgba(16,185,129,0.55)','rgba(99,102,241,0.55)'][mi%8], boxShadow: ['0 0 12px rgba(168,85,247,0.35)','0 0 12px rgba(59,130,246,0.35)','0 0 12px rgba(236,72,153,0.35)','0 0 12px rgba(6,182,212,0.35)','0 0 12px rgba(239,68,68,0.35)','0 0 12px rgba(245,158,11,0.35)','0 0 12px rgba(16,185,129,0.35)','0 0 12px rgba(99,102,241,0.35)'][mi%8] }}>
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src={getPhoto(m, mi)} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-white/25 text-[9px] font-medium">{m.displayName?.split(' ')[0]?.slice(0, 6)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── CONNECTION REQUESTS (if any) ─── */}
        {pendingFriendRequests.length > 0 && (
          <section className="px-5 mb-3" data-testid="connection-requests">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Heart className="w-3 h-3 text-rose-400" /> Requests</p>
            {pendingFriendRequests.slice(0, 2).map((req, ri) => (
              <div key={req.id || req.fromUserId} className="flex items-center gap-3 p-3 mb-2 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(245,158,11,0.03))', border: '1px solid rgba(244,63,94,0.08)' }} data-testid={`match-${req.fromUserId}`}>
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={req.fromAvatar || STOCK_PHOTOS[(ri + 5) % STOCK_PHOTOS.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{req.fromName || 'Someone'}</p>
                  <p className="text-white/30 text-xs">Wants to connect</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); acceptFriendRequest(req.fromUserId); }} className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">Accept</button>
              </div>
            ))}
          </section>
        )}

        {/* ─── 3. RECENT ACTIVITY ─── */}
        <section className="px-5 mb-3" data-testid="live-feed-section">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" style={{ boxShadow: '0 0 8px rgba(244,63,94,0.6)' }} /> Recent Activity
          </p>
          <div className="space-y-1.5">
            {liveFeedItems.map((item, i) => {
              const t = (item.text || '').toLowerCase()
              const ac = t.includes('online') || t.includes('active') ? { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.18)', ring: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.25)', chevron: 'rgba(59,130,246,0.4)' }
                : t.includes('joined') || t.includes('lounge') ? { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)', ring: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.25)', chevron: 'rgba(16,185,129,0.4)' }
                : t.includes('updated') || t.includes('profile') || t.includes('exploring') ? { bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.18)', ring: 'rgba(168,85,247,0.5)', glow: 'rgba(168,85,247,0.25)', chevron: 'rgba(168,85,247,0.4)' }
                : { bg: 'rgba(255,255,255,0.025)', border: 'rgba(255,255,255,0.04)', ring: 'rgba(255,255,255,0.08)', glow: 'transparent', chevron: 'rgba(255,255,255,0.1)' }
              return (
              <button key={item.id} onClick={() => item.userId ? router.push(`/profile/${item.userId}`) : null} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group" style={{ background: ac.bg, border: `1px solid ${ac.border}` }} data-testid={`feed-item-${i}`}>
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 1.5px ${ac.ring}, 0 0 8px ${ac.glow}` }}>
                  <img src={item.member ? getPhoto(item.member, item.photoIdx) : STOCK_PHOTOS[item.photoIdx % STOCK_PHOTOS.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white/60 text-[13px] group-hover:text-white/80 transition-colors truncate">{item.text}</p>
                  <p className="text-white/15 text-[10px] mt-0.5">{timeAgo(item.time)}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 transition-colors" style={{ color: ac.chevron }} />
              </button>
              )
            })}
          </div>
        </section>

        {/* ─── 4. EVENTS / PROMOTIONS ─── */}
        {events.length > 0 && (
          <section className="px-4 mb-3" data-testid="events-section">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Upcoming
              </p>
              <button onClick={() => router.push('/events')} className="flex items-center gap-1 text-amber-400/60 text-xs font-semibold hover:text-amber-400 transition-colors" data-testid="see-all-events">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {events.slice(0, 3).map((evt) => {
                const evtDate = new Date(evt.date)
                const dayName = evtDate.toLocaleDateString('en', { weekday: 'short' })
                const dayNum = evtDate.getDate()
                const month = evtDate.toLocaleDateString('en', { month: 'short' })
                const rsvpCount = evt.rsvps?.length || 0
                return (
                  <button key={evt.id} onClick={() => router.push('/events')} className="w-full rounded-2xl overflow-hidden text-left group hover:translate-y-[-1px] transition-all duration-200 relative" style={{ background: 'linear-gradient(145deg, #16141E, #11101A)', border: '1px solid rgba(245,158,11,0.08)', boxShadow: '0 4px 20px rgba(245,158,11,0.04)' }} data-testid={`event-card-${evt.id}`}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.5), transparent 60%)' }} />
                    <div className="absolute top-0 right-0 w-24 h-20 rounded-full blur-[40px]" style={{ background: 'rgba(245,158,11,0.04)' }} />
                    <div className="p-4 relative z-10">
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)' }}>
                          <span className="text-amber-400 text-[10px] font-bold leading-none uppercase">{dayName}</span>
                          <span className="text-white text-lg font-bold leading-tight">{dayNum}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-[15px] font-bold truncate mb-0.5">{evt.title}</h4>
                          <p className="text-white/30 text-[12px] leading-relaxed mb-2">{evt.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white/15 text-[11px]">{month} {dayNum} {evt.location ? `\u00B7 ${evt.location}` : ''}</span>
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/15 group-hover:bg-amber-400/20 transition-colors">
                              {rsvpCount > 0 ? `${rsvpCount} going` : 'Join'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── 5. LOUNGES (Unified Cards) ─── */}
        <section className="mb-3" data-testid="active-lounges-section">
          <div className="px-5 flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sofa className="w-4 h-4 text-indigo-400" style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }} />
              <h2 className="text-white/90 text-sm font-bold uppercase tracking-wider">Lounges</h2>
            </div>
            <button onClick={() => handleTileClick('lounge', '/lounge')} className="flex items-center gap-1 text-indigo-400/70 text-xs font-semibold hover:text-indigo-400 transition-colors" data-testid="see-all-lounges">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 px-4">
            {/* Featured lounges: Grown Folks, LowKey, After Dark, Kink, VIP */}
            {(() => {
              const featured = ['grown-folks', 'lowkey', 'after-dark', 'kink', 'vip']
              const featuredLounges = featured.map(key => {
                return loungesList.find(l => {
                  const n = l.name?.toLowerCase() || ''
                  if (key === 'grown-folks') return n.includes('grown folk')
                  if (key === 'lowkey') return n.includes('lowkey')
                  if (key === 'after-dark') return n.includes('after dark')
                  if (key === 'kink') return n.includes('kink')
                  if (key === 'vip') return n.includes('vip')
                  return false
                })
              }).filter(Boolean)

              return featuredLounges.map((l) => {
                const theme = getLoungeTheme(l)
                const count = l.memberCount || l.members?.length || 0
                const isAfterDark = l.isAfterDark || l.name?.toLowerCase().includes('after dark')
                const handleClick = () => {
                  if (isAfterDark) { handleTileClick('afterdark', '/afterdark') }
                  else { router.push(`/lounge?id=${l.id}`) }
                }
                return (
                  <button key={l.id} onClick={handleClick} className="w-full rounded-2xl overflow-hidden text-left group hover:translate-y-[-2px] transition-all duration-300 relative" style={{ background: `linear-gradient(145deg, ${theme.bgFrom}, ${theme.bgTo})`, border: `1.5px solid ${theme.neonBorder}`, boxShadow: theme.neonShadow }} data-testid={`home-lounge-${l.id}`}>
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}50 60%, transparent)` }} />
                    {/* Corner glow */}
                    <div className="absolute top-0 right-0 w-32 h-24 rounded-full blur-[50px]" style={{ background: `${theme.accent}18` }} />
                    {/* Bottom edge glow */}
                    <div className="absolute bottom-0 left-0 w-24 h-16 rounded-full blur-[40px]" style={{ background: `${theme.accent}10` }} />
                    {/* Featured badge */}
                    {theme.featured && (
                      <div className="absolute top-2.5 right-3 z-20">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-bold tracking-wider uppercase" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)', boxShadow: '0 0 14px rgba(255,215,0,0.25)' }}>
                          <Sparkles className="w-2.5 h-2.5" /> Featured Community
                        </span>
                      </div>
                    )}
                    <div className="relative p-3.5 z-10">
                      <div className="flex items-center gap-3 mb-1.5">
                        {/* Lounge Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}35`, boxShadow: `0 0 12px ${theme.accent}25` }}>
                          {theme.iconType === 'gfb' && <span className="text-[10px] font-black leading-none" style={{ color: theme.accent, textShadow: `0 0 8px ${theme.accent}60` }}>GFB</span>}
                          {theme.iconType === 'lk' && <span className="text-[12px] font-black leading-none" style={{ color: theme.accent, textShadow: `0 0 8px ${theme.accent}60` }}>LK</span>}
                          {theme.iconType === 'moon' && <Moon className="w-4 h-4" style={{ color: theme.iconAccent || theme.accent, filter: `drop-shadow(0 0 4px ${theme.iconAccent || theme.accent})` }} strokeWidth={2} />}
                          {theme.iconType === 'crown' && <Crown className="w-4 h-4" style={{ color: theme.iconAccent || theme.accent, filter: `drop-shadow(0 0 4px ${theme.iconAccent || theme.accent})` }} strokeWidth={2} />}
                          {theme.iconType === 'handcuffs' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${theme.accent})` }}><circle cx="8" cy="15" r="4.5" /><circle cx="16" cy="15" r="4.5" /><path d="M8 10.5V7M16 10.5V7M8 7h8" /></svg>}
                          {(!theme.iconType || theme.iconType === 'default') && <Sofa className="w-4 h-4" style={{ color: theme.accent, filter: `drop-shadow(0 0 4px ${theme.accent})` }} strokeWidth={2} />}
                        </div>
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <h3 className="text-white font-bold text-[14px] truncate flex-1 mr-3">{l.name}</h3>
                          {count > 0 && (
                            <span className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.accent, boxShadow: `0 0 12px ${theme.accent}, 0 0 4px ${theme.accent}80` }} />
                              <span className="text-[10px] font-bold tracking-wider" style={{ color: theme.accent, textShadow: `0 0 6px ${theme.accent}50` }}>LIVE</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-white/35 text-[12px] leading-relaxed mb-2.5">{l.description || theme.label}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" style={{ color: `${theme.accent}50` }} strokeWidth={1.5} />
                          <span className="text-white/30 text-[11px] font-medium">{count} {count === 1 ? 'person' : 'people'} inside</span>
                        </div>
                        <span className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold group-hover:brightness-125 transition-all" style={{ background: `${theme.accent}18`, color: theme.accent, border: `1px solid ${theme.accent}30`, boxShadow: `0 0 10px ${theme.accent}20` }}>Enter</span>
                      </div>
                    </div>
                  </button>
                )
              })
            })()}
          </div>
        </section>

        {/* ─── QUICK ACTIONS ─── */}
        <section className="px-5 mb-3" data-testid="quick-access">
          <div className="flex items-center gap-2.5">
            <button onClick={() => handleTileClick('radio', '/radio')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:translate-y-[-1px] active:scale-95 transition-all duration-200" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.30)', boxShadow: '0 0 15px rgba(168,85,247,0.15), 0 0 4px rgba(236,72,153,0.1)' }} data-testid="home-radio-btn">
              <Radio className="w-3.5 h-3.5 text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.6))' }} strokeWidth={1.5} />
              <span className="text-purple-300 text-[11px] font-semibold">Radio</span>
            </button>
            <button onClick={() => handleTileClick('games', '/games')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:translate-y-[-1px] active:scale-95 transition-all duration-200" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.30)', boxShadow: '0 0 15px rgba(59,130,246,0.15)' }} data-testid="quick-games">
              <Gamepad2 className="w-3.5 h-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.6))' }} strokeWidth={1.5} />
              <span className="text-blue-300 text-[11px] font-semibold">Games</span>
            </button>
            <button onClick={() => router.push('/inbox')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:translate-y-[-1px] active:scale-95 transition-all duration-200" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.30)', boxShadow: '0 0 15px rgba(6,182,212,0.15)' }} data-testid="quick-inbox">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.6))' }} strokeWidth={1.5} />
              <span className="text-cyan-300 text-[11px] font-semibold">Inbox</span>
            </button>
          </div>
        </section>

      </main>

      {/* ─── ADD STORY MODAL ─── */}
      {showAddStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => { setShowAddStory(false); resetStoryForm() }}>
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#14171F' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white font-bold">Create Story</h2>
              <button onClick={() => { setShowAddStory(false); resetStoryForm() }} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="flex gap-2 mb-6">
              {[{ t: 'photo', icon: Camera }, { t: 'video', icon: Video }, { t: 'text', icon: Type }].map(({ t, icon: Icon }) => (
                <button key={t} onClick={() => { setStoryType(t); setStoryFile(null); setStoryPreview(null) }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${storyType === t ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                  <Icon className="w-4 h-4" /> {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {storyType === 'text' ? (
              <div className="mb-6">
                <div className="aspect-[9/16] max-h-64 rounded-xl flex items-center justify-center p-6 mb-4" style={{ backgroundColor: storyBgColor }}>
                  <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="What's on your mind?" className="w-full h-full bg-transparent text-white text-xl text-center resize-none focus:outline-none placeholder-white/50" maxLength={200} />
                </div>
                <div className="flex gap-2 justify-center">
                  {['#1a1a2e', '#2d1b4e', '#1a365d', '#3d1c02', '#0d2818', '#3d2b2b'].map(color => (
                    <button key={color} onClick={() => setStoryBgColor(color)} className={`w-8 h-8 rounded-full border-2 ${storyBgColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {storyPreview ? (
                  <div className="aspect-[9/16] max-h-64 rounded-xl overflow-hidden bg-black mb-4 relative">
                    {storyType === 'video' ? <video src={storyPreview} className="w-full h-full object-contain" controls /> : <img src={storyPreview} alt="Preview" className="w-full h-full object-contain" />}
                    <button onClick={() => { setStoryFile(null); setStoryPreview(null) }} className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80"><X className="w-4 h-4 text-white" /></button>
                  </div>
                ) : (
                  <button onClick={() => storyFileInputRef.current?.click()} className="w-full aspect-[9/16] max-h-64 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-rose-400/30 transition-colors">
                    {storyType === 'photo' ? <Camera className="w-12 h-12 text-white/15" /> : <Video className="w-12 h-12 text-white/15" />}
                    <span className="text-white/25">Tap to select {storyType}</span>
                  </button>
                )}
              </div>
            )}
            <div className="mb-6">
              <label className="text-white/30 text-sm mb-2 block">Who can see this?</label>
              <div className="flex gap-2">
                <button onClick={() => setStoryPrivacy('everyone')} className={`flex-1 py-2 rounded-lg text-sm ${storyPrivacy === 'everyone' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-white/30 border border-white/5'}`}>Everyone</button>
                <button onClick={() => setStoryPrivacy('friends')} className={`flex-1 py-2 rounded-lg text-sm ${storyPrivacy === 'friends' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 font-bold' : 'bg-white/5 text-white/30 border border-white/5'}`}>Friends Only</button>
              </div>
            </div>
            <button onClick={createStory} disabled={uploadingStory || (storyType === 'text' ? !storyText.trim() : !storyFile)} className="w-full py-4 rounded-xl font-bold text-sm bg-rose-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
              {uploadingStory ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Share Story'}
            </button>
          </div>
        </div>
      )}

      {/* ─── STORY VIEWER ─── */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setSelectedStory(null)}>
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
                  {selectedStory.avatar ? <img src={selectedStory.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{selectedStory.displayName || 'User'}</p>
                  <p className="text-white/40 text-xs">{selectedStory.stories?.[0]?.createdAt && timeAgo(selectedStory.stories[0].createdAt)}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedStory(null) }} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="w-6 h-6 text-white" /></button>
            </div>
            {selectedStory.stories?.length > 1 && (
              <div className="flex gap-1 mt-3">{selectedStory.stories.map((_, idx) => (<div key={idx} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"><div className={`h-full bg-white ${idx === 0 ? 'w-full' : 'w-0'}`} /></div>))}</div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {selectedStory.stories?.[0] && (
              <>
                {(selectedStory.stories[0].type === 'video' || selectedStory.stories[0].mediaType === 'video') ? (
                  <video src={selectedStory.stories[0].mediaUrl || selectedStory.stories[0].content} className="max-w-full max-h-full object-contain" autoPlay playsInline controls loop />
                ) : selectedStory.stories[0].type === 'text' ? (
                  <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: selectedStory.stories[0].backgroundColor || '#1a1a2e' }}>
                    <p className="text-white text-2xl text-center font-medium">{selectedStory.stories[0].content || selectedStory.stories[0].text}</p>
                  </div>
                ) : (
                  <img src={selectedStory.stories[0].mediaUrl || selectedStory.stories[0].content} alt="" className="max-w-full max-h-full object-contain" />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── BOTTOM NAVIGATION ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t" style={{ background: 'rgba(12,14,21,0.95)', backdropFilter: 'blur(24px)', borderColor: 'rgba(255,255,255,0.04)' }} data-testid="bottom-nav">
        <div className="flex items-center justify-around py-2.5 max-w-lg mx-auto">
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5" data-testid="nav-home">
            <Home className="w-5 h-5 text-rose-400" strokeWidth={2} />
            <span className="text-[10px] font-bold text-rose-400">Home</span>
          </button>
          <button onClick={() => router.push('/search')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-white/50 transition-colors" data-testid="nav-search">
            <Search className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button onClick={() => handleTileClick('lounge', '/lounge')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-indigo-400 transition-colors" data-testid="nav-lounge">
            <Sofa className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Lounge</span>
          </button>
          <button onClick={() => handleTileClick('afterdark', '/afterdark')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-amber-400 transition-colors" data-testid="nav-afterdark">
            <Moon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">After Dark</span>
          </button>
          <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/20 hover:text-white/50 transition-colors" data-testid="nav-profile">
            <User className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* ─── MODALS ─── */}
      <LockModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
      <OnboardingSlide isOpen={showOnboarding} onDismiss={dismissOnboarding} />
      <AfterDarkDisclaimer isOpen={showAfterDarkDisclaimer} onAccept={acceptAfterDarkDisclaimer} />
      <MainLoungeInfo isOpen={showLoungeInfo} onClose={closeLoungeInfo} onEnter={enterLounge} />
    </div>
  )
}

// ─── Main App Entry ──────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (storedUser) setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  const handleLogin = (userData) => setUser(userData)
  const handleLogout = () => { localStorage.removeItem('lowkey_user'); localStorage.removeItem('lowkey_token'); setUser(null) }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0E15' }}>
        <div className="animate-pulse"><LowKeyLogo size="lg" /></div>
      </div>
    )
  }

  if (!user) return <AuthPage onLogin={handleLogin} />

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout }}>
      <HomePage user={user} onLogout={handleLogout} setUser={setUser} />
    </AuthContext.Provider>
  )
}
