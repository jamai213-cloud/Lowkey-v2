import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Radio, X, Volume2, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { useRadioContext } from '../context/RadioContext';

export const MiniPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    error,
    togglePlay,
    nextStation,
    previousStation,
    setVolume,
    stations,
    selectStation,
  } = useRadioContext();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed left-4 right-4 z-40"
      style={{ bottom: '80px' }}
      data-testid="mini-player"
    >
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(18, 18, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isExpanded 
            ? '0 -8px 32px rgba(124, 58, 237, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 4px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Main mini player row */}
        <div className="p-3 flex items-center gap-3">
          {/* Station indicator with color */}
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${currentStation?.color || '#7C3AED'}30, ${currentStation?.color || '#7C3AED'}10)`,
              boxShadow: isPlaying ? `0 0 20px ${currentStation?.color || '#7C3AED'}40` : 'none',
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: currentStation?.color || '#A78BFA' }} />
            ) : (
              <Radio size={18} style={{ color: currentStation?.color || '#A78BFA' }} />
            )}
          </div>
          
          {/* Track info */}
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
            <p className="text-sm font-medium text-white truncate">
              {currentStation?.name || 'Select Station'}
            </p>
            <p className="text-xs text-[#A1A1AA] truncate">
              {error || currentStation?.genre || 'Lowkey Radio'}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={previousStation}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 active:scale-95"
              data-testid="player-previous"
              aria-label="Previous station"
            >
              <SkipBack size={16} className="text-[#A1A1AA]" />
            </button>
            
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: currentStation?.color || '#7C3AED',
                boxShadow: `0 0 20px ${currentStation?.color || '#7C3AED'}50`,
              }}
              data-testid="player-play-pause"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} className="text-white" fill="white" />
              ) : (
                <Play size={18} className="text-white ml-0.5" fill="white" />
              )}
            </button>
            
            <button
              onClick={nextStation}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 active:scale-95"
              data-testid="player-next"
              aria-label="Next station"
            >
              <SkipForward size={16} className="text-[#A1A1AA]" />
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 ml-1"
              data-testid="player-close"
              aria-label="Close player"
            >
              <X size={14} className="text-[#A1A1AA]" />
            </button>
          </div>
        </div>
        
        {/* Live indicator bar */}
        <div className="h-0.5 bg-white/5">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: isPlaying ? '100%' : '0%',
              background: `linear-gradient(90deg, ${currentStation?.color || '#7C3AED'}, ${currentStation?.color || '#7C3AED'}80)`,
              animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Expanded station list */}
        {isExpanded && (
          <div className="border-t border-white/5">
            {/* Volume control */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
              <Volume2 size={14} className="text-[#A1A1AA]" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${currentStation?.color || '#7C3AED'} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                }}
                data-testid="volume-slider"
              />
              <span className="text-xs text-[#A1A1AA] w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
            
            {/* Station list */}
            <div className="max-h-56 overflow-y-auto">
              {stations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => selectStation(station)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                    currentStation?.id === station.id
                      ? 'bg-white/5'
                      : 'hover:bg-white/5'
                  }`}
                  data-testid={`station-${station.id}`}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: currentStation?.id === station.id 
                        ? station.color 
                        : `${station.color}20`,
                    }}
                  >
                    <Radio 
                      size={14} 
                      style={{ 
                        color: currentStation?.id === station.id ? 'white' : station.color 
                      }} 
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${currentStation?.id === station.id ? 'text-white font-medium' : 'text-[#A1A1AA]'}`}>
                      {station.name}
                    </p>
                    <p className="text-xs text-[#A1A1AA]/60">{station.genre}</p>
                  </div>
                  {currentStation?.id === station.id && isPlaying && (
                    <div className="flex gap-0.5 items-end h-4">
                      <span className="w-0.5 bg-current rounded-full animate-bounce" style={{ height: '8px', color: station.color, animationDelay: '0ms' }} />
                      <span className="w-0.5 bg-current rounded-full animate-bounce" style={{ height: '12px', color: station.color, animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-current rounded-full animate-bounce" style={{ height: '6px', color: station.color, animationDelay: '300ms' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Expand/collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 rounded-t-lg flex items-center justify-center transition-colors hover:bg-[#7C3AED]/20"
        style={{
          background: 'rgba(18, 18, 26, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none',
        }}
        data-testid="player-expand-toggle"
        aria-label={isExpanded ? 'Collapse stations' : 'Show stations'}
      >
        {isExpanded ? (
          <ChevronDown size={14} className="text-[#A1A1AA]" />
        ) : (
          <ChevronUp size={14} className="text-[#A1A1AA]" />
        )}
      </button>
    </div>
  );
};
