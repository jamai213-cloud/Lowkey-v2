'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Moon, AlertTriangle, Lock, Users, Calendar } from 'lucide-react'

export default function AfterDarkPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [verified, setVerified] = useState(false)
  const [lounges, setLounges] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGate, setShowGate] = useState(false)

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
      fetchContent()
    } else {
      setShowGate(true)
      setLoading(false)
    }
  }, [])

  const fetchContent = async () => {
    try {
      const [loungesRes, eventsRes] = await Promise.all([
        fetch('/api/lounges?afterDark=true'),
        fetch('/api/events?afterDark=true')
      ])
      
      if (loungesRes.ok) {
        const data = await loungesRes.json()
        setLounges(data)
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEvents(data)
      }
    } catch (err) {
      console.error('Failed to fetch content')
    }
    setLoading(false)
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
      fetchContent()
    } catch (err) {
      console.error('Failed to verify age')
    }
  }

  const declineAge = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  // Age Gate
  if (showGate) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
            <Moon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">After Dark</h1>
          <p className="text-gray-400 mb-6">This section contains adult content</p>
          
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold mb-2">Age Verification Required</h2>
            <p className="text-gray-400 text-sm">
              You must be 18 years or older to access this section. By continuing, you confirm that you are of legal age.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={confirmAge}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
            >
              I am 18 or older
            </button>
            <button
              onClick={declineAge}
              className="w-full py-4 rounded-xl bg-white/10 text-gray-300 font-medium"
            >
              Take me back
            </button>
          </div>
          
          <p className="text-gray-500 text-xs mt-6">
            Your age verification status will be saved to your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <Moon className="w-5 h-5 text-purple-400" />
        <h1 className="text-xl font-semibold text-white">After Dark</h1>
      </header>

      <div className="p-4">
        {/* Lounges Section */}
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> After Dark Lounges
          </h2>
          
          {lounges.length === 0 ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
              <p className="text-gray-400">No after dark lounges yet</p>
              <button
                onClick={() => router.push('/lounge')}
                className="mt-2 text-purple-400 text-sm"
              >
                Create one in the Lounge section
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {lounges.map(lounge => (
                <button
                  key={lounge.id}
                  onClick={() => router.push('/lounge')}
                  className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-left hover:bg-purple-500/20 transition-colors"
                >
                  <h3 className="text-white font-medium">{lounge.name}</h3>
                  <p className="text-gray-400 text-sm">{lounge.members?.length || 0} members</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-400" /> After Dark Events
          </h2>
          
          {events.length === 0 ? (
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center">
              <p className="text-gray-400">No after dark events yet</p>
              <button
                onClick={() => router.push('/events')}
                className="mt-2 text-pink-400 text-sm"
              >
                Create one in the Events section
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => router.push('/events')}
                  className="w-full p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-left hover:bg-pink-500/20 transition-colors"
                >
                  <h3 className="text-white font-medium">{event.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
