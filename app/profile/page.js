'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Calendar, Shield, Moon, LogOut, Star, Crown, PoundSterling, Users, Settings, Image, Music, Palette, Plus, Lock, Eye, EyeOff, Video, Check, UserCheck, Gem, Play, Edit, Heart, Gift, X } from 'lucide-react'

const VERIFICATION_TIERS = {
  'new': { name: 'New Member', icon: Users, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  'verified': { name: 'Verified', icon: Check, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  'trusted': { name: 'Trusted', icon: UserCheck, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  'inner-circle': { name: 'Inner Circle', icon: Gem, color: 'text-amber-400', bgColor: 'bg-amber-500/20' }
}

const TIP_AMOUNTS = [
  { amount: 1, label: '£1' },
  { amount: 5, label: '£5' },
  { amount: 10, label: '£10' },
  { amount: 20, label: '£20' },
  { amount: 50, label: '£50' },
  { amount: 100, label: '£100' },
]

const PROFILE_SKINS = [
  { id: 'default', name: 'Default', colors: ['#1a1a2e', '#16213e'], price: 0 },
  { id: 'midnight', name: 'Midnight Purple', colors: ['#2d1b4e', '#1a1a2e'], price: 1 },
  { id: 'ocean', name: 'Ocean Blue', colors: ['#0c2340', '#1a365d'], price: 1 },
  { id: 'sunset', name: 'Sunset Orange', colors: ['#3d1c02', '#5c2c06'], price: 1 },
  { id: 'forest', name: 'Forest Green', colors: ['#0d2818', '#1a4d2e'], price: 1 },
  { id: 'rose', name: 'Rose Gold', colors: ['#3d2b2b', '#4a3333'], price: 1 },
  { id: 'neon', name: 'Neon Glow', colors: ['#1a0a2e', '#2d1b4e'], price: 1 },
  { id: 'gold', name: 'Royal Gold', colors: ['#2d2006', '#3d2b08'], price: 1 }
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState(null)
  const [gallery, setGallery] = useState([])
  const [stories, setStories] = useState([])
  const [skins, setSkins] = useState({ skins: [], currentSkin: 'default' })
  const [isFounder, setIsFounder] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showUpload, setShowUpload] = useState(false)
  const [showSkins, setShowSkins] = useState(false)
  const [showStoryCreate, setShowStoryCreate] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState(5)
  const [tipMessage, setTipMessage] = useState('')
  const [tipping, setTipping] = useState(false)
  const [uploadData, setUploadData] = useState({ type: 'photo', url: '', caption: '' })
  const [storyData, setStoryData] = useState({ type: 'photo', content: '', privacy: 'everyone', backgroundColor: '#1a1a2e' })
  const [galleryPrivacy, setGalleryPrivacy] = useState('public')

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setGalleryPrivacy(userData.galleryPrivacy || 'public')
    
    if (userData.isCreator) {
      fetchEarnings(userData.id)
    }
    
    fetchGallery(userData.id)
    fetchStories(userData.id)
    fetchSkins(userData.id)
    checkFounder(userData.id)
    setLoading(false)
  }, [])

  const checkFounder = async (userId) => {
    try {
      const res = await fetch('/api/founder/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        const data = await res.json()
        setIsFounder(data.isFounder)
      }
    } catch (err) {}
  }

  const fetchEarnings = async (creatorId) => {
    try {
      const res = await fetch('/api/creator/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })
      if (res.ok) setEarnings(await res.json())
    } catch (err) {}
  }

  const fetchGallery = async (userId) => {
    try {
      const res = await fetch(`/api/gallery?userId=${userId}&viewerId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setGallery(data.items || [])
      }
    } catch (err) {}
  }

  const fetchStories = async (userId) => {
    try {
      const res = await fetch(`/api/stories?viewerId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        const myStories = data.find(g => g.userId === userId)
        setStories(myStories?.stories || [])
      }
    } catch (err) {}
  }

  const fetchSkins = async (userId) => {
    try {
      const res = await fetch(`/api/skins?userId=${userId}`)
      if (res.ok) setSkins(await res.json())
    } catch (err) {}
  }

  const uploadToGallery = async () => {
    if (!uploadData.url) return
    try {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...uploadData })
      })
      setShowUpload(false)
      setUploadData({ type: 'photo', url: '', caption: '' })
      fetchGallery(user.id)
    } catch (err) {}
  }

  const createStory = async () => {
    if (!storyData.content) return
    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...storyData })
      })
      setShowStoryCreate(false)
      setStoryData({ type: 'photo', content: '', privacy: 'everyone', backgroundColor: '#1a1a2e' })
      fetchStories(user.id)
    } catch (err) {}
  }

  const updateGalleryPrivacy = async (privacy) => {
    try {
      await fetch('/api/gallery/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, privacy })
      })
      setGalleryPrivacy(privacy)
    } catch (err) {}
  }

  const purchaseSkin = async (skinId) => {
    try {
      await fetch('/api/skins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, skinId })
      })
      fetchSkins(user.id)
    } catch (err) {}
  }

  const equipSkin = async (skinId) => {
    try {
      await fetch('/api/skins/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, skinId })
      })
      fetchSkins(user.id)
      const updatedUser = { ...user, currentSkin: skinId }
      setUser(updatedUser)
      localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
    } catch (err) {}
  }

  const sendTip = async () => {
    if (tipAmount < 1) return
    setTipping(true)
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: user.id, // In a real app, this would be the profile owner's ID
          amount: tipAmount,
          message: tipMessage
        })
      })
      if (res.ok) {
        setShowTipModal(false)
        setTipAmount(5)
        setTipMessage('')
        alert(`Tip of £${tipAmount} sent successfully!`)
      }
    } catch (err) {
      console.error('Failed to send tip')
    }
    setTipping(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('lowkey_user')
    localStorage.removeItem('lowkey_token')
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  const currentSkin = PROFILE_SKINS.find(s => s.id === (user.currentSkin || 'default')) || PROFILE_SKINS[0]
  const tierInfo = VERIFICATION_TIERS[user.verificationTier || 'new']
  const TierIcon = tierInfo.icon

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${currentSkin.colors[0]}, ${currentSkin.colors[1]})` }}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/profile/edit')} className="p-2 rounded-full hover:bg-white/10">
            <Edit className="w-5 h-5 text-blue-400" />
          </button>
          <button onClick={() => setShowSkins(true)} className="p-2 rounded-full hover:bg-white/10">
            <Palette className="w-5 h-5 text-purple-400" />
          </button>
          {isFounder && (
            <button onClick={() => router.push('/founder')} className="p-2 rounded-full bg-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
            </button>
          )}
        </div>
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${user.isCreator ? 'bg-gradient-to-br from-pink-500 to-purple-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
          {user.bio && <p className="text-gray-400 text-center mt-1">{user.bio}</p>}
          
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${tierInfo.bgColor} ${tierInfo.color} text-xs`}>
              <TierIcon className="w-3 h-3" /> {tierInfo.name}
            </span>
            {user.isCreator && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs">
                <Star className="w-3 h-3" /> Creator
              </span>
            )}
            {user.role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          {/* Profile Song */}
          {user.profileSong && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-full bg-white/10">
              <Play className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">{user.profileSong.title}</span>
              <span className="text-gray-400 text-xs">- {user.profileSong.artist}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-4">
          {['profile', 'gallery', 'stories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {user.isCreator && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-pink-400" /> Creator Dashboard
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/30">
                    <p className="text-gray-400 text-xs">Price</p>
                    <p className="text-white font-bold">£{user.subscriptionPrice?.toFixed(2) || '4.99'}/mo</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30">
                    <p className="text-gray-400 text-xs">Earnings</p>
                    <p className="text-green-400 font-bold">£{earnings?.totalEarnings?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-5 h-5 text-gray-400" />
                <div><p className="text-gray-400 text-sm">Email</p><p className="text-white">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="flex-1"><p className="text-gray-400 text-sm">Friends</p><p className="text-white">{user.friends?.length || 0}</p></div>
                <button onClick={() => router.push('/friends')} className="text-amber-400 text-sm">View</button>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full mt-6 py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateGalleryPrivacy('public')}
                  className={`px-3 py-1.5 rounded-lg text-xs ${galleryPrivacy === 'public' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'}`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Public
                </button>
                <button
                  onClick={() => updateGalleryPrivacy('friends')}
                  className={`px-3 py-1.5 rounded-lg text-xs ${galleryPrivacy === 'friends' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'}`}
                >
                  <Lock className="w-3 h-3 inline mr-1" /> Friends
                </button>
              </div>
              <button onClick={() => setShowUpload(true)} className="p-2 rounded-full bg-amber-500">
                <Plus className="w-5 h-5 text-black" />
              </button>
            </div>

            {gallery.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No media yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {gallery.map(item => (
                  <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-white/10">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <>
            <button onClick={() => setShowStoryCreate(true)} className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Story
            </button>

            <p className="text-gray-400 text-xs mb-3">Your stories (visible for 24hrs)</p>

            {stories.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Moon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active stories</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map(story => (
                  <div key={story.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      {story.type === 'text' ? (
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs p-2" style={{ backgroundColor: story.backgroundColor }}>
                          {story.content.substring(0, 30)}...
                        </div>
                      ) : (
                        <img src={story.content} className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm">{story.privacy === 'friends' ? '🔒 Friends only' : '🌍 Everyone'}</p>
                        <p className="text-gray-400 text-xs">{story.views?.length || 0} views</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Add to Gallery</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setUploadData({ ...uploadData, type: 'photo' })} className={`flex-1 py-2 rounded-lg text-sm ${uploadData.type === 'photo' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                  <Image className="w-4 h-4 inline mr-1" /> Photo
                </button>
                <button onClick={() => setUploadData({ ...uploadData, type: 'video' })} className={`flex-1 py-2 rounded-lg text-sm ${uploadData.type === 'video' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                  <Video className="w-4 h-4 inline mr-1" /> Video
                </button>
              </div>
              <input type="url" value={uploadData.url} onChange={e => setUploadData({ ...uploadData, url: e.target.value })} placeholder="Media URL" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500" />
              <input type="text" value={uploadData.caption} onChange={e => setUploadData({ ...uploadData, caption: e.target.value })} placeholder="Caption (optional)" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500" />
              <div className="flex gap-3">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button onClick={uploadToGallery} className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold">Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Create Modal */}
      {showStoryCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowStoryCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Story</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                {['photo', 'video', 'text'].map(t => (
                  <button key={t} onClick={() => setStoryData({ ...storyData, type: t })} className={`flex-1 py-2 rounded-lg text-xs capitalize ${storyData.type === t ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {storyData.type === 'text' ? (
                <textarea value={storyData.content} onChange={e => setStoryData({ ...storyData, content: e.target.value })} placeholder="What's on your mind?" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 h-24 resize-none" />
              ) : (
                <input type="url" value={storyData.content} onChange={e => setStoryData({ ...storyData, content: e.target.value })} placeholder="Media URL" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500" />
              )}
              <div className="flex gap-2">
                <button onClick={() => setStoryData({ ...storyData, privacy: 'everyone' })} className={`flex-1 py-2 rounded-lg text-xs ${storyData.privacy === 'everyone' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                  <Eye className="w-3 h-3 inline mr-1" /> Everyone
                </button>
                <button onClick={() => setStoryData({ ...storyData, privacy: 'friends' })} className={`flex-1 py-2 rounded-lg text-xs ${storyData.privacy === 'friends' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                  <Lock className="w-3 h-3 inline mr-1" /> Friends Only
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStoryCreate(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button onClick={createStory} className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold">Post</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skins Modal */}
      {showSkins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowSkins(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Profile Skins</h2>
            <div className="space-y-3">
              {skins.skins.map(skin => (
                <div key={skin.id} className="p-3 rounded-xl border border-white/10" style={{ background: `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{skin.name}</p>
                      {skin.price > 0 && !skin.owned && <p className="text-amber-400 text-sm">£{skin.price}</p>}
                      {skin.owned && <p className="text-green-400 text-xs">Owned</p>}
                    </div>
                    {skin.owned || skin.price === 0 ? (
                      <button
                        onClick={() => equipSkin(skin.id)}
                        className={`px-4 py-2 rounded-lg text-sm ${skins.currentSkin === skin.id ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}
                      >
                        {skins.currentSkin === skin.id ? 'Active' : 'Use'}
                      </button>
                    ) : (
                      <button onClick={() => purchaseSkin(skin.id)} className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold">
                        Buy £{skin.price}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSkins(false)} className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
