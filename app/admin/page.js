'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, User, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const router = useRouter()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleVerification = async (userId, currentStatus) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus })
      })
      
      if (res.ok) {
        const updatedUser = await res.json()
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        
        // Update local storage if this is the current user
        const storedUser = localStorage.getItem('lowkey_user')
        if (storedUser) {
          const currentUser = JSON.parse(storedUser)
          if (currentUser.id === userId) {
            localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
          }
        }
      }
    } catch (err) {
      console.error('Failed to update verification:', err)
    }
    setUpdating(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Admin - User Verification</h1>
        <button
          onClick={fetchUsers}
          className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No users found</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{user.displayName}</div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
              </div>
              
              <button
                onClick={() => toggleVerification(user.id, user.verified)}
                disabled={updating === user.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  user.verified
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                } hover:opacity-80 disabled:opacity-50`}
              >
                {updating === user.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : user.verified ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {user.verified ? 'Verified' : 'Unverified'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <p className="text-gray-300 text-sm">
          <strong className="text-purple-400">Note:</strong> Toggle verification status to test locked features.
          Locked features for unverified users: Radio, Music, After Dark
        </p>
      </div>
    </div>
  )
}
