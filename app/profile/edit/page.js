'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, User, MapPin, Calendar, Heart, Users, Ruler, 
  Eye, Cigarette, Wine, MessageSquare, Lock, Globe, X, Trash2,
  Camera, Sliders, Check
} from 'lucide-react'

// Photo filter options
const FILTERS = [
  { id: 'none', name: 'None', css: '' },
  { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(100%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(30%) saturate(120%)' },
  { id: 'cool', name: 'Cool', css: 'saturate(80%) hue-rotate(20deg)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(50%) contrast(90%)' },
  { id: 'bright', name: 'Bright', css: 'brightness(115%) contrast(105%)' },
  { id: 'dark', name: 'Dark', css: 'brightness(85%) contrast(110%)' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gallery, setGallery] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadData, setUploadData] = useState({ url: '', caption: '', privacy: 'public' })

  // Profile form fields (FabSwingers style)
  const [profile, setProfile] = useState({
    // Basic Info
    aboutMe: '',
    lookingFor: '',
    
    // Personal Details
    age: '',
    gender: '',
    sexuality: '',
    relationshipStatus: '',
    
    // Physical
    height: '',
    bodyType: '',
    eyeColor: '',
    hairColor: '',
    ethnicity: '',
    
    // Lifestyle
    smoking: '',
    drinking: '',
    
    // Location
    location: '',
    willingToTravel: '',
    
    // Preferences
    interestedIn: [],
    openTo: [],
    
    // Privacy
    profilePrivacy: 'public', // 'public' or 'friends'
  })

  const genderOptions = ['Man', 'Woman', 'Non-binary', 'Trans Man', 'Trans Woman', 'Other', 'Prefer not to say']
  const sexualityOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Curious', 'Other', 'Prefer not to say']
  const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Open relationship', 'Its complicated', 'Prefer not to say']
  const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus size', 'Muscular', 'Dad bod', 'Prefer not to say']
  const eyeColorOptions = ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Other']
  const hairColorOptions = ['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Bald', 'Other']
  const ethnicityOptions = ['Asian', 'Black', 'Hispanic/Latino', 'Middle Eastern', 'Mixed', 'White', 'Other', 'Prefer not to say']
  const smokingOptions = ['Non-smoker', 'Social smoker', 'Regular smoker', 'Vaper', 'Prefer not to say']
  const drinkingOptions = ['Non-drinker', 'Social drinker', 'Regular drinker', 'Prefer not to say']
  const travelOptions = ['No', '10 miles', '25 miles', '50 miles', '100+ miles', 'Anywhere']
  const interestedInOptions = ['Men', 'Women', 'Couples', 'Groups', 'Trans']
  const openToOptions = ['Chat', 'Friendship', 'Dating', 'Casual', 'Long-term', 'Discreet meets']

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchProfileDetails(userData.id)
    fetchGallery(userData.id)
  }, [])

  const fetchProfileDetails = async (userId) => {
    try {
      const res = await fetch(`/api/profile/details?userId=${userId}&viewerId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data && !data.restricted) {
          setProfile(prev => ({ ...prev, ...data }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile details')
    }
    setLoading(false)
  }

  const fetchGallery = async (userId) => {
    try {
      const res = await fetch(`/api/gallery?userId=${userId}&viewerId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setGallery(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch gallery')
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profile })
      })
      router.push('/profile')
    } catch (err) {
      console.error('Failed to save profile')
    }
    setSaving(false)
  }

  const uploadPhoto = async () => {
    if (!uploadData.url) return
    try {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          type: 'photo',
          url: uploadData.url,
          caption: uploadData.caption,
          privacy: uploadData.privacy
        })
      })
      setShowUpload(false)
      setUploadData({ url: '', caption: '', privacy: 'public' })
      fetchGallery(user.id)
    } catch (err) {
      console.error('Failed to upload photo')
    }
  }

  const deletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return
    try {
      await fetch(`/api/gallery/${photoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      setSelectedPhoto(null)
      fetchGallery(user.id)
    } catch (err) {
      console.error('Failed to delete photo')
    }
  }

  const updatePhotoPrivacy = async (photoId, privacy) => {
    try {
      await fetch(`/api/gallery/${photoId}/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, privacy })
      })
      fetchGallery(user.id)
      setSelectedPhoto(prev => ({ ...prev, privacy }))
    } catch (err) {
      console.error('Failed to update privacy')
    }
  }

  const updatePhotoFilter = async (photoId, filter) => {
    try {
      await fetch(`/api/gallery/${photoId}/filter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, filter })
      })
      fetchGallery(user.id)
      setSelectedPhoto(prev => ({ ...prev, filter }))
    } catch (err) {
      console.error('Failed to update filter')
    }
  }

  const toggleArrayField = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter(v => v !== value)
        : [...(prev[field] || []), value]
    }))
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
          </div>
          <button 
            onClick={saveProfile}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Photos Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-400" /> Photos
            </h2>
            <button 
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-sm"
            >
              + Add Photo
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {gallery.map(photo => {
              const filter = FILTERS.find(f => f.id === photo.filter) || FILTERS[0]
              return (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-white/10"
                >
                  <img 
                    src={photo.url} 
                    alt="" 
                    className="w-full h-full object-cover"
                    style={{ filter: filter.css }}
                  />
                  {photo.privacy === 'friends' && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-amber-400" />
                    </div>
                  )}
                </button>
              )
            })}
            {gallery.length === 0 && (
              <div className="col-span-4 py-8 text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No photos yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Profile Privacy */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" /> Profile Visibility
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setProfile(p => ({ ...p, profilePrivacy: 'public' }))}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                profile.profilePrivacy === 'public' ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
              }`}
            >
              <Globe className="w-4 h-4" /> Public
            </button>
            <button
              onClick={() => setProfile(p => ({ ...p, profilePrivacy: 'friends' }))}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
                profile.profilePrivacy === 'friends' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'
              }`}
            >
              <Lock className="w-4 h-4" /> Friends Only
            </button>
          </div>
        </section>

        {/* About Me */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" /> About Me
          </h2>
          <textarea
            value={profile.aboutMe}
            onChange={(e) => setProfile(p => ({ ...p, aboutMe: e.target.value }))}
            placeholder="Tell others about yourself..."
            className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </section>

        {/* Looking For */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" /> What I'm Looking For
          </h2>
          <textarea
            value={profile.lookingFor}
            onChange={(e) => setProfile(p => ({ ...p, lookingFor: e.target.value }))}
            placeholder="What are you looking for on LowKey?"
            className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </section>

        {/* Personal Details */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-pink-400" /> Personal Details
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(p => ({ ...p, age: e.target.value }))}
                  placeholder="Age"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Sexuality</label>
                <select
                  value={profile.sexuality}
                  onChange={(e) => setProfile(p => ({ ...p, sexuality: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {sexualityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Status</label>
                <select
                  value={profile.relationshipStatus}
                  onChange={(e) => setProfile(p => ({ ...p, relationshipStatus: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Physical Attributes */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-green-400" /> Physical
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Height</label>
                <input
                  type="text"
                  value={profile.height}
                  onChange={(e) => setProfile(p => ({ ...p, height: e.target.value }))}
                  placeholder="e.g. 5'10 or 178cm"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Body Type</label>
                <select
                  value={profile.bodyType}
                  onChange={(e) => setProfile(p => ({ ...p, bodyType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {bodyTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Eyes</label>
                <select
                  value={profile.eyeColor}
                  onChange={(e) => setProfile(p => ({ ...p, eyeColor: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {eyeColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Hair</label>
                <select
                  value={profile.hairColor}
                  onChange={(e) => setProfile(p => ({ ...p, hairColor: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {hairColorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Ethnicity</label>
                <select
                  value={profile.ethnicity}
                  onChange={(e) => setProfile(p => ({ ...p, ethnicity: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Select</option>
                  {ethnicityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Lifestyle */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-400" /> Lifestyle
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block flex items-center gap-1">
                <Cigarette className="w-3 h-3" /> Smoking
              </label>
              <select
                value={profile.smoking}
                onChange={(e) => setProfile(p => ({ ...p, smoking: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select</option>
                {smokingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block flex items-center gap-1">
                <Wine className="w-3 h-3" /> Drinking
              </label>
              <select
                value={profile.drinking}
                onChange={(e) => setProfile(p => ({ ...p, drinking: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select</option>
                {drinkingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" /> Location
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
              placeholder="City or area (e.g. London, Manchester)"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Willing to travel</label>
              <select
                value={profile.willingToTravel}
                onChange={(e) => setProfile(p => ({ ...p, willingToTravel: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select</option>
                {travelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Interested In */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Interested In
          </h2>
          <div className="flex flex-wrap gap-2">
            {interestedInOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleArrayField('interestedIn', opt)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  profile.interestedIn?.includes(opt)
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Open To */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" /> Open To
          </h2>
          <div className="flex flex-wrap gap-2">
            {openToOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleArrayField('openTo', opt)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  profile.openTo?.includes(opt)
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Photo Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-semibold">Add Photo</h2>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="url"
                value={uploadData.url}
                onChange={(e) => setUploadData(d => ({ ...d, url: e.target.value }))}
                placeholder="Image URL"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                value={uploadData.caption}
                onChange={(e) => setUploadData(d => ({ ...d, caption: e.target.value }))}
                placeholder="Caption (optional)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Who can see this?</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUploadData(d => ({ ...d, privacy: 'public' }))}
                    className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                      uploadData.privacy === 'public' ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> Public
                  </button>
                  <button
                    onClick={() => setUploadData(d => ({ ...d, privacy: 'friends' }))}
                    className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                      uploadData.privacy === 'friends' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    <Lock className="w-4 h-4" /> Friends
                  </button>
                </div>
              </div>
              <button
                onClick={uploadPhoto}
                disabled={!uploadData.url}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold disabled:opacity-50"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Editor Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Edit Photo</h3>
              <button onClick={() => setSelectedPhoto(null)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Photo Preview */}
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
              <img 
                src={selectedPhoto.url} 
                alt="" 
                className="w-full h-full object-cover"
                style={{ filter: FILTERS.find(f => f.id === selectedPhoto.filter)?.css || '' }}
              />
            </div>

            {/* Filters */}
            <div className="mb-4">
              <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Filters
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => updatePhotoFilter(selectedPhoto.id, filter.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 ${
                      selectedPhoto.filter === filter.id ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedPhoto.filter === filter.id ? 'border-amber-500' : 'border-transparent'}">
                      <img 
                        src={selectedPhoto.url} 
                        alt="" 
                        className="w-full h-full object-cover"
                        style={{ filter: filter.css }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{filter.name}</span>
                    {selectedPhoto.filter === filter.id && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="mb-4">
              <h4 className="text-white text-sm font-semibold mb-2">Visibility</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePhotoPrivacy(selectedPhoto.id, 'public')}
                  className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                    selectedPhoto.privacy === 'public' ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Public
                </button>
                <button
                  onClick={() => updatePhotoPrivacy(selectedPhoto.id, 'friends')}
                  className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                    selectedPhoto.privacy === 'friends' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  <Lock className="w-4 h-4" /> Friends Only
                </button>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => deletePhoto(selectedPhoto.id)}
              className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Delete Photo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
