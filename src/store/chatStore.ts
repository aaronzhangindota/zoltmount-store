import { create } from 'zustand'

export interface ChatSession {
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

export interface ChatMessage {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  content: string
  createdAt: string
}

interface ChatState {
  // User-side state
  sessionId: string | null
  messages: ChatMessage[]
  unreadByUser: number
  sessionStatus: 'active' | 'closed' | null
  isOpen: boolean
  isSending: boolean

  // Admin-side state
  adminSessions: ChatSession[]
  adminSelectedSessionId: string | null
  adminMessages: ChatMessage[]
  adminTotalUnread: number

  // User actions
  setOpen: (open: boolean) => void
  startSession: (visitorName: string, visitorEmail: string, message: string, userId?: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  markRead: () => Promise<void>
  restoreSession: () => void
  clearSession: () => void

  // User polling
  pollUserMessages: () => Promise<void>

  // Admin actions
  fetchAdminSessions: () => Promise<void>
  selectAdminSession: (sessionId: string) => Promise<void>
  adminSendMessage: (sessionId: string, content: string) => Promise<void>
  closeSession: (sessionId: string) => Promise<void>
  pollAdminSessions: () => Promise<void>

  // Admin badge polling
  fetchAdminUnreadTotal: () => Promise<void>
}

const getAdminToken = (): string | null => {
  try {
    const raw = localStorage.getItem('admin-store')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.adminToken || null
  } catch {
    return null
  }
}

const chatRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  const res = await fetch(`/api${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Chat API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export const useChatStore = create<ChatState>()((set, get) => ({
  sessionId: null,
  messages: [],
  unreadByUser: 0,
  sessionStatus: null,
  isOpen: false,
  isSending: false,

  adminSessions: [],
  adminSelectedSessionId: null,
  adminMessages: [],
  adminTotalUnread: 0,

  setOpen: (open) => {
    set({ isOpen: open })
    if (open && get().sessionId) {
      get().markRead()
    }
  },

  startSession: async (visitorName, visitorEmail, message, userId) => {
    set({ isSending: true })
    try {
      const res = await chatRequest<{ sessionId: string; session: ChatSession; message: ChatMessage }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ action: 'start', visitorName, visitorEmail, message, userId }),
      })
      localStorage.setItem('chat-session-id', res.sessionId)
      set({
        sessionId: res.sessionId,
        messages: [res.message],
        sessionStatus: 'active',
        unreadByUser: 0,
      })
    } finally {
      set({ isSending: false })
    }
  },

  sendMessage: async (content) => {
    const { sessionId } = get()
    if (!sessionId) return
    set({ isSending: true })
    try {
      const msg = await chatRequest<ChatMessage>('/chat', {
        method: 'POST',
        headers: { 'X-Chat-Session': sessionId },
        body: JSON.stringify({ action: 'send', sessionId, content }),
      })
      set((s) => ({ messages: [...s.messages, msg] }))
    } finally {
      set({ isSending: false })
    }
  },

  markRead: async () => {
    const { sessionId } = get()
    if (!sessionId) return
    try {
      await chatRequest('/chat', {
        method: 'POST',
        headers: { 'X-Chat-Session': sessionId },
        body: JSON.stringify({ action: 'read', sessionId }),
      })
      set({ unreadByUser: 0 })
    } catch { /* ignore */ }
  },

  restoreSession: () => {
    const stored = localStorage.getItem('chat-session-id')
    if (stored) {
      set({ sessionId: stored })
      // Fetch current messages
      chatRequest<{ messages: ChatMessage[]; unreadByUser: number; status: 'active' | 'closed' }>(`/chat?action=poll&sessionId=${stored}`, {
        headers: { 'X-Chat-Session': stored },
      }).then((res) => {
        set({
          messages: res.messages,
          unreadByUser: res.unreadByUser,
          sessionStatus: res.status,
        })
      }).catch(() => {
        // Session might be expired/invalid
        localStorage.removeItem('chat-session-id')
        set({ sessionId: null })
      })
    }
  },

  clearSession: () => {
    localStorage.removeItem('chat-session-id')
    set({ sessionId: null, messages: [], unreadByUser: 0, sessionStatus: null })
  },

  pollUserMessages: async () => {
    const { sessionId } = get()
    if (!sessionId) return
    try {
      const res = await chatRequest<{ messages: ChatMessage[]; unreadByUser: number; status: 'active' | 'closed' }>(`/chat?action=poll&sessionId=${sessionId}`, {
        headers: { 'X-Chat-Session': sessionId },
      })
      set({
        messages: res.messages,
        unreadByUser: res.unreadByUser,
        sessionStatus: res.status,
      })
    } catch { /* ignore polling errors */ }
  },

  // Admin actions
  fetchAdminSessions: async () => {
    const token = getAdminToken()
    if (!token) return
    try {
      const sessions = await chatRequest<ChatSession[]>('/chat?action=sessions', {
        headers: { 'X-Admin-Token': token },
      })
      const total = sessions.reduce((sum, s) => sum + s.unreadByAdmin, 0)
      set({ adminSessions: sessions, adminTotalUnread: total })
    } catch { /* ignore */ }
  },

  selectAdminSession: async (sessionId) => {
    const token = getAdminToken()
    if (!token) return
    set({ adminSelectedSessionId: sessionId })
    try {
      const messages = await chatRequest<ChatMessage[]>(`/chat?action=messages&sessionId=${sessionId}`, {
        headers: { 'X-Admin-Token': token },
      })
      set({ adminMessages: messages })
      // Refresh sessions to update unread count
      get().fetchAdminSessions()
    } catch { /* ignore */ }
  },

  adminSendMessage: async (sessionId, content) => {
    const token = getAdminToken()
    if (!token) return
    const msg = await chatRequest<ChatMessage>('/chat', {
      method: 'POST',
      headers: { 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'admin-send', sessionId, content }),
    })
    set((s) => ({ adminMessages: [...s.adminMessages, msg] }))
    get().fetchAdminSessions()
  },

  closeSession: async (sessionId) => {
    const token = getAdminToken()
    if (!token) return
    await chatRequest('/chat', {
      method: 'POST',
      headers: { 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'close', sessionId }),
    })
    get().fetchAdminSessions()
  },

  pollAdminSessions: async () => {
    const token = getAdminToken()
    if (!token) return
    try {
      const sessions = await chatRequest<ChatSession[]>('/chat?action=admin-poll', {
        headers: { 'X-Admin-Token': token },
      })
      const total = sessions.reduce((sum, s) => sum + s.unreadByAdmin, 0)
      set({ adminSessions: sessions, adminTotalUnread: total })

      // If a session is selected, also refresh its messages
      const selectedId = get().adminSelectedSessionId
      if (selectedId) {
        const messages = await chatRequest<ChatMessage[]>(`/chat?action=messages&sessionId=${selectedId}`, {
          headers: { 'X-Admin-Token': token },
        })
        set({ adminMessages: messages })
      }
    } catch { /* ignore */ }
  },

  fetchAdminUnreadTotal: async () => {
    const token = getAdminToken()
    if (!token) return
    try {
      const sessions = await chatRequest<ChatSession[]>('/chat?action=admin-poll', {
        headers: { 'X-Admin-Token': token },
      })
      const total = sessions.reduce((sum, s) => sum + s.unreadByAdmin, 0)
      set({ adminTotalUnread: total })
    } catch { /* ignore */ }
  },
}))
