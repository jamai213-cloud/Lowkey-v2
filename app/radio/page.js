'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Radio as RadioIcon, Clock } from 'lucide-react'

export default function RadioPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stations, setStations] = useState([])
  const [playing, setPlaying] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchStations()
    fetchHistory(userData.id)
  }, [])

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/radio/stations')
      if (res.ok) {
        const data = await res.json()
        setStations(data)
      }
    } catch (err) {
      console.error('Failed to fetch stations')
    }
    setLoading(false)
  }

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`/api/radio/history/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (err) {
      console.error('Failed to fetch history')
    }
  }

  const playStation = async (station) => {
    if (playing?.id === station.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    setPlaying(station)

    try {
      await fetch('/api/radio/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          stationId: station.id,
          stationName: station.name
        })
      })
      fetchHistory(user.id)
    } catch (err) {
      console.error('Failed to save history')
    }

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl
        audioRef.current.play().catch(e => console.error('Audio error:', e))
      }
    }, 100)
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
      <audio ref={audioRef} />

      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Radio</h1>
      </header>

      <div className="p-4">
        {/* Now Playing */}
        {playing && (
          <div className="mb-6 p-4 rounded-2xl border border-white/20" style={{ background: `linear-gradient(135deg, ${playing.color}40, ${playing.color}20)` }}>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center animate-pulse"
                style={{ backgroundColor: playing.color }}
              >
                <span className="text-white font-bold text-lg">{playing.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Now Playing</p>
                <h2 className="text-white text-xl font-semibold">{playing.name}</h2>
                <p className="text-gray-400 text-sm">{playing.genre}</p>
              </div>
              <button 
                onClick={() => playStation(playing)}
                className="p-4 rounded-full bg-white text-black"
              >
                <Pause className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Stations */}
        <h2 className="text-white font-semibold mb-3">UK Stations</h2>
        <div className="space-y-3 mb-6">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => playStation(station)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                playing?.id === station.id 
                  ? 'border-2' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
              style={playing?.id === station.id ? { 
                borderColor: station.color,
                background: `linear-gradient(135deg, ${station.color}20, transparent)`
              } : {}}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: station.color }}
              >
                <span className="text-white font-bold text-sm text-center leading-tight">
                  {station.name.split(' ').map(w => w[0]).join('').substring(0, 3)}
                </span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">{station.name}</h3>
                <p className="text-gray-400 text-sm">{station.genre}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: playing?.id === station.id ? station.color : 'rgba(255,255,255,0.1)' }}
              >
                {playing?.id === station.id ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Recently Played */}
        {history.length > 0 && (
          <>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recently Played
            </h2>
            <div className="space-y-2">
              {history.map((item) => {
                const station = stations.find(s => s.id === item.stationId)
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: station?.color || '#666' }}
                    >
                      <RadioIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{item.stationName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(item.playedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
