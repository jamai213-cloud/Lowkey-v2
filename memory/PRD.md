# Lowkey App - Product Requirements Document

## Overview
Lowkey is a Next.js-based social/dating application deployed on Vercel with MongoDB backend.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes (catch-all route at `/api/[[...path]]`)
- **Database**: MongoDB
- **Deployment**: Vercel

## Core Features
- User authentication (register/login)
- Profile management with gallery
- Friend request system
- Direct messaging
- Public lounge/chat
- Events management
- Radio streaming
- Notifications

## What's Been Implemented

### December 2024 Session - Bug Fixes & Enhancements

**Completed Tasks:**

1. **Radio Live Bar Layout Fix (P0)**
   - Updated `app/ClientLayout.js` with improved padding (pb-36 when radio active, pb-20 default)
   - Added `relative z-0` to main content for proper stacking
   - Updated `app/components/RadioMiniPlayer.js` with `z-[100]` for highest stacking priority

2. **Event Delete Feature (P1)**
   - Added DELETE endpoint in `app/api/[[...path]]/route.js` for `/events/:id`
   - Creator-only deletion with ownership verification
   - Updated `app/events/page.js` with delete button (Trash2 icon) visible only to event creators
   - Added confirmation dialog before deletion

3. **Chat/Lounge Message Expiry - 12 Hours (P2)**
   - Updated `/main-lounge/messages` GET endpoint to filter messages
   - Only returns messages from last 12 hours (`createdAt >= twelveHoursAgo`)

4. **Status/Stories Expiry - 24 Hours (Already Implemented)**
   - Verified `/stories` GET endpoint already filters by 24 hours
   - Uses `createdAt: { $gte: oneDayAgo }` filter

5. **Notification Sound System (P2) - ENHANCED**
   - Created `app/contexts/NotificationContext.js` with Web Audio API
   - Sound on/off toggle persisted to localStorage
   - Browser notification permission handling
   - Sound throttling (1 second minimum between sounds)
   - Helper methods: `notifyFriendRequest`, `notifyMessage`, `notifyInteraction`

6. **Friend Request System (Verified Working)**
   - Accept/decline flow in `app/api/[[...path]]/route.js` confirmed correct
   - Frontend properly refreshes state after accept/decline

7. **Stories Panel on Dashboard (NEW)**
   - Horizontal scrollable stories row with mobile optimization
   - User avatars with unviewed ring animation
   - Video/photo type indicators
   - Story viewer modal with full-screen support
   - Progress bars for multiple stories
   - Stories API returns user avatar

8. **Add Story Feature (NEW)**
   - "Add Story" button on dashboard
   - Support for photo, video, and text stories
   - Image compression before upload (reduces bandwidth)
   - Privacy settings (Everyone / Friends Only)
   - Background color picker for text stories
   - Upload progress indicator

9. **Image Compression Utility (NEW)**
   - Client-side image compression before upload
   - Reduces images to max 1200px width
   - Quality set to 80% for optimal balance

10. **Analytics Tracking (NEW)**
    - Local analytics storage for user engagement
    - Tracks story views, story creation, and other events
    - Ready for server-side integration

11. **Mobile CSS Improvements (NEW)**
    - Safe area padding for notched devices
    - Horizontal scroll optimization with touch support
    - Minimum 44px touch targets on mobile
    - Scroll snap for carousel-style components

12. **Kinks Scrolling Fix**
    - Fixed horizontal scroll in profile edit for kinks categories
    - Improved touch scrolling with WebkitOverflowScrolling

13. **Featured Spotlight Removed**
    - Removed from main dashboard as requested

## Key Files Modified
- `app/ClientLayout.js` - Layout wrapper with providers
- `app/components/RadioMiniPlayer.js` - Radio player component
- `app/contexts/NotificationContext.js` - NEW - Notification sound system with Web Audio API
- `app/events/page.js` - Events page with delete functionality
- `app/inbox/page.js` - Inbox with notification sounds
- `app/search/page.js` - Search page with notification sounds
- `app/page.js` - Main page with enhanced notification bell
- `app/api/[[...path]]/route.js` - API routes (event delete, message expiry)

## Key API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/details` - Update profile
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/decline` - Decline friend request
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `DELETE /api/events/:id` - Delete event (creator only)
- `GET /api/main-lounge/messages` - Get lounge messages (12hr expiry)
- `GET /api/stories` - Get stories (24hr expiry)

## Database Collections
- `users` - User accounts
- `friend_requests` - Pending friend requests
- `messages` - Direct messages
- `conversations` - Conversation threads
- `lounge_messages` - Public lounge chat
- `events` - Events
- `stories` - User stories (24hr)
- `gallery` - User photo galleries
- `notifications` - User notifications

## Remaining/Future Tasks
- None from current session - all 6 tasks completed

## Notes
- App is deployed to Vercel, not Emergent's preview environment
- User copies code changes to their GitHub repo for deployment
- Branch: `conflict_150226_2248` from `main`
