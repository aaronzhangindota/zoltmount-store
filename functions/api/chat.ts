import { getCollection, putCollection, authenticateAdmin, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

interface ChatSession {
  id: string
  userId?: string
  visitorName: string
  visitorEmail: string
  status: 'active' | 'closed'
  unreadByAdmin: number
  unreadByUser: number
  lastMessage: string
  lastMessageAt: string
  createdAt: string
}

interface ChatMessage {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  content: string
  createdAt: string
}

// GET /api/chat
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const kv = env.ZOLTMOUNT_KV

  // Admin: get all sessions
  if (action === 'sessions') {
    const admin = await authenticateAdmin(request, env)
    if (!admin) return json({ error: 'Unauthorized' }, 401)
    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    return json(sessions)
  }

  // Admin: poll all sessions (for sidebar badge + chat page)
  if (action === 'admin-poll') {
    const admin = await authenticateAdmin(request, env)
    if (!admin) return json({ error: 'Unauthorized' }, 401)
    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    return json(sessions)
  }

  // Get messages for a session
  if (action === 'messages') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) return json({ error: 'sessionId required' }, 400)

    // Allow admin or session owner
    const admin = await authenticateAdmin(request, env)
    const chatSession = request.headers.get('X-Chat-Session')
    if (!admin && chatSession !== sessionId) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const messages = await getCollection<ChatMessage>(kv, `chat-msgs-${sessionId}`)

    // If admin is reading, mark unreadByAdmin = 0
    if (admin) {
      const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
      const session = sessions.find((s) => s.id === sessionId)
      if (session && session.unreadByAdmin > 0) {
        session.unreadByAdmin = 0
        await putCollection(kv, 'chat-sessions', sessions)
      }
    }

    return json(messages)
  }

  // User: poll for new messages
  if (action === 'poll') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) return json({ error: 'sessionId required' }, 400)

    const chatSession = request.headers.get('X-Chat-Session')
    if (chatSession !== sessionId) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return json({ error: 'Session not found' }, 404)

    const messages = await getCollection<ChatMessage>(kv, `chat-msgs-${sessionId}`)

    return json({
      messages,
      unreadByUser: session.unreadByUser,
      status: session.status,
    })
  }

  return json({ error: 'Invalid action' }, 400)
}

// POST /api/chat
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const kv = env.ZOLTMOUNT_KV
  const body = await request.json() as Record<string, any>
  const action = body.action

  // Start a new chat session
  if (action === 'start') {
    const { visitorName, visitorEmail, message, userId } = body
    if (!visitorName || !visitorEmail || !message) {
      return json({ error: 'visitorName, visitorEmail, and message are required' }, 400)
    }

    const now = new Date().toISOString()
    const sessionId = 'cs-' + Date.now()
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)

    const session: ChatSession = {
      id: sessionId,
      userId: userId || undefined,
      visitorName,
      visitorEmail,
      status: 'active',
      unreadByAdmin: 1,
      unreadByUser: 0,
      lastMessage: message.slice(0, 100),
      lastMessageAt: now,
      createdAt: now,
    }

    const msg: ChatMessage = {
      id: msgId,
      sender: 'user',
      senderName: visitorName,
      content: message,
      createdAt: now,
    }

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    sessions.unshift(session)
    await putCollection(kv, 'chat-sessions', sessions)
    await putCollection(kv, `chat-msgs-${sessionId}`, [msg])

    return json({ sessionId, session, message: msg }, 201)
  }

  // User sends a message
  if (action === 'send') {
    const { sessionId, content } = body
    if (!sessionId || !content) return json({ error: 'sessionId and content required' }, 400)

    const chatSession = request.headers.get('X-Chat-Session')
    if (chatSession !== sessionId) return json({ error: 'Unauthorized' }, 401)

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return json({ error: 'Session not found' }, 404)
    if (session.status === 'closed') return json({ error: 'Session is closed' }, 400)

    const now = new Date().toISOString()
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sender: 'user',
      senderName: session.visitorName,
      content,
      createdAt: now,
    }

    const messages = await getCollection<ChatMessage>(kv, `chat-msgs-${sessionId}`)
    messages.push(msg)
    await putCollection(kv, `chat-msgs-${sessionId}`, messages)

    session.lastMessage = content.slice(0, 100)
    session.lastMessageAt = now
    session.unreadByAdmin += 1
    await putCollection(kv, 'chat-sessions', sessions)

    return json(msg, 201)
  }

  // Admin sends a message
  if (action === 'admin-send') {
    const admin = await authenticateAdmin(request, env)
    if (!admin) return json({ error: 'Unauthorized' }, 401)

    const { sessionId, content } = body
    if (!sessionId || !content) return json({ error: 'sessionId and content required' }, 400)

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return json({ error: 'Session not found' }, 404)

    const now = new Date().toISOString()
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sender: 'admin',
      senderName: admin.name,
      content,
      createdAt: now,
    }

    const messages = await getCollection<ChatMessage>(kv, `chat-msgs-${sessionId}`)
    messages.push(msg)
    await putCollection(kv, `chat-msgs-${sessionId}`, messages)

    session.lastMessage = content.slice(0, 100)
    session.lastMessageAt = now
    session.unreadByUser += 1
    session.unreadByAdmin = 0
    await putCollection(kv, 'chat-sessions', sessions)

    return json(msg, 201)
  }

  // Admin closes a session
  if (action === 'close') {
    const admin = await authenticateAdmin(request, env)
    if (!admin) return json({ error: 'Unauthorized' }, 401)

    const { sessionId } = body
    if (!sessionId) return json({ error: 'sessionId required' }, 400)

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return json({ error: 'Session not found' }, 404)

    session.status = 'closed'
    await putCollection(kv, 'chat-sessions', sessions)

    return json({ success: true })
  }

  // User marks messages as read
  if (action === 'read') {
    const { sessionId } = body
    if (!sessionId) return json({ error: 'sessionId required' }, 400)

    const chatSession = request.headers.get('X-Chat-Session')
    if (chatSession !== sessionId) return json({ error: 'Unauthorized' }, 401)

    const sessions = await getCollection<ChatSession>(kv, 'chat-sessions')
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return json({ error: 'Session not found' }, 404)

    session.unreadByUser = 0
    await putCollection(kv, 'chat-sessions', sessions)

    return json({ success: true })
  }

  return json({ error: 'Invalid action' }, 400)
}
