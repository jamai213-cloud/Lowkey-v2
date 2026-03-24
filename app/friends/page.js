'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, UserPlus, UserMinus, MessageSquare, X, Crown, Check, Sparkles, Image, Heart, MapPin, Calendar, ChevronLeft } from 'lucide-react'

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [viewingProfile, setViewingProfile] = useState(false)

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
      setViewingProfile(false)
      setSelectedFriend(null)
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

  const viewProfile = async (friendId) => {
    try {
      const res = await fetch(`/api/profile/${friendId}?viewerId=${user.id}`)
      if (res.ok) {
        const profileData = await res.json()
        setSelectedFriend(profileData)
        setViewingProfile(true)
      }
    } catch (err) {
      console.error('Failed to load profile')
    }
  }

  // Go back to friends list
  const backToList = () => {
    setViewingProfile(false)
    setSelectedFriend(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white/40 font-heading">Loading...</div>
      </div>
    )
  }

  // FULL PAGE PROFILE VIEW - when viewing a friend's profile
  if (viewingProfile && selectedFriend) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] page-enter" data-testid="friend-profile">
        <header className="lk-page-header flex items-center gap-3" data-testid="friend-profile-header">
          <button onClick={backToList} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-heading font-semibold text-white">{selectedFriend.displayName}</h1>
        </header>

        <div className="pb-24">
          <div className="relative">
            <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/15" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0f] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                {(selectedFriend.avatar || selectedFriend.profilePicture) ? (
                  <img src={selectedFriend.avatar || selectedFriend.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 px-4">
            {/* Name & Badges */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">{selectedFriend.displayName}</h2>
                {selectedFriend.isFounder && <Crown className="w-6 h-6 text-amber-400" />}
                {selectedFriend.verified && <Check className="w-6 h-6 text-green-400" />}
              </div>
              {selectedFriend.isCreator && (
                <span className="inline-block mt-1 text-sm px-3 py-1 rounded-full bg-pink-500/20 text-pink-400">Content Creator</span>
              )}
              {selectedFriend.bio && (
                <p className="text-white/40 mt-3 max-w-md mx-auto">{selectedFriend.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => startDM(selectedFriend.id)}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Message
              </button>
              <button 
                onClick={() => removeFriend(selectedFriend.id)}
                className="px-6 py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold"
              >
                <UserMinus className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#12121A] border border-white/5 text-center">
                <p className="text-white font-bold text-2xl">{selectedFriend.friends?.length || 0}</p>
                <p className="text-white/40 text-sm">Friends</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#12121A] border border-white/5 text-center">
                <p className="text-white font-bold text-2xl">{selectedFriend.galleryCount || 0}</p>
                <p className="text-white/40 text-sm">Photos</p>
              </div>
            </div>

            {/* Personal Info */}
            {(selectedFriend.location || selectedFriend.age || selectedFriend.gender) && (
              <div className="mb-6 p-4 rounded-2xl bg-[#12121A] border border-white/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" /> About
                </h3>
                <div className="space-y-2">
                  {selectedFriend.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-white/25" />
                      <span className="text-white/60">{selectedFriend.age} years old</span>
                    </div>
                  )}
                  {selectedFriend.gender && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-white/25" />
                      <span className="text-white/60">{selectedFriend.gender}</span>
                    </div>
                  )}
                  {selectedFriend.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white/25" />
                      <span className="text-white/60">{selectedFriend.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kinks/Interests - Full access for friends */}
            {selectedFriend.kinks && selectedFriend.kinks.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#12121A] border border-white/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" /> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.kinks.map((kink, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                      {kink}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery - Full access for friends */}
            {selectedFriend.gallery && selectedFriend.gallery.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Image className="w-5 h-5 text-amber-400" /> Gallery
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFriend.gallery.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                      <img 
                        src={img.imageData || img.url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
                {selectedFriend.galleryCount > selectedFriend.gallery.length && (
                  <p className="text-white/25 text-sm text-center mt-3">+{selectedFriend.galleryCount - selectedFriend.gallery.length} more photos</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // FRIENDS LIST VIEW
  return (
    <div className="min-h-screen bg-[#0a0a0f] page-enter" data-testid="friends-page">
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-yellow-500/5 blur-[100px] pointer-events-none z-0" />
      
      <header className="lk-page-header flex items-center justify-between" data-testid="friends-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="friends-back-btn">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-white">Friends</h1>
            <p className="text-white/30 text-xs">{friends.length} friends</p>
          </div>
        </div>
        <button onClick={() => router.push('/search')} className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/15 transition-colors" data-testid="add-friend-btn">
          <UserPlus className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-5">
        {friends.length === 0 ? (
          <div className="lk-card-elevated rounded-2xl p-8 text-center" data-testid="friends-empty">
            <User className="w-12 h-12 mb-4 mx-auto text-white/15" strokeWidth={1.5} />
            <p className="text-lg">No friends yet</p>
            <p className="text-sm mt-1">Search for people to add as friends!</p>
            <button onClick={() => router.push('/search')} className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">
              Find Friends
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} onClick={() => viewProfile(friend.id)} className="flex items-center gap-4 p-4 rounded-xl bg-[#12121A] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 overflow-hidden">
                  {(friend.avatar || friend.profilePicture) ? (
                    <img src={friend.avatar || friend.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{friend.displayName}</h3>
                    {friend.isFounder && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {friend.verified && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    {friend.isCreator && <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />}
                  </div>
                  <p className="text-white/40 text-sm truncate">{friend.bio || 'Tap to view profile'}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startDM(friend.id)} className="p-2 rounded-full bg-white/10 hover:bg-amber-500/30">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
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

