import { Heart, Sparkles } from 'lucide-react';

const matches = [
  {
    id: 1,
    name: 'Luna',
    age: 24,
    bio: 'Artist & Night owl',
    avatar: 'https://images.unsplash.com/photo-1591639365049-0bf0944f31d8?w=400&h=500&fit=crop',
    isNew: true,
  },
  {
    id: 2,
    name: 'Marcus',
    age: 27,
    bio: 'Music producer',
    avatar: 'https://images.unsplash.com/photo-1656946213160-380350566dde?w=400&h=500&fit=crop',
    isNew: true,
  },
  {
    id: 3,
    name: 'Aria',
    age: 23,
    bio: 'Dancing through life',
    avatar: 'https://images.unsplash.com/photo-1666979303152-d1678dc0eefa?w=400&h=500&fit=crop',
    isNew: false,
  },
  {
    id: 4,
    name: 'Jake',
    age: 26,
    bio: 'Adventure seeker',
    avatar: 'https://images.unsplash.com/photo-1730608580612-43823ad5dfc9?w=400&h=500&fit=crop',
    isNew: false,
  },
];

export const NewMatches = () => {
  return (
    <section className="mt-8" data-testid="new-matches-section">
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <Sparkles size={18} className="text-[#F59E0B]" />
          New Matches
        </h2>
        <button 
          className="text-sm text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
          data-testid="see-all-matches"
        >
          See all
        </button>
      </div>
      
      <div className="horizontal-scroll hide-scrollbar stagger-children">
        {matches.map((match) => (
          <div
            key={match.id}
            className="profile-card w-40 flex-shrink-0"
            data-testid={`match-card-${match.id}`}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={match.avatar}
                alt={match.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* New badge */}
              {match.isNew && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-[#7C3AED] text-white text-[10px] font-semibold uppercase tracking-wide rounded-full">
                  New
                </span>
              )}
              
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-white">{match.name}</h3>
                  <span className="text-[#A1A1AA]">{match.age}</span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">{match.bio}</p>
              </div>
            </div>
            
            {/* Action button */}
            <button 
              className="w-full py-3 flex items-center justify-center gap-2 bg-[#12121A] hover:bg-[#7C3AED]/20 transition-colors group"
              data-testid={`match-like-${match.id}`}
              aria-label={`Like ${match.name}`}
            >
              <Heart size={16} className="text-[#A78BFA] group-hover:text-[#F59E0B] transition-colors" />
              <span className="text-sm text-[#A1A1AA] group-hover:text-white transition-colors">Connect</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
