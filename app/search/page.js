'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search as SearchIcon, User, Users, Calendar, UserPlus, Check, Crown, Sparkles, X, Clock, Eye, Lock, Heart } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], lounges: [], events: [] })
  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    loadAllMembers()
    loadFriendRequests(userData.id)
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

  const loadFriendRequests = async (userId) => {
    try {
      const res = await fetch(`/api/friends/requests/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setPendingRequests(data.pending || [])
        setSentRequests(data.sent || [])
      }
    } catch (err) {
      console.error('Failed to load friend requests')
    }
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

  // Send friend request
  const sendFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      if (res.ok) {
        setSentRequests([...sentRequests, friendId])
      }
    } catch (err) {
      console.error('Failed to send friend request')
    }
  }

  // Accept friend request
  const acceptFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      if (res.ok) {
        setPendingRequests(pendingRequests.filter(r => r.fromUserId !== friendId))
        const updatedUser = { ...user, friends: [...(user.friends || []), friendId] }
        setUser(updatedUser)
        localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      }
    } catch (err) {
      console.error('Failed to accept friend request')
    }
  }

  // Decline friend request
  const declineFriendRequest = async (friendId) => {
    try {
      const res = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      if (res.ok) {
        setPendingRequests(pendingRequests.filter(r => r.fromUserId !== friendId))
      }
    } catch (err) {
      console.error('Failed to decline friend request')
    }
  }

  // View profile
  const viewProfile = async (profileUserId) => {
    try {
      const res = await fetch(`/api/profile/${profileUserId}?viewerId=${user.id}`)
      if (res.ok) {
        const profileData = await res.json()
        setSelectedUser(profileData)
        setShowProfileModal(true)
      }
    } catch (err) {
      console.error('Failed to load profile')
    }
  }

  const isFriend = (userId) => user?.friends?.includes(userId)
  const hasSentRequest = (userId) => sentRequests.includes(userId)
  const hasPendingRequest = (userId) => pendingRequests.some(r => r.fromUserId === userId)

  // Get verification badge
  const getVerificationBadge = (u) => {
    if (u.isFounder) return { icon: Crown, color: 'text-amber-400', label: 'Founder' }
    if (u.verificationTier === 'inner-circle') return { icon: Sparkles, color: 'text-purple-400', label: 'Inner Circle' }
    if (u.verificationTier === 'trusted') return { icon: Check, color: 'text-blue-400', label: 'Trusted' }
    if (u.verified) return { icon: Check, color: 'text-green-400', label: 'Verified' }
    return null
  }

  // Get friendship status button
  const getFriendButton = (u) => {
    if (isFriend(u.id)) {
      return (
        <span className="text-green-400 text-sm flex items-center gap-1 flex-shrink-0">
          <Check className="w-4 h-4" /> Friend
        </span>
      )
    }
    if (hasSentRequest(u.id)) {
      return (
        <span className="text-gray-400 text-sm flex items-center gap-1 flex-shrink-0">
          <Clock className="w-4 h-4" /> Pending
        </span>
      )
    }
    if (hasPendingRequest(u.id)) {
      return (
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); acceptFriendRequest(u.id) }}
            className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs"
          >
            Accept
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); declineFriendRequest(u.id) }}
            className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs"
          >
            Decline
          </button>
        </div>
      )
    }
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); sendFriendRequest(u.id) }}
        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm flex items-center gap-1 flex-shrink-0"
      >
        <UserPlus className="w-4 h-4" /> Add
      </button>
    )
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

        {/* Pending Friend Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Friend Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.fromUserId} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/30 overflow-hidden">
                      {req.fromAvatar ? (
                        <img src={req.fromAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-xs">
                          {req.fromName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className="text-white text-sm">{req.fromName}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => acceptFriendRequest(req.fromUserId)}
                      className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => declineFriendRequest(req.fromUserId)}
                      className="px-3 py-1 rounded-lg bg-white/10 text-gray-400 text-xs"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <div 
                        key={u.id} 
                        onClick={() => viewProfile(u.id)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        {/* Profile Picture */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                          u.isFounder ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                          u.isCreator ? 'bg-gradient-to-br from-pink-500 to-purple-500' :
                          'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
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
                            {u.profilePrivacy === 'private' && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          {u.bio && (
                            <p className="text-gray-400 text-sm truncate">{u.bio}</p>
                          )}
                        </div>
                        {getFriendButton(u)}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile View Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Profile Header */}
            <div className="relative">
              <div className="h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#1a1a2e] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-14 px-4 pb-4">
              {/* Name & Badge */}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{selectedUser.displayName}</h2>
                {selectedUser.isFounder && <Crown className="w-5 h-5 text-amber-400" />}
                {selectedUser.verified && <Check className="w-5 h-5 text-green-400" />}
                {selectedUser.isCreator && <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">Creator</span>}
              </div>
              
              {/* Privacy Notice for Private Profiles */}
              {selectedUser.profilePrivacy === 'private' && !isFriend(selectedUser.id) && !selectedUser.isPublic && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">This profile is private</p>
                  <p className="text-gray-500 text-xs mt-1">Send a friend request to see more</p>
                  {!isFriend(selectedUser.id) && !hasSentRequest(selectedUser.id) && (
                    <button 
                      onClick={() => sendFriendRequest(selectedUser.id)}
                      className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-medium"
                    >
                      Send Friend Request
                    </button>
                  )}
                </div>
              )}
              
              {/* Content Creator Subscription Notice */}
              {selectedUser.isCreator && selectedUser.requiresSubscription && !selectedUser.isSubscribed && !isFriend(selectedUser.id) && (
                <div className="mt-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center">
                  <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-pink-400 text-sm font-medium">Creator Content</p>
                  <p className="text-gray-400 text-xs mt-1">Subscribe to unlock full profile</p>
                  <button className="mt-3 px-4 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium">
                    Subscribe
                  </button>
                </div>
              )}
              
              {/* Full Profile - Shown to friends or public profiles */}
              {(isFriend(selectedUser.id) || selectedUser.profilePrivacy === 'public' || selectedUser.isPublic) && (
                <>
                  {/* About Me */}
                  {(selectedUser.aboutMe || selectedUser.bio) && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">About Me</h3>
                      <p className="text-gray-400 text-sm">{selectedUser.aboutMe || selectedUser.bio}</p>
                    </div>
                  )}

                  {/* Basic Info: Age, Location, Gender */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {selectedUser.age && (
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <p className="text-white font-bold text-sm">{selectedUser.age}</p>
                        <p className="text-gray-400 text-xs">Age</p>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <p className="text-white font-bold text-sm truncate">{selectedUser.location}</p>
                        <p className="text-gray-400 text-xs">Location</p>
                      </div>
                    )}
                    {selectedUser.gender && (
                      <div className="p-2 rounded-lg bg-white/5 text-center">
                        <p className="text-white font-bold text-sm truncate">{selectedUser.gender}</p>
                        <p className="text-gray-400 text-xs">Gender</p>
                      </div>
                    )}
                  </div>

                  {/* Looking For */}
                  {selectedUser.lookingFor && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Looking For</h3>
                      <p className="text-gray-400 text-sm">{selectedUser.lookingFor}</p>
                    </div>
                  )}

                  {/* Relationship Status & Sexuality */}
                  {(selectedUser.relationshipStatus || selectedUser.sexuality) && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {selectedUser.relationshipStatus && (
                        <div className="p-2 rounded-lg bg-white/5">
                          <p className="text-gray-400 text-xs">Status</p>
                          <p className="text-white text-sm">{selectedUser.relationshipStatus}</p>
                        </div>
                      )}
                      {selectedUser.sexuality && (
                        <div className="p-2 rounded-lg bg-white/5">
                          <p className="text-gray-400 text-xs">Sexuality</p>
                          <p className="text-white text-sm">{selectedUser.sexuality}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical Attributes */}
                  {(selectedUser.height || selectedUser.bodyType || selectedUser.eyeColor || selectedUser.hairColor || selectedUser.ethnicity) && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Physical</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.height && (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedUser.height}</span>
                        )}
                        {selectedUser.bodyType && (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedUser.bodyType}</span>
                        )}
                        {selectedUser.eyeColor && (
                          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">{selectedUser.eyeColor} eyes</span>
                        )}
                        {selectedUser.hairColor && (
                          <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">{selectedUser.hairColor} hair</span>
                        )}
                        {selectedUser.ethnicity && (
                          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">{selectedUser.ethnicity}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lifestyle */}
                  {(selectedUser.smoking || selectedUser.drinking) && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Lifestyle</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.smoking && (
                          <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">{selectedUser.smoking}</span>
                        )}
                        {selectedUser.drinking && (
                          <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">{selectedUser.drinking}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interested In */}
                  {selectedUser.interestedIn && selectedUser.interestedIn.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Interested In</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.interestedIn.map((item, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Open To */}
                  {selectedUser.openTo && selectedUser.openTo.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Open To</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.openTo.map((item, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="flex gap-4 mt-4 text-center">
                    <div className="flex-1 p-3 rounded-xl bg-white/5">
                      <p className="text-white font-bold">{selectedUser.friends?.length || 0}</p>
                      <p className="text-gray-400 text-xs">Friends</p>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-white/5">
                      <p className="text-white font-bold">{selectedUser.galleryCount || 0}</p>
                      <p className="text-gray-400 text-xs">Photos</p>
                    </div>
                  </div>
                  
                  {/* Kinks & Preferences */}
                  {selectedUser.kinks && selectedUser.kinks.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Kinks & Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.kinks.map((kink, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs">
                            {kink}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hard Limits */}
                  {selectedUser.kinksHard && selectedUser.kinksHard.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Hard Limits</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.kinksHard.map((kink, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                            {kink}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Gallery Preview */}
                  {selectedUser.gallery && selectedUser.gallery.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-white font-medium mb-2 text-sm">Gallery</h3>
                      <div className="grid grid-cols-3 gap-1">
                        {selectedUser.gallery.slice(0, 6).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                            <img src={img.imageData || img.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                {isFriend(selectedUser.id) ? (
                  <button 
                    onClick={() => router.push(`/messages?user=${selectedUser.id}`)}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-medium"
                  >
                    Message
                  </button>
                ) : hasSentRequest(selectedUser.id) ? (
                  <button disabled className="flex-1 py-3 rounded-xl bg-white/10 text-gray-400 font-medium">
                    Request Sent
                  </button>
                ) : (
                  <button 
                    onClick={() => sendFriendRequest(selectedUser.id)}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-medium"
                  >
                    Send Friend Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
