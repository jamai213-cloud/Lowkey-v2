 'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Users, MessageCircle, Clock, Sparkles, Lock, AlertTriangle, Hash, Flame, Star, TrendingUp, Crown, MessageSquare, ChevronRight, Plus, Heart, Smile, Image as ImageIcon, X, UserPlus, Volume2, VolumeX, Menu, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoungePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loungeId = searchParams?.get('id') || 'main'
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [members, setMembers] = useState([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [lounges, setLounges] = useState([])
  const [showLoungeList, setShowLoungeList] = useState(!searchParams?.get('id'))
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  
  const isFounder = user?.email?.toLowerCase() === 'kinglowkey@hotmail.com'

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchLounges()
    if (searchParams?.get('id')) {
      fetchMessages(loungeId, userData.id)
    } else {
      setLoading(false)
    }
  }, [loungeId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!searchParams?.get('id')) return
    const interval = setInterval(() => {
      if (user) fetchMessages(loungeId, user.id)
    }, 5000)
    return () => clearInterval(interval)
  }, [loungeId, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchLounges = async () => {
    try {
      const res = await fetch('/api/lounges')
      if (res.ok) {
        const data = await res.json()
        setLounges(data)
      }
    } catch (err) {
      console.error('Failed to fetch lounges')
    }
  }

  const fetchMessages = async (lid, userId) => {
    try {
      const res = await fetch(`/api/lounges/${lid}/messages?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setOnlineCount(data.onlineCount || 0)
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    }
    setLoading(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    setSending(true)

    try {
      const res = await fetch(`/api/lounges/${loungeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          displayName: user.displayName,
          content: newMessage.trim(),
          avatar: user.avatar || user.profilePicture
        })
      })
      if (res.ok) {
        setNewMessage('')
        fetchMessages(loungeId, user.id)
      }
    } catch (err) {
      console.error('Failed to send message')
    }
    setSending(false)
  }

  const deleteMessage = async (messageId) => {
    if (!isFounder) return
    try {
      const res = await fetch(`/api/lounges/${loungeId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id })
      })
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== messageId))
      }
    } catch (err) {
      console.error('Failed to delete message')
    }
  }

  const enterLounge = (lid) => {
    setShowLoungeList(false)
    router.push(`/lounge?id=${lid}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-cyan-400/60 font-heading">Loading...</div>
      </div>
    )
  }

  // Lounge Selection View
  if (showLoungeList) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] page-enter" data-testid="lounge-list">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none z-0" />
        
        <header className="lk-page-header flex items-center gap-3" data-testid="lounge-header">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="lounge-back-btn">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-white">Lounges</h1>
            <p className="text-white/30 text-xs">Choose a room to join</p>
          </div>
        </header>

        <div className="p-5 space-y-3">
          {lounges.length === 0 ? (
            <div className="lk-card-elevated rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-cyan-500/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-white/40">No lounges available yet</p>
            </div>
          ) : (
            lounges.map((lounge) => (
              <button
                key={lounge.id}
                onClick={() => enterLounge(lounge.id)}
                className="w-full text-left p-5 rounded-2xl bg-[#12121A] border border-white/5 hover:bg-[#1A1A24] hover:-translate-y-0.5 transition-all duration-300 group"
                data-testid={`lounge-item-${lounge.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/15 group-hover:border-cyan-500/30 transition-colors">
                    <Hash className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-heading font-semibold truncate">{lounge.name}</h3>
                    <p className="text-white/30 text-sm truncate">{lounge.description || 'Open conversation space'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-400/60 text-xs shrink-0">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{lounge.memberCount || 0}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  // Chat View
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col page-enter" data-testid="lounge-chat">
      <header className="lk-page-header flex items-center justify-between" data-testid="lounge-chat-header">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowLoungeList(true); router.push('/lounge'); }} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="lounge-chat-back">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
              {lounges.find(l => l.id === loungeId)?.name || 'Lounge'}
            </h1>
            <p className="text-white/30 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {onlineCount} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="show-members-btn"
          >
            <Users className="w-4 h-4 text-white/40" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Members Panel */}
      {showMembers && (
        <div className="bg-[#12121A] border-b border-white/5 p-4 animate-fade-in" data-testid="members-panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="lk-label text-cyan-400">Members ({members.length})</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center overflow-hidden border border-white/5">
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                  )}
                </div>
                <span className="text-white/40 text-[10px] truncate w-12 text-center">{member.displayName?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        data-testid="messages-container"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/30">
            <MessageCircle className="w-12 h-12 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userId === user?.id
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`} data-testid={`message-${msg.id}`}>
                <div className="w-9 h-9 rounded-full bg-[#1A1A24] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                  )}
                </div>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isOwn ? 'text-cyan-400' : 'text-white/60'}`}>
                      {msg.displayName || 'User'}
                    </span>
                    <span className="text-white/15 text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isFounder && !isOwn && (
                      <button onClick={() => deleteMessage(msg.id)} className="text-white/15 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isOwn 
                      ? 'bg-cyan-500/15 text-white border border-cyan-500/15' 
                      : 'bg-[#12121A] text-white/80 border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#12121A]/90 backdrop-blur-xl border-t border-white/5 p-4" data-testid="message-input-area">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="lk-input flex-1"
            data-testid="message-input"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors disabled:opacity-30 border border-cyan-500/15"
            data-testid="send-message-btn"
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  )
}
