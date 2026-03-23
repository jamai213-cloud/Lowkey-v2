import { Users, Flame, MessageCircle } from 'lucide-react';

const lounges = [
  {
    id: 1,
    name: 'Night Owls',
    description: 'For those who stay up late',
    users: 23,
    isActive: true,
    activity: 'hot',
  },
  {
    id: 2,
    name: 'Chill Vibes Only',
    description: 'Relaxed conversations',
    users: 15,
    isActive: true,
    activity: 'active',
  },
  {
    id: 3,
    name: 'Music Lovers',
    description: 'Share your favorite tracks',
    users: 8,
    isActive: false,
    activity: 'normal',
  },
];

export const ActiveLounges = () => {
  return (
    <section className="mt-8 px-5" data-testid="active-lounges-section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <MessageCircle size={18} className="text-[#7C3AED]" />
          Active Lounges
        </h2>
        <button 
          className="text-sm text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
          data-testid="see-all-lounges"
        >
          See all
        </button>
      </div>
      
      <div className="space-y-3 stagger-children">
        {lounges.map((lounge) => (
          <div
            key={lounge.id}
            className={`lounge-card ${lounge.isActive ? 'active' : ''}`}
            data-testid={`lounge-card-${lounge.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
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
              
              <div className="flex items-center gap-1.5 text-[#A1A1AA]">
                <Users size={14} />
                <span className="text-sm">{lounge.users}</span>
              </div>
            </div>
            
            <button 
              className="mt-4 w-full py-2.5 rounded-xl bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#A78BFA] text-sm font-medium transition-colors"
              data-testid={`join-lounge-${lounge.id}`}
            >
              Join Lounge
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
