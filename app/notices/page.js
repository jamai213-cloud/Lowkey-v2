'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Check, Clock, Crown, Trash2 } from 'lucide-react'

export default function NoticesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [notices, setNotices] = useState([])
  const [readNotices, setReadNotices] = useState([])
  const [loading, setLoading] = useState(true)

  const isFounder = user?.email?.toLowerCase() === 'kinglowkey@hotmail.com'

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchNotices()
    fetchReadStatus(userData.id)
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices')
      if (res.ok) {
        const data = await res.json()
        setNotices(data)
      }
    } catch (err) {
      console.error('Failed to fetch notices')
    }
    setLoading(false)
  }

  const fetchReadStatus = async (userId) => {
    // Get all reads for this user
    try {
      const res = await fetch('/api/notices')
      if (res.ok) {
        const allNotices = await res.json()
        // Mark all notices as we will check them one by one from server
        // For now we check locally based on what user clicks
      }
    } catch (err) {
      console.error('Failed to fetch read status')
    }
  }

  const markAsRead = async (noticeId) => {
    if (readNotices.includes(noticeId)) return
    
    try {
      await fetch('/api/notices/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, noticeId })
      })
      setReadNotices([...readNotices, noticeId])
    } catch (err) {
      console.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    const unreadNotices = notices.filter(n => !readNotices.includes(n.id))
    for (const notice of unreadNotices) {
      try {
        await fetch('/api/notices/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, noticeId: notice.id })
        })
      } catch (err) {
        console.error('Failed to mark as read')
      }
    }
    setReadNotices(notices.map(n => n.id))
  }

  const deleteNotice = async (noticeId, e) => {
    e.stopPropagation()
    if (!isFounder) return
    
    if (!confirm('Are you sure you want to delete this notice?')) return
    
    try {
      const res = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderId: user.id })
      })
      if (res.ok) {
        setNotices(notices.filter(n => n.id !== noticeId))
      }
    } catch (err) {
      console.error('Failed to delete notice')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  const unreadCount = notices.filter(n => !readNotices.includes(n.id)).length

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Notices</h1>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 rounded-full bg-amber-500 text-black text-xs font-bold">
            {unreadCount} unread
          </span>
        )}
      </header>

      <div className="p-4">
        {/* Info Banner */}
        <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-purple-200 text-xs">Updates and announcements from the Founder. Stay informed about LowKey news and features.</p>
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No notices yet</p>
            <p className="text-sm mt-1">Check back for updates!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(notice => {
              const isRead = readNotices.includes(notice.id)
              
              return (
                <button
                  key={notice.id}
                  onClick={() => markAsRead(notice.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    isRead 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isRead ? 'bg-white/10' : 'bg-amber-500/20'
                    }`}>
                      {isRead ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${isRead ? 'text-gray-300' : 'text-white'}`}>
                        {notice.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 break-words">
                        {notice.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          <Crown className="w-3 h-3" />
                          <span>{notice.postedBy || 'Founder'}</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
