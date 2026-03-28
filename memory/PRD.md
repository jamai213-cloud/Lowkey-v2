# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js featuring profiles, lounges, messaging, radio, events, games, After Dark spaces.

## Architecture
- Frontend: Next.js 14 (App Router), React, Tailwind CSS
- Backend: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- Database: MongoDB
- Deployment: Vercel

## What's Been Implemented

### March 28, 2026 — Grown Folks Featured Lounge
- Added "Grown Folks" lounge with gold/champagne premium glow (#C9A84C)
- Same unified card structure as all other lounges
- Additions: "Featured Community" badge (top-right), GFB logo (left of name)
- Auto-seeds in API alongside other 4 required lounges
- First position in featured lounges list on Home page

### March 28, 2026 — Auto-Seed + Inbox + Friend Request Fixes
- Auto-seeding: /api/lounges creates 5 required lounges if missing (works on ANY DB)
- Inbox API: GET/POST /api/inbox endpoints for conversations and messages
- Friend request variable shadowing bug fixed

### March 28, 2026 — Unified Lounge System + Events + Home Rebuild
- Complete Home screen rebuild (premium dating-app layout)
- Unified lounge card design system
- Events section, Quick Actions, Bottom Nav

## Seeded Lounges (Auto-Created)
1. Grown Folks (56) — gold/champagne, "Featured Community" badge
2. LowKey Lounge (42) — purple/blue
3. After Dark (31) — black/gold, isAfterDark=true
4. Kink Lounge (18) — deep red/neon
5. VIP Lounge (7) — gold/champagne

## Prioritized Backlog
### P1 (Next)
- [ ] Apply design system to Search, Inbox pages
- [ ] RSVP for Events
- [ ] Vercel deployment verification

### P2
- [ ] Real activity tracking backend
- [ ] Real multiplayer games
- [ ] Push notifications

## Test Credentials
- Email: kinglowkey@hotmail.com / Password: password123
