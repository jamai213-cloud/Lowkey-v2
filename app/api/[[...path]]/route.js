import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MongoDB connection - App Router safe pattern
let client = null
let clientPromise = null

function getMongoUri() {
  // Support both MONGODB_URI (Vercel standard) and MONGO_URL (local)
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL
  
  // Debug logging for Vercel
  if (!uri) {
    console.error('[MongoDB] ERROR: No MongoDB URI found in environment variables')
    console.error('[MongoDB] Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')))
    throw new Error('MONGODB_URI environment variable is not defined. Please set it in Vercel dashboard.')
  }
  
  // Log connection attempt (masked)
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  console.log('[MongoDB] Connecting to:', maskedUri)
  
  return uri
}

function getDbName() {
  return process.env.DB_NAME || 'lowkey'
}

async function connectToMongo() {
  try {
    const uri = getMongoUri()
    
    if (!clientPromise) {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
      
      client = new MongoClient(uri, options)
      clientPromise = client.connect()
      console.log('[MongoDB] New connection initiated')
    }
    
    await clientPromise
    const dbName = getDbName()
    console.log('[MongoDB] Connected successfully to database:', dbName)
    return client.db(dbName)
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message)
    clientPromise = null
    client = null
    throw error
  }
}

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Helper function to generate token
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Helper to safely parse JSON body
async function safeParseJson(request) {
  try {
    const text = await request.text()
    if (!text || text.trim() === '') return {}
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Remove MongoDB _id from objects
function cleanMongoDoc(doc) {
  if (!doc) return null
  const { _id, password, ...rest } = doc
  return rest
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // ==================== AUTH ROUTES ====================
    
    // Register - POST /api/auth/register
    if (route === '/auth/register' && method === 'POST') {
      const body = await safeParseJson(request)
      const { email, password, displayName } = body

      if (!email || !password || !displayName) {
        return handleCORS(NextResponse.json(
          { error: 'Email, password, and display name are required' },
          { status: 400 }
        ))
      }

      const existingEmail = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      })
      if (existingEmail) {
        return handleCORS(NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        ))
      }

      const existingName = await db.collection('users').findOne({ 
        displayNameLower: displayName.toLowerCase() 
      })
      if (existingName) {
        return handleCORS(NextResponse.json(
          { error: 'Display name already taken' },
          { status: 400 }
        ))
      }

      const userId = uuidv4()
      const token = generateToken()
      const now = new Date()

      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        displayName: displayName,
        displayNameLower: displayName.toLowerCase(),
        password: hashPassword(password),
        verified: false,
        friends: [],
        friendRequests: [],
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        token: token
      }

      await db.collection('users').insertOne(newUser)

      return handleCORS(NextResponse.json({
        user: cleanMongoDoc(newUser),
        token: token
      }))
    }

    // Login - POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await safeParseJson(request)
      const { identifier, password } = body

      if (!identifier || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Email/username and password are required' },
          { status: 400 }
        ))
      }

      const user = await db.collection('users').findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { displayNameLower: identifier.toLowerCase() }
        ]
      })

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ))
      }

      if (user.password !== hashPassword(password)) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ))
      }

      const token = generateToken()
      await db.collection('users').updateOne(
        { id: user.id },
        { 
          $set: { 
            lastLogin: new Date(),
            token: token
          } 
        }
      )

      return handleCORS(NextResponse.json({
        user: cleanMongoDoc(user),
        token: token
      }))
    }

    // Forgot Password - POST /api/auth/forgot-password
    if (route === '/auth/forgot-password' && method === 'POST') {
      const body = await safeParseJson(request)
      const { email } = body

      if (!email) {
        return handleCORS(NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        ))
      }

      const user = await db.collection('users').findOne({ email: email.toLowerCase() })
      
      // Always return success to prevent email enumeration
      if (!user) {
        return handleCORS(NextResponse.json({
          message: 'If an account exists with that email, a reset link has been sent.'
        }))
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.collection('users').updateOne(
        { id: user.id },
        { 
          $set: { 
            resetToken: resetTokenHash,
            resetTokenExpiry: resetTokenExpiry
          } 
        }
      )

      // Check if Resend API key is configured
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured - email not sent')
        console.log(`Reset token for ${email}: ${resetToken}`)
        return handleCORS(NextResponse.json({
          message: 'If an account exists with that email, a reset link has been sent.',
          devNote: 'RESEND_API_KEY not configured - check server logs for token'
        }))
      }

      // Send email via Resend
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        
        await resend.emails.send({
          from: 'LowKey <noreply@lowkey.app>',
          to: email,
          subject: 'Reset Your LowKey Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: white; padding: 40px; border-radius: 16px;">
              <h1 style="color: #a855f7;">Reset Your Password</h1>
              <p>You requested to reset your password. Click the button below:</p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #f59e0b, #eab308); color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
              <p style="color: #888;">This link expires in 1 hour.</p>
              <p style="color: #888;">If you didn't request this, ignore this email.</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError)
      }

      return handleCORS(NextResponse.json({
        message: 'If an account exists with that email, a reset link has been sent.'
      }))
    }

    // Reset Password - POST /api/auth/reset-password
    if (route === '/auth/reset-password' && method === 'POST') {
      const body = await safeParseJson(request)
      const { token, email, password } = body

      if (!token || !email || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        ))
      }

      if (password.length < 6) {
        return handleCORS(NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        ))
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      const user = await db.collection('users').findOne({
        email: decodeURIComponent(email).toLowerCase(),
        resetToken: tokenHash,
        resetTokenExpiry: { $gt: new Date() }
      })

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        ))
      }

      await db.collection('users').updateOne(
        { id: user.id },
        { 
          $set: { password: hashPassword(password) },
          $unset: { resetToken: '', resetTokenExpiry: '' }
        }
      )

      return handleCORS(NextResponse.json({
        message: 'Password has been reset successfully'
      }))
    }

    // ==================== USER ROUTES ====================

    // Get user - GET /api/users/:id
    if (route.match(/^\/users\/[^/]+$/) && method === 'GET' && path[1] !== 'search') {
      const userId = path[1]
      const user = await db.collection('users').findOne({ id: userId })
      
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json(cleanMongoDoc(user)))
    }

    // Update user verification - PUT /api/users/:id/verify
    if (route.match(/^\/users\/[^/]+\/verify$/) && method === 'PUT') {
      const userId = path[1]
      const body = await safeParseJson(request)
      const { verified } = body

      const result = await db.collection('users').updateOne(
        { id: userId },
        { $set: { verified: verified, updatedAt: new Date() } }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ))
      }

      const updatedUser = await db.collection('users').findOne({ id: userId })
      return handleCORS(NextResponse.json(cleanMongoDoc(updatedUser)))
    }

    // Get all users (admin) - GET /api/users
    if (route === '/users' && method === 'GET') {
      const users = await db.collection('users').find({}).toArray()
      return handleCORS(NextResponse.json(users.map(cleanMongoDoc)))
    }

    // ==================== NOTIFICATIONS ROUTES ====================

    // Get notifications - GET /api/notifications/:userId
    if (route.match(/^\/notifications\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      
      const notifications = await db.collection('notifications').find({
        userId: userId
      }).sort({ createdAt: -1 }).limit(50).toArray()

      return handleCORS(NextResponse.json(notifications.map(cleanMongoDoc)))
    }

    // Create notification - POST /api/notifications
    if (route === '/notifications' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, type, message, conversationId, fromUserId } = body

      const notification = {
        id: uuidv4(),
        userId,
        type,
        message,
        conversationId,
        fromUserId,
        read: false,
        createdAt: new Date()
      }

      await db.collection('notifications').insertOne(notification)
      return handleCORS(NextResponse.json(cleanMongoDoc(notification)))
    }

    // Mark notification as read - PUT /api/notifications/:id/read
    if (route.match(/^\/notifications\/[^/]+\/read$/) && method === 'PUT') {
      const notificationId = path[1]
      
      await db.collection('notifications').updateOne(
        { id: notificationId },
        { $set: { read: true } }
      )

      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== FRIEND REQUESTS ====================

    // Send friend request - POST /api/friends/request
    if (route === '/friends/request' && method === 'POST') {
      const body = await safeParseJson(request)
      const { fromUserId, toUserId } = body

      // Add to target user's friend requests
      await db.collection('users').updateOne(
        { id: toUserId },
        { $addToSet: { friendRequests: fromUserId } }
      )

      // Create notification
      const fromUser = await db.collection('users').findOne({ id: fromUserId })
      await db.collection('notifications').insertOne({
        id: uuidv4(),
        userId: toUserId,
        type: 'friend_request',
        message: `${fromUser.displayName} sent you a friend request`,
        fromUserId,
        read: false,
        createdAt: new Date()
      })

      return handleCORS(NextResponse.json({ success: true }))
    }

    // Accept friend request - POST /api/friends/accept
    if (route === '/friends/accept' && method === 'POST') {
      const body = await safeParseJson(request)
      const { userId, friendId } = body

      // Add each other as friends
      await db.collection('users').updateOne(
        { id: userId },
        { 
          $addToSet: { friends: friendId },
          $pull: { friendRequests: friendId }
        }
      )
      await db.collection('users').updateOne(
        { id: friendId },
        { $addToSet: { friends: userId } }
      )

      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== MESSAGING ROUTES ====================

    // Get conversations for user - GET /api/conversations/:userId
    if (route.match(/^\/conversations\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      
      const conversations = await db.collection('conversations').find({
        participants: userId
      }).sort({ updatedAt: -1 }).toArray()

      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipantId = conv.participants.find(p => p !== userId)
          const otherUser = await db.collection('users').findOne({ id: otherParticipantId })
          
          // Count unread messages
          const unreadCount = await db.collection('messages').countDocuments({
            conversationId: conv.id,
            senderId: { $ne: userId },
            read: false
          })
          
          return {
            ...cleanMongoDoc(conv),
            otherUser: otherUser ? cleanMongoDoc(otherUser) : null,
            unreadCount
          }
        })
      )

      return handleCORS(NextResponse.json(enrichedConversations))
    }

    // Create conversation - POST /api/conversations
    if (route === '/conversations' && method === 'POST') {
      const body = await safeParseJson(request)
      const { participants, isFromNonFriend } = body

      if (!participants || participants.length !== 2) {
        return handleCORS(NextResponse.json(
          { error: 'Exactly 2 participants required' },
          { status: 400 }
        ))
      }

      const existing = await db.collection('conversations').findOne({
        participants: { $all: participants, $size: 2 }
      })

      if (existing) {
        return handleCORS(NextResponse.json(cleanMongoDoc(existing)))
      }

      const conversationId = uuidv4()
      const now = new Date()

      const newConversation = {
        id: conversationId,
        participants: participants,
        isFromNonFriend: isFromNonFriend || false,
        accepted: !isFromNonFriend,
        createdAt: now,
        updatedAt: now,
        lastMessage: null
      }

      await db.collection('conversations').insertOne(newConversation)
      return handleCORS(NextResponse.json(cleanMongoDoc(newConversation)))
    }

    // Accept conversation (from non-friend) - PUT /api/conversations/:id/accept
    if (route.match(/^\/conversations\/[^/]+\/accept$/) && method === 'PUT') {
      const conversationId = path[1]
      
      await db.collection('conversations').updateOne(
        { id: conversationId },
        { $set: { accepted: true, isFromNonFriend: false } }
      )

      const conversation = await db.collection('conversations').findOne({ id: conversationId })
      return handleCORS(NextResponse.json(cleanMongoDoc(conversation)))
    }

    // Get messages for conversation - GET /api/messages/:conversationId
    if (route.match(/^\/messages\/[^/]+$/) && method === 'GET') {
      const conversationId = path[1]
      
      const messages = await db.collection('messages').find({
        conversationId: conversationId
      }).sort({ createdAt: 1 }).toArray()

      return handleCORS(NextResponse.json(messages.map(cleanMongoDoc)))
    }

    // Send message - POST /api/messages
    if (route === '/messages' && method === 'POST') {
      const body = await safeParseJson(request)
      const { conversationId, senderId, content } = body

      if (!conversationId || !senderId || !content) {
        return handleCORS(NextResponse.json(
          { error: 'conversationId, senderId, and content are required' },
          { status: 400 }
        ))
      }

      const messageId = uuidv4()
      const now = new Date()

      const newMessage = {
        id: messageId,
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        createdAt: now,
        read: false
      }

      await db.collection('messages').insertOne(newMessage)

      // Update conversation's last message
      await db.collection('conversations').updateOne(
        { id: conversationId },
        { 
          $set: { 
            lastMessage: {
              content: content,
              senderId: senderId,
              createdAt: now
            },
            updatedAt: now
          } 
        }
      )

      // Get conversation to find recipient
      const conversation = await db.collection('conversations').findOne({ id: conversationId })
      const recipientId = conversation.participants.find(p => p !== senderId)
      const sender = await db.collection('users').findOne({ id: senderId })

      // Create notification for recipient
      await db.collection('notifications').insertOne({
        id: uuidv4(),
        userId: recipientId,
        type: 'dm',
        message: `${sender.displayName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        conversationId: conversationId,
        fromUserId: senderId,
        read: false,
        createdAt: now
      })

      return handleCORS(NextResponse.json(cleanMongoDoc(newMessage)))
    }

    // Mark messages as read - PUT /api/messages/:conversationId/read
    if (route.match(/^\/messages\/[^/]+\/read$/) && method === 'PUT') {
      const conversationId = path[1]
      const body = await safeParseJson(request)
      const { userId } = body

      await db.collection('messages').updateMany(
        { conversationId, senderId: { $ne: userId }, read: false },
        { $set: { read: true } }
      )

      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== ROOT/STATUS ROUTES ====================

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'LowKey API v1.0' }))
    }

    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({ status: 'healthy', timestamp: new Date() }))
    }

    // Database diagnostic endpoint
    if (route === '/debug/db' && method === 'GET') {
      try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URL
        const hasUri = !!uri
        const uriPreview = uri ? uri.substring(0, 20) + '...' : 'NOT SET'
        const dbName = process.env.DB_NAME || 'lowkey'
        
        // Try to count users
        const userCount = await db.collection('users').countDocuments()
        
        return handleCORS(NextResponse.json({
          status: 'connected',
          hasMongoUri: hasUri,
          uriPreview: uriPreview,
          dbName: dbName,
          userCount: userCount,
          timestamp: new Date()
        }))
      } catch (dbError) {
        return handleCORS(NextResponse.json({
          status: 'error',
          error: dbError.message,
          hasMongoUri: !!(process.env.MONGODB_URI || process.env.MONGO_URL),
          timestamp: new Date()
        }, { status: 500 }))
      }
    }

    // Seed admin user endpoint - GET for easy browser access
    if (route === '/debug/seed-admin' && (method === 'POST' || method === 'GET')) {
      try {
        const now = new Date()
        const password = hashPassword('LowKey2026!')
        
        // Admin 1: LOWKEY
        const existingAdmin1 = await db.collection('users').findOne({
          $or: [
            { email: 'lowkey2026@hotmail.com' },
            { displayNameLower: 'lowkey' }
          ]
        })

        let admin1Status = 'exists'
        if (!existingAdmin1) {
          const adminUser1 = {
            id: uuidv4(),
            email: 'lowkey2026@hotmail.com',
            displayName: 'LOWKEY',
            displayNameLower: 'lowkey',
            password: password,
            role: 'admin',
            verified: true,
            friends: [],
            friendRequests: [],
            createdAt: now,
            updatedAt: now,
            lastLogin: now,
            token: generateToken()
          }
          await db.collection('users').insertOne(adminUser1)
          admin1Status = 'created'
        }

        // Admin 2: JamaiAdmin
        const existingAdmin2 = await db.collection('users').findOne({
          email: 'jamai213@hotmail.co.uk'
        })

        let admin2Status = 'exists'
        if (!existingAdmin2) {
          const adminUser2 = {
            id: uuidv4(),
            email: 'jamai213@hotmail.co.uk',
            displayName: 'JamaiAdmin',
            displayNameLower: 'jamaiadmin',
            password: password,
            role: 'admin',
            verified: true,
            friends: [],
            friendRequests: [],
            createdAt: now,
            updatedAt: now,
            lastLogin: now,
            token: generateToken()
          }
          await db.collection('users').insertOne(adminUser2)
          admin2Status = 'created'
        }

        return handleCORS(NextResponse.json({
          status: 'success',
          message: 'Admin users processed',
          admins: [
            { email: 'lowkey2026@hotmail.com', displayName: 'LOWKEY', status: admin1Status },
            { email: 'jamai213@hotmail.co.uk', displayName: 'JamaiAdmin', status: admin2Status }
          ],
          loginPassword: 'LowKey2026!'
        }))
      } catch (seedError) {
        return handleCORS(NextResponse.json({
          status: 'error',
          error: seedError.message
        }, { status: 500 }))
      }
    }

    // Reset admin passwords endpoint
    if (route === '/debug/reset-admin' && method === 'POST') {
      try {
        const newPassword = hashPassword('LowKey2026!')
        
        const result1 = await db.collection('users').updateOne(
          { email: 'lowkey2026@hotmail.com' },
          { $set: { password: newPassword, updatedAt: new Date() } }
        )
        
        const result2 = await db.collection('users').updateOne(
          { email: 'jamai213@hotmail.co.uk' },
          { $set: { password: newPassword, updatedAt: new Date() } }
        )

        return handleCORS(NextResponse.json({
          status: 'success',
          message: 'Admin passwords reset',
          lowkey2026Updated: result1.modifiedCount > 0,
          jamai213Updated: result2.modifiedCount > 0,
          newPassword: 'LowKey2026!'
        }))
      } catch (resetError) {
        return handleCORS(NextResponse.json({
          status: 'error',
          error: resetError.message
        }, { status: 500 }))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('[API Error]', error.message)
    console.error('[API Error Stack]', error.stack)
    
    // Check for specific MongoDB errors
    let errorMessage = 'Internal server error'
    let statusCode = 500
    
    if (error.message.includes('MONGODB_URI')) {
      errorMessage = 'Database configuration error. Please contact support.'
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      errorMessage = 'Database connection failed. Please try again.'
    } else if (error.message.includes('authentication failed')) {
      errorMessage = 'Database authentication error. Please contact support.'
    }
    
    return handleCORS(NextResponse.json(
      { error: errorMessage, debug: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: statusCode }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
