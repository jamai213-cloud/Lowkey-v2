 'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Users, MessageCircle, Clock, Sparkles, Lock, AlertTriangle, Hash, Flame, Star, TrendingUp, Crown, MessageSquare, ChevronRight, Plus, Heart, Smile, Image as ImageIcon, X, UserPlus, Volume2, VolumeX, Menu, Trash2, Sofa, Search } from 'lucide-react'

function LoungePageContent() {
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
  const [searchQuery, setSearchQuery] = useState('')
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
      const [regRes, adRes] = await Promise.all([
        fetch('/api/lounges'),
        fetch('/api/lounges?afterDark=true')
      ])
      const regular = regRes.ok ? await regRes.json() : []
      const afterDark = adRes.ok ? await adRes.json() : []
      setLounges([...regular, ...afterDark])
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0E15' }}>
        <div className="animate-pulse text-indigo-400/60 font-bold">Loading...</div>
      </div>
    )
  }

  // Lounge Theme System (unified with Home page)
  const getLoungeTheme = (lounge) => {
    const name = (lounge.name || '').toLowerCase()
    if (name.includes('grown folk'))
      return { accent: '#C9A84C', bgFrom: '#1A1608', bgTo: '#12100A', label: 'Grown energy. Real connections. No games.', glow: 'rgba(201,168,76,0.12)', featured: true }
    if (name.includes('lowkey') || name.includes('chill'))
      return { accent: '#8B5CF6', bgFrom: '#14101F', bgTo: '#0F0D18', label: 'Where everyone starts. Real people, real energy.', glow: 'rgba(139,92,246,0.08)' }
    if (name.includes('after dark'))
      return { accent: '#D4A54A', bgFrom: '#15120A', bgTo: '#0F0E08', label: 'No names. No limits. Just energy.', glow: 'rgba(212,165,74,0.08)' }
    if (name.includes('kink'))
      return { accent: '#EF4444', bgFrom: '#1A0F0F', bgTo: '#140C0C', label: 'Push boundaries. Find your people.', glow: 'rgba(239,68,68,0.10)' }
    if (name.includes('vip') || name.includes('exclusive') || name.includes('premium'))
      return { accent: '#D4A54A', bgFrom: '#18150E', bgTo: '#12100C', label: 'Private access. Elevated connections.', glow: 'rgba(212,165,74,0.08)' }
    if (name.includes('night') || name.includes('owl'))
      return { accent: '#F59E0B', bgFrom: '#17130D', bgTo: '#110F0B', label: 'The night is young. Step in.', glow: 'rgba(245,158,11,0.08)' }
    if (name.includes('late') || name.includes('talk'))
      return { accent: '#EF4444', bgFrom: '#1A0F0F', bgTo: '#140C0C', label: 'Deep conversations after midnight.', glow: 'rgba(239,68,68,0.08)' }
    if (name.includes('music'))
      return { accent: '#06B6D4', bgFrom: '#0E1518', bgTo: '#0B1114', label: 'Share your favourite tracks live.', glow: 'rgba(6,182,212,0.08)' }
    return { accent: '#6366F1', bgFrom: '#111118', bgTo: '#0D0D14', label: 'Step in and vibe.', glow: 'rgba(99,102,241,0.08)' }
  }

  const filteredLounges = lounges.filter(l => 
    !searchQuery || l.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeLoungeCount = lounges.filter(l => (l.memberCount || l.members?.length || 0) > 0).length
  const totalOnline = lounges.reduce((sum, l) => sum + (l.memberCount || l.members?.length || 0), 0)

  // Lounge Selection View
  if (showLoungeList) {
    return (
      <div className="min-h-screen page-enter" style={{ background: '#0C0E15' }} data-testid="lounge-list">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none z-0" style={{ background: 'rgba(99,102,241,0.03)' }} />
        <div className="absolute bottom-40 left-0 w-[250px] h-[250px] rounded-full blur-[100px] pointer-events-none z-0" style={{ background: 'rgba(6,182,212,0.02)' }} />
        
        <header className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(12,14,21,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} data-testid="lounge-header">
          <button onClick={() => router.push('/')} className="p-2 rounded-xl hover:bg-white/5 transition-colors" data-testid="lounge-back-btn">
            <ArrowLeft className="w-5 h-5 text-white/40" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Lounges</h1>
            <p className="text-white/25 text-[12px]">Find your vibe</p>
          </div>
        </header>

        {/* Search + Stats */}
        <div className="px-5 pt-4 pb-2 relative z-10">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search lounges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none transition-colors"
              style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.04)' }}
              data-testid="lounge-search-input"
            />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/35 font-medium">{activeLoungeCount} active</span>
            </span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-white/20" strokeWidth={1.5} />
              <span className="text-white/35 font-medium">{totalOnline} people online</span>
            </span>
          </div>
        </div>

        {/* Lounge Cards - Unified Design */}
        <div className="p-5 pt-3 space-y-3 pb-24 relative z-10">
          {filteredLounges.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Sofa className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(99,102,241,0.15)' }} strokeWidth={1.5} />
              <p className="text-white/25 text-sm">No lounges found</p>
            </div>
          ) : (
            filteredLounges.map((lounge) => {
              const theme = getLoungeTheme(lounge)
              const memberCount = lounge.memberCount || lounge.members?.length || 0
              return (
                <button
                  key={lounge.id}
                  onClick={() => enterLounge(lounge.id)}
                  className="w-full text-left rounded-2xl overflow-hidden relative group hover:translate-y-[-1px] transition-all duration-200"
                  style={{ background: `linear-gradient(145deg, ${theme.bgFrom}, ${theme.bgTo})`, border: `1px solid ${theme.accent}12`, boxShadow: `0 4px 20px ${theme.glow}` }}
                  data-testid={`lounge-item-${lounge.id}`}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${theme.accent}80, transparent 60%)` }} />
                  {/* Corner glow */}
                  <div className="absolute top-0 right-0 w-32 h-24 rounded-full blur-[50px]" style={{ background: theme.glow }} />

                  <div className="relative z-10 p-4">
                    {/* Header: Name + Live indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-[15px] truncate flex-1 mr-3">{lounge.name}</h3>
                      {memberCount > 0 && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="w-2 h-2 rounded-full animate-pulse shadow-lg" style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}60` }} />
                          <span className="text-[10px] font-bold tracking-wider" style={{ color: theme.accent }}>LIVE</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-white/30 text-[13px] leading-relaxed mb-3">{lounge.description || theme.label}</p>

                    {/* Footer: User count + Enter CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-white/15" strokeWidth={1.5} />
                        <span className="text-white/30 text-xs font-medium">{memberCount} {memberCount === 1 ? 'person' : 'people'} inside</span>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold group-hover:brightness-125 transition-all" style={{ background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}20` }}>Enter</span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Create Lounge FAB */}
        <button
          className="fixed bottom-6 right-6 z-30 w-13 h-13 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
          style={{ 
            background: '#14171F',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.3)'
          }}
          data-testid="create-lounge-btn"
        >
          <Plus className="w-5 h-5 text-indigo-400" strokeWidth={2} />
        </button>
      </div>
    )
  }

  // Chat View
  return (
    <div className="min-h-screen flex flex-col page-enter" style={{ background: '#0C0E15' }} data-testid="lounge-chat">
      <header className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(12,14,21,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} data-testid="lounge-chat-header">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowLoungeList(true); router.push('/lounge'); }} className="p-2 rounded-xl hover:bg-white/5 transition-colors" data-testid="lounge-chat-back">
            <ArrowLeft className="w-5 h-5 text-white/40" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
              {lounges.find(l => l.id === loungeId)?.name || 'Lounge'}
            </h1>
            <p className="text-white/25 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/[0.06] border border-amber-400/15 hover:border-amber-400/30 transition-colors text-amber-400/70 text-[11px] font-semibold"
            data-testid="take-private-btn"
          >
            <Lock className="w-3 h-3" strokeWidth={2} />
            Go Private
          </button>
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
        <div className="border-b border-white/5 p-4 animate-fade-in" style={{ background: '#111318' }} data-testid="members-panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Members ({members.length})</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/5" style={{ background: '#14171F' }}>
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                  )}
                </div>
                <span className="text-white/40 text-[10px] truncate w-12 text-center">{member.displayName?.split(' ')[0]}</span>
                {member.id !== user?.id && (
                  <button className="text-[8px] text-amber-400/60 hover:text-amber-400 font-semibold transition-colors" data-testid={`tip-member-${member.id}`}>
                    Tip
                  </button>
                )}
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
                <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5" style={{ background: '#14171F' }}>
                  {msg.avatar ? (
                    <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                  )}
                </div>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isOwn ? 'text-indigo-400' : 'text-white/60'}`}>
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
                      ? 'bg-indigo-500/10 text-white border border-indigo-500/10' 
                      : 'text-white/80 border border-white/5'
                  }`} style={!isOwn ? { background: '#14171F' } : {}}>
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
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/5 p-4" style={{ background: 'rgba(12,14,21,0.92)', backdropFilter: 'blur(20px)' }} data-testid="message-input-area">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
            style={{ background: '#14171F', border: '1px solid rgba(255,255,255,0.04)' }}
            data-testid="message-input"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-30 border border-indigo-500/10"
            data-testid="send-message-btn"
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  )
}


export default function LoungePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0C0E15' }} />}>
      <LoungePageContent />
    </Suspense>
  )
}
