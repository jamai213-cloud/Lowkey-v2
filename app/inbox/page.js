'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, User, MessageSquare, Plus, Search, X } from 'lucide-react'

export default function InboxPage() {
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations/${user.id}`)
      const data = await res.json()
      setConversations(data)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    }
    setLoading(false)
  }

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`)
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setAllUsers(data.filter(u => u.id !== user.id))
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: user.id,
          content: newMessage.trim()
        })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        setNewMessage('')
        fetchConversations() // Refresh to update last message
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
    setSending(false)
  }

  const startNewConversation = async (otherUser) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [user.id, otherUser.id]
        })
      })

      if (res.ok) {
        const conversation = await res.json()
        conversation.otherUser = otherUser
        setConversations([conversation, ...conversations.filter(c => c.id !== conversation.id)])
        setSelectedConversation(conversation)
        setShowNewChat(false)
        setSearchQuery('')
      }
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
  }

  const filteredUsers = allUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-white/5">
        <button
          onClick={() => selectedConversation ? setSelectedConversation(null) : router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white flex-1">
          {selectedConversation ? selectedConversation.otherUser?.displayName || 'Chat' : 'Inbox'}
        </h1>
        {!selectedConversation && (
          <button
            onClick={() => {
              setShowNewChat(true)
              fetchAllUsers()
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        )}
      </header>

      {/* Main Content */}
      {selectedConversation ? (
        // Chat View
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.senderId === user.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'glass text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Conversations List
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No conversations yet</p>
              <button
                onClick={() => {
                  setShowNewChat(true)
                  fetchAllUsers()
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm hover:opacity-90 transition-opacity"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {conv.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">
                      {conv.otherUser?.displayName || 'Unknown User'}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                  {conv.lastMessage && (
                    <div className="text-gray-500 text-xs">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowNewChat(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">New Conversation</h3>
              <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  {searchQuery ? 'No users found' : 'No other users yet'}
                </div>
              ) : (
                filteredUsers.map((otherUser) => (
                  <button
                    key={otherUser.id}
                    onClick={() => startNewConversation(otherUser)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {otherUser.displayName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{otherUser.displayName}</div>
                      <div className="text-gray-400 text-sm">{otherUser.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
