import { Lock, Crown, Users, Sparkles, Star, Eye } from 'lucide-react';

const exclusiveRooms = [
  {
    id: 1,
    name: 'Velvet Room',
    description: 'Where conversations get interesting',
    users: 18,
    isPremium: true,
    isLocked: false,
    vibe: 'intimate',
  },
  {
    id: 2,
    name: 'Midnight Confessions',
    description: 'Anonymous secrets & stories',
    users: 34,
    isPremium: true,
    isLocked: false,
    vibe: 'mysterious',
  },
  {
    id: 3,
    name: 'VIP Lounge',
    description: 'Exclusive access only',
    users: 12,
    isPremium: true,
    isLocked: true,
    vibe: 'elite',
  },
  {
    id: 4,
    name: 'After Hours',
    description: 'The party never stops here',
    users: 45,
    isPremium: false,
    isLocked: false,
    vibe: 'energetic',
  },
  {
    id: 5,
    name: 'Starlight',
    description: 'Romance under the digital stars',
    users: 22,
    isPremium: true,
    isLocked: false,
    vibe: 'romantic',
  },
];

const getVibeIcon = (vibe) => {
  switch (vibe) {
    case 'intimate': return Eye;
    case 'mysterious': return Sparkles;
    case 'elite': return Crown;
    case 'energetic': return Star;
    case 'romantic': return Star;
    default: return Sparkles;
  }
};

export const AfterDarkPage = () => {
  return (
    <div className="animate-fade-in-up" data-testid="after-dark-page">
      {/* Header with intense styling */}
      <header className="page-header relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 via-transparent to-[#F59E0B]/10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} className="text-[#F59E0B]" />
            <span className="premium-badge">Premium</span>
          </div>
          <h1 className="greeting text-glow-purple">After Dark</h1>
          <p className="greeting-sub">Exclusive rooms for the night</p>
        </div>
      </header>

      {/* Stats bar */}
      <div className="px-5 py-4 mb-4 mx-5 rounded-2xl glass">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-xl font-bold text-[#F59E0B] text-glow-gold">
              {exclusiveRooms.reduce((sum, r) => sum + r.users, 0)}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1">People Tonight</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#A78BFA] text-glow-purple">
              {exclusiveRooms.length}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1">Exclusive Rooms</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-[#22C55E]">
              {exclusiveRooms.filter(r => !r.isLocked).length}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1">Open Now</p>
          </div>
        </div>
      </div>

      {/* Exclusive rooms */}
      <div className="px-5 space-y-4 stagger-children">
        {exclusiveRooms.map((room) => {
          const VibeIcon = getVibeIcon(room.vibe);
          
          return (
            <div
              key={room.id}
              className={`after-dark-card ${room.isLocked ? 'opacity-80' : ''}`}
              data-testid={`after-dark-room-${room.id}`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <VibeIcon size={16} className="text-[#F59E0B]" />
                      <h3 className="font-semibold text-white">{room.name}</h3>
                      {room.isPremium && (
                        <span className="premium-badge text-[10px] py-0.5 px-2">
                          <Crown size={10} />
                          VIP
                        </span>
                      )}
                      {room.isLocked && (
                        <Lock size={14} className="text-[#A1A1AA]" />
                      )}
                    </div>
                    <p className="text-sm text-[#A1A1AA] mt-2">{room.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[#F59E0B] ml-4">
                    <Users size={14} />
                    <span className="text-sm font-medium">{room.users}</span>
                  </div>
                </div>

                {room.isLocked ? (
                  <button 
                    className="w-full py-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#F59E0B]/20 transition-colors"
                    data-testid={`unlock-room-${room.id}`}
                  >
                    <Lock size={14} />
                    Unlock Access
                  </button>
                ) : (
                  <button 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white text-sm font-medium hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-shadow"
                    data-testid={`enter-room-${room.id}`}
                  >
                    Enter Room
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium upsell */}
      <div className="mx-5 mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 via-[#12121A] to-[#7C3AED]/20 border border-[#F59E0B]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
            <Crown size={20} className="text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Go Premium</h3>
            <p className="text-xs text-[#A1A1AA]">Unlock all exclusive rooms</p>
          </div>
        </div>
        <button 
          className="w-full py-3 rounded-xl btn-gold text-sm font-semibold"
          data-testid="upgrade-premium-button"
        >
          Upgrade Now
        </button>
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
};
