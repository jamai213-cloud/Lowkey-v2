'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Crown, Users, Star, Shield, Trash2, PoundSterling, TrendingUp, Award, Check, UserCheck, Gem } from 'lucide-react'

const VERIFICATION_TIERS = [
  { id: 'new', name: 'New Member', icon: Users, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  { id: 'verified', name: 'Verified', icon: Check, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'trusted', name: 'Trusted', icon: UserCheck, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { id: 'inner-circle', name: 'Inner Circle', icon: Gem, color: 'text-amber-400', bgColor: 'bg-amber-500/20' }
]

export default function FounderPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isFounder, setIsFounder] = useState(false)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    checkFounder(userData.id)
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
        if (data.isFounder) {
          fetchUsers(userId)
          fetchStats(userId)
        }
      }
    } catch (err) {
      console.error('Failed to check founder status')
    }
    setLoading(false)
  }

  const fetchUsers = async (founderId) => {
    try {
      const res = await fetch('/api/founder/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId })
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  const fetchStats = async (founderId) => {
    try {
      const res = await fetch('/api/founder/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId })
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats')
    }
  }

  const setVerificationTier = async (userId, tier) => {
    try {
      await fetch('/api/founder/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id, userId, verificationTier: tier })
      })
      fetchUsers(user.id)
    } catch (err) {
      console.error('Failed to set verification tier')
    }
  }

  const toggleCreator = async (userId, currentStatus) => {
    try {
      await fetch('/api/founder/creator-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id, userId, isCreator: !currentStatus })
      })
      fetchUsers(user.id)
      fetchStats(user.id)
    } catch (err) {
      console.error('Failed to toggle creator status')
    }
  }

  const toggleAdmin = async (userId, currentStatus) => {
    try {
      await fetch('/api/founder/admin-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id, userId, isAdmin: currentStatus !== 'admin' })
      })
      fetchUsers(user.id)
    } catch (err) {
      console.error('Failed to toggle admin status')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    
    try {
      await fetch('/api/founder/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id, userId })
      })
      fetchUsers(user.id)
      fetchStats(user.id)
    } catch (err) {
      console.error('Failed to delete user')
    }
  }

  const getTierInfo = (tier) => VERIFICATION_TIERS.find(t => t.id === tier) || VERIFICATION_TIERS[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  if (!isFounder) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-white mb-2">Founder Access Only</h1>
          <p className="text-gray-400 mb-6">This page is restricted to the LowKey founder.</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-xl bg-white/10 text-white">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <Crown className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-xl font-semibold text-white">Founder Dashboard</h1>
          <p className="text-amber-400 text-xs">kinglowkey@hotmail.com</p>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <Users className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-gray-400 text-xs">Total Users</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <Star className="w-5 h-5 text-pink-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalCreators}</p>
            <p className="text-gray-400 text-xs">Creators</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <PoundSterling className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">£{stats.totalRevenue?.toFixed(2) || '0.00'}</p>
            <p className="text-gray-400 text-xs">Total Revenue</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">£{stats.lowkeyEarnings?.toFixed(2) || '0.00'}</p>
            <p className="text-gray-400 text-xs">LowKey Earnings (20%)</p>
          </div>
        </div>
      )}

      {/* Verification Tiers Legend */}
      <div className="px-4 mb-4">
        <p className="text-gray-400 text-xs mb-2">Verification Tiers:</p>
        <div className="flex flex-wrap gap-2">
          {VERIFICATION_TIERS.map(tier => (
            <span key={tier.id} className={`px-2 py-1 rounded-full text-xs ${tier.bgColor} ${tier.color}`}>
              {tier.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'users' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('creators')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'creators' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          Creators ({users.filter(u => u.isCreator).length})
        </button>
      </div>

      {/* User List */}
      <div className="p-4 space-y-3">
        {(activeTab === 'creators' ? users.filter(u => u.isCreator) : users).map((u) => {
          const tierInfo = getTierInfo(u.verificationTier)
          const TierIcon = tierInfo.icon
          
          return (
            <div key={u.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{u.displayName}</span>
                    <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
                    {u.isCreator && <Star className="w-4 h-4 text-pink-400" />}
                    {u.role === 'admin' && <Shield className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={u.email?.toLowerCase() === 'kinglowkey@hotmail.com'}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Verification Tier Selector */}
              <div className="mb-3">
                <p className="text-gray-500 text-xs mb-2">Verification Tier:</p>
                <div className="flex flex-wrap gap-1">
                  {VERIFICATION_TIERS.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setVerificationTier(u.id, tier.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.verificationTier === tier.id || (!u.verificationTier && tier.id === 'new')
                          ? `${tier.bgColor} ${tier.color} ring-1 ring-current`
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {tier.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleCreator(u.id, u.isCreator)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    u.isCreator ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  {u.isCreator ? 'Creator' : 'Make Creator'}
                </button>

                <button
                  onClick={() => toggleAdmin(u.id, u.role)}
                  disabled={u.email?.toLowerCase() === 'kinglowkey@hotmail.com'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'
                  } disabled:opacity-30`}
                >
                  <Shield className="w-3 h-3" />
                  {u.role === 'admin' ? 'Admin' : 'Make Admin'}
                </button>
              </div>

              {u.isCreator && (
                <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-400">
                  <span>Subscription: £{u.subscriptionPrice?.toFixed(2) || '4.99'}/month</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
