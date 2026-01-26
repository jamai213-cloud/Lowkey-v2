'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Hand, Check, RefreshCw } from 'lucide-react'

export default function MeetPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [wavedUsers, setWavedUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    
    // Check if quiet mode is on
    if (userData.quietMode) {
      setLoading(false)
      return
    }
    
    fetchSuggestions(userData.id)
  }, [])

  const fetchSuggestions = async (userId) => {
    try {
      const res = await fetch(`/api/meet/suggestions?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
      }
    } catch (err) {
      console.error('Failed to fetch suggestions')
    }
    setLoading(false)
  }

  const wave = async (toUserId) => {
    if (wavedUsers.includes(toUserId)) return
    
    try {
      await fetch('/api/waves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.id, toUserId })
      })
      setWavedUsers([...wavedUsers, toUserId])
    } catch (err) {
      console.error('Failed to wave')
    }
  }

  const addFriend = async (friendId) => {
    try {
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      // Refresh suggestions
      fetchSuggestions(user.id)
    } catch (err) {
      console.error('Failed to add friend')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  // Quiet mode message
  if (user?.quietMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Meet</h1>
        </header>
        
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-lg text-center">Quiet Mode is on</p>
          <p className="text-sm mt-2 text-center">Turn off Quiet Mode to see suggestions</p>
          <button 
            onClick={() => router.push('/quiet')}
            className="mt-4 px-6 py-3 rounded-xl bg-purple-500/20 text-purple-400 font-medium"
          >
            Go to Quiet Settings
          </button>
        </div>
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
          <h1 className="text-xl font-semibold text-white">Meet</h1>
        </div>
        <button 
          onClick={() => fetchSuggestions(user.id)}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      <div className="p-4">
        <p className="text-gray-400 text-sm mb-4">
          People you might want to connect with
        </p>

        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No suggestions right now</p>
            <p className="text-sm mt-1">Check back later!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map(person => {
              const hasWaved = wavedUsers.includes(person.id)
              
              return (
                <div 
                  key={person.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{person.displayName}</h3>
                    <p className="text-gray-400 text-sm">
                      {person.verified && '✓ Verified'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => wave(person.id)}
                      disabled={hasWaved}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                        hasWaved 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      }`}
                    >
                      {hasWaved ? (
                        <>
                          <Check className="w-4 h-4" /> Waved
                        </>
                      ) : (
                        <>
                          <Hand className="w-4 h-4" /> Wave
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => addFriend(person.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
