'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Send, User, LogOut } from 'lucide-react'

export default function LoungePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [lounges, setLounges] = useState([])
  const [selectedLounge, setSelectedLounge] = useState(null)
  const [loungeDetails, setLoungeDetails] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newLoungeName, setNewLoungeName] = useState('')
  const [newLoungeDesc, setNewLoungeDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchLounges()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

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
    setLoading(false)
  }

  const createLounge = async (e) => {
    e.preventDefault()
    if (!newLoungeName.trim()) return

    try {
      const res = await fetch('/api/lounges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLoungeName.trim(),
          description: newLoungeDesc.trim(),
          creatorId: user.id,
          isAfterDark: false
        })
      })
      if (res.ok) {
        setNewLoungeName('')
        setNewLoungeDesc('')
        setShowCreate(false)
        fetchLounges()
      }
    } catch (err) {
      console.error('Failed to create lounge')
    }
  }

  const joinLounge = async (loungeId) => {
    try {
      await fetch(`/api/lounges/${loungeId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      fetchLounges()
      loadLounge(loungeId)
    } catch (err) {
      console.error('Failed to join lounge')
    }
  }

  const leaveLounge = async () => {
    if (!selectedLounge) return
    try {
      await fetch(`/api/lounges/${selectedLounge}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      setSelectedLounge(null)
      setLoungeDetails(null)
      setMessages([])
      fetchLounges()
    } catch (err) {
      console.error('Failed to leave lounge')
    }
  }

  const loadLounge = async (loungeId) => {
    setSelectedLounge(loungeId)
    try {
      const [detailsRes, msgsRes] = await Promise.all([
        fetch(`/api/lounges/${loungeId}`),
        fetch(`/api/lounges/${loungeId}/messages`)
      ])
      if (detailsRes.ok) {
        const details = await detailsRes.json()
        setLoungeDetails(details)
      }
      if (msgsRes.ok) {
        const msgs = await msgsRes.json()
        setMessages(msgs)
      }
    } catch (err) {
      console.error('Failed to load lounge')
    }

    // Poll for new messages
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/lounges/${loungeId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    }, 3000)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedLounge) return

    try {
      const res = await fetch(`/api/lounges/${selectedLounge}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.displayName,
          content: newMessage.trim()
        })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages([...messages, msg])
        setNewMessage('')
      }
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isMember = loungeDetails?.members?.includes(user?.id)

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
          <button onClick={() => selectedLounge ? setSelectedLounge(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">
            {selectedLounge && loungeDetails ? loungeDetails.name : 'Lounge'}
          </h1>
        </div>
        {selectedLounge && isMember && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMembers(true)} className="p-2 rounded-full hover:bg-white/10">
              <Users className="w-5 h-5 text-gray-300" />
            </button>
            <button onClick={leaveLounge} className="p-2 rounded-full hover:bg-white/10">
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}
      </header>

      {!selectedLounge ? (
        // Lounges List
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Lounge
          </button>

          {lounges.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No lounges yet</p>
              <p className="text-sm">Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lounges.map((lounge) => (
                <button
                  key={lounge.id}
                  onClick={() => loadLounge(lounge.id)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{lounge.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{lounge.description || 'No description'}</p>
                    </div>
                    <span className="text-gray-500 text-xs">{lounge.members?.length || 0} members</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : isMember ? (
        // Lounge Chat
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <p>No messages yet. Say hi!</p>
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
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-black/60' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

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
        // Join Lounge View
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Users className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl text-white font-semibold mb-2">{loungeDetails?.name}</h2>
          <p className="text-gray-400 text-center mb-6">{loungeDetails?.description || 'Join this lounge to start chatting!'}</p>
          <p className="text-gray-500 text-sm mb-4">{loungeDetails?.members?.length || 0} members</p>
          <button
            onClick={() => joinLounge(selectedLounge)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold"
          >
            Join Lounge
          </button>
        </div>
      )}

      {/* Create Lounge Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Lounge</h2>
            <form onSubmit={createLounge} className="space-y-4">
              <input
                type="text"
                value={newLoungeName}
                onChange={(e) => setNewLoungeName(e.target.value)}
                placeholder="Lounge name"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                required
              />
              <textarea
                value={newLoungeDesc}
                onChange={(e) => setNewLoungeDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none h-24"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembers && loungeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowMembers(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm mx-4 w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Members ({loungeDetails.memberDetails?.length || 0})</h2>
            <div className="space-y-3">
              {loungeDetails.memberDetails?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">{member.displayName}</span>
                  {member.id === loungeDetails.creatorId && (
                    <span className="ml-auto text-xs text-amber-400">Creator</span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setShowMembers(false)} className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
