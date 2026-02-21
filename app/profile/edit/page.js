---

## 4. `app/profile/edit/page.js`
Action: $ cat /app/app/profile/edit/page.js
Observation: 'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, User, MapPin, Heart, Users, Ruler, 
  Eye, Cigarette, Wine, MessageSquare, Lock, Globe, X, Trash2,
  Camera, Sliders, Check, Image as ImageIcon, Flame, Upload
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

// Extended kink categories (FabSwingers style)
const KINK_CATEGORIES = {
  'Basics': [
    'Kissing', 'Cuddling', 'Massage', 'Oral giving', 'Oral receiving', 
    'Protected sex', 'Unprotected sex', 'Toys', 'Lingerie', 'Role play'
  ],
  'Positions & Styles': [
    'Missionary', 'Doggy style', 'Cowgirl', 'Reverse cowgirl', '69', 
    'Standing', 'Outdoor', 'Car', 'Shower/Bath', 'Public places'
  ],
  'Group & Social': [
    'Threesome (MFM)', 'Threesome (FMF)', 'Foursomes', 'Moresomes', 
    'Gang bang', 'Dogging', 'Swinging', 'Club meets', 'Voyeurism', 'Exhibitionism'
  ],
  'BDSM Light': [
    'Blindfolds', 'Handcuffs', 'Restraints', 'Light spanking', 'Hair pulling',
    'Choking (light)', 'Biting', 'Scratching', 'Ice play', 'Wax play'
  ],
  'BDSM Advanced': [
    'Dom/Sub', 'Master/Slave', 'Bondage', 'Rope play', 'Suspension',
    'Impact play', 'Flogging', 'Caning', 'Electro play', 'CBT'
  ],
  'Fetish': [
    'Feet', 'Latex/Rubber', 'Leather', 'PVC', 'Uniforms', 
    'Cross dressing', 'Strap-on', 'Pegging', 'Feminization', 'Cuckolding'
  ],
  'Other': [
    'Photography', 'Videoing', 'Phone sex', 'Sexting', 'Cam to cam',
    'Tantric', 'Edging', 'Multiple orgasms', 'Squirting', 'Anal'
  ]
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gallery, setGallery] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showProfilePicUpload, setShowProfilePicUpload] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadPrivacy, setUploadPrivacy] = useState('public')
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [activeKinkCategory, setActiveKinkCategory] = useState('Basics')
  const fileInputRef = useRef(null)
  const profilePicInputRef = useRef(null)

  // Profile form fields
  const [profile, setProfile] = useState({
    profilePicture: '',
    aboutMe: '',
    lookingFor: '',
    age: '',
    gender: '',
    sexuality: '',
    relationshipStatus: '',
    height: '',
    bodyType: '',
    eyeColor: '',
    hairColor: '',
    ethnicity: '',
    smoking: '',
    drinking: '',
    location: '',
    willingToTravel: '',
    interestedIn: [],
    openTo: [],
    kinks: [],
    kinksHard: [],
    profilePrivacy: 'public',
  })

  const genderOptions = ['Man', 'Woman', 'Non-binary', 'Trans Man', 'Trans Woman', 'Couple (MF)', 'Couple (MM)', 'Couple (FF)', 'Other', 'Prefer not to say']
  const sexualityOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Bicurious', 'Pansexual', 'Heteroflexible', 'Homoflexible', 'Other', 'Prefer not to say']
  const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Open relationship', 'Polyamorous', 'Its complicated', 'Separated', 'Divorced', 'Prefer not to say']
  const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus size', 'Muscular', 'BBW/BHM', 'Dad bod', 'Prefer not to say']
  const eyeColorOptions = ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Other']
  const hairColorOptions = ['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Bald', 'Shaved', 'Other']
  const ethnicityOptions = ['Asian', 'Black', 'Hispanic/Latino', 'Middle Eastern', 'Mixed', 'White', 'Indian', 'Caribbean', 'African', 'Other', 'Prefer not to say']
  const smokingOptions = ['Non-smoker', 'Social smoker', 'Regular smoker', 'Vaper', '420 friendly', 'Prefer not to say']
  const drinkingOptions = ['Non-drinker', 'Social drinker', 'Regular drinker', 'Prefer not to say']
  const travelOptions = ['No', '10 miles', '25 miles', '50 miles', '100+ miles', 'Anywhere']
  const interestedInOptions = ['Men', 'Women', 'Couples (MF)', 'Couples (MM)', 'Couples (FF)', 'Groups', 'Trans', 'Non-binary']
  const openToOptions = ['Chat', 'Friendship', 'Dating', 'Casual', 'Long-term', 'Discreet meets', 'One night stands', 'Regular meets', 'NSA fun', 'FWB']

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
      
      if (profile.profilePicture) {
        await fetch('/api/profile/picture', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, profilePicture: profile.profilePicture })
        })
        const updatedUser = { ...user, profilePicture: profile.profilePicture }
        localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      }
      
      router.push('/profile')
    } catch (err) {
      console.error('Failed to save profile')
    }
    setSaving(false)
  }

  // Handle file selection from phone
  const handleFileSelect = (e, isProfilePic = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB allowed.')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      if (isProfilePic) {
        setProfile(prev => ({ ...prev, profilePicture: base64 }))
        setShowProfilePicUpload(false)
      } else {
        setPreviewImage(base64)
        setShowUpload(true)
      }
    }
    reader.readAsDataURL(file)
  }

  // Upload photo to gallery
  const uploadPhoto = async () => {
    if (!previewImage) return
    setUploading(true)

    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          imageData: previewImage,
          caption: uploadCaption,
          privacy: uploadPrivacy
        })
      })
      
      if (res.ok) {
        setShowUpload(false)
        setPreviewImage(null)
        setUploadCaption('')
        setUploadPrivacy('public')
        fetchGallery(user.id)
      } else {
        alert('Upload failed. Please try again.')
      }
    } catch (err) {
      console.error('Failed to upload photo')
      alert('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const setAsProfilePicture = (imageData) => {
    setProfile(prev => ({ ...prev, profilePicture: imageData }))
    setSelectedPhoto(null)
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

  const toggleKink = (kink) => toggleArrayField('kinks', kink)
  const toggleHardLimit = (kink) => toggleArrayField('kinksHard', kink)

  // Get image source (supports both base64 and URL)
  const getImageSrc = (photo) => photo.imageData || photo.url

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Hidden file inputs - no capture attribute to allow gallery selection */}
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
        {/* Profile Picture Section */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> Profile Picture
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-amber-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button 
                onClick={() => profilePicInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-2">Tap to upload from your phone</p>
              <button 
                onClick={() => setShowProfilePicUpload(true)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Change Photo
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-400" /> Photos
            </h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload
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
                    src={getImageSrc(photo)} 
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
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="col-span-4 py-12 rounded-xl border-2 border-dashed border-white/20 text-center"
              >
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400">Tap to upload photos</p>
              </button>
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

        {/* KINKS SECTION */}
        <section>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> Kinks & Preferences
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Tap to select (green = into it). Tap again to mark as hard limit (red = won't do).
          </p>
          
          {/* Category tabs - horizontally scrollable with snap */}
          <div className="relative -mx-4 px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {Object.keys(KINK_CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveKinkCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors snap-start ${
                    activeKinkCategory === cat
                      ? 'bg-orange-500 text-black font-semibold'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {/* Extra padding at end for scroll */}
              <div className="flex-shrink-0 w-4" aria-hidden="true"></div>
            </div>
          </div>

          {/* Kink checkboxes */}
          <div className="grid grid-cols-2 gap-2">
            {KINK_CATEGORIES[activeKinkCategory]?.map(kink => {
              const isSelected = profile.kinks?.includes(kink)
              const isHardLimit = profile.kinksHard?.includes(kink)
              
              return (
                <button
                  key={kink}
                  onClick={() => {
                    if (isHardLimit) {
                      toggleHardLimit(kink)
                    } else if (isSelected) {
                      toggleKink(kink)
                      toggleHardLimit(kink)
                    } else {
                      toggleKink(kink)
                    }
                  }}
                  className={`p-3 rounded-xl text-left text-sm transition-all ${
                    isHardLimit
                      ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                      : isSelected
                      ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                      : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                      isHardLimit ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-green-500 text-white' : 'bg-white/20'
                    }`}>
                      {isHardLimit ? '✗' : isSelected ? '✓' : ''}
                    </div>
                    <span className="flex-1">{kink}</span>
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-400">Into it</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-400">Hard limit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-white/20" />
              <span className="text-gray-400">No preference</span>
            </div>
          </div>
        </section>
      </div>

      {/* Profile Picture Upload Modal */}
      {showProfilePicUpload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowProfilePicUpload(false)}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-semibold">Profile Picture</h2>
              <button onClick={() => setShowProfilePicUpload(false)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Upload from phone */}
            <button
              onClick={() => {
                profilePicInputRef.current?.click()
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center gap-2 mb-4"
            >
              <Camera className="w-5 h-5" /> Take Photo or Choose from Gallery
            </button>

            {/* Or select from existing gallery */}
            {gallery.length > 0 && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[#1a1a2e] text-gray-500 text-sm">Or select from gallery</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {gallery.map(photo => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setProfile(p => ({ ...p, profilePicture: getImageSrc(photo) }))
                        setShowProfilePicUpload(false)
                      }}
                      className={`aspect-square rounded-xl overflow-hidden border-2 ${
                        profile.profilePicture === getImageSrc(photo) ? 'border-amber-500' : 'border-transparent'
                      }`}
                    >
                      <img src={getImageSrc(photo)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showUpload && previewImage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90" onClick={() => { setShowUpload(false); setPreviewImage(null) }}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white font-semibold">Upload Photo</h2>
              <button onClick={() => { setShowUpload(false); setPreviewImage(null) }} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Preview */}
            <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-black">
              <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
            </div>

            {/* Caption */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Caption (optional)</label>
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Privacy */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Who can see this?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadPrivacy('public')}
                  className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                    uploadPrivacy === 'public' ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Public
                </button>
                <button
                  onClick={() => setUploadPrivacy('friends')}
                  className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
     
... [stdout truncated]
Exit code: 0
