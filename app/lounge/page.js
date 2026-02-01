'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Users, Image, Lock, MessageSquare, PoundSterling, Star, Upload, X } from 'lucide-react'

export default function LoungePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [lounge, setLounge] = useState(null)
  const [messages, setMessages] = useState([])
  const [posts, setPosts] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [newPost, setNewPost] = useState({ imageData: '', caption: '', price: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('chat') // chat, posts
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchLounge(userData.id)
    fetchPosts()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const fetchLounge = async (userId) => {
    try {
      const res = await fetch('/api/main-lounge')
      if (res.ok) {
        const data = await res.json()
        setLounge(data)
        
        // Auto-join if not member
        if (!data.members?.includes(userId)) {
          await fetch('/api/main-lounge/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          })
        }
        
        fetchMessages()
        startPolling()
      }
    } catch (err) {
      console.error('Failed to fetch lounge')
    }
    setLoading(false)
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/main-lounge/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/main-lounge/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error('Failed to fetch posts')
    }
  }

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchMessages, 3000)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const res = await fetch('/api/main-lounge/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.displayName,
          content: newMessage.trim()
        })
      })
      if (res.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  // Handle file selection for tease post
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max size is 10MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setNewPost({ ...newPost, imageData: base64 })
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  // Clear selected image
  const clearImage = () => {
    setNewPost({ ...newPost, imageData: '' })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createPost = async (e) => {
    e.preventDefault()
    if (!newPost.imageData) return

    try {
      const res = await fetch('/api/main-lounge/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: user.id,
          imageData: newPost.imageData,
          caption: newPost.caption,
          price: parseFloat(newPost.price) || 0
        })
      })
      if (res.ok) {
        setNewPost({ imageData: '', caption: '', price: '' })
        setImagePreview(null)
        setShowPostForm(false)
        fetchPosts()
      }
    } catch (err) {
      console.error('Failed to create post')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">LowKey Lounge</h1>
            <p className="text-gray-400 text-xs">{lounge?.memberCount || 0} members online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'posts' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
        >
          <Image className="w-4 h-4 inline mr-2" />
          Creator Posts
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <p>Welcome to the LowKey Lounge!</p>
                <p className="text-sm">Be the first to say something...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for other users - show on left */}
                  {msg.senderId !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-purple-500/30 flex-shrink-0 overflow-hidden">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-xs font-bold">
                          {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      msg.senderId === user?.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {msg.senderId !== user?.id && (
                      <p className="text-xs font-medium opacity-70 mb-1">{msg.senderName}</p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-black/60' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {/* Avatar for current user - show on right */}
                  {msg.senderId === user?.id && (
                    <div className="w-8 h-8 rounded-full bg-amber-500/30 flex-shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400 text-xs font-bold">
                          {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-full bg-amber-500 text-black disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Creator Posts */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Create Post Button - Only for Creators */}
            {user?.isCreator ? (
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Image className="w-5 h-5" /> Post a Tease
              </button>
            ) : (
              <div className="mb-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center">
                <Star className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Want to post content?</p>
                <p className="text-gray-400 text-xs">Contact the founder to become a creator</p>
              </div>
            )}

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No creator posts yet</p>
                <p className="text-sm">Be the first to share!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {posts.map((post) => (
                  <div key={post.id} className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    {/* Blurred Image with LowKey overlay */}
                    <div className="relative aspect-square">
                      <img 
                        src={post.imageData || post.imageUrl} 
                        alt="Teaser" 
                        className="w-full h-full object-cover blur-lg"
                      />
                      {/* LowKey Logo Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-center">
                          <img 
                            src="https://customer-assets.emergentagent.com/job_9cfb4bde-566c-4101-8a52-a8ca747e74ca/artifacts/xjtcpb4e_095E7AA1-912D-48A9-A667-A5A89F16DBD7.png" 
                            alt="LowKey" 
                            className="w-12 h-12 mx-auto mb-2 opacity-80"
                          />
                          <Lock className="w-6 h-6 mx-auto text-white/60" />
                        </div>
                      </div>
                    </div>
                    {/* Post Info */}
                    <div className="p-3">
                      <p className="text-white text-sm font-medium truncate">{post.creatorName}</p>
                      {post.caption && <p className="text-gray-400 text-xs truncate">{post.caption}</p>}
                      {post.price > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-amber-400 text-sm font-semibold">
                          <PoundSterling className="w-4 h-4" />
                          {post.price.toFixed(2)}
                        </div>
                      )}
                      <button className="w-full mt-2 py-2 rounded-lg bg-pink-500/20 text-pink-400 text-xs font-medium">
                        Subscribe to View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowPostForm(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Tease Post</h2>
            <form onSubmit={createPost} className="space-y-4">
              {/* File Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl bg-black/40 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-pink-500/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400 text-sm">Tap to upload image</span>
                  <span className="text-gray-500 text-xs">Max 10MB • JPG, PNG, GIF</span>
                </button>
              )}
              
              <textarea
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                placeholder="Caption (optional)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 resize-none h-20"
              />
              <div className="relative">
                <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPost.price}
                  onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                  placeholder="Set your price (£)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <p className="text-gray-400 text-xs">Your image will be blurred with the LowKey logo. Subscribers can view full content. LowKey takes 20%.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowPostForm(false); clearImage(); }} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button type="submit" disabled={!newPost.imageData} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
