# Lowkey App - Product Requirements Document

## Overview
A premium adult social club / dating platform built with Next.js 14 (App Router) + MongoDB. Connections are the primary focus, with lounges as supporting interaction spaces.

## Core Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (monolithic `app/api/[[...path]]/route.js`)
- **Database**: MongoDB (local, `lowkey` DB)
- **Auth**: Custom email/password with JWT
- **Deployment**: Vercel (production), Emergent (dev)

## Home Page Structure (7 Sections — Connections First)
1. **Discover / Connections** (DOMINANT) — Hero card (first user, full-width) + 2-column profile grid with unique gradient backgrounds, verification badges, online dots. Clicking any user opens **profile modal** (not /search)
2. **Active Now** — Stories + online member avatars horizontal strip with green online dots
3. **Recent Activity** — Real notifications when available, falls back to online member status signals
4. **Featured Lounge** — After Dark hero card with LIVE indicator and Enter CTA
5. **Lounges** — Real existing lounges (Night Owls, Chill Vibes, etc.) in simple list with lounge icons
6. **Content / Monetisation** — Credits + Exclusive/Unlock buttons (subtle, not intrusive)
7. **Radio** — Existing radio feature, clean link to /radio (NOT renamed or rebuilt)

## Profile Modal
- Opens from any user click (Discover, Active Now, Recent Activity)
- Shows: avatar/initial hero, name, verification badge, bio
- Actions: Connect (for non-friends), Message (for friends), Full Profile (goes to /search?view=)
- Slides up from bottom with backdrop blur
- Does NOT navigate away from home page

## Visual Design
- Background: Deep navy `#0C0F18`
- Cards: `#131720` with subtle borders
- Gradients: Rich, varied per profile card (gold→red, blue→purple, green→teal, etc.)
- Typography: Bold headings, clear hierarchy
- Accents: Gold `#D4A54A` (premium), Red `#E8364E`, Blue `#3B82F6`, Green `#10B981`
- Profile cards: Edge-to-edge gradients, not boxed

## Key Routing
- User cards → `viewProfile(userId)` → profile modal (NO /search navigation)
- "See all" → `/search` (intentional)
- "Full Profile" in modal → `/search?view=` (intentional)
- Lounges → `/lounge?id=`
- After Dark → `/afterdark`
- Radio → `/radio`

## Test Credentials
- Email: `kinglowkey@hotmail.com` / Password: `password123` / Role: founder

## What's Implemented
- [x] Home page (7-section connections-first layout with profile modal)
- [x] Profile modal with Connect/Message/Full Profile actions
- [x] Verification badges (Crown for founders, Check for verified)
- [x] All existing features preserved (radio, stories, lounges, auth, etc.)
- [x] 100% test pass rate (iteration_6.json)

## Upcoming (Pending User Approval on Home)
- [ ] Visual upgrade for Lounge, Profile, Inbox, Search pages
- [ ] Real activity tracking backend for Recent Activity

## Known Limitations
- Recent Activity falls back to simulated online statuses when no notifications exist
- Users have no avatars in test data (initials with gradient backgrounds used)
- Preview URL unavailable (platform issue)
