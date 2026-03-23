# Lowkey - Premium Social + Dating App

## Original Problem Statement
Build a premium social + dating app UI called "Lowkey" focused on dating, social interaction, and live lounges (chat rooms). High-end, modern nightlife platform aesthetic with dark mode only.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + MongoDB (existing setup)
- **Styling**: Custom CSS with neon glow effects, glassmorphism

## User Personas
1. **Night Owls** (21-35): Young adults seeking premium social/dating experiences
2. **Premium Users**: VIP members wanting exclusive room access
3. **Social Explorers**: Users looking for chat lounges and connections

## Core Requirements (Static)
- Dark mode only (#0A0A0F background)
- Neon purple (#7C3AED) + Gold (#F59E0B) accent system
- Bottom navigation: Home, Lounge, After Dark, Profile
- Glassmorphism effects and subtle neon glows
- Mobile-first responsive design

## What's Been Implemented (Jan 2026)

### Pages
- **Home Page**: Greeting, People Online (horizontal scroll), New Matches (profile cards), Active Lounges
- **Lounge Page**: Search functionality, lounge list with tags, live indicators, join buttons
- **After Dark Page**: Premium rooms, VIP badges, stats bar, locked/unlocked rooms
- **Profile Page**: Avatar, stats (matches/likes/visits), settings menu, logout

### Components
- BottomNav: Fixed navigation with active state glow
- MiniPlayer: Collapsible radio player with play/pause controls
- PeopleOnline: Horizontal avatars with online indicators
- NewMatches: Profile cards with connect actions
- ActiveLounges: Lounge cards with live/hot indicators

### Styling
- Custom fonts: Unbounded (headings), Outfit (body)
- Neon glow effects on active elements
- Glassmorphism for navigation and player
- Staggered entrance animations
- Pulse animations for online indicators

## Prioritized Backlog

### P0 (Critical)
- ✅ All core pages implemented
- ✅ Navigation working
- ✅ Premium styling applied

### P1 (Important)
- Real-time chat functionality in lounges
- User authentication integration
- Backend API for matches/lounges/users
- Profile editing functionality

### P2 (Nice to Have)
- Push notifications
- Voice chat in lounges
- Premium subscription flow
- Profile verification badges

## Next Tasks
1. Connect existing auth system to profile
2. Implement real lounge chat rooms with WebSocket
3. Add match/like functionality with backend
4. Create user discovery/swipe feature
