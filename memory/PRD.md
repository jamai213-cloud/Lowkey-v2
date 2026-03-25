# Lowkey App - Product Requirements Document

## Original Problem Statement
Build and maintain "Lowkey" - a private social platform for adults featuring curated connections, lounges, events, and after-dark spaces. Next.js 14 (App Router), MongoDB, deployed on Vercel.

## Latest Requirement: Neon Electric Premium UI
The user rejected the initial heavy/dense color scheme. New direction: **smooth electric premium feel with neon borders**. Different accent colors per page unified in dark tone. Nightlife feel, adulting premium social dating chill spot. No duplicate buttons. No heavy solid gradient fills — only neon outlined buttons and glass-morphism.

## Architecture
- **Framework**: Next.js 14 (App Router), monolithic
- **Database**: MongoDB (local for preview, Atlas for production)
- **Deployment**: Vercel (user's production) / Emergent Preview (dev)
- **Styling**: Tailwind CSS + custom neon design system in globals.css
- **API Proxy**: FastAPI on port 8001 proxies /api/* to Next.js on port 3000

## Design System
- **Background**: `#08080D` (near-black)
- **Cards**: Glass-morphism with backdrop-blur, semi-transparent
- **Borders**: Neon accent colors at ~25% opacity, glowing on hover to ~45%
- **Buttons**: `neon-btn` class — transparent fill, colored border + box-shadow glow
- **Inputs**: `lk-input-neon` class — dark bg, purple glow on focus
- **Accents per page**: Home = purple, Lounge = blue/cycling, After Dark = gold, Profile = emerald
- **Color palette**: `#9333EA` (purple), `#3B82F6` (blue), `#D4A54A` (gold), `#E8364E` (red), `#10B981` (emerald), `#E84393` (pink)
- **Animated background**: Very subtle blurred blobs at 3-18% opacity with slow drift animations

## What's Been Implemented

### Neon UI Redesign (March 2026) - COMPLETED
- [x] Glass-morphism card system with neon accent borders (6 colors)
- [x] Auth page: neon purple theme, glass card, neon outlined Sign In/Join buttons
- [x] Animated background with ultra-subtle blobs (not dense)
- [x] Home page scroll layout: Stories → People Online → Active Lounges → Quick Access
- [x] Lounge cards: glass cards with accent-colored neon borders, "Live" indicator, "Join →" text link
- [x] Lounge list page: search bar, stats, neon input, purple FAB
- [x] People Online: 64px avatars, green online dots, purple "See all"
- [x] Quick Access: 5 tiles with neon-tinted borders per category
- [x] Bottom nav: purple active state (Home)
- [x] All amber/gold references converted to neon purple
- [x] No heavy solid gradient buttons anywhere
- [x] Backend proxy: FastAPI on 8001 → Next.js on 3000

### Previous Functional Features (Completed)
- Radio bar layout fix
- Notification system with sound
- Event deletion for founders
- Message & status expiry
- Dashboard stories panel
- Mobile-friendliness sweep
- Game stubs (client-side only)

## Backlog / Future Tasks
- **P2**: Real multiplayer games
- **P2**: Push notifications (service worker)
- **P3**: Image compression for uploads
- **P3**: Analytics backend

## Known Issues
- Code sync/deployment via "Save to GitHub" has been unreliable
- Multiplayer games are client-side only (mocked)

## Key Files
- `/app/app/globals.css` - Neon design system
- `/app/app/page.js` - Home/Auth page
- `/app/app/lounge/page.js` - Lounge list and chat
- `/app/backend/server.py` - FastAPI proxy

## Test Credentials
- Email: kinglowkey@hotmail.com
- Password: password123
