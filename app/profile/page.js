'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Calendar, Check, Shield, Moon, LogOut, Settings } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

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
        {user.role === 'admin' && (
          <button 
            onClick={() => router.push('/admin')}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Settings className="w-5 h-5 text-amber-400" />
          </button>
        )}
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
          <div className="flex items-center gap-2 mt-2">
            {user.verified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {user.role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            {user.ageVerified && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs">
                <Moon className="w-3 h-3" /> 18+
              </span>
            )}
          </div>
        </div>

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
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <User className="w-5 h-5 text-gray-400" />
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
    </div>
  )
}
