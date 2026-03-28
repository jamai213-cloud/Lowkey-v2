# LowKey - Product Requirements Document

## Original Problem Statement
Build "LowKey", a premium adult social/dating app with Next.js featuring profiles, lounges, messaging, radio, events, games, After Dark spaces.

## Architecture
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB
- **Deployment**: Vercel (user-managed)

## What's Been Implemented

### March 28, 2026 — Auto-Seed Lounges + Fix Inbox + Fix Friend Requests
- **Auto-seeding**: GET /api/lounges now auto-creates 4 required lounges (LowKey Lounge, After Dark, Kink Lounge, VIP Lounge) if missing — works on ANY database including production
- **Inbox API**: Added GET /api/inbox?userId=X (conversations), GET /api/inbox/{convoId}/messages, POST /api/inbox/{convoId}/messages
- **Inbox DM auto-open**: /inbox?dm={userId} param auto-creates conversation and opens it
- **Friend request bug fix**: Fixed variable shadowing in /api/friends/request AND /api/friends/accept (const request → const friendReq)
- Testing: 15/15 all passed (login, lounges, auto-seed, friend request/accept, inbox CRUD, navigation)

### March 28, 2026 — Unified Lounge System + Events
- All 4 lounges exist as real DB entries with engaging descriptions
- Unified card design, events section, quick actions

### March 28, 2026 — Home Screen Rebuild
- Premium dating-app layout, /profile/[userId] route

## Key API Endpoints
- POST /api/auth/login — Login
- GET /api/users — List users
- GET /api/profile/{id} — User profile
- GET /api/lounges — Regular lounges (auto-seeds missing ones)
- GET /api/lounges?afterDark=true — After Dark lounges
- GET /api/events — Events list
- POST /api/friends/request — Send friend request
- GET /api/friends/requests/{userId} — Pending requests
- POST /api/friends/accept — Accept request
- GET /api/inbox?userId=X — Conversations
- POST /api/inbox/{convoId}/messages — Send message
- GET /api/inbox/{convoId}/messages — Get messages
- POST /api/conversations — Create/find conversation

## Prioritized Backlog

### P0 (Done)
- [x] Home screen rebuild
- [x] Unified lounge system with auto-seeding
- [x] Fix inbox/messaging API
- [x] Fix friend request bugs

### P1 (Next)
- [ ] Apply design system to Search page
- [ ] RSVP for Events
- [ ] Vercel deployment verification

### P2
- [ ] Real activity tracking backend
- [ ] Real multiplayer games
- [ ] Push notifications

## Test Credentials
- Email: `kinglowkey@hotmail.com` / Password: `password123`
