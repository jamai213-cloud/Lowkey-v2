import { useState } from 'react';
import { Users, Flame, Search, Plus } from 'lucide-react';
import { Input } from '../components/ui/input';

const allLounges = [
  {
    id: 1,
    name: 'Night Owls',
    description: 'For those who stay up late',
    users: 23,
    isActive: true,
    activity: 'hot',
    tags: ['late night', 'chill'],
  },
  {
    id: 2,
    name: 'Chill Vibes Only',
    description: 'Relaxed conversations & good energy',
    users: 15,
    isActive: true,
    activity: 'active',
    tags: ['relaxed', 'friendly'],
  },
  {
    id: 3,
    name: 'Music Lovers',
    description: 'Share your favorite tracks and discover new ones',
    users: 8,
    isActive: false,
    activity: 'normal',
    tags: ['music', 'discovery'],
  },
  {
    id: 4,
    name: 'Late Night Talks',
    description: 'Deep conversations after midnight',
    users: 12,
    isActive: true,
    activity: 'active',
    tags: ['deep talks', 'intimate'],
  },
  {
    id: 5,
    name: 'Weekend Warriors',
    description: 'Planning the next adventure',
    users: 6,
    isActive: false,
    activity: 'normal',
    tags: ['plans', 'social'],
  },
  {
    id: 6,
    name: 'Flirt Zone',
    description: 'Where sparks fly',
    users: 31,
    isActive: true,
    activity: 'hot',
    tags: ['dating', 'fun'],
  },
];

export const LoungePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredLounges = allLounges.filter(lounge =>
    lounge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lounge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lounge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in-up" data-testid="lounge-page">
      {/* Header */}
      <header className="page-header">
        <h1 className="greeting">Lounges</h1>
        <p className="greeting-sub">Find your vibe</p>
      </header>

      {/* Search & Create */}
      <div className="px-5 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <Input
            type="text"
            placeholder="Search lounges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#12121A] border-white/5 text-white placeholder:text-[#A1A1AA] focus:border-[#7C3AED]/50 focus:ring-[#7C3AED]/20 rounded-xl h-12"
            data-testid="lounge-search-input"
          />
        </div>
        <button 
          className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-shadow"
          data-testid="create-lounge-button"
          aria-label="Create new lounge"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Active indicator */}
      <div className="px-5 mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] pulse-online" />
          <span className="text-sm text-[#A1A1AA]">
            {allLounges.filter(l => l.isActive).length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#A1A1AA]" />
          <span className="text-sm text-[#A1A1AA]">
            {allLounges.reduce((sum, l) => sum + l.users, 0)} people online
          </span>
        </div>
      </div>

      {/* Lounge list */}
      <div className="px-5 space-y-3 stagger-children">
        {filteredLounges.map((lounge) => (
          <div
            key={lounge.id}
            className={`lounge-card ${lounge.isActive ? 'active' : ''}`}
            data-testid={`lounge-item-${lounge.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{lounge.name}</h3>
                  {lounge.activity === 'hot' && (
                    <span className="live-indicator">
                      <span className="live-dot" />
                      Live
                    </span>
                  )}
                  {lounge.activity === 'hot' && (
                    <Flame size={14} className="text-[#F59E0B]" />
                  )}
                </div>
                <p className="text-sm text-[#A1A1AA] mt-1">{lounge.description}</p>
              </div>
              
              <div className="flex items-center gap-1.5 text-[#A1A1AA] ml-4">
                <Users size={14} />
                <span className="text-sm font-medium">{lounge.users}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {lounge.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-[#A1A1AA]"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <button 
              className="w-full py-3 rounded-xl bg-[#7C3AED]/10 hover:bg-[#7C3AED] text-[#A78BFA] hover:text-white text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              data-testid={`join-lounge-btn-${lounge.id}`}
            >
              Join Lounge
            </button>
          </div>
        ))}

        {filteredLounges.length === 0 && (
          <div className="empty-state">
            <Search size={48} className="mx-auto mb-4 text-[#A1A1AA] opacity-50" />
            <p className="text-[#A1A1AA]">No lounges found</p>
            <p className="text-sm text-[#A1A1AA]/60 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
};
