# LowKey v2 - Product Requirements Document

## Original Problem Statement
Fix multiple UI issues in production app (https://lowkey-v2.vercel.app):
1. Public Profile - Missing Sections (only showing Interests)
2. Gallery - Tap to Enlarge (no lightbox)
3. Lounge Upload Restriction (had URL input)
4. Kinks & Preferences Tabs Overflow on Mobile
5. Radio "LIVE" Strip Blocking UI Navigation

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: MongoDB
- **Deployment**: Vercel
- **Repository**: github.com/jamai213-cloud/Lowkey-v2
- **Branch**: conflict_150226_2248

## User Personas
- Adult dating/social network users
- Content creators
- Founders/admins

## Core Requirements (Static)
- Profile viewing with full details
- Gallery with privacy settings
- Radio streaming with persistent playback
- Social features (friends, messages)
- Creator subscriptions

## What's Been Implemented (Feb 16, 2026)

### 1. Public Profile - Full Section Display
**Files Changed**: `/app/app/search/page.js`
- Profile modal now displays ALL profileDetails sections:
  - About Me
  - Age / Location / Gender
  - Looking For
  - Relationship Status / Sexuality
  - Physical attributes (Height, Body Type, Eye Color, Hair Color, Ethnicity)
  - Lifestyle (Smoking, Drinking)
  - Interested In
  - Open To
  - Kinks & Preferences
  - Hard Limits
  - Gallery Preview

### 2. Gallery Lightbox/Modal
**Files Changed**: `/app/app/profile/page.js`, `/app/app/search/page.js`
- Implemented full-screen lightbox modal for gallery images
- Navigation arrows for browsing multiple images
- Image counter display
- Click outside to close
- Support for videos

### 3. Lounge Device-Only Upload
**Files Changed**: `/app/app/lounge/page.js`
- Removed URL input field
- Added device file picker with `<input type="file">`
- Preview image before posting
- Max 10MB file size validation
- Image-only restriction

### 4. Kinks & Preferences Tabs - Horizontal Scroll
**Files Changed**: `/app/app/profile/edit/page.js`
- Category tabs now horizontally scrollable with snap behavior
- Added scroll container with `-mx-4 px-4` for full-width scroll
- `snap-x snap-mandatory` for smooth tab scrolling
- Hidden scrollbar for clean appearance

### 5. Radio Bar - Bottom Padding Fix
**Files Changed**: `/app/app/ClientLayout.js`, `/app/app/components/RadioMiniPlayer.js`
- Created `MainContent` component that reads radio state
- Dynamic padding: `pb-32` when radio active, `pb-16` otherwise
- Added proper safe-area-inset-bottom for iOS devices

## Prioritized Backlog

### P0 (Critical) - NONE

### P1 (High Priority)
- Push changes to GitHub and deploy to Vercel
- Test all fixes on production

### P2 (Medium Priority)
- Add touch gesture support for lightbox (swipe navigation)
- Add loading states for image gallery
- Improve gallery image compression

## Next Tasks
1. User needs to push changes via "Save to Github" feature
2. Verify Vercel auto-deploys from the branch
3. Test all fixes on production URL
4. Mobile testing for tab scroll and radio bar spacing

## Files Modified
- `/app/app/search/page.js` - Public profile modal with all sections + lightbox
- `/app/app/profile/page.js` - Gallery lightbox modal
- `/app/app/lounge/page.js` - Device-only file upload
- `/app/app/profile/edit/page.js` - Horizontal scrollable kink tabs
- `/app/app/ClientLayout.js` - Dynamic padding for radio
- `/app/app/components/RadioMiniPlayer.js` - Safe area spacing
