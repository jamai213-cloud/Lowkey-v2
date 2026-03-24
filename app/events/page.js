'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Users, Check, X, Trash2 } from 'lucide-react'

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
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

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    setDeleting(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      if (res.ok) {
        fetchEvents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete event')
      }
    } catch (err) {
      console.error('Failed to delete event')
    }
    setDeleting(null)
  }

  const getUserRsvp = (event) => {
    return event.rsvps?.find(r => r.userId === user?.id)?.status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white/40 font-heading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] page-enter" data-testid="events-page">
      <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none z-0" />
      
      {/* Header */}
      <header className="lk-page-header flex items-center justify-between" data-testid="events-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="events-back-btn">
            <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-heading font-semibold text-white">Events</h1>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/15 transition-colors"
          data-testid="create-event-btn"
        >
          <Plus className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-5 relative z-[5]">
        {events.length === 0 ? (
          <div className="lk-card-elevated rounded-2xl p-8 text-center" data-testid="events-empty">
            <Calendar className="w-12 h-12 mb-4 mx-auto text-amber-500/20" strokeWidth={1.5} />
            <p className="text-white/40">No events yet</p>
            <p className="text-white/25 text-sm mt-1">Create one to get started!</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="lk-btn-primary mt-5 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20"
              data-testid="create-first-event-btn"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const userRsvp = getUserRsvp(event)
              const yesCount = event.rsvps?.filter(r => r.status === 'yes').length || 0
              const isCreator = event.creatorId === user?.id
              const isFounder = user?.role === 'founder' || user?.role === 'admin' || user?.verificationTier === 'founder'
              const canDelete = isCreator || isFounder
              
              return (
                <div key={event.id} className="p-5 rounded-2xl bg-[#12121A] border border-white/5 hover:bg-[#1A1A24] transition-colors" data-testid={`event-${event.id}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-heading font-semibold">{event.title}</h3>
                    {canDelete && (
                      <button
                        onClick={() => deleteEvent(event.id)}
                        disabled={deleting === event.id}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-red-500/10"
                        title="Delete event"
                        data-testid={`delete-event-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-white/30 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {event.location || 'TBD'}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-white/40 text-sm mt-2 leading-relaxed">{event.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-white/30 text-sm flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" strokeWidth={1.5} /> {yesCount} attending
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => rsvp(event.id, userRsvp === 'yes' ? 'none' : 'yes')}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                          userRsvp === 'yes' 
                            ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                            : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                        }`}
                        data-testid={`rsvp-yes-${event.id}`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> Going
                      </button>
                      <button
                        onClick={() => rsvp(event.id, userRsvp === 'no' ? 'none' : 'no')}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                          userRsvp === 'no' 
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                            : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                        }`}
                        data-testid={`rsvp-no-${event.id}`}
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} /> Can't
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowCreate(false)} data-testid="create-event-modal">
          <div className="glass-card rounded-3xl p-8 max-w-md mx-auto w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl text-white font-heading font-semibold mb-6">Create Event</h2>
            <form onSubmit={createEvent} className="space-y-5">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                required
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="lk-input"
                  required
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="lk-input"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, isOnline: !newEvent.isOnline })}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    newEvent.isOnline ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-white/40 border border-white/5'
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
                  className="lk-input w-full"
                />
              )}
              
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Description (optional)"
                className="lk-input w-full resize-none h-24"
              />
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="lk-btn-ghost flex-1 py-3">Cancel</button>
                <button type="submit" className="lk-btn-primary flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// v2
