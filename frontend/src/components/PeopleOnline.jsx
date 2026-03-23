import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const onlineUsers = [
  { id: 1, name: 'Aria', avatar: 'https://images.unsplash.com/photo-1666979303152-d1678dc0eefa?w=200&h=200&fit=crop' },
  { id: 2, name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1656946213160-380350566dde?w=200&h=200&fit=crop' },
  { id: 3, name: 'Luna', avatar: 'https://images.unsplash.com/photo-1591639365049-0bf0944f31d8?w=200&h=200&fit=crop' },
  { id: 4, name: 'Jake', avatar: 'https://images.unsplash.com/photo-1730608580612-43823ad5dfc9?w=200&h=200&fit=crop' },
  { id: 5, name: 'Sofia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { id: 6, name: 'Ethan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 7, name: 'Mia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: 8, name: 'Noah', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
];

export const PeopleOnline = () => {
  return (
    <section data-testid="people-online-section">
      <div className="px-5 mb-3">
        <h2 className="section-title flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] pulse-online" />
          People Online
          <span className="text-sm font-normal text-[#A1A1AA] ml-2">
            {onlineUsers.length}
          </span>
        </h2>
      </div>
      
      <div className="horizontal-scroll hide-scrollbar stagger-children">
        {onlineUsers.map((user) => (
          <button
            key={user.id}
            className="avatar-container group cursor-pointer"
            data-testid={`online-user-${user.id}`}
            aria-label={`View ${user.name}'s profile`}
          >
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-[#7C3AED] transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                <AvatarImage 
                  src={user.avatar} 
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#12121A] text-[#A78BFA] text-lg font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="online-indicator pulse-online" />
            </div>
            <p className="text-xs text-center mt-2 text-[#A1A1AA] group-hover:text-white transition-colors">
              {user.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
