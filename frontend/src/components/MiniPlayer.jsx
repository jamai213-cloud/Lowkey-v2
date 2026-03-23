import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Radio, X, Volume2, Loader2, ChevronUp } from 'lucide-react';
import { useRadioContext } from '../context/RadioContext';
import { Slider } from '../components/ui/slider';

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
    <>
      {/* Mini Player - positioned above bottom nav */}
      <div 
        className="fixed left-4 right-4 z-40 transition-all duration-300 ease-out"
        style={{ bottom: '88px' }}
        data-testid="mini-player"
      >
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {/* Main mini player row */}
          <div className="p-3 flex items-center gap-3">
            {/* Album art / Radio icon */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#F59E0B]/20 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
              data-testid="player-expand"
              aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
            >
              {isLoading ? (
                <Loader2 size={20} className="text-[#A78BFA] animate-spin" />
              ) : (
                <Radio size={20} className="text-[#A78BFA]" />
              )}
            </button>
            
            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentStation?.name || 'Select Station'}
              </p>
              <p className="text-xs text-[#A1A1AA] truncate">
                {error || currentStation?.genre || 'Lowkey Radio'}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={previousStation}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                data-testid="player-previous"
                aria-label="Previous station"
              >
                <SkipBack size={16} className="text-[#A1A1AA]" />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] active:scale-95 disabled:opacity-50"
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
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
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
                <X size={16} className="text-[#A1A1AA]" />
              </button>
            </div>
          </div>
          
          {/* Progress/Live indicator bar */}
          <div className="h-1 bg-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] w-full animate-pulse' 
                  : 'bg-[#7C3AED]/50 w-0'
              }`}
            />
          </div>

          {/* Expanded view */}
          {isExpanded && (
            <div className="p-4 pt-2 border-t border-white/5 animate-fade-in-up">
              {/* Volume control */}
              <div className="flex items-center gap-3 mb-4">
                <Volume2 size={16} className="text-[#A1A1AA]" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => setVolume(values[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                  data-testid="volume-slider"
                />
                <span className="text-xs text-[#A1A1AA] w-8">{Math.round(volume * 100)}%</span>
              </div>
              
              {/* Station list */}
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-2">Stations</p>
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => selectStation(station)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      currentStation?.id === station.id
                        ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/30'
                        : 'hover:bg-white/5'
                    }`}
                    data-testid={`station-${station.id}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentStation?.id === station.id ? 'bg-[#7C3AED]' : 'bg-white/5'
                    }`}>
                      <Radio size={14} className={currentStation?.id === station.id ? 'text-white' : 'text-[#A1A1AA]'} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm ${currentStation?.id === station.id ? 'text-white font-medium' : 'text-[#A1A1AA]'}`}>
                        {station.name}
                      </p>
                      <p className="text-xs text-[#A1A1AA]/60">{station.genre}</p>
                    </div>
                    {currentStation?.id === station.id && isPlaying && (
                      <div className="flex gap-0.5">
                        <span className="w-1 h-3 bg-[#7C3AED] rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-[#A78BFA] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 h-2 bg-[#7C3AED] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Expand hint */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#12121A] rounded-t-lg flex items-center justify-center border border-white/5 border-b-0 hover:bg-[#7C3AED]/20 transition-colors"
            data-testid="player-expand-hint"
            aria-label="Show more stations"
          >
            <ChevronUp size={12} className="text-[#A1A1AA]" />
          </button>
        )}
      </div>
    </>
  );
};
