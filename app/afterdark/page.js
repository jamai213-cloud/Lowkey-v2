'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Moon, Plus, Users, Send, AlertTriangle, Shield, Heart, MessageSquare } from 'lucide-react'

export default function AfterDarkPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [verified, setVerified] = useState(false)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showGate, setShowGate] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '', category: 'chat' })
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const categories = [
    { id: 'chat', name: 'General Chat', icon: MessageSquare },
    { id: 'kink', name: 'Kink Friendly', icon: Heart },
    { id: 'safe-space', name: 'Safe Space', icon: Shield }
  ]

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    
    if (userData.ageVerified) {
      setVerified(true)
      fetchRooms()
    } else {
      setShowGate(true)
      setLoading(false)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/afterdark/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (err) {
      console.error('Failed to fetch rooms')
    }
    setLoading(false)
  }

  const createRoom = async (e) => {
    e.preventDefault()
    if (!newRoom.name.trim()) return

    try {
      const res = await fetch('/api/afterdark/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoom.name.trim(),
          description: newRoom.description.trim(),
          category: newRoom.category,
          creatorId: user.id
        })
      })
      if (res.ok) {
        setNewRoom({ name: '', description: '', category: 'chat' })
        setShowCreate(false)
        fetchRooms()
      }
    } catch (err) {
      console.error('Failed to create room')
    }
  }

  const joinRoom = async (roomId) => {
    try {
      await fetch(`/api/afterdark/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
    } catch (err) {
      console.error('Failed to join room')
    }
  }

  const loadRoom = async (room) => {
    setSelectedRoom(room)
    await joinRoom(room.id)
    fetchMessages(room.id)
    startPolling(room.id)
  }

  const fetchMessages = async (roomId) => {
    try {
      const res = await fetch(`/api/afterdark/rooms/${roomId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const startPolling = (roomId) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(roomId), 3000)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom) return

    try {
      const res = await fetch(`/api/afterdark/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          content: newMessage.trim()
        })
      })
      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedRoom.id)
      }
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  const confirmAge = async () => {
    try {
      await fetch('/api/profile/age-verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      const updatedUser = { ...user, ageVerified: true }
      setUser(updatedUser)
      localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
      
      setVerified(true)
      setShowGate(false)
      fetchRooms()
    } catch (err) {
      console.error('Failed to verify age')
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

  // Age Gate
  if (showGate) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
            <Moon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">After Dark</h1>
          <p className="text-purple-300 mb-6">Anonymous • Kink-Friendly • Safe Space</p>
          
          <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 mb-6 text-left">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-4" />
            <h2 className="text-white font-semibold mb-2">18+ Content Warning</h2>
            <p className="text-gray-400 text-sm mb-4">
              After Dark is a safe space for adult conversations. All chats are anonymous. 
              By entering, you confirm you are 18+ and agree to respect all members.
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Anonymous identities</li>
              <li>✓ Kink-friendly discussions</li>
              <li>✓ Safe space - no judgment</li>
              <li>✓ Respect boundaries always</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={confirmAge}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
            >
              I am 18+ - Enter After Dark
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-xl bg-white/10 text-gray-300 font-medium"
            >
              Take me back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedRoom ? setSelectedRoom(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <Moon className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              {selectedRoom ? selectedRoom.name : 'After Dark'}
            </h1>
            {selectedRoom && (
              <p className="text-purple-300 text-xs">Anonymous Chat • {selectedRoom.category}</p>
            )}
          </div>
        </div>
        {!selectedRoom && (
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30"
          >
            <Plus className="w-5 h-5 text-purple-400" />
          </button>
        )}
      </header>

      {!selectedRoom ? (
        // Rooms List
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-purple-300 text-sm mb-4">
            🔒 All chats are anonymous. Your identity is protected.
          </p>

          {rooms.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Moon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rooms yet</p>
              <p className="text-sm">Create the first After Dark room!</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
              >
                Create Room
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const CategoryIcon = categories.find(c => c.id === room.category)?.icon || MessageSquare
                return (
                  <button
                    key={room.id}
                    onClick={() => loadRoom(room)}
                    className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-left hover:bg-purple-500/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <CategoryIcon className="w-5 h-5 text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{room.name}</h3>
                        <p className="text-gray-400 text-sm">{room.description || 'Anonymous chat room'}</p>
                        <span className="text-purple-400 text-xs mt-1 inline-block">
                          {categories.find(c => c.id === room.category)?.name || 'General'}
                        </span>
                      </div>
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        // Chat View
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center py-2 px-4 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
              <p className="text-purple-300 text-xs">🔒 You appear as: Anonymous {user.id.substring(0, 4)}</p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.senderId === user.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-xs font-medium opacity-70 mb-1">{msg.senderName}</p>
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-purple-500/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type anonymously..."
                className="flex-1 px-4 py-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-full bg-purple-500 text-white disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Create Room Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create After Dark Room</h2>
            <form onSubmit={createRoom} className="space-y-4">
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="Room name"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                required
              />
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none h-20"
              />
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Category</label>
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewRoom({ ...newRoom, category: cat.id })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                        newRoom.category === cat.id 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      <cat.icon className="w-3 h-3" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
