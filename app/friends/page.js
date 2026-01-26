'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, UserPlus, UserMinus, MessageSquare } from 'lucide-react'

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchFriends(userData.id)
  }, [])

  const fetchFriends = async (userId) => {
    try {
      const res = await fetch(`/api/friends/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFriends(data)
      }
    } catch (err) {
      console.error('Failed to fetch friends')
    }
    setLoading(false)
  }

  const removeFriend = async (friendId) => {
    if (!confirm('Remove this friend?')) return
    
    try {
      await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      fetchFriends(user.id)
    } catch (err) {
      console.error('Failed to remove friend')
    }
  }

  const startDM = async (friendId) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [user.id, friendId] })
      })
      if (res.ok) {
        const convo = await res.json()
        router.push(`/inbox?conversation=${convo.id}`)
      }
    } catch (err) {
      console.error('Failed to create conversation')
    }
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
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Friends</h1>
        </div>
        <button 
          onClick={() => router.push('/search')}
          className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30"
        >
          <UserPlus className="w-5 h-5 text-amber-400" />
        </button>
      </header>

      <div className="p-4">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No friends yet</p>
            <p className="text-sm mt-1">Search for people to add as friends!</p>
            <button 
              onClick={() => router.push('/search')}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold"
            >
              Find Friends
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div 
                key={friend.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{friend.displayName}</h3>
                  <p className="text-gray-400 text-sm">{friend.email}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startDM(friend.id)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                  </button>
                  <button 
                    onClick={() => removeFriend(friend.id)}
                    className="p-2 rounded-full bg-white/10 hover:bg-red-500/20"
                  >
                    <UserMinus className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
