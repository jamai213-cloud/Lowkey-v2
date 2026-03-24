'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, User, Search, MessageCircle, Clock, Plus, X, ChevronRight } from 'lucide-react'

function InboxContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConvo, setSelectedConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchConversations(userData.id)
  }, [])

  useEffect(() => {
    if (selectedConvo && user) {
      fetchMessages(selectedConvo.id, user.id)
      const interval = setInterval(() => fetchMessages(selectedConvo.id, user.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConvo])

  const fetchConversations = async (userId) => {
    try {
      const res = await fetch(`/api/inbox?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Failed to fetch conversations')
    }
    setLoading(false)
  }

  const fetchMessages = async (convoId, userId) => {
    try {
      const res = await fetch(`/api/inbox/${convoId}/messages?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedConvo) return
    setSending(true)

    try {
      const res = await fetch(`/api/inbox/${selectedConvo.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: newMessage.trim()
        })
      })
      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedConvo.id, user.id)
      }
    } catch (err) {
      console.error('Failed to send message')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-indigo-400/60 font-heading">Loading...</div>
      </div>
    )
  }

  // Chat View
  if (selectedConvo) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col page-enter" data-testid="inbox-chat">
        <header className="lk-page-header flex items-center gap-3" data-testid="inbox-chat-header">
          <button onClick={() => setSelectedConvo(null)} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="inbox-chat-back">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center overflow-hidden border border-white/5">
            {selectedConvo.avatar ? (
              <img src={selectedConvo.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white/30" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h2 className="text-white font-heading font-semibold">{selectedConvo.displayName}</h2>
            <p className="text-white/30 text-xs">Private message</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24" data-testid="inbox-messages">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/30">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === user?.id
              return (
                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`} data-testid={`dm-${msg.id}`}>
                  <div className={`max-w-[75%]`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn 
                        ? 'bg-indigo-500/15 text-white border border-indigo-500/15' 
                        : 'bg-[#12121A] text-white/80 border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-white/20 mt-1 block ${isOwn ? 'text-right' : ''}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#12121A]/90 backdrop-blur-xl border-t border-white/5 p-4" data-testid="dm-input-area">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="lk-input flex-1"
              data-testid="dm-input"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors disabled:opacity-30 border border-indigo-500/15"
              data-testid="dm-send-btn"
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Conversation List
  const filtered = conversations.filter(c => 
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] page-enter" data-testid="inbox-page">
      <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none z-0" />
      
      <header className="lk-page-header flex items-center gap-3" data-testid="inbox-header">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="inbox-back-btn">
          <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-white">Messages</h1>
          <p className="text-white/30 text-xs">{conversations.length} conversations</p>
        </div>
      </header>

      <div className="p-5">
        {/* Search */}
        <div className="relative mb-5" data-testid="inbox-search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="lk-input w-full pl-11"
          />
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="lk-card-elevated rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-indigo-500/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-white/40 text-sm">{searchQuery ? 'No results' : 'No messages yet'}</p>
              <p className="text-white/20 text-xs mt-1">Start chatting with friends</p>
            </div>
          ) : (
            filtered.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className="w-full text-left p-4 rounded-2xl bg-[#12121A] border border-white/5 hover:bg-[#1A1A24] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 group"
                data-testid={`convo-${convo.id}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                  {convo.avatar ? (
                    <img src={convo.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/30" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium text-sm truncate">{convo.displayName}</h3>
                    <span className="text-white/20 text-[10px] flex-shrink-0">
                      {convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs truncate">{convo.lastMessage || 'No messages yet'}</p>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-indigo-400/60 font-heading">Loading...</div>
      </div>
    }>
      <InboxContent />
    </Suspense>
  )
}
