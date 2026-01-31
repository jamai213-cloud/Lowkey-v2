'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Radio as RadioIcon, Volume2, VolumeX } from 'lucide-react'
import { useRadio } from '@/app/contexts/RadioContext'

export default function RadioPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Use global radio context
  const { currentStation, isPlaying, volume, setVolume, playStation } = useRadio()

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchStations()
  }, [router])

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

  const handlePlayStation = async (station) => {
    // Use global context to play
    playStation(station)

    // Save to history
    if (user) {
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
      } catch (err) {
        console.error('Failed to save history')
      }
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Radio</h1>
        {currentStation && isPlaying && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">LIVE</span>
          </div>
        )}
      </header>

      {/* Volume Control */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-white/20 accent-purple-500"
          />
          <span className="text-white/60 text-sm w-10">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Now Playing */}
      {currentStation && (
        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: currentStation.color }}
            >
              <RadioIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-lg">{currentStation.name}</p>
              <p className="text-white/60 text-sm">{currentStation.genre}</p>
              <p className="text-purple-400 text-xs mt-1">{currentStation.frequency}</p>
            </div>
            <button 
              onClick={() => playStation(currentStation)}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-purple-900" />
              ) : (
                <Play className="w-7 h-7 text-purple-900 ml-1" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
          <p className="text-purple-200 text-sm text-center">
            🎧 Radio continues playing as you navigate the app!
          </p>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="p-4">
        <h2 className="text-white font-semibold mb-4">UK Stations</h2>
        <div className="grid grid-cols-2 gap-3">
          {stations.map(station => {
            const isCurrentPlaying = currentStation?.id === station.id && isPlaying
            
            return (
              <button
                key={station.id}
                onClick={() => handlePlayStation(station)}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrentPlaying 
                    ? 'bg-white/10 border-purple-500/50 ring-2 ring-purple-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: station.color }}
                >
                  {isCurrentPlaying ? (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-4 bg-white rounded-full animate-pulse" />
                      <span className="w-1 h-6 bg-white rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-150" />
                    </div>
                  ) : (
                    <RadioIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <p className="text-white font-medium text-sm truncate">{station.name}</p>
                <p className="text-gray-400 text-xs truncate">{station.genre}</p>
                <p className="text-purple-400 text-xs mt-1">{station.frequency}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
