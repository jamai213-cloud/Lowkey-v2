'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Crown, CheckCircle, Heart, MessageSquare, UserPlus, Users, Lock, Image as ImageIcon, Sparkles, MapPin, Share2 } from 'lucide-react'

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1636406269177-4827c00bb263?w=600&h=800&fit=crop&crop=face',
  'https://images.pexels.com/photos/18838688/pexels-photo-18838688.jpeg?auto=compress&w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1512503868941-bd9fa9c6b569?w=600&h=800&fit=crop&crop=face',
  'https://images.pexels.com/photos/16495772/pexels-photo-16495772.jpeg?auto=compress&w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1737091956854-d39f0655389b?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534664393936-5220914620f0?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1572852781348-4634bb3225bd?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1589723710704-3d64c57ae972?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1585807145425-793be610875c?w=600&h=800&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1672794444732-e007954a177c?w=600&h=800&fit=crop&crop=face',
]

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [requestSent, setRequestSent] = useState(false)

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
      setRequestSent(true)
    } catch (err) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0E15' }}>
        <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0C0E15' }}>
        <p className="text-white/50">Profile not found</p>
        <button onClick={() => router.back()} className="text-rose-400 text-sm font-bold hover:text-rose-300 transition-colors" data-testid="profile-go-back">Go back</button>
      </div>
    )
  }

  const isFounder = profile.isFounder || profile.role === 'founder'

  return (
    <div className="min-h-screen" style={{ background: '#0C0E15' }} data-testid="user-profile-page">
      {/* Hero Photo */}
      <div className="relative" style={{ height: '55vh' }}>
        <img src={getPhoto()} alt={profile.displayName} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E15] via-transparent to-black/20" />

        {/* Back button */}
        <button onClick={() => router.back()} className="absolute top-12 left-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors" data-testid="profile-back-btn">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Share button */}
        <button className="absolute top-12 right-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors" data-testid="profile-share-btn">
          <Share2 className="w-4 h-4 text-white" />
        </button>

        {/* Profile info overlay */}
        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-white text-3xl font-bold">{profile.displayName}</h1>
            {profile.age && <span className="text-white/60 text-2xl font-light">{profile.age}</span>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {isFounder && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/20">
                <Crown className="w-3 h-3" /> Founder
              </span>
            )}
            {profile.verified && !isFounder && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" /> Online
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-28">
        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {currentUser && userId !== currentUser.id && !isFriend && (
            <button
              onClick={sendFriendRequest}
              disabled={requestSent}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${requestSent ? 'bg-white/5 text-white/30' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25'}`}
              data-testid="connect-btn"
            >
              <UserPlus className="w-4 h-4" /> {requestSent ? 'Request Sent' : 'Connect'}
            </button>
          )}
          {isFriend && (
            <button onClick={() => router.push(`/inbox?dm=${userId}`)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25" data-testid="message-btn">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          )}
          <button className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium text-sm bg-white/5 text-white/50 hover:bg-white/10 transition-colors border border-white/5">
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
          <div className="flex-1 py-4 rounded-xl text-center" style={{ background: '#14171F', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-white text-lg font-bold">{profile.friends?.length || 0}</p>
            <p className="text-white/30 text-xs mt-0.5">Connections</p>
          </div>
          <div className="flex-1 py-4 rounded-xl text-center" style={{ background: '#14171F', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-white text-lg font-bold">{profile.galleryCount || profile.gallery?.length || 0}</p>
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
