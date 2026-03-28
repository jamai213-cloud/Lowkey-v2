# Lowkey App - Product Requirements Document

## Overview
A premium adult social club / dating platform built with Next.js 14 (App Router) + MongoDB. The UI prioritizes people/connections first, with lounges as supporting interaction spaces and monetization visible but not intrusive.

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
│   ├── components/       # RadioMiniPlayer, etc.
│   ├── contexts/         # RadioContext, NotificationContext
│   ├── globals.css       # Global styles - premium dark theme
│   ├── page.js           # Home page (7-section layout, connections-first)
│   ├── afterdark/        # After Dark feature page
│   ├── lounge/page.js    # Lounge pages
│   ├── search/page.js    # Member search + profiles
│   ├── inbox/page.js     # Messages
│   ├── radio/            # Radio feature page
│   └── [other routes]    # Games, events, friends, profile, etc.
├── backend/              # FastAPI reverse proxy (port 8001 -> 3000)
└── package.json
```

## Home Page Structure (7 Sections — Connections First)
1. **Discover / Connections** (TOP) — 2-column profile card grid, "See all" to /search, connection requests
2. **Active Now** — Stories + online member avatars horizontal strip
3. **Recent Activity** — Lightweight activity signals (MOCKED: viewed profile, liked, online)
4. **Featured Lounge** — After Dark hero card with Live indicator and Enter CTA
5. **Lounges** — Real existing lounges in simple flat list (Night Owls, Chill Vibes, Music Lovers, etc.)
6. **Content / Monetisation** — Credits balance + Exclusive/Unlock buttons (subtle)
7. **Radio** — Existing radio feature, clean link to /radio (NOT renamed or rebuilt)

## Visual Design System
- Background: Deep navy `#0B0D14`
- Cards: `#111318` with `rgba(255,255,255,0.03-0.04)` borders
- Accents: Gold `#D4A54A` (premium), Red `#E8364E` (intensity), Blue `#3B82F6` (calm), Pink `#E84393`, Purple `#9333EA`, Green `#10B981`
- Style: Clean, structured, minimal. NO heavy gradient cards, no tile dashboards
- Typography: Strong hierarchy, font-heading for section labels

## Existing Features (UNCHANGED)
- Auth (login, signup, forgot password)
- Stories (create photo/video/text, view, expiry)
- Radio player (RadioMiniPlayer.js - fixed bottom bar)
- Notifications (polling + sound)
- Friend requests (accept/decline)
- Lounges (7 real lounges)
- After Dark (separate premium feature)
- Messaging (inbox, DMs)
- Events, Games, Profile

## Test Credentials
- Email: `kinglowkey@hotmail.com`
- Password: `password123`
- Role: Founder (admin privileges)

## What's Implemented
- [x] Home page (7-section connections-first layout)
- [x] Deep navy premium theme
- [x] Monetization UI stubs (wallet, tips, locked content, credits)
- [x] All existing features preserved (radio, stories, lounges, auth, etc.)
- [x] Vercel build compatibility (Suspense boundaries)
- [x] 100% test pass rate (backend + frontend)

## Upcoming Tasks (Pending User Approval)
- [ ] **P0**: User confirms Home page design
- [ ] **P1**: Lounge page visual upgrade (same premium style)
- [ ] **P1**: Profile page visual upgrade
- [ ] **P1**: Inbox/Messages visual upgrade
- [ ] **P1**: Search page visual upgrade
- [ ] **P2**: Real multiplayer games
- [ ] **P2**: Push notifications

## Known Limitations
- Recent Activity feed uses simulated signals (not real activity tracking)
- Preview URL unavailable (platform routing issue with forked environment)
- Games are client-side only (no real-time multiplayer)
