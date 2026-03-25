# Lowkey App - Product Requirements Document

## Original Problem Statement
Private adult social platform: curated connections, lounges, events, after-dark spaces. Next.js 14, MongoDB, Vercel.

## Current Design Direction (March 2026)
Premium, vibrant, alive — not gloomy. Deep navy base, warm gold/red/blue accents. Featured lounge hero, gradient avatars, lounge cards with colored accent bars and depth.

## Architecture
- **Framework**: Next.js 14 (App Router), monolithic
- **Database**: MongoDB
- **Styling**: Tailwind CSS + custom design system (globals.css)
- **API Proxy**: FastAPI on port 8001 proxies to Next.js on port 3000

## Design System
- **Base**: `#0B0D14` (deep navy, not flat black)
- **Surfaces**: `#111420` cards, `#141824` gradient cards
- **Featured card**: warm gold/red radial glow, `.featured-card` class
- **Lounge cards**: `.lounge-card` with colored top accent bars, inner shine
- **Accents**: gold `#D4A54A` (premium), red `#E8364E` (energy), blue `#3B82F6` (chill), cyan `#22D3EE`, purple `#9333EA`
- **Avatars**: `.avatar-ring` with gradient border, colored initial backgrounds

## What's Been Implemented

### Vibrant UI Redesign — Home + Lounge (DONE)
- [x] Featured Lounge hero card (warm gold glow, Enter CTA, live count)
- [x] People Online with gradient-colored avatar initials + pulse green dot
- [x] Active Lounges with colored accent bars (blue/red/cyan)
- [x] Quick Access as compact inline row (not tile dashboard)
- [x] Lounge list with unique accent per lounge (blue/gold/red/cyan/purple/emerald)
- [x] Deep navy backgrounds with warm ambient glow blobs
- [x] Section dividers between scroll sections
- [x] Build passes clean (Suspense fix for /lounge)

### Monetisation UI (DONE)
- [x] Credit/wallet indicator in header (gold)
- [x] Tip button on user profiles and lounge members
- [x] Locked content UI (blurred gallery + unlock overlay)
- [x] "Go Private" button in lounge chat header

### Previous Features (DONE)
- Radio, notifications, events, stories, games stubs, mobile fixes

## Pending (Waiting for User Confirmation)
- After Dark page visual upgrade
- Profile page visual upgrade
- Auth/Login page refinement
- Inbox/Messages visual upgrade
- Search page visual upgrade

## Backlog
- P2: Real multiplayer games
- P2: Push notifications
- P3: Image compression
- P3: Analytics

## Test Credentials
- Email: kinglowkey@hotmail.com / Password: password123
