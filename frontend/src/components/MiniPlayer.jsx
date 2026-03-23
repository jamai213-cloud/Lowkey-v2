import { useState } from 'react';
import { Play, Pause, SkipForward, Radio, X } from 'lucide-react';

export const MiniPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mini-player" data-testid="mini-player">
      <div className="flex items-center gap-3">
        {/* Album art / Radio icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
          <Radio size={20} className="text-[#A78BFA]" />
        </div>
        
        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            Lowkey Radio
          </p>
          <p className="text-xs text-[#A1A1AA] truncate">
            Late Night Vibes
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            data-testid="player-play-pause"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} className="text-white" fill="white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" fill="white" />
            )}
          </button>
          
          <button
            onClick={() => {}}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors hover:bg-white/10"
            data-testid="player-skip"
            aria-label="Skip"
          >
            <SkipForward size={16} className="text-[#A1A1AA]" />
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            data-testid="player-close"
            aria-label="Close player"
          >
            <X size={16} className="text-[#A1A1AA]" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-300"
          style={{ width: isPlaying ? '45%' : '0%' }}
        />
      </div>
    </div>
  );
};
