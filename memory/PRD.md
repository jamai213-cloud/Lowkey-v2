# Lowkey App - Product Requirements Document

## Original Problem Statement
Build and maintain "Lowkey" - a private social platform for adults featuring curated connections, lounges, events, and after-dark spaces. The app uses Next.js 14 (App Router), MongoDB, and is deployed on Vercel.

## Latest Requirement: Complete UI/Visual Upgrade
The user requested a full visual-only upgrade while preserving all existing functionality. The new design system features:
- Dark base (#0A0A0F) with glass-morphism cards (#12121A)
- Section-specific accent colors (Purple=Home, Cyan=Lounge, Indigo=Messages, Orange=After Dark, Amber=Events, Stone=Profile)
- Manrope (headings) + Figtree (body) fonts
- Pill-shaped buttons, subtle glow effects, generous spacing
- Animated login background with blobs
- Page entrance animations

## Architecture
- **Framework**: Next.js 14 (App Router), monolithic
- **Database**: MongoDB
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + custom design system in globals.css

## What's Been Implemented

### UI Visual Upgrade (March 2026) - COMPLETED
- [x] Global design system: CSS variables, glass-morphism, animations, glow effects
- [x] Font system: Manrope (headings) + Figtree (body) via Google Fonts
- [x] Auth page: Animated background, glass card, purple accent
- [x] Home dashboard: Premium header, stories panel, 3-column tile grid, bottom navigation
- [x] Lounge page: Cyan accent theme
- [x] Inbox/Messages: Indigo accent theme
- [x] Friends page: Updated card list styling
- [x] Search page: Premium search input, result cards
- [x] After Dark: Orange accent, age gate, room list
- [x] Events page: Amber accent, pill-shaped RSVP buttons
- [x] Profile page: Updated header and skin system
- [x] RadioMiniPlayer: Premium styling
- [x] All modals: backdrop-blur-md + glass-card
- [x] All pages: page-enter animation, lk-page-header
- [x] data-testid attributes on key elements

### Previous Functional Features (Completed before UI upgrade)
- Radio bar layout fix
- Professional notification system with sound
- Event deletion for founders/creators
- Message & status expiry (12h messages, 24h stories)
- Dashboard stories panel + add story modal
- Mobile-friendliness sweep
- Game stubs (Ice Breaker, Tic-Tac-Toe - client-side only)

## Backlog / Future Tasks
- **P2**: Real multiplayer games (backend game sessions)
- **P2**: Push notifications (service worker)
- **P3**: Image compression for uploads
- **P3**: Analytics backend integration

## Known Issues
- **Code sync/deployment**: Save to GitHub has been unreliable. User should hard-refresh after deployments.
- **Multiplayer games**: Currently mocked (client-side only)

## Key Files
- `/app/app/globals.css` - Design system
- `/app/app/page.js` - Home/Auth page
- `/app/app/lounge/page.js` - Lounge (cyan)
- `/app/app/inbox/page.js` - Messages (indigo)
- `/app/app/afterdark/page.js` - After Dark (orange)
- `/app/app/events/page.js` - Events (amber)
- `/app/app/search/page.js` - Search
- `/app/app/friends/page.js` - Friends
- `/app/app/profile/page.js` - Profile (stone)
- `/app/design_guidelines.json` - Design guidelines source of truth
