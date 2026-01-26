'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Radio as RadioIcon, Volume2, VolumeX } from 'lucide-react'

export default function RadioPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stations, setStations] = useState([])
  const [playing, setPlaying] = useState(null)
  const [loading, setLoading] = useState(true)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
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
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100
    }
  }, [volume, muted])

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
    } catch (err) {
      console.error('Failed to save history')
    }

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl
        audioRef.current.volume = muted ? 0 : volume / 100
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
    <div className="min-h-screen bg-[#0a0a0f] pb-32">
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white">Radio</h1>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
            />
          </div>
        </div>
      </header>

      {/* Now Playing */}
      {playing && (
        <div className="p-4">
          <div 
            className="p-4 rounded-2xl border-2 transition-all"
            style={{ 
              background: `linear-gradient(135deg, ${playing.color}30, ${playing.color}10)`,
              borderColor: `${playing.color}60`
            }}
          >
            <div className="flex items-center gap-4">
              {/* Radio Dial Indicator */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{ 
                  background: `conic-gradient(from 0deg, ${playing.color}, ${playing.color}40, ${playing.color})`,
                  boxShadow: `0 0 30px ${playing.color}50`
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-lg">{playing.frequency}</span>
                  <span className="text-gray-400 text-xs">FM</span>
                </div>
                <div className="absolute w-full h-full rounded-full animate-ping opacity-20" style={{ backgroundColor: playing.color }} />
              </div>
              
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Now Playing</p>
                <h2 className="text-white text-xl font-bold">{playing.name}</h2>
                <p className="text-gray-400 text-sm">{playing.genre}</p>
              </div>
              
              <button 
                onClick={() => playStation(playing)}
                className="p-4 rounded-full text-black"
                style={{ backgroundColor: playing.color }}
              >
                <Pause className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Grid - Tile Design */}
      <div className="p-4">
        <h2 className="text-white font-semibold mb-4">UK Urban Stations</h2>
        <div className="grid grid-cols-2 gap-3">
          {stations.map((station) => {
            const isPlaying = playing?.id === station.id
            return (
              <button
                key={station.id}
                onClick={() => playStation(station)}
                className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  isPlaying ? 'ring-2' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${station.color}20, ${station.color}08)`,
                  border: `1px solid ${station.color}40`,
                  boxShadow: isPlaying ? `0 0 20px ${station.color}40` : `0 4px 20px ${station.color}10`,
                  ringColor: station.color
                }}
              >
                {/* Radio Dial Design */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  {/* Dial Circle */}
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      background: `radial-gradient(circle, ${station.color}40, ${station.color}15)`,
                      border: `2px solid ${station.color}60`
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0a0a0f]/80 flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-sm">{station.frequency}</span>
                      <span className="text-gray-500 text-[10px]">FM</span>
                    </div>
                  </div>
                  
                  {/* Station Name */}
                  <h3 className="text-white text-sm font-semibold text-center leading-tight">{station.name}</h3>
                  <p className="text-gray-400 text-xs text-center">{station.genre}</p>
                </div>
                
                {/* Play/Pause Overlay */}
                <div 
                  className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isPlaying ? 'opacity-100' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: isPlaying ? station.color : 'rgba(255,255,255,0.1)' }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Live Indicator */}
                {isPlaying && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-bold">LIVE</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Radio Info */}
      <div className="p-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <RadioIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">About Radio</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Stream live UK urban radio stations. Features Grime, R&B, Hip-Hop, Dancehall, Afrobeats and more from London's best underground stations.
          </p>
        </div>
      </div>
    </div>
  )
}
