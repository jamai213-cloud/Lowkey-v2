# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js. The app features user profiles, lounges, messaging, radio, events, games, After Dark spaces, and more.

## Latest Pivots

### March 28, 2026 — Home Screen Rebuild
Complete UI replacement of the Home screen to feel like a premium, bright, and highly social dating app. People-first layout with horizontal profile cards, stories, live feed, lounges, and bottom navigation.

### March 28, 2026 — Unified Lounge Card System
Unify all lounge cards across the entire app into a single design system. Same structure (name + LIVE indicator + description + user count + Enter CTA) on both Home page and Lounge list page. Visual themes differentiate lounges by color:
- LowKey/Chill: purple (#8B5CF6)
- After Dark/Night: amber (#F59E0B)
- VIP/Exclusive: gold (#D4A54A)
- Bold/Late Night: red (#EF4444)
- Music: cyan (#06B6D4)
- Default: indigo (#6366F1)

## Architecture
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local)
- **Deployment**: Vercel (user-managed)

## What's Been Implemented

### March 28, 2026 — Unified Lounge Design System
- Consistent card structure across Home page and Lounge list page
- Theme mapping by lounge name keywords (purple, amber, gold, red, cyan, indigo)
- Each card: name, LIVE indicator, description, dynamic user count, Enter CTA
- After Dark banner uses same unified card structure
- Active copy: "People are already inside", "Step in if you're ready"
- No routing to /search from any lounge element
- Testing: 12/12 frontend features verified

### March 28, 2026 — Home Screen Complete Rebuild
- Premium dating-app Home screen from scratch
- Compact top bar, Hero Discover section, Stories, Live Feed, Lounges, Quick Access, Bottom Nav
- `/profile/[userId]` dynamic route
- Testing: 13/13 backend, 9/9 frontend verified

### Previous Sessions
- Auth, Radio, Notifications, Events, Stories, Mobile fixes, Game stubs

## Prioritized Backlog

### P0 (Done)
- [x] Complete Home screen visual rebuild
- [x] Unified lounge card design system

### P1 (Next)
- [ ] Apply new design system to Search, Inbox pages
- [ ] Fix Vercel deployment synchronization

### P2
- [ ] Real activity tracking backend
- [ ] Real multiplayer games
- [ ] Push notifications

### P3
- [ ] Image compression for uploads
- [ ] Analytics backend

## Test Credentials
- Email: `kinglowkey@hotmail.com`
- Password: `password123`

## Known Issues
1. External preview URL unreliable (platform issue)
2. Multiplayer game logic is client-side only (mocked)
