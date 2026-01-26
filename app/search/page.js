'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search as SearchIcon, User, Users, Calendar, UserPlus, Check, Crown, Sparkles } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], lounges: [], events: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    // Load all users on page load
    loadAllMembers()
  }, [])

  const loadAllMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search?q=')
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (err) {
      console.error('Failed to load members')
    }
    setLoading(false)
  }

  const search = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (err) {
      console.error('Search failed')
    }
    setLoading(false)
  }

  const addFriend = async (friendId) => {
    try {
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      // Update local user
      const updatedUser = { ...user, friends: [...(user.friends || []), friendId] }
      setUser(updatedUser)
      localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error('Failed to add friend')
    }
  }

  const joinLounge = async (loungeId) => {
    try {
      await fetch(`/api/lounges/${loungeId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      router.push('/lounge')
    } catch (err) {
      console.error('Failed to join lounge')
    }
  }

  const rsvpEvent = async (eventId) => {
    try {
      await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: 'yes' })
      })
      search() // Refresh results
    } catch (err) {
      console.error('Failed to RSVP')
    }
  }

  const isFriend = (userId) => user?.friends?.includes(userId)

  // Get verification badge
  const getVerificationBadge = (u) => {
    if (u.isFounder) return { icon: Crown, color: 'text-amber-400', label: 'Founder' }
    if (u.verificationTier === 'inner-circle') return { icon: Sparkles, color: 'text-purple-400', label: 'Inner Circle' }
    if (u.verificationTier === 'trusted') return { icon: Check, color: 'text-blue-400', label: 'Trusted' }
    if (u.verified) return { icon: Check, color: 'text-green-400', label: 'Verified' }
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Search</h1>
      </header>

      <div className="p-4">
        {/* Search Input */}
        <form onSubmit={search} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </form>

        {loading && (
          <div className="text-center text-gray-400">Loading members...</div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* Users - All Members */}
            <div>
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> 
                {query ? 'Results' : 'All Members'} 
                <span className="text-gray-500 text-sm font-normal">({results.users.filter(u => u.id !== user?.id).length})</span>
              </h2>
              {results.users.filter(u => u.id !== user?.id).length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No members found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.users.filter(u => u.id !== user?.id).map(u => {
                    const badge = getVerificationBadge(u)
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          u.isFounder ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                          u.isCreator ? 'bg-gradient-to-br from-pink-500 to-purple-500' :
                          'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium truncate">{u.displayName}</p>
                            {badge && (
                              <badge.icon className={`w-4 h-4 flex-shrink-0 ${badge.color}`} />
                            )}
                            {u.isCreator && !u.isFounder && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 flex-shrink-0">Creator</span>
                            )}
                          </div>
                          {u.verificationTier && u.verificationTier !== 'new' && (
                            <p className="text-gray-500 text-xs capitalize">{u.verificationTier.replace('-', ' ')}</p>
                          )}
                        </div>
                        {isFriend(u.id) ? (
                          <span className="text-green-400 text-sm flex items-center gap-1 flex-shrink-0">
                            <Check className="w-4 h-4" /> Friend
                          </span>
                        ) : (
                          <button 
                            onClick={() => addFriend(u.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm flex items-center gap-1 flex-shrink-0"
                          >
                            <UserPlus className="w-4 h-4" /> Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Lounges */}
            {results.lounges.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Lounges
                </h2>
                <div className="space-y-2">
                  {results.lounges.map(lounge => (
                    <div key={lounge.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-white font-medium">{lounge.name}</p>
                        <p className="text-gray-400 text-sm">{lounge.members?.length || 0} members</p>
                      </div>
                      <button 
                        onClick={() => joinLounge(lounge.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {results.events.length > 0 && (
              <div>
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Events
                </h2>
                <div className="space-y-2">
                  {results.events.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <p className="text-white font-medium">{event.title}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => rsvpEvent(event.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm"
                      >
                        RSVP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
