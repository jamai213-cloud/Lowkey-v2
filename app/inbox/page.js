'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, User, MessageSquare, Check, CheckCheck } from 'lucide-react'

function InboxContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConvo, setSelectedConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
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
    fetchConversations(userData.id)

    // Check if conversation ID is in URL
    const convoId = searchParams.get('conversation')
    if (convoId) {
      loadConversation(convoId, userData.id)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const fetchConversations = async (userId) => {
    try {
      const res = await fetch(`/api/conversations/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Failed to fetch conversations')
    }
    setLoading(false)
  }

  const loadConversation = async (convoId, userId) => {
    setSelectedConvo(convoId)
    try {
      const res = await fetch(`/api/messages/${convoId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        // Mark as read
        await fetch(`/api/messages/${convoId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
        fetchConversations(userId)
      }
    } catch (err) {
      console.error('Failed to load messages')
    }

    // Poll for new messages
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/messages/${convoId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    }, 3000)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConvo) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvo,
          senderId: user.id,
          content: newMessage.trim()
        })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages([...messages, msg])
        setNewMessage('')
        fetchConversations(user.id)
      }
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedConversation = conversations.find(c => c.id === selectedConvo)

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
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => selectedConvo ? setSelectedConvo(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">
          {selectedConvo && selectedConversation?.otherUser ? selectedConversation.otherUser.displayName : 'Inbox'}
        </h1>
      </header>

      {!selectedConvo ? (
        // Conversations List
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with friends!</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => loadConversation(convo.id, user.id)}
                className="w-full flex items-center gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{convo.otherUser?.displayName || 'Unknown'}</span>
                    {convo.unreadCount > 0 && (
                      <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        // Chat View
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    msg.senderId === user.id
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${msg.senderId === user.id ? 'text-black/60' : 'text-gray-400'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.senderId === user.id && (msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                  </div>
                </div>
              </div>
            ))}
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
      )}
    </div>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <InboxContent />
    </Suspense>
  )
}
