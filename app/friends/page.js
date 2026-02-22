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
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => selectedConvo ? setSelectedConvo(null) : router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        {selectedConvo && selectedConversation?.otherUser ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {selectedConversation.otherUser.avatar ? (
                <img src={selectedConversation.otherUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <h1 className="text-xl font-semibold text-white">{selectedConversation.otherUser.displayName}</h1>
          </div>
        ) : (
          <h1 className="text-xl font-semibold text-white">Inbox</h1>
        )}
      </header>

      {!selectedConvo ? (
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {convo.otherUser?.avatar ? (
                    <img src={convo.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
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
```

---

## FILE 2: `app/friends/page.js`
Action: file_editor create /tmp/friends_page.js --file-text "'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, UserPlus, UserMinus, MessageSquare, X, Crown, Check, Sparkles, Image, Heart, ChevronLeft, ChevronRight } from 'lucide-react'

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchFriends(userData.id)
  }, [])

  const fetchFriends = async (userId) => {
    try {
      const res = await fetch(`/api/friends/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFriends(data)
      }
    } catch (err) {
      console.error('Failed to fetch friends')
    }
    setLoading(false)
  }

  const removeFriend = async (friendId) => {
    if (!confirm('Remove this friend?')) return
    try {
      await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      setShowProfileModal(false)
      fetchFriends(user.id)
    } catch (err) {
      console.error('Failed to remove friend')
    }
  }

  const startDM = async (friendId) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [user.id, friendId] })
      })
      if (res.ok) {
        const convo = await res.json()
        router.push(`/inbox?conversation=${convo.id}`)
      }
    } catch (err) {
      console.error('Failed to create conversation')
    }
  }

  const viewProfile = async (friendId) => {
    try {
      const res = await fetch(`/api/profile/${friendId}?viewerId=${user.id}`)
      if (res.ok) {
        const profileData = await res.json()
        setSelectedFriend(profileData)
        setShowProfileModal(true)
      }
    } catch (err) {
      console.error('Failed to load profile')
    }
  }

  if (loading) {
    return (
      <div className=\"min-h-screen bg-[#0a0a0f] flex items-center justify-center\">
        <div className=\"animate-pulse text-white\">Loading...</div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-[#0a0a0f]\">
      <header className=\"flex items-center justify-between p-4 border-b border-white/10\">
        <div className=\"flex items-center gap-3\">
          <button onClick={() => router.push('/')} className=\"p-2 rounded-full hover:bg-white/10\">
            <ArrowLeft className=\"w-5 h-5 text-white\" />
          </button>
          <h1 className=\"text-xl font-semibold text-white\">Friends</h1>
        </div>
        <button onClick={() => router.push('/search')} className=\"p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30\">
          <UserPlus className=\"w-5 h-5 text-amber-400\" />
        </button>
      </header>

      <div className=\"p-4\">
        {friends.length === 0 ? (
          <div className=\"flex flex-col items-center justify-center h-64 text-gray-400\">
            <User className=\"w-16 h-16 mb-4 opacity-50\" />
            <p className=\"text-lg\">No friends yet</p>
            <p className=\"text-sm mt-1\">Search for people to add as friends!</p>
            <button onClick={() => router.push('/search')} className=\"mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold\">
              Find Friends
            </button>
          </div>
        ) : (
          <div className=\"space-y-3\">
            {friends.map(friend => (
              <div key={friend.id} onClick={() => viewProfile(friend.id)} className=\"flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors\">
                <div className=\"w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 overflow-hidden\">
                  {(friend.avatar || friend.profilePicture) ? (
                    <img src={friend.avatar || friend.profilePicture} alt=\"\" className=\"w-full h-full object-cover\" />
                  ) : (
                    <div className=\"w-full h-full flex items-center justify-center\">
                      <User className=\"w-7 h-7 text-white\" />
                    </div>
                  )}
                </div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"flex items-center gap-2\">
                    <h3 className=\"text-white font-medium truncate\">{friend.displayName}</h3>
                    {friend.isFounder && <Crown className=\"w-4 h-4 text-amber-400 flex-shrink-0\" />}
                    {friend.verified && <Check className=\"w-4 h-4 text-green-400 flex-shrink-0\" />}
                    {friend.isCreator && <Sparkles className=\"w-4 h-4 text-pink-400 flex-shrink-0\" />}
                  </div>
                  <p className=\"text-gray-400 text-sm truncate\">{friend.bio || 'Tap to view profile'}</p>
                </div>
                <div className=\"flex gap-2 flex-shrink-0\" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startDM(friend.id)} className=\"p-2 rounded-full bg-white/10 hover:bg-amber-500/30\">
                    <MessageSquare className=\"w-5 h-5 text-amber-400\" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProfileModal && selectedFriend && (
        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4\" onClick={() => setShowProfileModal(false)}>
          <div className=\"bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto\" onClick={e => e.stopPropagation()}>
            <div className=\"relative\">
              <div className=\"h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30\" />
              <button onClick={() => setShowProfileModal(false)} className=\"absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white\">
                <X className=\"w-5 h-5\" />
              </button>
              <div className=\"absolute -bottom-12 left-4\">
                <div className=\"w-24 h-24 rounded-full border-4 border-[#1a1a2e] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500\">
                  {(selectedFriend.avatar || selectedFriend.profilePicture) ? (
                    <img src={selectedFriend.avatar || selectedFriend.profilePicture} alt=\"\" className=\"w-full h-full object-cover\" />
                  ) : (
                    <div className=\"w-full h-full flex items-center justify-center\">
                      <User className=\"w-10 h-10 text-white\" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className=\"pt-14 px-4 pb-4\">
              <div className=\"flex items-center gap-2 mb-1\">
                <h2 className=\"text-xl font-bold text-white\">{selectedFriend.displayName}</h2>
                {selectedFriend.isFounder && <Crown className=\"w-5 h-5 text-amber-400\" />}
                {selectedFriend.verified && <Check className=\"w-5 h-5 text-green-400\" />}
                {selectedFriend.isCreator && <span className=\"text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400\">Creator</span>}
              </div>

              {(selectedFriend.aboutMe || selectedFriend.bio) && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">About Me</h3>
                  <p className=\"text-gray-400 text-sm\">{selectedFriend.aboutMe || selectedFriend.bio}</p>
                </div>
              )}

              <div className=\"mt-4 grid grid-cols-3 gap-2\">
                {selectedFriend.age && (
                  <div className=\"p-2 rounded-lg bg-white/5 text-center\">
                    <p className=\"text-white font-bold text-sm\">{selectedFriend.age}</p>
                    <p className=\"text-gray-400 text-xs\">Age</p>
                  </div>
                )}
                {selectedFriend.location && (
                  <div className=\"p-2 rounded-lg bg-white/5 text-center\">
                    <p className=\"text-white font-bold text-sm truncate\">{selectedFriend.location}</p>
                    <p className=\"text-gray-400 text-xs\">Location</p>
                  </div>
                )}
                {selectedFriend.gender && (
                  <div className=\"p-2 rounded-lg bg-white/5 text-center\">
                    <p className=\"text-white font-bold text-sm truncate\">{selectedFriend.gender}</p>
                    <p className=\"text-gray-400 text-xs\">Gender</p>
                  </div>
                )}
              </div>

              {selectedFriend.lookingFor && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Looking For</h3>
                  <p className=\"text-gray-400 text-sm\">{selectedFriend.lookingFor}</p>
                </div>
              )}

              {(selectedFriend.relationshipStatus || selectedFriend.sexuality) && (
                <div className=\"mt-4 grid grid-cols-2 gap-2\">
                  {selectedFriend.relationshipStatus && (
                    <div className=\"p-2 rounded-lg bg-white/5\">
                      <p className=\"text-gray-400 text-xs\">Status</p>
                      <p className=\"text-white text-sm\">{selectedFriend.relationshipStatus}</p>
                    </div>
                  )}
                  {selectedFriend.sexuality && (
                    <div className=\"p-2 rounded-lg bg-white/5\">
                      <p className=\"text-gray-400 text-xs\">Sexuality</p>
                      <p className=\"text-white text-sm\">{selectedFriend.sexuality}</p>
                    </div>
                  )}
                </div>
              )}

              {(selectedFriend.height || selectedFriend.bodyType || selectedFriend.eyeColor || selectedFriend.hairColor || selectedFriend.ethnicity) && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Physical</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.height && <span className=\"px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs\">{selectedFriend.height}</span>}
                    {selectedFriend.bodyType && <span className=\"px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs\">{selectedFriend.bodyType}</span>}
                    {selectedFriend.eyeColor && <span className=\"px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs\">{selectedFriend.eyeColor} eyes</span>}
                    {selectedFriend.hairColor && <span className=\"px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs\">{selectedFriend.hairColor} hair</span>}
                    {selectedFriend.ethnicity && <span className=\"px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs\">{selectedFriend.ethnicity}</span>}
                  </div>
                </div>
              )}

              {(selectedFriend.smoking || selectedFriend.drinking) && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Lifestyle</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.smoking && <span className=\"px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs\">{selectedFriend.smoking}</span>}
                    {selectedFriend.drinking && <span className=\"px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs\">{selectedFriend.drinking}</span>}
                  </div>
                </div>
              )}

              {selectedFriend.interestedIn && selectedFriend.interestedIn.length > 0 && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Interested In</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.interestedIn.map((item, i) => (
                      <span key={i} className=\"px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs\">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFriend.openTo && selectedFriend.openTo.length > 0 && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Open To</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.openTo.map((item, i) => (
                      <span key={i} className=\"px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs\">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className=\"flex gap-4 mt-4 text-center\">
                <div className=\"flex-1 p-3 rounded-xl bg-white/5\">
                  <p className=\"text-white font-bold\">{selectedFriend.friends?.length || 0}</p>
                  <p className=\"text-gray-400 text-xs\">Friends</p>
                </div>
                <div className=\"flex-1 p-3 rounded-xl bg-white/5\">
                  <p className=\"text-white font-bold\">{selectedFriend.galleryCount || 0}</p>
                  <p className=\"text-gray-400 text-xs\">Photos</p>
                </div>
              </div>
              
              {selectedFriend.kinks && selectedFriend.kinks.length > 0 && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Kinks & Preferences</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.kinks.map((kink, i) => (
                      <span key={i} className=\"px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs\">{kink}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFriend.kinksHard && selectedFriend.kinksHard.length > 0 && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Hard Limits</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {selectedFriend.kinksHard.map((kink, i) => (
                      <span key={i} className=\"px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs\">{kink}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFriend.gallery && selectedFriend.gallery.length > 0 && (
                <div className=\"mt-4\">
                  <h3 className=\"text-white font-medium mb-2 text-sm\">Gallery</h3>
                  <div className=\"grid grid-cols-3 gap-1\">
                    {selectedFriend.gallery.slice(0, 6).map((img, i) => (
                      <div key={i} className=\"aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:opacity-80 transition-opacity\" onClick={() => { setLightboxImage(img); setLightboxIndex(i); }}>
                        <img src={img.imageData || img.url} alt=\"\" className=\"w-full h-full object-cover\" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className=\"flex gap-2 mt-4\">
                <button onClick={() => startDM(selectedFriend.id)} className=\"flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold flex items-center justify-center gap-2\">
                  <MessageSquare className=\"w-5 h-5\" /> Message
                </button>
                <button onClick={() => removeFriend(selectedFriend.id)} className=\"px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold\">
                  <UserMinus className=\"w-5 h-5\" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && selectedFriend?.gallery && (
        <div className=\"fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm\" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className=\"absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20\">
            <X className=\"w-6 h-6\" />
          </button>
          {selectedFriend.gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); const newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : selectedFriend.gallery.length - 1; setLightboxIndex(newIndex); setLightboxImage(selectedFriend.gallery[newIndex]); }} className=\"absolute left-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20\">
                <ChevronLeft className=\"w-6 h-6\" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); const newIndex = lightboxIndex < selectedFriend.gallery.length - 1 ? lightboxIndex + 1 : 0; setLightboxIndex(newIndex); setLightboxImage(selectedFriend.gallery[newIndex]); }} className=\"absolute right-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20\">
                <ChevronRight className=\"w-6 h-6\" />
              </button>
            </>
          )}
          <div className=\"max-w-[90vw] max-h-[85vh] flex items-center justify-center\" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.imageData || lightboxImage.url} alt=\"\" className=\"max-w-full max-h-[85vh] object-contain rounded-lg\" />
          </div>
          <div className=\"absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full\">
            {lightboxIndex + 1} / {selectedFriend.gallery.length}
          </div>
        </div>
      )}
    </div>
  )
}
"
Observation: Create successful: /tmp/friends_page.js

Action: $ cat /tmp/friends_page.js
Observation: 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, UserPlus, UserMinus, MessageSquare, X, Crown, Check, Sparkles, Image, Heart, ChevronLeft, ChevronRight } from 'lucide-react'

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchFriends(userData.id)
  }, [])

  const fetchFriends = async (userId) => {
    try {
      const res = await fetch(`/api/friends/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFriends(data)
      }
    } catch (err) {
      console.error('Failed to fetch friends')
    }
    setLoading(false)
  }

  const removeFriend = async (friendId) => {
    if (!confirm('Remove this friend?')) return
    try {
      await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendId })
      })
      setShowProfileModal(false)
      fetchFriends(user.id)
    } catch (err) {
      console.error('Failed to remove friend')
    }
  }

  const startDM = async (friendId) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [user.id, friendId] })
      })
      if (res.ok) {
        const convo = await res.json()
        router.push(`/inbox?conversation=${convo.id}`)
      }
    } catch (err) {
      console.error('Failed to create conversation')
    }
  }

  const viewProfile = async (friendId) => {
    try {
      const res = await fetch(`/api/profile/${friendId}?viewerId=${user.id}`)
      if (res.ok) {
        const profileData = await res.json()
        setSelectedFriend(profileData)
        setShowProfileModal(true)
      }
    } catch (err) {
      console.error('Failed to load profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Friends</h1>
        </div>
        <button onClick={() => router.push('/search')} className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30">
          <UserPlus className="w-5 h-5 text-amber-400" />
        </button>
      </header>

      <div className="p-4">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No friends yet</p>
            <p className="text-sm mt-1">Search for people to add as friends!</p>
            <button onClick={() => router.push('/search')} className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold">
              Find Friends
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} onClick={() => viewProfile(friend.id)} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 overflow-hidden">
                  {(friend.avatar || friend.profilePicture) ? (
                    <img src={friend.avatar || friend.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{friend.displayName}</h3>
                    {friend.isFounder && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {friend.verified && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    {friend.isCreator && <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{friend.bio || 'Tap to view profile'}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startDM(friend.id)} className="p-2 rounded-full bg-white/10 hover:bg-amber-500/30">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProfileModal && selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <div className="h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
              <button onClick={() => setShowProfileModal(false)} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-12 left-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#1a1a2e] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                  {(selectedFriend.avatar || selectedFriend.profilePicture) ? (
                    <img src={selectedFriend.avatar || selectedFriend.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-14 px-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{selectedFriend.displayName}</h2>
                {selectedFriend.isFounder && <Crown className="w-5 h-5 text-amber-400" />}
                {selectedFriend.verified && <Check className="w-5 h-5 text-green-400" />}
                {selectedFriend.isCreator && <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">Creator</span>}
              </div>

              {(selectedFriend.aboutMe || selectedFriend.bio) && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">About Me</h3>
                  <p className="text-gray-400 text-sm">{selectedFriend.aboutMe || selectedFriend.bio}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {selectedFriend.age && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm">{selectedFriend.age}</p>
                    <p className="text-gray-400 text-xs">Age</p>
                  </div>
                )}
                {selectedFriend.location && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm truncate">{selectedFriend.location}</p>
                    <p className="text-gray-400 text-xs">Location</p>
                  </div>
                )}
                {selectedFriend.gender && (
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-white font-bold text-sm truncate">{selectedFriend.gender}</p>
                    <p className="text-gray-400 text-xs">Gender</p>
                  </div>
                )}
              </div>

              {selectedFriend.lookingFor && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Looking For</h3>
                  <p className="text-gray-400 text-sm">{selectedFriend.lookingFor}</p>
                </div>
              )}

              {(selectedFriend.relationshipStatus || selectedFriend.sexuality) && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {selectedFriend.relationshipStatus && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-xs">Status</p>
                      <p className="text-white text-sm">{selectedFriend.relationshipStatus}</p>
                    </div>
                  )}
                  {selectedFriend.sexuality && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-xs">Sexuality</p>
                      <p className="text-white text-sm">{selectedFriend.sexuality}</p>
                    </div>
                  )}
                </div>
              )}

              {(selectedFriend.height || selectedFriend.bodyType || selectedFriend.eyeColor || selectedFriend.hairColor || selectedFriend.ethnicity) && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Physical</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.height && <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedFriend.height}</span>}
                    {selectedFriend.bodyType && <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">{selectedFriend.bodyType}</span>}
                    {selectedFriend.eyeColor && <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">{selectedFriend.eyeColor} eyes</span>}
                    {selectedFriend.hairColor && <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">{selectedFriend.hairColor} hair</span>}
                    {selectedFriend.ethnicity && <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">{selectedFriend.ethnicity}</span>}
                  </div>
                </div>
              )}

              {(selectedFriend.smoking || selectedFriend.drinking) && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Lifestyle</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.smoking && <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">{selectedFriend.smoking}</span>}
                    {selectedFriend.drinking && <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">{selectedFriend.drinking}</span>}
                  </div>
                </div>
              )}

              {selectedFriend.interestedIn && selectedFriend.interestedIn.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Interested In</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.interestedIn.map((item, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFriend.openTo && selectedFriend.openTo.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Open To</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.openTo.map((item, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-4 text-center">
                <div className="flex-1 p-3 rounded-xl bg-white/5">
                  <p className="text-white font-bold">{selectedFriend.friends?.length || 0}</p>
                  <p className="text-gray-400 text-xs">Friends</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/5">
                  <p className="text-white font-bold">{selectedFriend.galleryCount || 0}</p>
                  <p className="text-gray-400 text-xs">Photos</p>
                </div>
              </div>
              
              {selectedFriend.kinks && selectedFriend.kinks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Kinks & Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.kinks.map((kink, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs">{kink}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFriend.kinksHard && selectedFriend.kinksHard.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Hard Limits</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.kinksHard.map((kink, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">{kink}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFriend.gallery && selectedFriend.gallery.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 text-sm">Gallery</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {selectedFriend.gallery.slice(0, 6).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setLightboxImage(img); setLightboxIndex(i); }}>
                        <img src={img.imageData || img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => startDM(selectedFriend.id)} className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-semibold flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Message
                </button>
                <button onClick={() => removeFriend(selectedFriend.id)} className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold">
                  <UserMinus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && selectedFriend?.gallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          {selectedFriend.gallery.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); const newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : selectedFriend.gallery.length - 1; setLightboxIndex(newIndex); setLightboxImage(selectedFriend.gallery[newIndex]); }} className="absolute left-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); const newIndex = lightboxIndex < selectedFriend.gallery.length - 1 ? lightboxIndex + 1 : 0; setLightboxIndex(newIndex); setLightboxImage(selectedFriend.gallery[newIndex]); }} className="absolute right-4 p-3 rounded-full bg-white/10 text-white z-10 hover:bg-white/20">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.imageData || lightboxImage.url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
          <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {selectedFriend.gallery.length}
          </div>
        </div>
      )}
    </div>
  )
}
