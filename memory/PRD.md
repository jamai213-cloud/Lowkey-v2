# LowKey App - Product Requirements Document

## Original Problem Statement
The user wants to fix several UI issues in their Next.js application (LowKey) deployed on Vercel.

## Core Application
LowKey is a social app with features including:
- User authentication (email/password)
- Friend system (requests, accept/decline)
- Real-time messaging (inbox)
- Community lounge
- Radio player
- Events system
- Status/Stories (24hr expiry)
- Profile customization

## Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Deployment**: Vercel

---

## Completed Tasks (March 8, 2026)

### 1. Friend Request System Bug Fix ✅
**Issue**: Variable shadowing causing "Cannot access 's' before initialization" error  
**Fix**: Renamed `request` variable to `friendRequest` in:
- `/api/friends/request` POST endpoint
- `/api/friends/accept` POST endpoint
**Files**: `app/api/[[...path]]/route.js`

### 2. Event Delete Feature ✅
**Issue**: Delete button not visible, no DELETE endpoint  
**Fix**:
- Added DELETE endpoint `/api/events/{eventId}?userId=xxx`
- Only event creator can delete (403 if not)
- Added trash icon button visible only to creator on frontend
**Files**: `app/api/[[...path]]/route.js`, `app/events/page.js`

### 3. Message Expiry (12 hours) ✅
**Issue**: Messages should auto-expire  
**Fix**: Added 12-hour filter to:
- `/messages/{convoId}` GET - inbox messages
- `/main-lounge/messages` GET - lounge messages
**Files**: `app/api/[[...path]]/route.js`

### 4. Status/Stories Expiry (24 hours) ✅
**Status**: Already implemented - `/stories` GET filters by 24hr createdAt

### 5. Notifications + Sound System ✅
**Implementation**:
- Created `NotificationSoundContext.js` with Web Audio API
- Sound toggle button in header (Volume2/VolumeX icons)
- Auto-polling for notifications every 30 seconds
- Sound plays when new unread notifications detected
**Files**: `app/contexts/NotificationSoundContext.js`, `app/ClientLayout.js`, `app/page.js`

### 6. Radio Live Bar UI Fix ✅
**Issue**: Radio player blocking navigation  
**Fix**:
- Bottom nav moves up 72px when radio is active
- Main content padding increases to `pb-40` when radio active
**Files**: `app/page.js`

---

## API Endpoints Reference

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login (uses `identifier`, not `email`)
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with token

### Friends
- POST `/api/friends/request` - Send friend request
- POST `/api/friends/accept` - Accept friend request
- POST `/api/friends/decline` - Decline friend request
- GET `/api/friends/{userId}` - Get user's friends list

### Events
- GET `/api/events` - List all events
- POST `/api/events` - Create event (include `createdBy` field)
- DELETE `/api/events/{eventId}?userId=xxx` - Delete event (creator only)
- POST `/api/events/{eventId}/rsvp` - RSVP to event

### Messages
- GET `/api/messages/{convoId}` - Get messages (12hr filter)
- POST `/api/messages` - Send message
- GET `/api/main-lounge/messages` - Get lounge messages (12hr filter)
- POST `/api/main-lounge/messages` - Post to lounge

### Notifications
- GET `/api/notifications/{userId}` - Get user notifications
- POST `/api/notifications/mark-read` - Mark notifications read

---

## Pending/Future Tasks

### P0 (High Priority)
- [ ] Codebase validation on Vercel after file updates
- [ ] Full E2E testing on deployed site

### P1 (Medium Priority)
- [ ] Public profile sections rendering in search/friends modals
- [ ] Gallery lightbox modal implementation
- [ ] Lounge upload device-only restriction
- [ ] Kinks & Preferences tabs scrollable on mobile
- [ ] Inbox avatars display

### P2 (Lower Priority)
- [ ] Browser push notifications integration
- [ ] Message read receipts
- [ ] Typing indicators

---

## Key Files Modified

```
app/
├── ClientLayout.js (added NotificationSoundProvider)
├── page.js (radio bar fix, notification sounds, sound toggle)
├── events/page.js (delete button for creators)
├── contexts/
│   └── NotificationSoundContext.js (NEW)
└── api/[[...path]]/route.js (friend request fix, event delete, message expiry)
```

---

## Notes for Future Development
1. The preview environment has routing limitations - external preview URL may not work
2. Next.js uses `output: standalone` configuration
3. MongoDB ObjectId must be cleaned from responses (`cleanMongoDoc` function)
4. Login uses `identifier` field (accepts email OR displayName)
