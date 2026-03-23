import { PeopleOnline } from '../components/PeopleOnline';
import { NewMatches } from '../components/NewMatches';
import { ActiveLounges } from '../components/ActiveLounges';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

export const HomePage = () => {
  return (
    <div className="animate-fade-in-up" data-testid="home-page">
      {/* Header */}
      <header className="page-header">
        <h1 className="greeting">{getGreeting()}</h1>
        <p className="greeting-sub">Who's around tonight?</p>
      </header>

      {/* People Online */}
      <PeopleOnline />

      {/* New Matches */}
      <NewMatches />

      {/* Active Lounges */}
      <ActiveLounges />

      {/* Bottom spacing for nav + mini player */}
      <div className="h-8" />
    </div>
  );
};
