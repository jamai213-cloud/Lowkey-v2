'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Users, Check, X } from 'lucide-react'

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    isOnline: false
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (err) {
      console.error('Failed to fetch events')
    }
    setLoading(false)
  }

  const createEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date) return

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          date: new Date(`${newEvent.date}T${newEvent.time || '12:00'}`),
          location: newEvent.isOnline ? 'Online' : newEvent.location,
          description: newEvent.description,
          creatorId: user.id,
          isOnline: newEvent.isOnline
        })
      })
      if (res.ok) {
        setShowCreate(false)
        setNewEvent({ title: '', date: '', time: '', location: '', description: '', isOnline: false })
        fetchEvents()
      }
    } catch (err) {
      console.error('Failed to create event')
    }
  }

  const rsvp = async (eventId, status) => {
    try {
      await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status })
      })
      fetchEvents()
    } catch (err) {
      console.error('Failed to RSVP')
    }
  }

  const getUserRsvp = (event) => {
    return event.rsvps?.find(r => r.userId === user?.id)?.status
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
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Events</h1>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30"
        >
          <Plus className="w-5 h-5 text-amber-400" />
        </button>
      </header>

      <div className="p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No events yet</p>
            <p className="text-sm mt-1">Create one to get started!</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => {
              const userRsvp = getUserRsvp(event)
              const yesCount = event.rsvps?.filter(r => r.status === 'yes').length || 0
              
              return (
                <div key={event.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location || 'TBD'}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-gray-300 text-sm mt-2">{event.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" /> {yesCount} attending
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => rsvp(event.id, userRsvp === 'yes' ? 'none' : 'yes')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          userRsvp === 'yes' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <Check className="w-4 h-4" /> Going
                      </button>
                      <button
                        onClick={() => rsvp(event.id, userRsvp === 'no' ? 'none' : 'no')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          userRsvp === 'no' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <X className="w-4 h-4" /> Can't
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md mx-4 w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-semibold mb-4">Create Event</h2>
            <form onSubmit={createEvent} className="space-y-4">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                required
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, isOnline: !newEvent.isOnline })}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    newEvent.isOnline ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  Online Event
                </button>
              </div>
              
              {!newEvent.isOnline && (
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              )}
              
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
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
    </div>
  )
}
