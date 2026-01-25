import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'lowkey')
  }
  return db
}

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Helper function to generate token
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
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

      // Check if email already exists
      const existingEmail = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      })
      if (existingEmail) {
        return handleCORS(NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        ))
      }

      // Check if displayName already exists
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

      // Find user by email or displayName
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

      // Check password
      if (user.password !== hashPassword(password)) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ))
      }

      // Update last login and generate new token
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

    // ==================== USER ROUTES ====================

    // Get user - GET /api/users/:id
    if (route.startsWith('/users/') && method === 'GET') {
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

    // ==================== MESSAGING ROUTES ====================

    // Get conversations for user - GET /api/conversations/:userId
    if (route.match(/^\/conversations\/[^/]+$/) && method === 'GET') {
      const userId = path[1]
      
      const conversations = await db.collection('conversations').find({
        participants: userId
      }).sort({ updatedAt: -1 }).toArray()

      // Get participant details for each conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipantId = conv.participants.find(p => p !== userId)
          const otherUser = await db.collection('users').findOne({ id: otherParticipantId })
          return {
            ...cleanMongoDoc(conv),
            otherUser: otherUser ? cleanMongoDoc(otherUser) : null
          }
        })
      )

      return handleCORS(NextResponse.json(enrichedConversations))
    }

    // Create conversation - POST /api/conversations
    if (route === '/conversations' && method === 'POST') {
      const body = await safeParseJson(request)
      const { participants } = body

      if (!participants || participants.length !== 2) {
        return handleCORS(NextResponse.json(
          { error: 'Exactly 2 participants required' },
          { status: 400 }
        ))
      }

      // Check if conversation already exists
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
        createdAt: now,
        updatedAt: now,
        lastMessage: null
      }

      await db.collection('conversations').insertOne(newConversation)
      return handleCORS(NextResponse.json(cleanMongoDoc(newConversation)))
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

      return handleCORS(NextResponse.json(cleanMongoDoc(newMessage)))
    }

    // ==================== ROOT/STATUS ROUTES ====================

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'LowKey API v1.0' }))
    }

    if (route === '/health' && method === 'GET') {
      return handleCORS(NextResponse.json({ status: 'healthy', timestamp: new Date() }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
