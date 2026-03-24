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
        <div className="animate-pulse text-white/40 font-heading">Loading...</div>
      </div>
    )
  }

  // Age Gate
  if (showGate) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 page-enter" data-testid="afterdark-gate">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/15 mb-6">
            <Moon className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-white mb-2">After Dark</h1>
          <p className="text-orange-400/80 mb-8">Anonymous · Kink-Friendly · Safe Space</p>
          
          <div className="glass-card rounded-2xl p-6 mb-8 text-left border border-orange-500/10">
            <AlertTriangle className="w-6 h-6 text-amber-400 mb-4" strokeWidth={1.5} />
            <h2 className="text-white font-heading font-semibold mb-2">18+ Content Warning</h2>
            <p className="text-white/40 text-sm mb-4 leading-relaxed">
              After Dark is a safe space for adult conversations. All chats are anonymous. 
              By entering, you confirm you are 18+ and agree to respect all members.
            </p>
            <ul className="text-white/40 text-sm space-y-1.5">
              <li className="flex items-center gap-2"><span className="text-orange-400">·</span> Anonymous identities</li>
              <li className="flex items-center gap-2"><span className="text-orange-400">·</span> Kink-friendly discussions</li>
              <li className="flex items-center gap-2"><span className="text-orange-400">·</span> Safe space - no judgment</li>
              <li className="flex items-center gap-2"><span className="text-orange-400">·</span> Respect boundaries always</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={confirmAge}
              className="lk-btn-primary w-full py-4 bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/20"
              data-testid="afterdark-age-confirm"
            >
              I am 18+ - Enter After Dark
            </button>
            <button
              onClick={() => router.push('/')}
              className="lk-btn-ghost w-full py-3"
              data-testid="afterdark-go-back"
            >
              Take me back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col page-enter" data-testid="afterdark-page">
      <header className="lk-page-header flex items-center justify-between border-b border-orange-500/10" data-testid="afterdark-header">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedRoom ? setSelectedRoom(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="afterdark-back">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <Moon className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-heading font-semibold text-white">
              {selectedRoom ? selectedRoom.name : 'After Dark'}
            </h1>
            {selectedRoom && (
              <p className="text-orange-400/60 text-xs">Anonymous Chat · {selectedRoom.category}</p>
            )}
          </div>
        </div>
        {!selectedRoom && (
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/15 transition-colors"
            data-testid="afterdark-create-room"
          >
            <Plus className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
          </button>
        )}
      </header>

      {!selectedRoom ? (
        // Rooms List
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-5 px-1">
            <Shield className="w-4 h-4 text-orange-400/60" strokeWidth={1.5} />
            <p className="text-white/30 text-sm">All chats are anonymous. Your identity is protected.</p>
          </div>

          {rooms.length === 0 ? (
            <div className="lk-card-elevated rounded-2xl p-8 text-center" data-testid="afterdark-empty">
              <Moon className="w-12 h-12 mx-auto mb-4 text-orange-500/20" strokeWidth={1.5} />
              <p className="text-white/40">No rooms yet</p>
              <p className="text-white/25 text-sm mt-1">Create the first After Dark room!</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="lk-btn-primary mt-5 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/20"
                data-testid="afterdark-create-first-room"
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
                    className="w-full p-5 rounded-2xl bg-[#12121A] border border-orange-500/10 text-left hover:bg-[#1A1A24] hover:-translate-y-0.5 transition-all duration-300 group"
                    data-testid={`afterdark-room-${room.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/15 group-hover:border-orange-500/25 transition-colors">
                        <CategoryIcon className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-heading font-medium">{room.name}</h3>
                        <p className="text-white/30 text-sm mt-0.5">{room.description || 'Anonymous chat room'}</p>
                        <span className="text-orange-400/60 text-xs mt-1.5 inline-block">
                          {categories.find(c => c.id === room.category)?.name || 'General'}
                        </span>
                      </div>
                      <Users className="w-4 h-4 text-white/15" strokeWidth={1.5} />
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="afterdark-chat">
            <div className="text-center py-2.5 px-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-4">
              <p className="text-orange-400/60 text-xs">You appear as: Anonymous {user.id.substring(0, 4)}</p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center text-white/30 mt-8">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.senderId === user.id
                        ? 'bg-orange-500/15 text-white border border-orange-500/15'
                        : 'bg-[#12121A] text-white/80 border border-white/5'
                    }`}
                  >
                    <p className="text-xs font-medium text-white/30 mb-1">{msg.senderName}</p>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] mt-1 text-white/20">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-[#12121A]/90 backdrop-blur-xl" data-testid="afterdark-input">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type anonymously..."
                className="lk-input flex-1"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-xl bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors disabled:opacity-30 border border-orange-500/15"
              >
                <Send className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        </>
      )}

      {/* Create Room Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowCreate(false)} data-testid="create-room-modal">
          <div className="glass-card rounded-3xl p-8 max-w-sm mx-auto w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-heading font-semibold mb-6">Create After Dark Room</h2>
            <form onSubmit={createRoom} className="space-y-5">
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="Room name"
                className="lk-input w-full"
                required
              />
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Description (optional)"
                className="lk-input w-full resize-none h-20"
              />
              <div>
                <label className="lk-label block mb-2">Category</label>
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewRoom({ ...newRoom, category: cat.id })}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        newRoom.category === cat.id 
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' 
                          : 'bg-[#1A1A24] text-white/40 border border-white/5'
                      }`}
                    >
                      <cat.icon className="w-3 h-3" strokeWidth={1.5} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="lk-btn-ghost flex-1 py-3">Cancel</button>
                <button type="submit" className="lk-btn-primary flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/20">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
