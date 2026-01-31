'use client'

import { useRadio } from '@/app/contexts/RadioContext'
import { Radio, Play, Pause, X, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export default function RadioMiniPlayer() {
  const { currentStation, isPlaying, volume, setVolume, togglePlay, stopRadio } = useRadio()
  const [showVolume, setShowVolume] = useState(false)

  if (!currentStation) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
      <div className="flex items-center gap-3 p-3 max-w-screen-xl mx-auto">
        {/* Station info */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: currentStation.color || '#9333ea' }}
        >
          <Radio className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{currentStation.name}</p>
          <p className="text-white/60 text-xs truncate">{currentStation.genre}</p>
        </div>

        {/* Live indicator */}
        {isPlaying && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">LIVE</span>
          </div>
        )}

        {/* Volume control */}
        <div className="relative">
          <button 
            onClick={() => setShowVolume(!showVolume)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-white/70" />
            ) : (
              <Volume2 className="w-5 h-5 text-white/70" />
            )}
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black/90 rounded-xl">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-2 accent-purple-500"
                style={{ writingMode: 'horizontal-tb' }}
              />
            </div>
          )}
        </div>

        {/* Play/Pause */}
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-purple-900" />
          ) : (
            <Play className="w-5 h-5 text-purple-900 ml-0.5" />
          )}
        </button>

        {/* Close */}
        <button 
          onClick={stopRadio}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  )
}
