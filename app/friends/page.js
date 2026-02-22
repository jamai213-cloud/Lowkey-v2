'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, UserPlus, UserMinus, MessageSquare, X, Crown, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

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
      setShowProfileModal(false)
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
        setShowProfileModal(true)
      }
    } catch (err) {
      console.error('Failed to load profile')
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
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Friends</h1>
        </div>
        <button onClick={() => router.push('/search')} className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30">
          <UserPlus className="w-5 h-5 text-amber-400" />
        </button>
      </header>

      <div className="p-4">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No friends yet</p>
            <p className="text-sm mt-1">Search for people to add as friends!</p>
            <button onClick={() => router.push('/search')} className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">
              Find Friends
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} onClick={() => viewProfile(friend.id)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
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
                  <p className="text-gray-400 text-sm truncate">{friend.bio || 'Tap to view profile'}</p>
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

      {showProfileModal && selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <div className="h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
              <button onClick={() => setShowProfileModal(false)} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#1a1a2e] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                  {(selectedFriend.avatar || selectedFriend.profilePicture) ? (
                    <img src={selectedFriend.avatar || selectedFriend.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-14 px-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{selectedFriend.displayName}</h2>
                {selectedFriend.isFounder && <Crown className="w-5 h-5 text-amber-400" />}
                {selectedFriend.verified && <Check className="w-5 h-5 text-green-400" />}
              </div>

              {(selectedFriend.aboutMe || selectedFriend.bio) && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">About Me</h3>
                  <p className="text-gray-400 text-sm">{selectedFriend.aboutMe || selectedFriend.bio}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {selectedFriend.age && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm">{selectedFriend.age}</p>
                    <p className="text-gray-400 text-xs">Age</p>
                  </div>
                )}
                {selectedFriend.location && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm truncate">{selectedFriend.location}</p>
                    <p className="text-gray-400 text-xs">Location</p>
                  </div>
                )}
                {selectedFriend.gender && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm truncate">{selectedFriend.gender}</p>
                    <p className="text-gray-400 text-xs">Gender</p>
                  </div>
                )}
              </div>

              {selectedFriend.lookingFor && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Looking For</h3>
                  <p className="text-gray-400 text-sm">{selectedFriend.lookingFor}</p>
                </div>
              )}

              {(selectedFriend.relationshipStatus || selectedFriend.sexuality) && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {selectedFriend.relationshipStatus && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-xs">Status</p>
                      <p className="text-white text-sm">{selectedFriend.relationshipStatus}</p>
                    </div>
                  )}
                  {selectedFriend.sexuality && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-xs">Sexuality</p>
                      <p className="text-white text-sm">{selectedFriend.sexuality}</p>
                    </div>
                  )}
                </div>
              )}

              {(selectedFriend.height || selectedFriend.bodyType) && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Physical</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.height && <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedFriend.height}</span>}
                    {selectedFriend.bodyType && <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedFriend.bodyType}</span>}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-4 text-center">
                <div className="flex-1 p-3 rounded-xl bg-white/5">
                  <p className="text-white font-bold">{selectedFriend.friends?.length || 0}</p>
                  <p className="text-gray-400 text-xs">Friends</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/5">
                  <p className="text-white font-bold">{selectedFriend.galleryCount || 0}</p>
                  <p className="text-gray-400 text-xs">Photos</p>
                </div>
              </div>
              
              {selectedFriend.kinks && selectedFriend.kinks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Kinks & Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.kinks.map((kink, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs">{kink}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFriend.gallery && selectedFriend.gallery.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Gallery</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {selectedFriend.gallery.slice(0, 6).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer" onClick={() => { setLightboxImage(img); setLightboxIndex(i); }}>
                        <img src={img.imageData || img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => startDM(selectedFriend.id)} className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Message
                </button>
                <button onClick={() => removeFriend(selectedFriend.id)} className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold">
                  <UserMinus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && selectedFriend?.gallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white z-10">
            <X className="w-6 h-6" />
          </button>
          {selectedFriend.gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); const idx = lightboxIndex > 0 ? lightboxIndex - 1 : selectedFriend.gallery.length - 1; setLightboxIndex(idx); setLightboxImage(selectedFriend.gallery[idx]); }} className="absolute left-4 p-3 rounded-full bg-white/10 text-white z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); const idx = lightboxIndex < selectedFriend.gallery.length - 1 ? lightboxIndex + 1 : 0; setLightboxIndex(idx); setLightboxImage(selectedFriend.gallery[idx]); }} className="absolute right-4 p-3 rounded-full bg-white/10 text-white z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.imageData || lightboxImage.url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
          <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {selectedFriend.gallery.length}
          </div>
        </div>
      )}
    </div>
  )
}
