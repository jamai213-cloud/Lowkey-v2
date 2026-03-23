import { Settings, Heart, MessageCircle, Shield, Bell, HelpCircle, LogOut, ChevronRight, Edit2, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const userProfile = {
  name: 'Alex Morgan',
  age: 26,
  bio: 'Night owl, music lover, seeking genuine connections',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  stats: {
    matches: 24,
    likes: 156,
    visits: 89,
  },
};

const settingsItems = [
  { icon: Edit2, label: 'Edit Profile', action: 'edit-profile' },
  { icon: Heart, label: 'My Matches', action: 'matches', badge: '24' },
  { icon: MessageCircle, label: 'Messages', action: 'messages', badge: '3' },
  { icon: Bell, label: 'Notifications', action: 'notifications' },
  { icon: Shield, label: 'Privacy & Safety', action: 'privacy' },
  { icon: Settings, label: 'Settings', action: 'settings' },
  { icon: HelpCircle, label: 'Help & Support', action: 'help' },
];

export const ProfilePage = () => {
  return (
    <div className="animate-fade-in-up" data-testid="profile-page">
      {/* Profile Header */}
      <header className="profile-header relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Avatar with edit button */}
        <div className="relative">
          <Avatar className="w-28 h-28 border-4 border-[#7C3AED] shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <AvatarImage 
              src={userProfile.avatar} 
              alt={userProfile.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#12121A] text-[#A78BFA] text-3xl font-bold">
              {userProfile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button 
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center border-4 border-[#0A0A0F] hover:bg-[#A78BFA] transition-colors"
            data-testid="change-avatar-button"
            aria-label="Change profile photo"
          >
            <Camera size={14} className="text-white" />
          </button>
        </div>

        {/* Name and bio */}
        <h1 className="profile-name mt-5">
          {userProfile.name}, {userProfile.age}
        </h1>
        <p className="profile-bio">{userProfile.bio}</p>

        {/* Stats */}
        <div className="profile-stats mt-6">
          <div className="stat-item" data-testid="stat-matches">
            <p className="stat-value">{userProfile.stats.matches}</p>
            <p className="stat-label">Matches</p>
          </div>
          <div className="stat-item" data-testid="stat-likes">
            <p className="stat-value">{userProfile.stats.likes}</p>
            <p className="stat-label">Likes</p>
          </div>
          <div className="stat-item" data-testid="stat-visits">
            <p className="stat-value">{userProfile.stats.visits}</p>
            <p className="stat-label">Profile Visits</p>
          </div>
        </div>

        {/* Edit profile button */}
        <button 
          className="btn-primary mt-6"
          data-testid="edit-profile-button"
        >
          <Edit2 size={16} />
          Edit Profile
        </button>
      </header>

      {/* Settings List */}
      <div className="settings-list mt-4 stagger-children">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.action}
              className="settings-item w-full"
              data-testid={`settings-${item.action}`}
            >
              <div className="settings-item-left">
                <div className="settings-icon">
                  <Icon size={18} />
                </div>
                <span className="text-white font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-xs font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={18} className="text-[#A1A1AA]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-5 mt-6">
        <button 
          className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
          data-testid="logout-button"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-[#A1A1AA]/50 mt-6 mb-4">
        Lowkey v1.0.0
      </p>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
};
