'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Crown, Check, Heart, MessageSquare, UserPlus, Users, Lock, Image as ImageIcon, Sparkles } from 'lucide-react'

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1758598497192-15ffa411c3de?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1576099374988-92c106eab519?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1758598302784-42d00ce2ba8f?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1548544507-7de0e7a931d6?w=600&h=800&fit=crop&crop=face',
  'https://images.pexels.com/photos/3474629/pexels-photo-3474629.jpeg?auto=compress&w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1572852781348-4634bb3225bd?w=600&h=800&fit=crop&crop=face',
  'https://images.pexels.com/photos/29690107/pexels-photo-29690107.jpeg?auto=compress&w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1589723710704-3d64c57ae972?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1758598497190-f609ecba227b?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1658909835269-e76abd3ffb5d?w=600&h=800&fit=crop&crop=face',
]

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('lowkey_user')
    if (stored) setCurrentUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (!userId) return
    const fetchProfile = async () => {
      try {
        const viewerId = currentUser?.id || ''
        const res = await fetch(`/api/profile/${userId}?viewerId=${viewerId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
        const usersRes = await fetch('/api/users')
        if (usersRes.ok) {
          const users = await usersRes.json()
          const idx = users.findIndex(u => u.id === userId)
          if (idx >= 0) setPhotoIndex(idx)
        }
      } catch (err) {
        console.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId, currentUser])

  const getPhoto = () => {
    if (profile?.avatar || profile?.profilePicture) return profile.avatar || profile.profilePicture
    return STOCK_PHOTOS[photoIndex % STOCK_PHOTOS.length]
  }

  const isFriend = currentUser?.friends?.includes(userId)

  const sendFriendRequest = async () => {
    if (!currentUser) return
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, friendId: userId })
      })
    } catch (err) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0E1117' }}>
        <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0E1117' }}>
        <p className="text-white/50">Profile not found</p>
        <button onClick={() => router.back()} className="text-rose-400 text-sm font-semibold">Go back</button>
      </div>
    )
  }

  const isFounder = profile.isFounder || profile.role === 'founder'

  return (
    <div className="min-h-screen" style={{ background: '#0E1117' }} data-testid="user-profile-page">
      {/* Hero Photo */}
      <div className="relative" style={{ height: '55vh' }}>
        <img src={getPhoto()} alt={profile.displayName} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/20" />

        <button onClick={() => router.back()} className="absolute top-12 left-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center" data-testid="profile-back-btn">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-white text-3xl font-bold">{profile.displayName}</h1>
            {profile.age && <span className="text-white/60 text-2xl font-light">{profile.age}</span>}
          </div>
          <div className="flex items-center gap-3">
            {isFounder && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-xs font-bold">
                <Crown className="w-3 h-3" /> Founder
              </span>
            )}
            {profile.verified && !isFounder && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-28">
        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {currentUser && userId !== currentUser.id && !isFriend && (
            <button onClick={sendFriendRequest} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-500/80 transition-colors" data-testid="connect-btn">
              <UserPlus className="w-4 h-4" /> Connect
            </button>
          )}
          {isFriend && (
            <button onClick={() => router.push(`/inbox?dm=${userId}`)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-500/80 transition-colors" data-testid="message-btn">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          )}
          <button className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium text-sm bg-white/5 text-white/50 hover:bg-white/10 transition-colors">
            <Heart className="w-4 h-4" /> Like
          </button>
        </div>

        {/* Bio */}
        {(profile.bio || profile.aboutMe) && (
          <div className="mb-6">
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">About</h3>
            <p className="text-white/70 text-sm leading-relaxed">{profile.aboutMe || profile.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 py-4 rounded-xl text-center" style={{ background: '#161B24' }}>
            <p className="text-white text-lg font-bold">{profile.friends?.length || 0}</p>
            <p className="text-white/30 text-xs mt-0.5">Connections</p>
          </div>
          <div className="flex-1 py-4 rounded-xl text-center" style={{ background: '#161B24' }}>
            <p className="text-white text-lg font-bold">{profile.gallery?.length || 0}</p>
            <p className="text-white/30 text-xs mt-0.5">Photos</p>
          </div>
        </div>

        {/* Gallery */}
        {profile.gallery && profile.gallery.length > 0 && (
          <div>
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                  <img src={typeof img === 'string' ? img : img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
