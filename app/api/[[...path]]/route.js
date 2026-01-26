import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MongoDB connection
let client = null
let clientPromise = null

function getMongoUri() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL
  if (!uri) {
    console.error('[MongoDB] ERROR: No MongoDB URI found')
    throw new Error('MONGODB_URI environment variable is not defined')
  }
  return uri
}

function getDbName() {
  return process.env.DB_NAME || 'lowkey'
}

async function connectToMongo() {
  try {
    const uri = getMongoUri()
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      clientPromise = client.connect()
    }
    await clientPromise
    return client.db(getDbName())
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message)
    clientPromise = null
    client = null
    throw error
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function safeParseJson(request) {
  try {
    const text = await request.text()
    if (!text || text.trim() === '') return {}
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

function cleanMongoDoc(doc) {
  if (!doc) return null
  const { _id, password, ...rest } = doc
  return rest
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // ==================== AUTH ====================
    if (route === '/auth/register' && method === 'POST') {
      const body = await safeParseJson(request)
      const { email, password, displayName } = body
      if (!email || !password || !displayName) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }))
      }
      const existing = await db.collection('users').findOne({
        $or: [{ email: email.toLowerCase() }, { displayNameLower: displayName.toLowerCase() }]
      })
      if (existing) {
        return handleCORS(NextResponse.json({ error: 'User already exists' }, { status: 400 }))
      }
      const userId = uuidv4()
      const token = generateToken()
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        displayName,
        displayNameLower: displayName.toLowerCase(),
        password: hashPassword(password),
        verified: false,
        quietMode: false,
        ageVerified: false,
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        token
      }
      await db.collection('users').insertOne(newUser)
      return handleCORS(NextResponse.json({ user: cleanMongoDoc(newUser), token }))
    }

    if (route === '/auth/login' && method === 'POST') {
      const body = await safeParseJson(request)
      const { identifier, password } = body
      if (!identifier || !password) {
        return handleCORS(NextResponse.json({ error: 'Credentials required' }, { status: 400 }))
      }
      const user = await db.collection('users').findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { displayNameLower: identifier.toLowerCase() }
        ]
      })
      if (!user || user.password !== hashPassword(password)) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      }
      const token = generateToken()
      await db.collection('users').updateOne({ id: user.id }, { $set: { token, lastLogin: new Date() } })
      return handleCORS(NextResponse.json({ user: cleanMongoDoc(user), token }))
    }

    // ==================== USERS & PROFILE ====================
    if (route === '/users' && method === 'GET') {
      const users = await db.collection('users').find({}).toArray()
      return handleCORS(NextResponse.json(users.map(cleanMongoDoc)))
    }

    if (route.match(/^\/users\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      const user = await db.collection('users').findOne({ id: userId })
      return handleCORS(NextResponse.json(user ? cleanMongoDoc(user) : { error: 'Not found' }))
    }

    if (route.match(/^\/users\/[^/]+\/verify$/) && method === 'PUT') {
      const userId = path[1]
      const body = await safeParseJson(request)
      await db.collection('users').updateOne({ id: userId }, { $set: { verified: body.verified } })
      const user = await db.collection('users').findOne({ id: userId })
      return handleCORS(NextResponse.json(cleanMongoDoc(user)))
    }

    // ==================== ADMIN ENDPOINTS ====================
    // Delete/Remove a user (Admin only)
    if (route.match(/^\/admin\/users\/[^/]+\/delete$/) && method === 'DELETE') {
      const userId = path[2]
      const body = await safeParseJson(request)
      const adminId = body.adminId
      
      // Verify requester is admin
      const admin = await db.collection('users').findOne({ id: adminId, role: 'admin' })
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 }))
      }
      
      // Delete the user
      const result = await db.collection('users').deleteOne({ id: userId })
      if (result.deletedCount === 0) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }
      
      // Also clean up related data
      await db.collection('messages').deleteMany({ senderId: userId })
      await db.collection('conversations').updateMany({}, { $pull: { members: userId } })
      await db.collection('friends').deleteMany({ $or: [{ userId }, { friendId: userId }] })
      
      return handleCORS(NextResponse.json({ success: true, message: 'User deleted successfully' }))
    }

    // Get all users with full details (Admin only)
    if (route === '/admin/users' && method === 'POST') {
      const body = await safeParseJson(request)
      const adminId = body.adminId
      
      // Verify requester is admin
      const admin = await db.collection('users').findOne({ id: adminId, role: 'admin' })
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 }))
      }
      
      const users = await db.collection('users').find({}).toArray()
      return handleCORS(NextResponse.json(users.map(u => ({
        ...cleanMongoDoc(u),
        password: undefined // Hide passwords
      }))))
    }

    // Bulk verify/unverify users (Admin only)
    if (route === '/admin/users/bulk-verify' && method === 'POST') {
      const body = await safeParseJson(request)
      const { adminId, userIds, verified } = body
      
      // Verify requester is admin
      const admin = await db.collection('users').findOne({ id: adminId, role: 'admin' })
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 }))
      }
      
      await db.collection('users').updateMany(
        { id: { $in: userIds } },
        { $set: { verified } }
      )
      return handleCORS(NextResponse.json({ success: true, message: `${userIds.length} users updated` }))
    }

    // Ban/Suspend a user (Admin only)
    if (route.match(/^\/admin\/users\/[^/]+\/ban$/) && method === 'PUT') {
      const userId = path[2]
      const body = await safeParseJson(request)
      const { adminId, banned, reason } = body
      
      // Verify requester is admin
      const admin = await db.collection('users').findOne({ id: adminId, role: 'admin' })
      if (!admin) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 }))
      }
      
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { banned, banReason: reason, bannedAt: banned ? new Date() : null, bannedBy: banned ? adminId : null } }
      )
      const user = await db.collection('users').findOne({ id: userId })
      return handleCORS(NextResponse.json({ success: true, user: cleanMongoDoc(user) }))
    }

    // ==================== FOUNDER ENDPOINTS (kinglowkey@hotmail.com ONLY) ====================
    const FOUNDER_EMAIL = 'kinglowkey@hotmail.com'
    
    // Check if user is founder
    if (route === '/founder/check' && method === 'POST') {
      const body = await safeParseJson(request)
      const user = await db.collection('users').findOne({ id: body.userId })
      const isFounder = user?.email?.toLowerCase() === FOUNDER_EMAIL.toLowerCase()
      return handleCORS(NextResponse.json({ isFounder, user: user ? cleanMongoDoc(user) : null }))
    }

    // Get all users (Founder only)
    if (route === '/founder/users' && method === 'POST') {
      const body = await safeParseJson(request)
      const requester = await db.collection('users').findOne({ id: body.founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(users.map(u => ({ ...cleanMongoDoc(u), password: undefined }))))
    }

    // Toggle verification tier (Founder only) - New Member, Verified, Trusted, Inner Circle
    if (route === '/founder/verify' && method === 'POST') {
      const body = await safeParseJson(request)
      const { founderId, userId, verificationTier } = body
      const requester = await db.collection('users').findOne({ id: founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      // verificationTier: 'new', 'verified', 'trusted', 'inner-circle'
      await db.collection('users').updateOne({ id: userId }, { 
        $set: { 
          verificationTier: verificationTier || 'new',
          verified: verificationTier !== 'new'
        } 
      })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PROFILE GALLERY ====================
    if (route === '/gallery' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const viewerId = url.searchParams.get('viewerId')
      
      const owner = await db.collection('users').findOne({ id: userId })
      const viewer = await db.collection('users').findOne({ id: viewerId })
      
      // Check privacy settings
      const isFriend = owner?.friends?.includes(viewerId)
      const isOwner = userId === viewerId
      
      let query = { userId }
      if (!isOwner) {
        if (owner?.galleryPrivacy === 'friends' && !isFriend) {
          return handleCORS(NextResponse.json({ items: [], restricted: true, message: 'Gallery is friends only' }))
        }
      }
      
      const items = await db.collection('gallery').find(query).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json({ items: items.map(cleanMongoDoc), restricted: false }))
    }

    if (route === '/gallery' && method === 'POST') {
      const body = await safeParseJson(request)
      const item = {
        id: uuidv4(),
        userId: body.userId,
        type: body.type, // 'photo' or 'video'
        url: body.url,
        thumbnail: body.thumbnail,
        caption: body.caption,
        createdAt: new Date()
      }
      await db.collection('gallery').insertOne(item)
      return handleCORS(NextResponse.json(cleanMongoDoc(item)))
    }

    if (route.match(/^\/gallery\/[^/]+$/) && method === 'DELETE') {
      const itemId = path[1]
      await db.collection('gallery').deleteOne({ id: itemId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/gallery/privacy' && method === 'PUT') {
      const body = await safeParseJson(request)
      await db.collection('users').updateOne(
        { id: body.userId },
        { $set: { galleryPrivacy: body.privacy } } // 'public' or 'friends'
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== STORIES / STATUS (24hr) ====================
    if (route === '/stories' && method === 'GET') {
      const url = new URL(request.url)
      const viewerId = url.searchParams.get('viewerId')
      const viewer = await db.collection('users').findOne({ id: viewerId })
      
      // Get stories from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const allStories = await db.collection('stories').find({ 
        createdAt: { $gte: oneDayAgo } 
      }).sort({ createdAt: -1 }).toArray()
      
      // Filter by privacy
      const visibleStories = allStories.filter(story => {
        if (story.userId === viewerId) return true
        if (story.privacy === 'everyone') return true
        if (story.privacy === 'friends') {
          const owner = viewer?.friends?.includes(story.userId)
          return owner
        }
        return false
      })
      
      // Group by user
      const grouped = {}
      for (const story of visibleStories) {
        if (!grouped[story.userId]) {
          const user = await db.collection('users').findOne({ id: story.userId })
          grouped[story.userId] = {
            userId: story.userId,
            displayName: user?.displayName || 'Unknown',
            verificationTier: user?.verificationTier || 'new',
            stories: []
          }
        }
        grouped[story.userId].stories.push(cleanMongoDoc(story))
      }
      
      return handleCORS(NextResponse.json(Object.values(grouped)))
    }

    if (route === '/stories' && method === 'POST') {
      const body = await safeParseJson(request)
      const story = {
        id: uuidv4(),
        userId: body.userId,
        type: body.type, // 'photo', 'video', 'text'
        content: body.content, // URL for media, text for status
        backgroundColor: body.backgroundColor,
        privacy: body.privacy || 'everyone', // 'everyone' or 'friends'
        views: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
      await db.collection('stories').insertOne(story)
      return handleCORS(NextResponse.json(cleanMongoDoc(story)))
    }

    if (route.match(/^\/stories\/[^/]+\/view$/) && method === 'POST') {
      const storyId = path[1]
      const body = await safeParseJson(request)
      await db.collection('stories').updateOne(
        { id: storyId },
        { $addToSet: { views: body.viewerId } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/stories\/[^/]+$/) && method === 'DELETE') {
      const storyId = path[1]
      await db.collection('stories').deleteOne({ id: storyId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== MUSIC SEARCH & PROFILE SONGS ====================
    if (route === '/music/search' && method === 'GET') {
      const url = new URL(request.url)
      const query = url.searchParams.get('q')?.toLowerCase() || ''
      
      // Search in our music database
      const tracks = await db.collection('music_library').find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { artist: { $regex: query, $options: 'i' } },
          { album: { $regex: query, $options: 'i' } }
        ]
      }).limit(20).toArray()
      
      return handleCORS(NextResponse.json(tracks.map(cleanMongoDoc)))
    }

    if (route === '/music/library' && method === 'POST') {
      // Add a track to the music library (admin only)
      const body = await safeParseJson(request)
      const track = {
        id: uuidv4(),
        title: body.title,
        artist: body.artist,
        album: body.album,
        duration: body.duration,
        previewUrl: body.previewUrl,
        coverUrl: body.coverUrl,
        createdAt: new Date()
      }
      await db.collection('music_library').insertOne(track)
      return handleCORS(NextResponse.json(cleanMongoDoc(track)))
    }

    if (route === '/profile/song' && method === 'PUT') {
      const body = await safeParseJson(request)
      await db.collection('users').updateOne(
        { id: body.userId },
        { $set: { profileSong: body.song } } // { trackId, title, artist, previewUrl }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/profile/song' && method === 'DELETE') {
      const body = await safeParseJson(request)
      await db.collection('users').updateOne(
        { id: body.userId },
        { $unset: { profileSong: '' } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PROFILE SKINS (Premium £1) ====================
    const PROFILE_SKINS = [
      { id: 'default', name: 'Default', colors: ['#1a1a2e', '#16213e'], price: 0 },
      { id: 'midnight', name: 'Midnight Purple', colors: ['#2d1b4e', '#1a1a2e'], price: 1 },
      { id: 'ocean', name: 'Ocean Blue', colors: ['#0c2340', '#1a365d'], price: 1 },
      { id: 'sunset', name: 'Sunset Orange', colors: ['#3d1c02', '#5c2c06'], price: 1 },
      { id: 'forest', name: 'Forest Green', colors: ['#0d2818', '#1a4d2e'], price: 1 },
      { id: 'rose', name: 'Rose Gold', colors: ['#3d2b2b', '#4a3333'], price: 1 },
      { id: 'neon', name: 'Neon Glow', colors: ['#1a0a2e', '#2d1b4e'], price: 1 },
      { id: 'gold', name: 'Royal Gold', colors: ['#2d2006', '#3d2b08'], price: 1 }
    ]

    if (route === '/skins' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const user = await db.collection('users').findOne({ id: userId })
      const owned = user?.ownedSkins || ['default']
      
      const skinsWithOwnership = PROFILE_SKINS.map(skin => ({
        ...skin,
        owned: owned.includes(skin.id)
      }))
      
      return handleCORS(NextResponse.json({ 
        skins: skinsWithOwnership,
        currentSkin: user?.currentSkin || 'default'
      }))
    }

    if (route === '/skins/purchase' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, skinId } = body
      
      const skin = PROFILE_SKINS.find(s => s.id === skinId)
      if (!skin) return handleCORS(NextResponse.json({ error: 'Skin not found' }, { status: 404 }))
      
      const user = await db.collection('users').findOne({ id: userId })
      if (user?.ownedSkins?.includes(skinId)) {
        return handleCORS(NextResponse.json({ error: 'Already owned' }, { status: 400 }))
      }
      
      // Record transaction
      const transaction = {
        id: uuidv4(),
        type: 'skin_purchase',
        userId,
        skinId,
        amount: skin.price,
        currency: 'GBP',
        createdAt: new Date()
      }
      await db.collection('transactions').insertOne(transaction)
      
      // Add skin to user
      await db.collection('users').updateOne(
        { id: userId },
        { $addToSet: { ownedSkins: skinId } }
      )
      
      return handleCORS(NextResponse.json({ success: true, transaction: cleanMongoDoc(transaction) }))
    }

    if (route === '/skins/equip' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, skinId } = body
      
      const user = await db.collection('users').findOne({ id: userId })
      if (!user?.ownedSkins?.includes(skinId) && skinId !== 'default') {
        return handleCORS(NextResponse.json({ error: 'Skin not owned' }, { status: 403 }))
      }
      
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { currentSkin: skinId } }
      )
      
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Grant/Revoke Creator Status (Founder only)
    if (route === '/founder/creator-status' && method === 'POST') {
      const body = await safeParseJson(request)
      const { founderId, userId, isCreator } = body
      const requester = await db.collection('users').findOne({ id: founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      await db.collection('users').updateOne(
        { id: userId }, 
        { $set: { 
          isCreator, 
          creatorSince: isCreator ? new Date() : null,
          subscriptionPrice: isCreator ? 4.99 : null // Default £4.99
        }}
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Grant/Revoke Admin Status (Founder only)
    if (route === '/founder/admin-status' && method === 'POST') {
      const body = await safeParseJson(request)
      const { founderId, userId, isAdmin } = body
      const requester = await db.collection('users').findOne({ id: founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      await db.collection('users').updateOne(
        { id: userId }, 
        { $set: { role: isAdmin ? 'admin' : 'user' }}
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Delete user (Founder only)
    if (route === '/founder/delete-user' && method === 'POST') {
      const body = await safeParseJson(request)
      const { founderId, userId } = body
      const requester = await db.collection('users').findOne({ id: founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      await db.collection('users').deleteOne({ id: userId })
      // Clean up related data
      await db.collection('messages').deleteMany({ senderId: userId })
      await db.collection('subscriptions').deleteMany({ $or: [{ subscriberId: userId }, { creatorId: userId }] })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== CREATOR PROFILE & SUBSCRIPTIONS ====================
    const LOWKEY_CUT = 0.20 // LowKey takes 20% of all transactions

    // Get creator profile
    if (route.match(/^\/creator\/[^/]+$/) && method === 'GET') {
      const creatorId = path[1]
      const creator = await db.collection('users').findOne({ id: creatorId, isCreator: true })
      if (!creator) return handleCORS(NextResponse.json({ error: 'Creator not found' }, { status: 404 }))
      
      const subscriberCount = await db.collection('subscriptions').countDocuments({ creatorId, status: 'active' })
      const posts = await db.collection('creator_posts').find({ creatorId }).sort({ createdAt: -1 }).toArray()
      
      return handleCORS(NextResponse.json({
        id: creator.id,
        displayName: creator.displayName,
        bio: creator.bio,
        subscriptionPrice: creator.subscriptionPrice || 4.99,
        subscriberCount,
        posts: posts.map(cleanMongoDoc),
        creatorSince: creator.creatorSince
      }))
    }

    // Update creator profile settings
    if (route === '/creator/settings' && method === 'PUT') {
      const body = await safeParseJson(request)
      const { userId, subscriptionPrice, bio } = body
      const user = await db.collection('users').findOne({ id: userId, isCreator: true })
      if (!user) return handleCORS(NextResponse.json({ error: 'Not a creator' }, { status: 403 }))
      
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { subscriptionPrice: parseFloat(subscriptionPrice) || 4.99, bio } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Subscribe to a creator
    if (route === '/creator/subscribe' && method === 'POST') {
      const body = await safeParseJson(request)
      const { subscriberId, creatorId } = body
      
      const creator = await db.collection('users').findOne({ id: creatorId, isCreator: true })
      if (!creator) return handleCORS(NextResponse.json({ error: 'Creator not found' }, { status: 404 }))
      
      // Check if already subscribed
      const existing = await db.collection('subscriptions').findOne({ 
        subscriberId, creatorId, status: 'active' 
      })
      if (existing) return handleCORS(NextResponse.json({ error: 'Already subscribed' }, { status: 400 }))
      
      const price = creator.subscriptionPrice || 4.99
      const lowkeyCut = price * LOWKEY_CUT
      const creatorEarnings = price - lowkeyCut
      
      const subscription = {
        id: uuidv4(),
        subscriberId,
        creatorId,
        price,
        lowkeyCut,
        creatorEarnings,
        currency: 'GBP',
        status: 'active',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
      await db.collection('subscriptions').insertOne(subscription)
      
      // Record transaction
      const transaction = {
        id: uuidv4(),
        type: 'subscription',
        fromUserId: subscriberId,
        toUserId: creatorId,
        amount: price,
        lowkeyCut,
        creatorEarnings,
        currency: 'GBP',
        createdAt: new Date()
      }
      await db.collection('transactions').insertOne(transaction)
      
      return handleCORS(NextResponse.json({ success: true, subscription: cleanMongoDoc(subscription) }))
    }

    // Check subscription status
    if (route === '/creator/subscription-check' && method === 'POST') {
      const body = await safeParseJson(request)
      const { subscriberId, creatorId } = body
      const sub = await db.collection('subscriptions').findOne({ 
        subscriberId, creatorId, status: 'active',
        expiresAt: { $gt: new Date() }
      })
      return handleCORS(NextResponse.json({ isSubscribed: !!sub, subscription: sub ? cleanMongoDoc(sub) : null }))
    }

    // Get user's subscriptions
    if (route.match(/^\/creator\/subscriptions\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const subscriptions = await db.collection('subscriptions').find({ 
        subscriberId: userId, status: 'active' 
      }).toArray()
      
      const enriched = await Promise.all(subscriptions.map(async (sub) => {
        const creator = await db.collection('users').findOne({ id: sub.creatorId })
        return { ...cleanMongoDoc(sub), creator: creator ? { displayName: creator.displayName, id: creator.id } : null }
      }))
      return handleCORS(NextResponse.json(enriched))
    }

    // Get creator earnings
    if (route === '/creator/earnings' && method === 'POST') {
      const body = await safeParseJson(request)
      const { creatorId } = body
      
      const transactions = await db.collection('transactions').find({ toUserId: creatorId }).toArray()
      const totalEarnings = transactions.reduce((sum, t) => sum + (t.creatorEarnings || 0), 0)
      const subscriberCount = await db.collection('subscriptions').countDocuments({ creatorId, status: 'active' })
      
      return handleCORS(NextResponse.json({
        totalEarnings,
        subscriberCount,
        transactions: transactions.map(cleanMongoDoc),
        currency: 'GBP'
      }))
    }

    // Get all creators
    if (route === '/creators' && method === 'GET') {
      const creators = await db.collection('users').find({ isCreator: true }).toArray()
      const enriched = await Promise.all(creators.map(async (c) => {
        const subCount = await db.collection('subscriptions').countDocuments({ creatorId: c.id, status: 'active' })
        return {
          id: c.id,
          displayName: c.displayName,
          bio: c.bio,
          subscriptionPrice: c.subscriptionPrice || 4.99,
          subscriberCount: subCount,
          verified: c.verified
        }
      }))
      return handleCORS(NextResponse.json(enriched))
    }

    // LowKey platform stats (Founder only)
    if (route === '/founder/stats' && method === 'POST') {
      const body = await safeParseJson(request)
      const requester = await db.collection('users').findOne({ id: body.founderId })
      if (requester?.email?.toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
        return handleCORS(NextResponse.json({ error: 'Founder access required' }, { status: 403 }))
      }
      
      const totalUsers = await db.collection('users').countDocuments()
      const totalCreators = await db.collection('users').countDocuments({ isCreator: true })
      const totalSubscriptions = await db.collection('subscriptions').countDocuments({ status: 'active' })
      const transactions = await db.collection('transactions').find({}).toArray()
      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const lowkeyEarnings = transactions.reduce((sum, t) => sum + (t.lowkeyCut || 0), 0)
      
      return handleCORS(NextResponse.json({
        totalUsers,
        totalCreators,
        totalSubscriptions,
        totalRevenue,
        lowkeyEarnings,
        currency: 'GBP'
      }))
    }

    if (route === '/profile/quiet-mode' && method === 'PUT') {
      const body = await safeParseJson(request)
      const { userId, quietMode } = body
      await db.collection('users').updateOne({ id: userId }, { $set: { quietMode } })
      return handleCORS(NextResponse.json({ success: true, quietMode }))
    }

    if (route === '/profile/age-verify' && method === 'PUT') {
      const body = await safeParseJson(request)
      const { userId } = body
      await db.collection('users').updateOne({ id: userId }, { $set: { ageVerified: true } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== FRIENDS ====================
    if (route === '/friends/add' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, friendId } = body
      await db.collection('users').updateOne({ id: userId }, { $addToSet: { friends: friendId } })
      await db.collection('users').updateOne({ id: friendId }, { $addToSet: { friends: userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/friends/remove' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, friendId } = body
      await db.collection('users').updateOne({ id: userId }, { $pull: { friends: friendId } })
      await db.collection('users').updateOne({ id: friendId }, { $pull: { friends: userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/friends\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      const user = await db.collection('users').findOne({ id: userId })
      if (!user || !user.friends) return handleCORS(NextResponse.json([]))
      const friends = await db.collection('users').find({ id: { $in: user.friends } }).toArray()
      return handleCORS(NextResponse.json(friends.map(cleanMongoDoc)))
    }

    // ==================== CONVERSATIONS & MESSAGES ====================
    if (route.match(/^\/conversations\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      const convos = await db.collection('conversations').find({ participants: userId }).sort({ updatedAt: -1 }).toArray()
      const enriched = await Promise.all(convos.map(async (c) => {
        const otherId = c.participants.find(p => p !== userId)
        const other = await db.collection('users').findOne({ id: otherId })
        const unread = await db.collection('messages').countDocuments({ conversationId: c.id, senderId: { $ne: userId }, read: false })
        return { ...cleanMongoDoc(c), otherUser: other ? cleanMongoDoc(other) : null, unreadCount: unread }
      }))
      return handleCORS(NextResponse.json(enriched))
    }

    if (route === '/conversations' && method === 'POST') {
      const body = await safeParseJson(request)
      const { participants } = body
      const existing = await db.collection('conversations').findOne({ participants: { $all: participants, $size: 2 } })
      if (existing) return handleCORS(NextResponse.json(cleanMongoDoc(existing)))
      const convo = { id: uuidv4(), participants, createdAt: new Date(), updatedAt: new Date(), lastMessage: null }
      await db.collection('conversations').insertOne(convo)
      return handleCORS(NextResponse.json(cleanMongoDoc(convo)))
    }

    if (route.match(/^\/messages\/[^/]+$/) && method === 'GET') {
      const convoId = path[1]
      const msgs = await db.collection('messages').find({ conversationId: convoId }).sort({ createdAt: 1 }).toArray()
      return handleCORS(NextResponse.json(msgs.map(cleanMongoDoc)))
    }

    if (route === '/messages' && method === 'POST') {
      const body = await safeParseJson(request)
      const { conversationId, senderId, content } = body
      const msg = { id: uuidv4(), conversationId, senderId, content, createdAt: new Date(), read: false }
      await db.collection('messages').insertOne(msg)
      await db.collection('conversations').updateOne({ id: conversationId }, { $set: { lastMessage: { content, senderId, createdAt: msg.createdAt }, updatedAt: new Date() } })
      return handleCORS(NextResponse.json(cleanMongoDoc(msg)))
    }

    if (route.match(/^\/messages\/[^/]+\/read$/) && method === 'PUT') {
      const convoId = path[1]
      const body = await safeParseJson(request)
      await db.collection('messages').updateMany({ conversationId: convoId, senderId: { $ne: body.userId }, read: false }, { $set: { read: true } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== MAIN LOUNGE (Single Global Lounge) ====================
    if (route === '/main-lounge' && method === 'GET') {
      // Get or create the main lounge
      let mainLounge = await db.collection('lounges').findOne({ isMainLounge: true })
      if (!mainLounge) {
        mainLounge = { 
          id: 'main-lounge', 
          name: 'LowKey Lounge', 
          description: 'The main lounge for all LowKey members', 
          isMainLounge: true, 
          members: [], 
          createdAt: new Date() 
        }
        await db.collection('lounges').insertOne(mainLounge)
      }
      const members = await db.collection('users').find({ id: { $in: mainLounge.members || [] } }).toArray()
      return handleCORS(NextResponse.json({ ...cleanMongoDoc(mainLounge), memberDetails: members.map(cleanMongoDoc), memberCount: members.length }))
    }

    if (route === '/main-lounge/join' && method === 'POST') {
      const body = await safeParseJson(request)
      await db.collection('lounges').updateOne({ isMainLounge: true }, { $addToSet: { members: body.userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/main-lounge/messages' && method === 'GET') {
      const msgs = await db.collection('lounge_messages').find({ loungeId: 'main-lounge' }).sort({ createdAt: -1 }).limit(100).toArray()
      return handleCORS(NextResponse.json(msgs.reverse().map(cleanMongoDoc)))
    }

    if (route === '/main-lounge/messages' && method === 'POST') {
      const body = await safeParseJson(request)
      const msg = { id: uuidv4(), loungeId: 'main-lounge', senderId: body.senderId, senderName: body.senderName, content: body.content, createdAt: new Date() }
      await db.collection('lounge_messages').insertOne(msg)
      return handleCORS(NextResponse.json(cleanMongoDoc(msg)))
    }

    // ==================== CONTENT CREATOR POSTS (Teaser for Sale) ====================
    if (route === '/main-lounge/posts' && method === 'GET') {
      const posts = await db.collection('creator_posts').find({}).sort({ createdAt: -1 }).limit(50).toArray()
      const enriched = await Promise.all(posts.map(async (p) => {
        const creator = await db.collection('users').findOne({ id: p.creatorId })
        return { ...cleanMongoDoc(p), creatorName: creator?.displayName || 'Anonymous' }
      }))
      return handleCORS(NextResponse.json(enriched))
    }

    if (route === '/main-lounge/posts' && method === 'POST') {
      const body = await safeParseJson(request)
      const post = {
        id: uuidv4(),
        creatorId: body.creatorId,
        imageUrl: body.imageUrl,
        caption: body.caption,
        price: body.price || 0,
        isBlurred: true,
        createdAt: new Date()
      }
      await db.collection('creator_posts').insertOne(post)
      return handleCORS(NextResponse.json(cleanMongoDoc(post)))
    }

    // ==================== COMMUNITIES (With Invite Codes) ====================
    if (route === '/communities' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      // Get communities user is member of
      const communities = await db.collection('communities').find({ members: userId }).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(communities.map(cleanMongoDoc)))
    }

    if (route === '/communities' && method === 'POST') {
      const body = await safeParseJson(request)
      // Generate unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const community = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        adminId: body.adminId,
        inviteCode,
        members: [body.adminId],
        createdAt: new Date()
      }
      await db.collection('communities').insertOne(community)
      return handleCORS(NextResponse.json(cleanMongoDoc(community)))
    }

    if (route === '/communities/join' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, inviteCode } = body
      const community = await db.collection('communities').findOne({ inviteCode: inviteCode.toUpperCase() })
      if (!community) {
        return handleCORS(NextResponse.json({ error: 'Invalid invite code' }, { status: 404 }))
      }
      await db.collection('communities').updateOne({ id: community.id }, { $addToSet: { members: userId } })
      return handleCORS(NextResponse.json({ success: true, community: cleanMongoDoc(community) }))
    }

    if (route.match(/^\/communities\/[^/]+$/) && method === 'GET') {
      const communityId = path[1]
      const community = await db.collection('communities').findOne({ id: communityId })
      if (!community) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const members = await db.collection('users').find({ id: { $in: community.members || [] } }).toArray()
      return handleCORS(NextResponse.json({ ...cleanMongoDoc(community), memberDetails: members.map(cleanMongoDoc) }))
    }

    if (route.match(/^\/communities\/[^/]+\/messages$/) && method === 'GET') {
      const communityId = path[1]
      const msgs = await db.collection('community_messages').find({ communityId }).sort({ createdAt: -1 }).limit(100).toArray()
      return handleCORS(NextResponse.json(msgs.reverse().map(cleanMongoDoc)))
    }

    if (route.match(/^\/communities\/[^/]+\/messages$/) && method === 'POST') {
      const communityId = path[1]
      const body = await safeParseJson(request)
      const msg = { id: uuidv4(), communityId, senderId: body.senderId, senderName: body.senderName, content: body.content, createdAt: new Date() }
      await db.collection('community_messages').insertOne(msg)
      return handleCORS(NextResponse.json(cleanMongoDoc(msg)))
    }

    // ==================== AFTER DARK ROOMS (Anonymous Safe Space) ====================
    if (route === '/afterdark/rooms' && method === 'GET') {
      const rooms = await db.collection('afterdark_rooms').find({}).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(rooms.map(cleanMongoDoc)))
    }

    if (route === '/afterdark/rooms' && method === 'POST') {
      const body = await safeParseJson(request)
      const room = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        category: body.category || 'general', // kink, chat, safe-space, etc
        creatorId: body.creatorId,
        isAnonymous: true,
        members: [body.creatorId],
        createdAt: new Date()
      }
      await db.collection('afterdark_rooms').insertOne(room)
      return handleCORS(NextResponse.json(cleanMongoDoc(room)))
    }

    if (route.match(/^\/afterdark\/rooms\/[^/]+$/) && method === 'GET') {
      const roomId = path[2]
      const room = await db.collection('afterdark_rooms').findOne({ id: roomId })
      if (!room) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      return handleCORS(NextResponse.json(cleanMongoDoc(room)))
    }

    if (route.match(/^\/afterdark\/rooms\/[^/]+\/join$/) && method === 'POST') {
      const roomId = path[2]
      const body = await safeParseJson(request)
      await db.collection('afterdark_rooms').updateOne({ id: roomId }, { $addToSet: { members: body.userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/afterdark\/rooms\/[^/]+\/messages$/) && method === 'GET') {
      const roomId = path[2]
      const msgs = await db.collection('afterdark_messages').find({ roomId }).sort({ createdAt: -1 }).limit(100).toArray()
      // Return with anonymous names
      const anonMsgs = msgs.reverse().map(m => ({ ...cleanMongoDoc(m), senderName: `Anonymous ${m.senderId.substring(0, 4)}` }))
      return handleCORS(NextResponse.json(anonMsgs))
    }

    if (route.match(/^\/afterdark\/rooms\/[^/]+\/messages$/) && method === 'POST') {
      const roomId = path[2]
      const body = await safeParseJson(request)
      const msg = { id: uuidv4(), roomId, senderId: body.senderId, content: body.content, createdAt: new Date() }
      await db.collection('afterdark_messages').insertOne(msg)
      return handleCORS(NextResponse.json({ ...cleanMongoDoc(msg), senderName: `Anonymous ${body.senderId.substring(0, 4)}` }))
    }

    // ==================== LEGACY LOUNGES (keeping for backwards compat) ====================
    if (route === '/lounges' && method === 'GET') {
      const url = new URL(request.url)
      const afterDark = url.searchParams.get('afterDark') === 'true'
      const query = afterDark ? { isAfterDark: true } : { isAfterDark: { $ne: true } }
      const lounges = await db.collection('lounges').find(query).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(lounges.map(cleanMongoDoc)))
    }

    if (route === '/lounges' && method === 'POST') {
      const body = await safeParseJson(request)
      const { name, description, creatorId, isAfterDark } = body
      const lounge = { id: uuidv4(), name, description, creatorId, isAfterDark: !!isAfterDark, members: [creatorId], createdAt: new Date() }
      await db.collection('lounges').insertOne(lounge)
      return handleCORS(NextResponse.json(cleanMongoDoc(lounge)))
    }

    if (route.match(/^\/lounges\/[^/]+$/) && method === 'GET') {
      const loungeId = path[1]
      const lounge = await db.collection('lounges').findOne({ id: loungeId })
      if (!lounge) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      const members = await db.collection('users').find({ id: { $in: lounge.members || [] } }).toArray()
      return handleCORS(NextResponse.json({ ...cleanMongoDoc(lounge), memberDetails: members.map(cleanMongoDoc) }))
    }

    if (route.match(/^\/lounges\/[^/]+\/join$/) && method === 'POST') {
      const loungeId = path[1]
      const body = await safeParseJson(request)
      await db.collection('lounges').updateOne({ id: loungeId }, { $addToSet: { members: body.userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/lounges\/[^/]+\/leave$/) && method === 'POST') {
      const loungeId = path[1]
      const body = await safeParseJson(request)
      await db.collection('lounges').updateOne({ id: loungeId }, { $pull: { members: body.userId } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/lounges\/[^/]+\/messages$/) && method === 'GET') {
      const loungeId = path[1]
      const msgs = await db.collection('lounge_messages').find({ loungeId }).sort({ createdAt: 1 }).limit(100).toArray()
      return handleCORS(NextResponse.json(msgs.map(cleanMongoDoc)))
    }

    if (route.match(/^\/lounges\/[^/]+\/messages$/) && method === 'POST') {
      const loungeId = path[1]
      const body = await safeParseJson(request)
      const msg = { id: uuidv4(), loungeId, senderId: body.senderId, senderName: body.senderName, content: body.content, createdAt: new Date() }
      await db.collection('lounge_messages').insertOne(msg)
      return handleCORS(NextResponse.json(cleanMongoDoc(msg)))
    }

    // ==================== EVENTS ====================
    if (route === '/events' && method === 'GET') {
      const url = new URL(request.url)
      const afterDark = url.searchParams.get('afterDark') === 'true'
      const query = afterDark ? { isAfterDark: true } : { isAfterDark: { $ne: true } }
      const events = await db.collection('events').find(query).sort({ date: 1 }).toArray()
      return handleCORS(NextResponse.json(events.map(cleanMongoDoc)))
    }

    if (route === '/events' && method === 'POST') {
      const body = await safeParseJson(request)
      const event = { id: uuidv4(), ...body, rsvps: [], createdAt: new Date() }
      await db.collection('events').insertOne(event)
      return handleCORS(NextResponse.json(cleanMongoDoc(event)))
    }

    if (route.match(/^\/events\/[^/]+\/rsvp$/) && method === 'POST') {
      const eventId = path[1]
      const body = await safeParseJson(request)
      const { userId, status } = body
      await db.collection('events').updateOne({ id: eventId }, { $pull: { rsvps: { userId: userId } } })
      if (status !== 'none') {
        await db.collection('events').updateOne({ id: eventId }, { $push: { rsvps: { userId, status } } })
      }
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== NOTICES ====================
    if (route === '/notices' && method === 'GET') {
      const notices = await db.collection('notices').find({}).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(notices.map(cleanMongoDoc)))
    }

    if (route === '/notices' && method === 'POST') {
      const body = await safeParseJson(request)
      const notice = { id: uuidv4(), title: body.title, content: body.content, createdAt: new Date() }
      await db.collection('notices').insertOne(notice)
      return handleCORS(NextResponse.json(cleanMongoDoc(notice)))
    }

    if (route === '/notices/read' && method === 'POST') {
      const body = await safeParseJson(request)
      await db.collection('notice_reads').updateOne(
        { userId: body.userId, noticeId: body.noticeId },
        { $set: { userId: body.userId, noticeId: body.noticeId, readAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/notices\/unread\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const notices = await db.collection('notices').find({}).toArray()
      const reads = await db.collection('notice_reads').find({ userId }).toArray()
      const readIds = new Set(reads.map(r => r.noticeId))
      const unread = notices.filter(n => !readIds.has(n.id)).length
      return handleCORS(NextResponse.json({ count: unread }))
    }

    // ==================== WAVES (Meet) ====================
    if (route === '/waves' && method === 'POST') {
      const body = await safeParseJson(request)
      const wave = { id: uuidv4(), fromUserId: body.fromUserId, toUserId: body.toUserId, createdAt: new Date() }
      await db.collection('waves').insertOne(wave)
      return handleCORS(NextResponse.json(cleanMongoDoc(wave)))
    }

    if (route.match(/^\/waves\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      const waves = await db.collection('waves').find({ toUserId: userId }).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(waves.map(cleanMongoDoc)))
    }

    if (route === '/meet/suggestions' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const user = await db.collection('users').findOne({ id: userId })
      const friendIds = user?.friends || []
      const suggestions = await db.collection('users').find({ id: { $nin: [...friendIds, userId] } }).limit(10).toArray()
      return handleCORS(NextResponse.json(suggestions.map(cleanMongoDoc)))
    }

    // ==================== RADIO (UK Stations) ====================
    if (route === '/radio/stations' && method === 'GET') {
      const stations = [
        { id: 'rinse-fm', name: 'Rinse FM', genre: 'Urban/Electronic', streamUrl: 'https://streamer.radio.co/s2b2b68744/listen', color: '#FF6B00' },
        { id: 'ontop-fm', name: 'OnTopFM.net', genre: 'Urban/R&B', streamUrl: 'https://stream.ontopfm.net/live', color: '#E91E63' },
        { id: 'vibes-fm', name: 'Vibes FM', genre: 'R&B/Soul', streamUrl: 'https://uk2.internet-radio.com/proxy/vibesfm', color: '#9C27B0' },
        { id: 'capital-xtra', name: 'Capital Xtra', genre: 'Hip-Hop/R&B', streamUrl: 'https://media-ice.musicradio.com/CapitalXTRAMP3', color: '#FFD700' },
        { id: 'soca-fm', name: 'Soca FM', genre: 'Soca/Caribbean', streamUrl: 'https://stream.socafm.net/live', color: '#00BCD4' },
        { id: 'jazz-fm', name: 'Jazz FM', genre: 'Jazz/Soul', streamUrl: 'https://media-ice.musicradio.com/JazzFMMP3', color: '#3F51B5' },
        { id: 'caribbean-power-jam', name: 'Caribbean Power Jam', genre: 'Caribbean/Reggae', streamUrl: 'https://stream.caribbeanpowerjam.com/live', color: '#4CAF50' },
        { id: 'lbc', name: 'LBC', genre: 'Talk/News', streamUrl: 'https://media-ice.musicradio.com/LBCMP3', color: '#F44336' }
      ]
      return handleCORS(NextResponse.json(stations))
    }

    if (route === '/radio/history' && method === 'POST') {
      const body = await safeParseJson(request)
      const entry = { id: uuidv4(), userId: body.userId, stationId: body.stationId, stationName: body.stationName, playedAt: new Date() }
      await db.collection('radio_history').insertOne(entry)
      // Keep only last 5
      const history = await db.collection('radio_history').find({ userId: body.userId }).sort({ playedAt: -1 }).toArray()
      if (history.length > 5) {
        const toDelete = history.slice(5).map(h => h.id)
        await db.collection('radio_history').deleteMany({ id: { $in: toDelete } })
      }
      return handleCORS(NextResponse.json(cleanMongoDoc(entry)))
    }

    if (route.match(/^\/radio\/history\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const history = await db.collection('radio_history').find({ userId }).sort({ playedAt: -1 }).limit(5).toArray()
      return handleCORS(NextResponse.json(history.map(cleanMongoDoc)))
    }

    // ==================== MUSIC ====================
    if (route === '/music/tracks' && method === 'GET') {
      const tracks = [
        { id: 'track-1', title: 'Midnight Vibes', artist: 'LowKey Artist', duration: '3:24', clipUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 'track-2', title: 'Golden Hour', artist: 'Sunset Collective', duration: '2:58', clipUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { id: 'track-3', title: 'Purple Dreams', artist: 'Night Owl', duration: '4:12', clipUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
      ]
      return handleCORS(NextResponse.json(tracks))
    }

    if (route === '/music/save' && method === 'POST') {
      const body = await safeParseJson(request)
      await db.collection('saved_tracks').updateOne(
        { userId: body.userId, trackId: body.trackId },
        { $set: { userId: body.userId, trackId: body.trackId, savedAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/music/unsave' && method === 'POST') {
      const body = await safeParseJson(request)
      await db.collection('saved_tracks').deleteOne({ userId: body.userId, trackId: body.trackId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.match(/^\/music\/saved\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const saved = await db.collection('saved_tracks').find({ userId }).toArray()
      return handleCORS(NextResponse.json(saved.map(s => s.trackId)))
    }

    // ==================== GAMES ====================
    if (route === '/games/invite' && method === 'POST') {
      const body = await safeParseJson(request)
      const invite = { id: uuidv4(), gameType: body.gameType, fromUserId: body.fromUserId, toUserId: body.toUserId, status: 'pending', createdAt: new Date() }
      await db.collection('game_invites').insertOne(invite)
      return handleCORS(NextResponse.json(cleanMongoDoc(invite)))
    }

    if (route.match(/^\/games\/invites\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const invites = await db.collection('game_invites').find({ toUserId: userId, status: 'pending' }).toArray()
      const enriched = await Promise.all(invites.map(async (inv) => {
        const from = await db.collection('users').findOne({ id: inv.fromUserId })
        return { ...cleanMongoDoc(inv), fromUser: from ? cleanMongoDoc(from) : null }
      }))
      return handleCORS(NextResponse.json(enriched))
    }

    if (route.match(/^\/games\/invite\/[^/]+\/accept$/) && method === 'POST') {
      const inviteId = path[2]
      const invite = await db.collection('game_invites').findOne({ id: inviteId })
      if (!invite) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      await db.collection('game_invites').updateOne({ id: inviteId }, { $set: { status: 'accepted' } })
      const session = {
        id: uuidv4(),
        gameType: invite.gameType,
        players: [invite.fromUserId, invite.toUserId],
        currentTurn: invite.fromUserId,
        board: Array(9).fill(null),
        status: 'active',
        winner: null,
        createdAt: new Date()
      }
      await db.collection('game_sessions').insertOne(session)
      return handleCORS(NextResponse.json(cleanMongoDoc(session)))
    }

    if (route.match(/^\/games\/session\/[^/]+$/) && method === 'GET') {
      const sessionId = path[2]
      const session = await db.collection('game_sessions').findOne({ id: sessionId })
      return handleCORS(NextResponse.json(session ? cleanMongoDoc(session) : { error: 'Not found' }))
    }

    if (route.match(/^\/games\/session\/[^/]+\/move$/) && method === 'POST') {
      const sessionId = path[2]
      const body = await safeParseJson(request)
      const { userId, position } = body
      const session = await db.collection('game_sessions').findOne({ id: sessionId })
      if (!session || session.status !== 'active') {
        return handleCORS(NextResponse.json({ error: 'Invalid session' }, { status: 400 }))
      }
      if (session.currentTurn !== userId) {
        return handleCORS(NextResponse.json({ error: 'Not your turn' }, { status: 400 }))
      }
      if (session.board[position] !== null) {
        return handleCORS(NextResponse.json({ error: 'Position taken' }, { status: 400 }))
      }
      const mark = session.players[0] === userId ? 'X' : 'O'
      session.board[position] = mark
      const move = { id: uuidv4(), sessionId, userId: userId, position, mark, createdAt: new Date() }
      await db.collection('game_moves').insertOne(move)
      // Check winner
      const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
      let winner = null
      for (const [a,b,c] of wins) {
        if (session.board[a] && session.board[a] === session.board[b] && session.board[a] === session.board[c]) {
          winner = userId
          break
        }
      }
      const isDraw = !winner && session.board.every(x => x !== null)
      const nextTurn = session.players.find(p => p !== userId)
      await db.collection('game_sessions').updateOne({ id: sessionId }, {
        $set: {
          board: session.board,
          currentTurn: winner || isDraw ? null : nextTurn,
          status: winner ? 'won' : isDraw ? 'draw' : 'active',
          winner
        }
      })
      const updated = await db.collection('game_sessions').findOne({ id: sessionId })
      return handleCORS(NextResponse.json(cleanMongoDoc(updated)))
    }

    if (route.match(/^\/games\/sessions\/[^/]+$/) && method === 'GET') {
      const userId = path[2]
      const sessions = await db.collection('game_sessions').find({ players: userId }).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(sessions.map(cleanMongoDoc)))
    }

    // ==================== SEARCH ====================
    if (route === '/search' && method === 'GET') {
      const url = new URL(request.url)
      const q = url.searchParams.get('q')?.toLowerCase() || ''
      const users = await db.collection('users').find({ displayNameLower: { $regex: q } }).limit(10).toArray()
      const lounges = await db.collection('lounges').find({ name: { $regex: q, $options: 'i' } }).limit(10).toArray()
      const events = await db.collection('events').find({ title: { $regex: q, $options: 'i' } }).limit(10).toArray()
      return handleCORS(NextResponse.json({
        users: users.map(cleanMongoDoc),
        lounges: lounges.map(cleanMongoDoc),
        events: events.map(cleanMongoDoc)
      }))
    }

    // ==================== DEBUG ====================
    if (route === '/debug/db' && method === 'GET') {
      const userCount = await db.collection('users').countDocuments()
      return handleCORS(NextResponse.json({ status: 'connected', userCount }))
    }

    if (route === '/debug/fix-login' && (method === 'GET' || method === 'POST')) {
      // Create/Reset FOUNDER account: kinglowkey@hotmail.com
      const email = 'kinglowkey@hotmail.com'
      const pwd = hashPassword('LowKey2026')
      const founderData = {
        id: uuidv4(),
        email,
        displayName: 'KINGLOWKEY',
        displayNameLower: 'kinglowkey',
        password: pwd,
        verified: true,
        verificationTier: 'inner-circle',
        role: 'admin',
        isFounder: true,
        isCreator: true,
        subscriptionPrice: 0,
        permissions: {
          manageUsers: true,
          verifyUsers: true,
          removeUsers: true,
          accessAll: true,
          manageContent: true,
          manageEvents: true,
          manageNotices: true,
          manageLounges: true,
          manageCreators: true,
          viewAnalytics: true,
          fullControl: true
        },
        quietMode: false,
        ageVerified: true,
        friends: [],
        ownedSkins: ['default', 'midnight', 'ocean', 'sunset', 'forest', 'rose', 'neon', 'gold'],
        currentSkin: 'gold',
        createdAt: new Date(),
        token: generateToken()
      }
      
      const existing = await db.collection('users').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      if (existing) {
        await db.collection('users').updateOne(
          { email: existing.email },
          { $set: { 
            password: pwd, 
            verified: true,
            verificationTier: 'inner-circle',
            role: 'admin',
            isFounder: true,
            isCreator: true,
            permissions: founderData.permissions,
            ageVerified: true,
            ownedSkins: founderData.ownedSkins,
            currentSkin: 'gold'
          }}
        )
        return handleCORS(NextResponse.json({ 
          status: 'FOUNDER_RESET', 
          email: existing.email, 
          password: 'LowKey2026',
          role: 'admin',
          isFounder: true,
          verificationTier: 'inner-circle',
          message: 'FOUNDER account reset with FULL control. You are the owner of LowKey.'
        }))
      } else {
        await db.collection('users').insertOne(founderData)
        return handleCORS(NextResponse.json({ 
          status: 'FOUNDER_CREATED', 
          email, 
          password: 'LowKey2026',
          role: 'admin',
          isFounder: true,
          verificationTier: 'inner-circle',
          message: 'FOUNDER account created with FULL control. You are the owner of LowKey.'
        }))
      }
    }

    // ==================== STATUS ====================
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'LowKey API v2.0' }))
    }

    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({ status: 'healthy' }))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))

  } catch (error) {
    console.error('[API Error]', error.message)
    return handleCORS(NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
