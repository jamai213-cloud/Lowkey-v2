import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Moon, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/lounge', icon: MessageCircle, label: 'Lounge' },
  { path: '/after-dark', icon: Moon, label: 'After Dark' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" data-testid="bottom-navigation">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[#A78BFA]' : 'text-[#A1A1AA]'}
              />
              <span className={isActive ? 'text-[#A78BFA]' : 'text-[#A1A1AA]'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
