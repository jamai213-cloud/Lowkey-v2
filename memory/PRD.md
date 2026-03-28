# Lowkey App - Product Requirements Document

## Overview
Premium adult social club / dating platform. Connections are the primary focus. Feed-style UI like modern dating apps (Hinge/Bumble aesthetic).

## Tech Stack
- Next.js 14 (App Router) + MongoDB + Vercel
- No separate backend — API routes in Next.js

## Home Page Layout (Completely New — Feed Style)
The home page flows like a social feed, NOT stacked dashboard sections:

1. **Greeting** — "Hey, {name}" + "Who catches your eye tonight?"
2. **Hero Profile Card** — Full-width, 3:4 aspect ratio, stock photo (or real avatar), name + online dot + badge overlay. Taps to profile modal.
3. **Active Now** — Overlapping avatar row + "X online" count
4. **Stories** — Horizontal scroll (or "Share a story" when empty)
5. **2-Up Profile Grid** — Two profile cards side by side, photos, names, badges
6. **Connection Requests** — If pending, shown inline with Accept button
7. **Happening Now** — Real member activity (names + verbs like "is browsing", "just came online")
8. **After Dark Banner** — Vibrant gradient, Sparkles icon, LIVE indicator, Enter CTA
9. **2-Up More Profiles** — Additional profile cards
10. **Lounges** — Horizontal pill chips with names + member counts
11. **Even More Profiles** — Third grid of profile cards
12. **Quick Access** — Radio / Games / Inbox as inline row
13. **Credits** — Subtle wallet/credits link

## Profile Modal (Opens on User Click)
- Slides up from bottom (animate-slide-up)
- Shows: full-bleed photo hero, name, verification badges
- Actions: Connect (non-friends), Message (friends), Full Profile
- Stats: Friends count, Photos count
- Gallery preview if available
- Close button (X)

## Visual Design
- Background: `#0F1219` (warm dark navy, not flat black)
- Photos: Stock photos from unsplash/pexels as fallback avatars
- Accents: Coral `#F43F5E`, Gold `#F59E0B`, Indigo `#6366F1`, Green `#22C55E`
- Cards: Full-bleed photos with gradient overlays, rounded-3xl/2xl
- No boxed sections, no heavy containers, no dashboard tiles
- Feed flows naturally with profiles interleaved with content

## Routing
- All user clicks → viewProfile() → profile modal (stays on home)
- "See all" → /search (intentional)
- "Full Profile" in modal → /search?view= (intentional)
- After Dark → /afterdark
- Lounges → /lounge?id=
- Radio → /radio
- Games → /games
- Inbox → /inbox

## Test Credentials
- Email: `kinglowkey@hotmail.com` / Password: `password123`

## Test Status
- iteration_7.json: 100% pass (13/13 backend + all frontend features)

## Upcoming (After User Approval)
- [ ] Lounge page visual upgrade
- [ ] Profile page visual upgrade
- [ ] Inbox/Messages visual upgrade
- [ ] Search page visual upgrade

## Known Limitations
- Stock photos used as fallback avatars (users have no real photos in test data)
- Recent Activity simulated from online member data (no real activity tracking)
- Preview URL unavailable (platform issue with forked environment)
