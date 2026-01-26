'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Send, Copy, Check, MessageSquare, RefreshCw, Clock, AlertCircle } from 'lucide-react'

export default function CommunitiesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '' })
  const [copiedCode, setCopiedCode] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
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
    fetchCommunities(userData.id)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const fetchCommunities = async (userId) => {
    try {
      const res = await fetch(`/api/communities?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setCommunities(data)
      }
    } catch (err) {
      console.error('Failed to fetch communities')
    }
    setLoading(false)
  }

  const createCommunity = async (e) => {
    e.preventDefault()
    if (!newCommunity.name.trim()) return

    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCommunity.name.trim(),
          description: newCommunity.description.trim(),
          adminId: user.id
        })
      })
      if (res.ok) {
        const data = await res.json()
        setNewCommunity({ name: '', description: '' })
        setShowCreate(false)
        fetchCommunities(user.id)
        alert(`Community created!\n\nShare this code: ${data.inviteCode}\n\n⚠️ Code expires in 24 hours`)
      }
    } catch (err) {
      console.error('Failed to create community')
    }
  }

  const joinCommunity = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoinError('')

    try {
      const res = await fetch('/api/communities/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          inviteCode: joinCode.trim()
        })
      })
      const data = await res.json()
      if (res.ok) {
        setJoinCode('')
        setShowJoin(false)
        fetchCommunities(user.id)
      } else {
        setJoinError(data.error || 'Invalid invite code')
      }
    } catch (err) {
      setJoinError('Failed to join community')
    }
  }

  const regenerateCode = async () => {
    if (!selectedCommunity || regenerating) return
    setRegenerating(true)

    try {
      const res = await fetch('/api/communities/regenerate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId: selectedCommunity.id,
          userId: user.id
        })
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedCommunity({ ...selectedCommunity, inviteCode: data.inviteCode, codeExpired: false })
        fetchCommunities(user.id)
        alert(`New code: ${data.inviteCode}\n\n⚠️ Expires in 24 hours`)
      }
    } catch (err) {
      console.error('Failed to regenerate code')
    }
    setRegenerating(false)
  }

  const loadCommunity = async (community) => {
    setSelectedCommunity(community)
    fetchMessages(community.id)
    startPolling(community.id)
  }

  const fetchMessages = async (communityId) => {
    try {
      const res = await fetch(`/api/communities/${communityId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const startPolling = (communityId) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(communityId), 3000)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedCommunity) return

    try {
      const res = await fetch(`/api/communities/${selectedCommunity.id}/messages`, {
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
        fetchMessages(selectedCommunity.id)
      }
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(selectedCommunity.inviteCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
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

  const isAdmin = selectedCommunity?.adminId === user?.id

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => selectedCommunity ? setSelectedCommunity(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {selectedCommunity ? selectedCommunity.name : 'Groups'}
            </h1>
            {selectedCommunity && (
              <p className="text-gray-400 text-xs">{selectedCommunity.members?.length || 0} members</p>
            )}
          </div>
        </div>
        {selectedCommunity && isAdmin && (
          <div className="flex items-center gap-2">
            {selectedCommunity.codeExpired ? (
              <button 
                onClick={regenerateCode}
                disabled={regenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Generating...' : 'New Code'}
              </button>
            ) : (
              <button onClick={copyInviteCode} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : selectedCommunity.inviteCode}
              </button>
            )}
          </div>
        )}
      </header>

      {!selectedCommunity ? (
        // Communities List
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowCreate(true)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" /> Join
            </button>
          </div>

          {/* Info about 24-hour codes */}
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-200 text-xs">Invite codes expire after 24 hours for security. Admins can generate new codes anytime.</p>
            </div>
          </div>

          {communities.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No groups yet</p>
              <p className="text-sm">Create one or join with code!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => loadCommunity(community)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-medium truncate">{community.name}</h3>
                        {community.isAdmin && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex-shrink-0">Admin</span>
                        )}
                        {community.codeExpired && community.isAdmin && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">Code Expired</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">{community.description || 'No description'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Community Chat
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
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
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {msg.senderId !== user.id && (
                      <p className="text-xs font-medium opacity-70 mb-1">{msg.senderName}</p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-black/60' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
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
      )}

      {/* Create Community Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Group</h2>
            <form onSubmit={createCommunity} className="space-y-4">
              <input
                type="text"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                placeholder="Group name"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                required
              />
              <textarea
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none h-24"
              />
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-200 text-xs">An invite code will be generated. It expires in 24 hours - you can regenerate anytime.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Community Modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => { setShowJoin(false); setJoinError('') }}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Join Group</h2>
            <form onSubmit={joinCommunity} className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
                placeholder="Enter invite code"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-center text-xl tracking-widest"
                maxLength={6}
                required
              />
              {joinError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{joinError}</p>
                  </div>
                </div>
              )}
              <p className="text-gray-400 text-xs text-center">Ask the group admin for the invite code</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowJoin(false); setJoinError('') }} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">Join</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
