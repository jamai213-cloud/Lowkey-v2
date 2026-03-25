# Lowkey App - Product Requirements Document

## Original Problem Statement
Build and maintain "Lowkey" - a private social platform for adults featuring curated connections, lounges, events, and after-dark spaces. The app uses Next.js 14 (App Router), MongoDB, and is deployed on Vercel.

## Latest Requirement: Match Reference Screenshot UI
The user provided 5 reference screenshots showing a premium nightlife-themed UI with large lounge cards, fire emoji Live indicators, tag pills, "Join Lounge" buttons, search functionality, and clean People Online sections. All changes are visual-only.

## Architecture
- **Framework**: Next.js 14 (App Router), monolithic
- **Database**: MongoDB
- **Deployment**: Vercel (user's production) / Emergent Preview (dev)
- **Styling**: Tailwind CSS + custom design system in globals.css
- **API Proxy**: FastAPI on port 8001 proxies /api/* to Next.js on port 3000

## What's Been Implemented

### UI Upgrade - Phase 2: Reference Screenshot Matching (March 2026) - COMPLETED
- [x] Home page lounge cards: bold titles, "Live" + fire emoji, tag pills, colored "Join Lounge" buttons, user counts
- [x] Lounge list page: "Find your vibe" subtitle, search bar with real-time filtering, stats line (X active, X people online)
- [x] Purple "+" FAB button for create lounge
- [x] People Online: larger avatars (w-16), green online dots, better spacing, purple "See all"
- [x] New Matches section: purple "NEW" badge, star icon header, "See all" link
- [x] Consistent accent colors cycling: blue, gold, red, purple, pink, emerald
- [x] Backend proxy: FastAPI on 8001 proxies all /api/* to Next.js on 3000

### UI Upgrade - Phase 1: Design System (March 2026) - COMPLETED
- [x] Global design system: CSS variables, glass-morphism, animations, glow effects
- [x] Font system: Manrope (headings) + Figtree (body) via Google Fonts
- [x] Auth page: Animated background, glass card, gold accent
- [x] Home dashboard: scroll-based layout (Stories, People Online, Matches, Lounges, Quick Access)
- [x] Lounge page: accent-themed cards
- [x] All pages: page-enter animation, lk-page-header, data-testid attributes

### Previous Functional Features (Completed)
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
- **Code sync/deployment**: "Save to GitHub" has been unreliable. User should hard-refresh after deployments.
- **Multiplayer games**: Currently mocked (client-side only)

## Key Files
- `/app/app/globals.css` - Design system with lounge-card CSS
- `/app/app/page.js` - Home/Auth page (scroll-based layout)
- `/app/app/lounge/page.js` - Lounge list (search, stats, FAB) and chat
- `/app/backend/server.py` - FastAPI proxy (8001 -> 3000)
- `/app/design_guidelines.json` - Design guidelines source of truth

## Test Credentials
- Email: kinglowkey@hotmail.com
- Password: password123
