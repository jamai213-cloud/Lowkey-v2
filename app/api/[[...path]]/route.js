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

    // ==================== LOUNGES ====================
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
      await db.collection('events').updateOne({ id: eventId }, { $pull: { rsvps: { odbc.userId: userId } } })
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
        { odbc.userId: body.userId, noticeId: body.noticeId },
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

    // ==================== RADIO ====================
    if (route === '/radio/stations' && method === 'GET') {
      const stations = [
        { id: 'lowkey-rnb', name: 'Lowkey R&B', genre: 'R&B', streamUrl: 'https://streams.ilovemusic.de/iloveradio-relaxing.mp3' },
        { id: 'lowkey-afro', name: 'Lowkey Afrobeats', genre: 'Afrobeats', streamUrl: 'https://streams.ilovemusic.de/iloveradio-afrobeats.mp3' },
        { id: 'lowkey-hiphop', name: 'Lowkey Hip-Hop', genre: 'Hip-Hop', streamUrl: 'https://streams.ilovemusic.de/iloveradio-hiphop.mp3' },
        { id: 'lofi-chill', name: 'Lo-Fi Chill', genre: 'Lo-Fi', streamUrl: 'https://streams.ilovemusic.de/iloveradio-chillhop.mp3' },
        { id: 'dancehall', name: 'Dancehall', genre: 'Dancehall', streamUrl: 'https://streams.ilovemusic.de/iloveradio-dance.mp3' }
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
      const { odbc.userId, position } = body
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
      const move = { id: uuidv4(), sessionId, odbc.userId, position, mark, createdAt: new Date() }
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
      const email = 'lowkey2026@hotmail.com'
      const pwd = hashPassword('LowKey2026!')
      const existing = await db.collection('users').findOne({ email })
      if (existing) {
        await db.collection('users').updateOne({ email }, { $set: { password: pwd, verified: true } })
        return handleCORS(NextResponse.json({ status: 'FIXED', email, password: 'LowKey2026!' }))
      } else {
        const user = { id: uuidv4(), email, displayName: 'LOWKEY', displayNameLower: 'lowkey', password: pwd, verified: true, quietMode: false, ageVerified: false, friends: [], createdAt: new Date(), token: generateToken() }
        await db.collection('users').insertOne(user)
        return handleCORS(NextResponse.json({ status: 'CREATED', email, password: 'LowKey2026!' }))
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
