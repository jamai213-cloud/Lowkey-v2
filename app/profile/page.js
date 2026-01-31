'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Calendar, Shield, Moon, LogOut, Star, Crown, PoundSterling, Users, Settings, Image, Music, Palette, Plus, Lock, Eye, EyeOff, Video, Check, UserCheck, Gem, Play, Edit, Heart, Gift, X, Upload, Camera, Loader2 } from 'lucide-react'

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
  const [uploadData, setUploadData] = useState({ type: 'photo', file: null, caption: '', preview: null, filter: 'none', blur: 0 })
  const [uploading, setUploading] = useState(false)
  const [storyData, setStoryData] = useState({ type: 'photo', file: null, preview: null, text: '', privacy: 'everyone', backgroundColor: '#1a1a2e', filter: 'none', blur: 0 })
  const [galleryPrivacy, setGalleryPrivacy] = useState('public')
  const fileInputRef = useRef(null)
  const storyFileInputRef = useRef(null)
  const profilePicInputRef = useRef(null)

  // Available filters
  const FILTERS = [
    { id: 'none', name: 'None', css: '' },
    { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(100%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(50%) contrast(90%) brightness(90%)' },
    { id: 'warm', name: 'Warm', css: 'saturate(150%) hue-rotate(-10deg)' },
    { id: 'cool', name: 'Cool', css: 'saturate(120%) hue-rotate(20deg)' },
    { id: 'dramatic', name: 'Drama', css: 'contrast(130%) saturate(120%)' },
    { id: 'fade', name: 'Fade', css: 'contrast(90%) brightness(110%) saturate(80%)' },
  ]

  // Blur levels
  const BLUR_LEVELS = [
    { value: 0, label: 'None' },
    { value: 2, label: 'Light' },
    { value: 5, label: 'Medium' },
    { value: 10, label: 'Heavy' },
    { value: 20, label: 'Max' },
  ]

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
    
    fetchUserProfile(userData.id)
    fetchGallery(userData.id)
    fetchStories(userData.id)
    fetchSkins(userData.id)
    checkFounder(userData.id)
    setLoading(false)
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        // Update user with fresh data from server including avatar
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  }

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
    if (!uploadData.file) return
    setUploading(true)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result
        
        const res = await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            type: uploadData.type,
            data: base64,
            caption: uploadData.caption,
            privacy: galleryPrivacy,
            filter: uploadData.filter,
            blur: uploadData.blur
          })
        })
        
        if (res.ok) {
          setShowUpload(false)
          setUploadData({ type: 'photo', file: null, caption: '', preview: null, filter: 'none', blur: 0 })
          fetchGallery(user.id)
        }
        setUploading(false)
      }
      reader.readAsDataURL(uploadData.file)
    } catch (err) {
      console.error('Upload failed:', err)
      setUploading(false)
    }
  }

  const handleFileSelect = (e, isProfilePic = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const preview = URL.createObjectURL(file)
    
    if (isProfilePic) {
      // Upload profile picture
      uploadProfilePic(file)
    } else {
      const type = file.type.startsWith('video/') ? 'video' : 'photo'
      setUploadData({ ...uploadData, file, preview, type })
    }
  }

  const uploadProfilePic = async (file) => {
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const res = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, data: reader.result })
        })
        
        if (res.ok) {
          const data = await res.json()
          const updatedUser = { ...user, avatar: data.avatarUrl }
          setUser(updatedUser)
          localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Profile pic upload failed:', err)
      setUploading(false)
    }
  }

  const createStory = async () => {
    // For text stories, just need text content
    // For photo/video stories, need file
    if (storyData.type === 'text' && !storyData.text) return
    if (storyData.type !== 'text' && !storyData.file) return
    
    setUploading(true)
    try {
      let content = storyData.text
      
      // If it's a media story, convert file to base64
      if (storyData.file) {
        content = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(storyData.file)
        })
      }
      
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          type: storyData.type,
          content: content,
          privacy: storyData.privacy,
          backgroundColor: storyData.backgroundColor,
          filter: storyData.filter,
          blur: storyData.blur
        })
      })
      setShowStoryCreate(false)
      setStoryData({ type: 'photo', file: null, preview: null, text: '', privacy: 'everyone', backgroundColor: '#1a1a2e', filter: 'none', blur: 0 })
      fetchStories(user.id)
    } catch (err) {
      console.error('Story creation failed:', err)
    }
    setUploading(false)
  }

  const handleStoryFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const preview = URL.createObjectURL(file)
    const type = file.type.startsWith('video/') ? 'video' : 'photo'
    setStoryData({ ...storyData, file, preview, type })
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

  const deleteGalleryItem = async (itemId) => {
    if (!confirm('Delete this photo?')) return
    try {
      await fetch(`/api/gallery/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      fetchGallery(user.id)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const deleteProfilePic = async () => {
    if (!confirm('Remove profile picture?')) return
    try {
      await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const updatedUser = { ...user, avatar: null }
      setUser(updatedUser)
      localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error('Failed to delete profile pic:', err)
    }
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
  const isOwnProfile = true // This page always shows the current user's profile

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
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 overflow-hidden ${user.isCreator ? 'bg-gradient-to-br from-pink-500 to-purple-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => profilePicInputRef.current?.click()}
                  className="absolute bottom-3 right-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
                >
                  <Camera className="w-4 h-4 text-black" />
                </button>
                {user.avatar && (
                  <button 
                    onClick={deleteProfilePic}
                    className="absolute bottom-3 left-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </>
            )}
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

          {/* Tip Button */}
          <button
            onClick={() => setShowTipModal(true)}
            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold flex items-center gap-2 mx-auto"
          >
            <Gift className="w-4 h-4" /> Send Tip
          </button>
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
            {/* Public Gallery Preview */}
            {gallery.length > 0 && galleryPrivacy === 'public' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Image className="w-4 h-4 text-amber-400" /> Gallery
                  </h3>
                  <button onClick={() => setActiveTab('gallery')} className="text-amber-400 text-sm">View all</button>
                </div>
                <div className="grid grid-cols-4 gap-1 rounded-xl overflow-hidden">
                  {gallery.slice(0, 4).map(item => (
                    <div key={item.id} className="aspect-square bg-white/10">
                      <img src={item.imageData || item.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/10 group">
                    {item.type === 'video' ? (
                      <video src={item.url || item.imageData} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.imageData || item.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {/* Delete button on hover/tap */}
                    <button 
                      onClick={() => deleteGalleryItem(item.id)}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs truncate">{item.caption}</p>
                      </div>
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

      {/* Hidden file inputs for gallery access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
      />
      <input
        ref={profilePicInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, true)}
        className="hidden"
      />

      {/* Upload Modal with Filters */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Add to Gallery</h2>
            <div className="space-y-4">
              {/* Preview with applied filter */}
              {uploadData.preview ? (
                <div className="relative">
                  {uploadData.type === 'video' ? (
                    <video 
                      src={uploadData.preview} 
                      className="w-full h-48 object-cover rounded-xl" 
                      style={{ 
                        filter: `${FILTERS.find(f => f.id === uploadData.filter)?.css || ''} blur(${uploadData.blur}px)` 
                      }}
                      controls 
                    />
                  ) : (
                    <img 
                      src={uploadData.preview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl" 
                      style={{ 
                        filter: `${FILTERS.find(f => f.id === uploadData.filter)?.css || ''} blur(${uploadData.blur}px)` 
                      }}
                    />
                  )}
                  <button 
                    onClick={() => setUploadData({ ...uploadData, file: null, preview: null })}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-amber-500/50 hover:bg-white/5 transition-colors"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-gray-400">Tap to select from device</span>
                  <span className="text-gray-500 text-sm">Photos or videos</span>
                </button>
              )}
              
              {/* Filters - only show when file is selected */}
              {uploadData.preview && uploadData.type === 'photo' && (
                <>
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Filter</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setUploadData({ ...uploadData, filter: filter.id })}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs ${
                            uploadData.filter === filter.id 
                              ? 'bg-amber-500 text-black' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Blur Level</label>
                    <div className="flex gap-2">
                      {BLUR_LEVELS.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setUploadData({ ...uploadData, blur: level.value })}
                          className={`flex-1 py-1.5 rounded-lg text-xs ${
                            uploadData.blur === level.value 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <input 
                type="text" 
                value={uploadData.caption} 
                onChange={e => setUploadData({ ...uploadData, caption: e.target.value })} 
                placeholder="Caption (optional)" 
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500" 
              />
              
              <div className="flex gap-3">
                <button onClick={() => { setShowUpload(false); setUploadData({ type: 'photo', file: null, caption: '', preview: null, filter: 'none', blur: 0 }) }} className="flex-1 py-3 rounded-xl bg-white/10 text-white">
                  Cancel
                </button>
                <button 
                  onClick={uploadToGallery} 
                  disabled={!uploadData.file || uploading}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Create Modal with File Upload */}
      {showStoryCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowStoryCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Story</h2>
            <div className="space-y-4">
              {/* Story Type Selection */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setStoryData({ ...storyData, type: 'photo', file: null, preview: null })} 
                  className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${storyData.type === 'photo' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}
                >
                  <Camera className="w-3 h-3" /> Photo
                </button>
                <button 
                  onClick={() => setStoryData({ ...storyData, type: 'video', file: null, preview: null })} 
                  className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${storyData.type === 'video' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}
                >
                  <Video className="w-3 h-3" /> Video
                </button>
                <button 
                  onClick={() => setStoryData({ ...storyData, type: 'text', file: null, preview: null })} 
                  className={`flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1 ${storyData.type === 'text' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}
                >
                  <Edit className="w-3 h-3" /> Text
                </button>
              </div>
              
              {/* Content Area */}
              {storyData.type === 'text' ? (
                <div 
                  className="w-full h-48 rounded-xl p-4 flex items-center justify-center"
                  style={{ backgroundColor: storyData.backgroundColor }}
                >
                  <textarea 
                    value={storyData.text} 
                    onChange={e => setStoryData({ ...storyData, text: e.target.value })} 
                    placeholder="What's on your mind?" 
                    className="w-full h-full bg-transparent text-white text-center text-lg placeholder-white/50 resize-none focus:outline-none"
                    maxLength={200}
                  />
                </div>
              ) : (
                <>
                  {storyData.preview ? (
                    <div className="relative">
                      {storyData.type === 'video' ? (
                        <video 
                          src={storyData.preview} 
                          className="w-full h-48 object-cover rounded-xl" 
                          style={{ 
                            filter: `${FILTERS.find(f => f.id === storyData.filter)?.css || ''} blur(${storyData.blur}px)` 
                          }}
                          controls 
                        />
                      ) : (
                        <img 
                          src={storyData.preview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-xl" 
                          style={{ 
                            filter: `${FILTERS.find(f => f.id === storyData.filter)?.css || ''} blur(${storyData.blur}px)` 
                          }}
                        />
                      )}
                      <button 
                        onClick={() => setStoryData({ ...storyData, file: null, preview: null })}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => storyFileInputRef.current?.click()}
                      className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:border-amber-500/50 hover:bg-white/5 transition-colors"
                    >
                      <Upload className="w-10 h-10 text-gray-400" />
                      <span className="text-gray-400">Tap to select {storyData.type}</span>
                      <span className="text-gray-500 text-sm">From your device</span>
                    </button>
                  )}
                </>
              )}
              
              {/* Filters for photo stories */}
              {storyData.preview && storyData.type === 'photo' && (
                <>
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Filter</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setStoryData({ ...storyData, filter: filter.id })}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs ${
                            storyData.filter === filter.id 
                              ? 'bg-amber-500 text-black' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Blur Level</label>
                    <div className="flex gap-2">
                      {BLUR_LEVELS.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setStoryData({ ...storyData, blur: level.value })}
                          className={`flex-1 py-1.5 rounded-lg text-xs ${
                            storyData.blur === level.value 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Background color for text stories */}
              {storyData.type === 'text' && (
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">Background</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#1a1a2e', '#2d1b4e', '#0c2340', '#3d1c02', '#0d2818', '#3d2b2b', '#1a0a2e', '#2d2006'].map(color => (
                      <button
                        key={color}
                        onClick={() => setStoryData({ ...storyData, backgroundColor: color })}
                        className={`w-8 h-8 rounded-full ${storyData.backgroundColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Privacy */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setStoryData({ ...storyData, privacy: 'everyone' })} 
                  className={`flex-1 py-2 rounded-lg text-xs ${storyData.privacy === 'everyone' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Everyone
                </button>
                <button 
                  onClick={() => setStoryData({ ...storyData, privacy: 'friends' })} 
                  className={`flex-1 py-2 rounded-lg text-xs ${storyData.privacy === 'friends' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                >
                  <Lock className="w-3 h-3 inline mr-1" /> Friends Only
                </button>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => { 
                    setShowStoryCreate(false)
                    setStoryData({ type: 'photo', file: null, preview: null, text: '', privacy: 'everyone', backgroundColor: '#1a1a2e', filter: 'none', blur: 0 })
                  }} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={createStory} 
                  disabled={uploading || (storyData.type === 'text' ? !storyData.text : !storyData.file)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {uploading ? 'Posting...' : 'Post Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for story uploads */}
      <input
        ref={storyFileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleStoryFileSelect}
        className="hidden"
      />

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

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowTipModal(false)}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" /> Send a Tip
              </h2>
              <button onClick={() => setShowTipModal(false)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">Show your appreciation with a tip. 80% goes to the creator.</p>

            {/* Quick Amounts */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {TIP_AMOUNTS.map(t => (
                <button
                  key={t.amount}
                  onClick={() => setTipAmount(t.amount)}
                  className={`py-3 rounded-xl font-semibold transition-colors ${
                    tipAmount === t.amount
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">£</span>
                <input
                  type="number"
                  min="1"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Add a message (optional)</label>
              <input
                type="text"
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                placeholder="Thanks for the great content!"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Tip amount</span>
                <span className="text-white">£{tipAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Platform fee (20%)</span>
                <span className="text-gray-400">-£{(tipAmount * 0.20).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">Creator receives</span>
                <span className="text-green-400 font-semibold">£{(tipAmount * 0.80).toFixed(2)}</span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={sendTip}
              disabled={tipping || tipAmount < 1}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {tipping ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" /> Send £{tipAmount.toFixed(2)} Tip
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
