# LowKey - Product Requirements Document

## Original Problem Statement
Build a premium social/dating app called "Lowkey" with lounge chat rooms, member discovery, real-time messaging, events, and a nightlife aesthetic.

## Core Requirements
- Dark theme social platform with MongoDB backend
- Lounge system (Grown Folks, LowKey, After Dark, Kink, VIP) with auto-seeding
- Member discovery, friend requests, inbox messaging
- Stories, events, radio, games features
- Premium nightlife visual aesthetic with neon glows

## Tech Stack
- Frontend: Next.js 14 (App Router), React, Tailwind CSS
- Backend: Next.js API Routes (monolithic route.js)
- Database: MongoDB (auto-seeding for core entities)
- Deployment: Vercel

## Test Credentials
- Email: kinglowkey@hotmail.com / Password: password123

## What's Been Implemented (Latest Session - March 2026)

### Neon Nightlife Visual Upgrade (COMPLETED)
All CSS-only changes to `app/page.js` and `app/globals.css`:

1. **Lounge Cards** - Each lounge has unique neon glow system:
   - Grown Folks: Rich gold (#FFD700) glow, GFB text logo, "Featured Community" badge
   - LowKey: Electric purple (#A855F7) glow, LK text logo
   - After Dark: Blue (#3B82F6) border glow, gold moon icon
   - Kink: Neon red (#EF4444) glow, handcuffs SVG icon
   - VIP: Emerald green (#10B981) glow, gold crown icon

2. **Discover Cards** - Rotating neon border colors (purple, blue, pink, cyan, red)
3. **Active Now** - Neon glowing rings per avatar with 8-color rotation
4. **Recent Activity** - Conditional colored borders (blue=online, green=joined, purple=updated)
5. **Quick Actions** - Radio=purple, Games=blue, Inbox=cyan neon buttons
6. **Section headings** - Icon drop-shadow glows
7. **Ambient background** - Increased purple/blue glow orbs
8. **CSS animations** - ring-neon-pulse, neon-border-breathe keyframes

### Previously Completed
- Unified Lounge card system with auto-seeding (5 core lounges)
- Dynamic profile route (/profile/[userId])
- Inbox API endpoints and friend request flow
- Event deletion for creators
- Story creation/viewing
- Radio mini player
- Notification system
- Dashboard stories panel

## Prioritized Backlog

### P1 - Upcoming
- Apply neon design system to /lounge, /search, /inbox pages for app-wide consistency
- Replace mocked Recent Activity with real backend activity feed

### P2 - Future
- Real multiplayer games (Ice Breaker, Tic-Tac-Toe) with backend sessions
- Push notifications via service worker
- Robust image compression for uploads

### P3 - Backlog
- Refactor monolithic route.js (~2900 lines) into modular API files
- Refactor page.js (~1140 lines) by extracting components
- Analytics backend for engagement tracking

## Known Issues
- Profile page route (/profile/{id}) returns 404 (pre-existing)
- Recent Activity uses mocked static data (not real backend feed)
- Multiplayer game logic is client-side only (no real-time backend)
- Code sync/deployment with Vercel can be unreliable
