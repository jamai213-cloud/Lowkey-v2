'use client'

import { useRadio } from '@/app/contexts/RadioContext'
import { Radio, Play, Pause, X, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export default function RadioMiniPlayer() {
  const { currentStation, isPlaying, volume, setVolume, togglePlay, stopRadio } = useRadio()
  const [showVolume, setShowVolume] = useState(false)

  if (!currentStation) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#12121A]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.4)]" data-testid="radio-mini-player">
      <div className="flex items-center gap-3 p-3 max-w-screen-xl mx-auto">
        {/* Station info */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5"
          style={{ backgroundColor: `${currentStation.color || '#9333ea'}20` }}
          data-testid="mini-player-station-icon"
        >
          <Radio className="w-5 h-5" style={{ color: currentStation.color || '#9333ea' }} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{currentStation.name}</p>
          <p className="text-white/30 text-xs truncate">{currentStation.genre}</p>
        </div>

        {/* Live indicator */}
        {isPlaying && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-[10px] font-bold tracking-wider">LIVE</span>
          </div>
        )}

        {/* Volume control */}
        <div className="relative">
          <button 
            onClick={() => setShowVolume(!showVolume)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="mini-player-volume-btn"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-white/30" strokeWidth={1.5} />
            ) : (
              <Volume2 className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            )}
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#1A1A24] rounded-xl border border-white/5 shadow-xl">
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
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          data-testid="mini-player-play-btn"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-[#0a0a0f]" />
          ) : (
            <Play className="w-5 h-5 text-[#0a0a0f] ml-0.5" />
          )}
        </button>

        {/* Close */}
        <button 
          onClick={stopRadio}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          data-testid="mini-player-close-btn"
        >
          <X className="w-4 h-4 text-white/30" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
