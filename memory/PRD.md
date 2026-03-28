# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js. The app features user profiles, lounges, messaging, radio, events, games, After Dark spaces, and more.

## Latest Pivot (March 2026)
Complete UI replacement of the Home screen to feel like a premium, bright, and highly social dating app. NOT a refinement — a completely new visual composition from scratch.

## Core Requirements (Current)
1. **People-First Layout**: Hero section with horizontal scroll of large profile cards
2. **Compact Top Bar**: Small avatar, username, online status, notifications, wallet
3. **Visual Live Feed**: Replace text-based activity with visual feed cards
4. **Lounges Secondary**: Horizontal card chips, not dominant
5. **Functional Routing**: Clicking any user goes to `/profile/[userId]`
6. **Premium Style**: Brighter luxury palette, high contrast, sharp edges, not gloomy

## Architecture
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local)
- **Deployment**: Vercel (user-managed)

## Key Pages
- `/` — Home (Auth + Dashboard)
- `/profile/[userId]` — User profile view
- `/search` — Member search
- `/lounge` — Chat lounges
- `/inbox` — Direct messages
- `/afterdark` — Private spaces
- `/radio` — Live radio
- `/games` — Mini games
- `/events` — Events
- `/profile/edit` — Edit own profile

## What's Been Implemented

### March 28, 2026 — Home Screen Complete Rebuild
- Completely new Home screen layout (premium dating app style)
- Compact top bar: avatar, username "Hey, [name]", online status, wallet, notifications, settings
- Hero Discover section: horizontal scroll of large profile cards (155x210px) with photos, names, online indicators, verification badges
- Stories row with gradient rings and Add Story button
- Connection requests inline cards
- 2-up featured profiles grid (3:4 aspect ratio)
- Visual Live Feed ("Happening Now") with user images, action text, timestamps
- After Dark banner (slim, gradient)
- Active Lounges horizontal scroll with accent-colored cards
- Quick Access row (Radio, Games, Inbox)
- Bottom navigation (Home, Search, Lounge, After Dark, Profile)
- `/profile/[userId]` dynamic route: full hero photo, name, age, badges, Connect/Message/Like actions, stats, gallery
- All profile clicks route to `/profile/[userId]` (not /search)
- Testing: 13/13 backend APIs passing, 9/9 frontend features verified

### Previous Sessions
- Auth system (login/register with SHA-256 hashed passwords)
- Radio bar layout fix
- Professional notification system with sound
- Event deletion for creators/founders
- Message & status expiry (12h/24h)
- Dashboard stories panel
- "Add Story" functionality
- Mobile-friendliness sweep
- Game stubs (Ice Breaker, Tic-Tac-Toe — client-only)

## Prioritized Backlog

### P0 (Done)
- [x] Complete Home screen visual rebuild

### P1 (Next)
- [ ] Apply new design system to Search, Inbox, Lounge pages
- [ ] Fix Vercel deployment synchronization (recurring issue)

### P2
- [ ] Real activity tracking backend (currently uses member activity + notifications)
- [ ] Real multiplayer games (currently client-side stubs)
- [ ] Push notifications (service worker)

### P3
- [ ] Image compression for uploads
- [ ] Analytics backend
- [ ] Profile verification flow improvements

## DB Schema
- **users**: id, email, displayName, avatar, verified, role, bio, friends
- **lounges**: id, name, description, theme, members, memberCount
- **stories**: id, userId, type, content, createdAt, viewedBy
- **notifications**: id, userId, type, title, message, read, createdAt
- **lounge_messages**: id, loungeId, createdAt, content

## Test Credentials
- Email: `kinglowkey@hotmail.com`
- Password: `password123`

## Known Issues
1. External preview URL unreliable (platform infrastructure issue)
2. Multiplayer game logic is client-side only (mocked)
3. Live feed supplements real notifications with member activity when insufficient notifications exist
