'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Calendar, Check, Shield, Moon, LogOut, Star, Crown, PoundSterling, Users, Settings, Image } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(null)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [bio, setBio] = useState('')
  const [isFounder, setIsFounder] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setNewPrice(userData.subscriptionPrice?.toString() || '4.99')
    setBio(userData.bio || '')
    
    if (userData.isCreator) {
      fetchEarnings(userData.id)
    }
    
    checkFounder(userData.id)
    setLoading(false)
  }, [])

  const checkFounder = async (userId) => {
    try {
      const res = await fetch('/api/founder/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        const data = await res.json()
        setIsFounder(data.isFounder)
      }
    } catch (err) {
      console.error('Failed to check founder')
    }
  }

  const fetchEarnings = async (creatorId) => {
    try {
      const res = await fetch('/api/creator/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })
      if (res.ok) {
        const data = await res.json()
        setEarnings(data)
      }
    } catch (err) {
      console.error('Failed to fetch earnings')
    }
  }

  const updateCreatorSettings = async () => {
    try {
      await fetch('/api/creator/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscriptionPrice: parseFloat(newPrice),
          bio
        })
      })
      const updatedUser = { ...user, subscriptionPrice: parseFloat(newPrice), bio }
      setUser(updatedUser)
      localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      setShowPriceModal(false)
    } catch (err) {
      console.error('Failed to update settings')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lowkey_user')
    localStorage.removeItem('lowkey_token')
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          {isFounder && (
            <button 
              onClick={() => router.push('/founder')}
              className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30"
            >
              <Crown className="w-5 h-5 text-amber-400" />
            </button>
          )}
          {user.role === 'admin' && (
            <button 
              onClick={() => router.push('/admin')}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
            user.isCreator 
              ? 'bg-gradient-to-br from-pink-500 to-purple-500' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
          {user.bio && <p className="text-gray-400 text-center mt-2">{user.bio}</p>}
          <div className="flex items-center gap-2 mt-3">
            {user.verified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {user.isCreator && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs">
                <Star className="w-3 h-3" /> Creator
              </span>
            )}
            {user.role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            {isFounder && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs">
                <Crown className="w-3 h-3" /> Founder
              </span>
            )}
            {user.ageVerified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs">
                <Moon className="w-3 h-3" /> 18+
              </span>
            )}
          </div>
        </div>

        {/* Creator Section */}
        {user.isCreator && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-pink-400" /> Creator Dashboard
              </h3>
              <button
                onClick={() => setShowPriceModal(true)}
                className="text-pink-400 text-sm"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-black/30">
                <p className="text-gray-400 text-xs">Subscription Price</p>
                <p className="text-white text-lg font-bold">£{user.subscriptionPrice?.toFixed(2) || '4.99'}/mo</p>
              </div>
              <div className="p-3 rounded-xl bg-black/30">
                <p className="text-gray-400 text-xs">Subscribers</p>
                <p className="text-white text-lg font-bold">{earnings?.subscriberCount || 0}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs">Total Earnings</p>
                  <p className="text-green-400 text-xl font-bold">£{earnings?.totalEarnings?.toFixed(2) || '0.00'}</p>
                </div>
                <p className="text-gray-500 text-xs">LowKey takes 20%</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/lounge')}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Image className="w-5 h-5" /> Post Content
            </button>
          </div>
        )}

        {/* Normal User - Creator Info */}
        {!user.isCreator && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-6 h-6 text-pink-400" />
              <div>
                <h3 className="text-white font-semibold">Become a Creator</h3>
                <p className="text-gray-400 text-sm">Earn money by sharing exclusive content</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Contact the founder to request creator status. Set your own subscription price in £ (pounds) and start earning!
            </p>
            <p className="text-pink-400 text-xs">LowKey takes only 20% - you keep 80% of earnings!</p>
          </div>
        )}

        {/* Profile Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Member since</p>
              <p className="text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <Users className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Friends</p>
              <p className="text-white">{user.friends?.length || 0} friends</p>
            </div>
            <button 
              onClick={() => router.push('/friends')}
              className="text-amber-400 text-sm"
            >
              View
            </button>
          </div>
        </div>

        {/* Quick Settings */}
        <h3 className="text-white font-semibold mb-3">Quick Settings</h3>
        <div className="space-y-2 mb-6">
          <button 
            onClick={() => router.push('/quiet')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="text-white">Quiet Mode</span>
            <span className={`text-sm ${user.quietMode ? 'text-green-400' : 'text-gray-400'}`}>
              {user.quietMode ? 'On' : 'Off'}
            </span>
          </button>

          {!user.verified && (
            <button 
              onClick={() => router.push('/verification')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
            >
              <span className="text-white">Complete Verification</span>
              <span className="text-purple-400 text-sm">Required</span>
            </button>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      {/* Price/Bio Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowPriceModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Creator Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Subscription Price (£)</label>
                <div className="relative">
                  <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-pink-500/30 text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">You'll receive 80% (£{((parseFloat(newPrice) || 0) * 0.8).toFixed(2)})</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell subscribers about yourself..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPriceModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button onClick={updateCreatorSettings} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
