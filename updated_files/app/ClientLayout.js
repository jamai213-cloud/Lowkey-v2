'use client'

import { RadioProvider, useRadio } from './contexts/RadioContext'
import { NotificationProvider } from './contexts/NotificationContext'
import RadioMiniPlayer from './components/RadioMiniPlayer'

function MainContent({ children }) {
  const { currentStation } = useRadio()
  
  // Add extra bottom padding when radio player is visible to prevent content overlap
  // pb-32 (128px) provides enough space for the radio bar + safe area
  const paddingClass = currentStation ? 'pb-36' : 'pb-20'
  
  return (
    <main className={`overflow-x-hidden max-w-full ${paddingClass} relative z-0`}>
      {children}
    </main>
  )
}

export default function ClientLayout({ children }) {
  return (
    <NotificationProvider>
      <RadioProvider>
        <MainContent>{children}</MainContent>
        <RadioMiniPlayer />
      </RadioProvider>
    </NotificationProvider>
  )
}
FILE 3: app/components/RadioMiniPlayer.js (REPLACE)

'use client'

import { useRadio } from '@/app/contexts/RadioContext'
import { Radio, Play, Pause, X, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export default function RadioMiniPlayer() {
  const { currentStation, isPlaying, volume, setVolume, togglePlay, stopRadio } = useRadio()
  const [showVolume, setShowVolume] = useState(false)

  if (!currentStation) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom shadow-lg shadow-purple-900/50">
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
The remaining larger files (app/page.js, app/events/page.js, app/api/[[...path]]/route.js) are too long to paste here.

Would you like me to:

Output them one by one (they're 300-2600 lines each)
Create downloadable individual files you can get from Emergent
Which do you prefer?

Feb 22, 06:44 PM

Rollback
Rollback

Copy
