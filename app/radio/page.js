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
  
  // Use global radio context for persistent playback
  const { currentStation, isPlaying, volume, setVolume, playStation: contextPlayStation } = useRadio()
  
  // Local state for volume slider (0-100 for UI, converted to 0-1 for context)
  const [localVolume, setLocalVolume] = useState(volume * 100)
  const [muted, setMuted] = useState(volume === 0)

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

  // Sync local volume with context
  useEffect(() => {
    setLocalVolume(volume * 100)
    setMuted(volume === 0)
  }, [volume])

  const handleVolumeChange = (value) => {
    setLocalVolume(value)
    setVolume(value / 100)
    if (value > 0) setMuted(false)
  }

  const handleMuteToggle = () => {
    if (muted) {
      setVolume(0.8)
      setMuted(false)
    } else {
      setVolume(0)
      setMuted(true)
    }
  }

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
    // Use the global context to play/pause
    contextPlayStation(station)

    // Save to history
    if (user && (!currentStation || currentStation.id !== station.id)) {
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

  // Check if a station is currently playing
  const isStationPlaying = (stationId) => {
    return currentStation?.id === stationId && isPlaying
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
              onClick={handleMuteToggle}
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
              value={localVolume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
            />
          </div>
        </div>
      </header>

      {/* Now Playing */}
      {currentStation && (
        <div className="p-4">
          <div 
            className="p-4 rounded-2xl border-2 transition-all"
            style={{ 
              background: `linear-gradient(135deg, ${currentStation.color}30, ${currentStation.color}10)`,
              borderColor: `${currentStation.color}60`
            }}
          >
            <div className="flex items-center gap-4">
              {/* Radio Dial Indicator */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{ 
                  background: `conic-gradient(from 0deg, ${currentStation.color}, ${currentStation.color}40, ${currentStation.color})`,
                  boxShadow: `0 0 30px ${currentStation.color}50`
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-lg">{currentStation.frequency}</span>
                  <span className="text-gray-400 text-xs">FM</span>
                </div>
                {isPlaying && (
                  <div className="absolute w-full h-full rounded-full animate-ping opacity-20" style={{ backgroundColor: currentStation.color }} />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-gray-400 text-sm">{isPlaying ? 'Now Playing' : 'Paused'}</p>
                <h2 className="text-white text-xl font-bold">{currentStation.name}</h2>
                <p className="text-gray-400 text-sm">{currentStation.genre}</p>
              </div>
              
              <button 
                onClick={() => playStation(currentStation)}
                className="p-4 rounded-full text-black"
                style={{ backgroundColor: currentStation.color }}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
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
            const playing = isStationPlaying(station.id)
            return (
              <button
                key={station.id}
                onClick={() => playStation(station)}
                className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  playing ? 'ring-2' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${station.color}20, ${station.color}08)`,
                  border: `1px solid ${station.color}40`,
                  boxShadow: playing ? `0 0 20px ${station.color}40` : `0 4px 20px ${station.color}10`,
                  ringColor: station.color
                }}
              >
                {/* Radio Dial Design */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  {/* Dial Circle */}
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                      playing ? 'animate-pulse' : ''
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
                    playing ? 'opacity-100' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: playing ? station.color : 'rgba(255,255,255,0.1)' }}
                >
                  {playing ? (
                    <Pause className="w-4 h-4 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Live Indicator */}
                {playing && (
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
            Tune into UK's best urban radio stations. Listen to the latest hits, classic tracks, and exclusive content from top DJs.
          </p>
          <p className="text-purple-400 text-sm mt-2">
            Radio continues playing as you navigate the app!
          </p>
        </div>
      </div>
    </div>
  )
}
