# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js featuring profiles, lounges, messaging, radio, events, games, After Dark spaces.

## Architecture
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local)
- **Deployment**: Vercel (user-managed)

## What's Been Implemented

### March 28, 2026 — Unified Lounge System + Events + Copy Upgrade
- Renamed Main Lounge → **LowKey Lounge**, VIP Room → **VIP Lounge**
- All 4 named lounges exist as real DB entries: LowKey Lounge (42), After Dark (31), Kink Lounge (18), VIP Lounge (7)
- Upgraded descriptions: LowKey="Where everyone starts. Real people, real energy.", After Dark="No names. No limits. Just energy.", Kink="Push boundaries. Find your people.", VIP="Private access. Elevated connections."
- Unified card structure across Home + Lounge list (name + LIVE indicator + description + people count + Enter CTA)
- Events section: full-width stacked cards with date box, title, description, Join/View CTA
- Quick Actions: compact inline pill buttons (Radio, Games, Inbox)
- Both pages fetch regular + afterDark lounges via Promise.all
- Testing: 13/13 backend, 15/15 frontend — all passed

### March 28, 2026 — Home Screen Layout Fix
- Removed duplicate profile grids, reordered sections
- Added Events/Promotions section from /api/events
- Seeded Kink Lounge, After Dark, 3 events

### March 28, 2026 — Home Screen Complete Rebuild
- Premium dating-app style layout, /profile/[userId] dynamic route

## DB Schema
- **users**: id, email, displayName, avatar, verified, role, bio, friends
- **lounges**: id, name, description, theme, isAfterDark, members, memberCount
- **events**: id, title, description, date, creatorId, location, rsvps
- **stories**: id, userId, type, content, createdAt, viewedBy
- **notifications**: id, userId, type, title, message, read, createdAt

## Seeded Data
- 9 lounges: LowKey Lounge (42), After Dark (31), Night Owls (23), Kink Lounge (18), Chill Vibes (15), Late Night Talks (12), Music Lovers (8), VIP Lounge (7), Music Corner (0)
- 3 events: Friday Night Live, Vinyl & Vibes, After Dark: Unmasked

## Prioritized Backlog

### P0 (Done)
- [x] Complete Home screen visual rebuild
- [x] Unified lounge card design system
- [x] Fix layout duplication, section order, add Events
- [x] Lounge system: all 4 named lounges, unified cards, upgraded copy

### P1 (Next)
- [ ] Apply new design system to Search, Inbox pages
- [ ] RSVP functionality for Events
- [ ] Vercel deployment synchronization

### P2
- [ ] Real activity tracking backend
- [ ] Real multiplayer games
- [ ] Push notifications

## Test Credentials
- Email: `kinglowkey@hotmail.com` / Password: `password123`

## Known Issues
1. External preview URL unreliable (platform issue)
2. Multiplayer game logic is client-side only (mocked)
