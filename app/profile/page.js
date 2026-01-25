'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, CheckCircle, Settings, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('lowkey_user')
    localStorage.removeItem('lowkey_token')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </header>

      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <span className="text-white font-bold text-3xl">
            {user.displayName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        
        <h2 className="text-white text-xl font-semibold">{user.displayName}</h2>
        <p className="text-gray-400">{user.email}</p>
        
        {user.verified && (
          <span className="flex items-center gap-1 px-3 py-1 mt-3 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Verified
          </span>
        )}
      </div>

      <div className="space-y-3 mt-6">
        <button
          onClick={() => router.push('/admin')}
          className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
        >
          <Settings className="w-5 h-5 text-purple-400" />
          <span className="text-white">Admin Settings</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-white">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
