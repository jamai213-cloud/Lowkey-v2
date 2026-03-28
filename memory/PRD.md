# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js. The app features user profiles, lounges, messaging, radio, events, games, After Dark spaces, and more.

## Architecture
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local)
- **Deployment**: Vercel (user-managed)

## What's Been Implemented

### March 28, 2026 — Home Screen Layout Fix & Events
- Removed all duplicate profile grids (2-up featured, more profiles, extra profiles sections)
- Reordered sections: Discover → Active Now → Recent Activity → Events → Lounges → Quick Actions
- Added Events/Promotions section fetching from `/api/events`
- Seeded 3 sample events: Friday Night Live, Vinyl & Vibes, After Dark: Unmasked
- Seeded Kink Lounge (18 members) and After Dark lounge (31 members) into DB
- Updated Main Lounge (42 members) and VIP Room (7 members) counts
- Featured 4 lounges on Home: Main Lounge, After Dark, Kink Lounge, VIP Room
- Home page now fetches both regular and afterDark lounges via Promise.all
- Quick Actions changed from loose flex row to aligned 3-column grid
- Testing: 13/13 backend, 12/12 frontend — all passed

### March 28, 2026 — Unified Lounge Design System
- Consistent card structure (name + LIVE indicator + description + user count + Enter CTA)
- Visual themes by name: purple (LowKey), amber (Night), gold (VIP), red (Kink/Bold), cyan (Music)
- Applied to both Home page and Lounge list page

### March 28, 2026 — Home Screen Complete Rebuild
- Premium dating-app style: Compact top bar, Hero Discover, Stories, Live Feed, Bottom Nav
- `/profile/[userId]` dynamic route with full profile view

### Previous Sessions
- Auth system, Radio, Notifications, Events CRUD, Stories, Mobile fixes, Game stubs

## DB Schema
- **users**: id, email, displayName, avatar, verified, role, bio, friends
- **lounges**: id, name, description, theme, isAfterDark, members, memberCount
- **events**: id, title, description, date, creatorId, location, rsvps
- **stories**: id, userId, type, content, createdAt, viewedBy
- **notifications**: id, userId, type, title, message, read, createdAt

## Seeded Data
- 9 lounges: Main Lounge (42), Night Owls (23), Kink Lounge (18), Chill Vibes (15), Late Night Talks (12), Music Lovers (8), VIP Room (7), Music Corner (0), After Dark (31)
- 3 events: Friday Night Live, Vinyl & Vibes, After Dark: Unmasked

## Prioritized Backlog

### P0 (Done)
- [x] Complete Home screen visual rebuild
- [x] Unified lounge card design system
- [x] Fix layout duplication, section order, add Events section, seed lounges

### P1 (Next)
- [ ] Apply new design system to Search, Inbox pages
- [ ] Vercel deployment synchronization

### P2
- [ ] Real activity tracking backend
- [ ] Real multiplayer games
- [ ] Push notifications

## Test Credentials
- Email: `kinglowkey@hotmail.com`
- Password: `password123`

## Known Issues
1. External preview URL unreliable (platform infrastructure issue)
2. Multiplayer game logic is client-side only (mocked)
3. Live feed supplements real notifications with member activity
