# Lowkey App - Product Requirements Document

## Overview
A premium adult social club platform built with Next.js 14 (App Router) + MongoDB. Features include lounges, messaging, stories, events, games, radio, and member profiles.

## Core Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local instance, `lowkey` DB)
- **Auth**: Custom email/password auth with JWT tokens
- **Deployment**: Vercel (user's production), Emergent preview (dev)

## Architecture
```
/app
├── app/                  # Next.js App Router
│   ├── api/              # API routes (monolithic route.js)
│   ├── components/       # Shared UI components
│   ├── contexts/         # React contexts (Radio, Notification)
│   ├── globals.css       # Global styles - premium dark theme
│   ├── page.js           # Home page (6-section layout)
│   ├── lounge/page.js    # Lounge pages
│   ├── search/page.js    # Member search + profiles
│   ├── inbox/page.js     # Messages
│   └── [other routes]    # Games, events, radio, etc.
├── backend/              # FastAPI reverse proxy (port 8001 -> 3000)
└── package.json
```

## Home Page Structure (Implemented)
1. **Featured Lounge** — "After Dark" hero with gold accent and "Enter" CTA
2. **Members Online + Stories** — Merged horizontal strip with story circles and online avatars
3. **New Matches** — Conditional section for pending friend requests
4. **Live Moments** — Lightweight activity feed (MOCKED data)
5. **Rooms / Lounges** — Simple flat list with colored accent bars
6. **Quick Access** — Compact icon row (Inbox, Games, Radio, Events, Search)

## Visual Design System
- Background: Deep navy `#0B0D14`
- Card surfaces: `#12121A`
- Accents: Gold `#D4A54A` (premium), Red `#E8364E` (intensity), Blue `#3B82F6` (calm), Purple `#9333EA`, Green `#10B981`
- Font: Heading (`font-heading`), clean sans-serif
- Style: Minimal cards, subtle glows, controlled gradients

## Monetization UI (Frontend Stubs Only)
- Credit balance in header (wallet icon)
- Tip buttons on profiles
- Locked gallery photos with blur + unlock
- "Go Private" action buttons

## Test Credentials
- Email: `kinglowkey@hotmail.com`
- Password: `password123`
- Role: Founder (admin privileges)

## What's Implemented
- [x] Auth flow (login, signup, forgot password)
- [x] Home page (6-section premium layout)
- [x] Lounges (list, join, chat)
- [x] Stories (create, view, expiry)
- [x] Members (search, profiles, friend requests)
- [x] Messaging (inbox, DMs)
- [x] Events (CRUD, founder can delete)
- [x] Games (Ice Breaker, Tic-Tac-Toe - client-side only)
- [x] Radio player (mini player)
- [x] Notification system (polling + sound)
- [x] Monetization UI stubs (wallet, tips, locked content)
- [x] Deep navy premium theme
- [x] Onboarding modal
- [x] Responsive mobile layout
- [x] Vercel build compatibility (Suspense boundaries)

## Upcoming Tasks
- [ ] **P0**: Get user feedback on Home page design, then apply to other pages
- [ ] **P1**: Lounge page visual upgrade
- [ ] **P1**: Profile page visual upgrade
- [ ] **P1**: Inbox/Messages visual upgrade
- [ ] **P2**: Search/Auth page refinement
- [ ] **P2**: Real multiplayer games
- [ ] **P2**: Push notifications (service worker)

## Known Limitations
- Live Moments feed is hardcoded mock data
- Multiplayer games are client-side only (no real-time backend)
- Deployment sync issues with Vercel (historical)
