'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Bell, BellOff, Users, Eye, EyeOff } from 'lucide-react'

export default function QuietPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [quietMode, setQuietMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setQuietMode(userData.quietMode || false)
    setLoading(false)
  }, [])

  const toggleQuietMode = async () => {
    setSaving(true)
    const newValue = !quietMode
    
    try {
      const res = await fetch('/api/profile/quiet-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quietMode: newValue })
      })
      
      if (res.ok) {
        setQuietMode(newValue)
        const updatedUser = { ...user, quietMode: newValue }
        setUser(updatedUser)
        localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      }
    } catch (err) {
      console.error('Failed to update quiet mode')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Quiet Mode</h1>
      </header>

      <div className="p-4">
        {/* Main Toggle */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                quietMode ? 'bg-purple-500' : 'bg-white/10'
              }`}>
                {quietMode ? (
                  <VolumeX className="w-7 h-7 text-white" />
                ) : (
                  <Volume2 className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">Quiet Mode</h2>
                <p className="text-gray-400 text-sm">
                  {quietMode ? 'Currently active' : 'Currently off'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleQuietMode}
              disabled={saving}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                quietMode ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                quietMode ? 'left-7' : 'left-0.5'
              }`} />
            </button>
          </div>
          <p className="text-gray-300 text-sm">
            When enabled, Quiet Mode reduces notifications and hides certain UI elements to give you a peaceful experience.
          </p>
        </div>

        {/* What Quiet Mode Does */}
        <h3 className="text-white font-semibold mb-3">What Quiet Mode does:</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              quietMode ? 'bg-green-500/20' : 'bg-white/10'
            }`}>
              <BellOff className={`w-5 h-5 ${quietMode ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Mute notification badges</p>
              <p className="text-gray-400 text-sm">Hide unread counts from notice tiles</p>
            </div>
            {quietMode && <span className="text-green-400 text-xs">Active</span>}
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              quietMode ? 'bg-green-500/20' : 'bg-white/10'
            }`}>
              <EyeOff className={`w-5 h-5 ${quietMode ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Hide Meet suggestions</p>
              <p className="text-gray-400 text-sm">Stop seeing user suggestions</p>
            </div>
            {quietMode && <span className="text-green-400 text-xs">Active</span>}
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              quietMode ? 'bg-green-500/20' : 'bg-white/10'
            }`}>
              <Users className={`w-5 h-5 ${quietMode ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Reduce social prompts</p>
              <p className="text-gray-400 text-sm">Less "who's online" notifications</p>
            </div>
            {quietMode && <span className="text-green-400 text-xs">Active</span>}
          </div>
        </div>

        {/* Status */}
        <div className={`mt-6 p-4 rounded-xl ${
          quietMode 
            ? 'bg-purple-500/10 border border-purple-500/30' 
            : 'bg-white/5 border border-white/10'
        }`}>
          <p className={`text-sm ${quietMode ? 'text-purple-300' : 'text-gray-400'}`}>
            {quietMode 
              ? '🌙 Quiet Mode is active. Enjoy your peaceful experience.'
              : '💬 Quiet Mode is off. You will receive all notifications normally.'}
          </p>
        </div>
      </div>
    </div>
  )
}
