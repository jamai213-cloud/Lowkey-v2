'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, MessageSquare, Sofa, Search, Wallet, Moon, Gamepad2, Radio, Music, 
  Calendar, Bell, Lock, X, Eye, EyeOff, Volume2, UserPlus, CheckCircle, 
  LogOut, Settings, Sparkles, Home, User, ChevronRight, Send
} from 'lucide-react'

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

// Tile Component
const Tile = ({ icon: Icon, label, colorClass, isLocked, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`tile ${colorClass} relative w-full aspect-[2/1] rounded-xl flex items-center gap-3 px-4 group`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Icon className="w-5 h-5 text-white/90" />
        <span className="text-white font-medium text-sm">{label}</span>
      </div>
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-purple-400 animate-pulse-soft" />
        </div>
      )}
    </button>
  )
}

// Notification Bell Component
const NotificationBell = ({ count, onClick }) => (
  <button onClick={onClick} className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
    <Bell className="w-5 h-5 text-gray-300" />
    {count > 0 && (
      <span className="notification-badge">{count > 9 ? '9+' : count}</span>
    )}
  </button>
)

// Home Page Component
const HomePage = ({ user, onLogout, setUser }) => {
  const [showLockModal, setShowLockModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  
  const lockedFeatures = ['radio', 'music', 'afterdark']
  
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }
  
  const handleTileClick = (tileId, path) => {
    if (lockedFeatures.includes(tileId) && !user.verified) {
      setShowLockModal(true)
      return
    }
    router.push(path)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const tiles = [
    { id: 'friends', icon: Users, label: 'Friends', colorClass: 'tile-friends', path: '/friends' },
    { id: 'inbox', icon: MessageSquare, label: 'Inbox', colorClass: 'tile-inbox', path: '/inbox' },
    { id: 'lounge', icon: Sofa, label: 'Lounge', colorClass: 'tile-lounge', path: '/lounge' },
    { id: 'search', icon: Search, label: 'Search', colorClass: 'tile-search', path: '/search' },
    { id: 'wallet', icon: Wallet, label: 'Wallet', colorClass: 'tile-wallet', path: '/wallet' },
    { id: 'meet', icon: UserPlus, label: 'Meet', colorClass: 'tile-meet', path: '/meet' },
    { id: 'quiet', icon: Volume2, label: 'Quiet', colorClass: 'tile-quiet', path: '/quiet' },
    { id: 'afterdark', icon: Moon, label: 'After Dark', colorClass: 'tile-afterdark', path: '/afterdark' },
    { id: 'games', icon: Gamepad2, label: 'Games', colorClass: 'tile-games', path: '/games' },
    { id: 'radio', icon: Radio, label: 'Radio', colorClass: 'tile-radio', path: '/radio' },
    { id: 'music', icon: Music, label: 'Music', colorClass: 'tile-music', path: '/music' },
    { id: 'events', icon: Calendar, label: 'Events', colorClass: 'tile-events', path: '/events' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" 
            alt="LowKey" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-lg font-semibold text-white">LowKey</span>
        </div>
        
        <div className="flex items-center gap-2">
          {user.verified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          <NotificationBell count={unreadCount} onClick={() => setShowNotifications(!showNotifications)} />
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
        <div className="absolute top-16 right-4 z-30 w-80 glass-card rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No notifications</div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => {
                  if (notif.type === 'dm') {
                    router.push(`/inbox?conversation=${notif.conversationId}`)
                  }
                  setShowNotifications(false)
                }}
                className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer ${!notif.read ? 'bg-purple-500/10' : ''}`}
              >
                <p className="text-white text-sm">{notif.message}</p>
                <p className="text-gray-500 text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 p-4 pb-24">
        {/* Tiles Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              icon={tile.icon}
              label={tile.label}
              colorClass={tile.colorClass}
              isLocked={lockedFeatures.includes(tile.id) && !user.verified}
              onClick={() => handleTileClick(tile.id, tile.path)}
            />
          ))}          
        </div>

        {/* Notices Tile */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/notices')}
            className="tile tile-notices w-full max-w-xs rounded-xl flex items-center gap-3 px-4 py-3"
          >
            <Bell className="w-5 h-5 text-white/90" />
            <span className="text-white font-medium text-sm">Notices</span>
          </button>
        </div>

        {/* Tagline */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">A private space for adults. Connection happens at your own pace.</p>
          <p className="text-gray-500 text-xs mt-1">Share what you want • Say what you feel • Respect boundaries</p>
        </div>

        {/* Featured Spotlight */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Featured Spotlight</h3>
              <p className="text-gray-400 text-sm mt-1">
                Get calm visibility + Browse. Create personal traction and earn subtly. Optional, never aggressive.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-amber-400 text-sm font-medium">From $5/hour</span>
                <span className="text-gray-500 text-sm">• Neutral placement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Communities Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Communities</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors">
              Browse
            </button>
            <button className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-sm font-semibold hover:opacity-90 transition-opacity">
              Join
            </button>
            <button className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-colors">
              + Create
            </button>
          </div>
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
