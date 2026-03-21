import React, { useState, useEffect, useRef } from 'react'
import { FiSend, FiX, FiUser, FiMail, FiMessageCircle } from 'react-icons/fi'
import { useChatStore } from '../../store/chatStore'
import type { ChatSession } from '../../store/chatStore'

export const AdminChatPage: React.FC = () => {
  const {
    adminSessions, adminSelectedSessionId, adminMessages,
    fetchAdminSessions, selectAdminSession, adminSendMessage, closeSession, pollAdminSessions,
  } = useChatStore()

  const [replyContent, setReplyContent] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initial fetch + polling
  useEffect(() => {
    fetchAdminSessions()
    pollRef.current = setInterval(pollAdminSessions, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [adminMessages])

  const filteredSessions = adminSessions
    .filter((s) => filter === 'all' || s.status === filter)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

  const selectedSession = adminSessions.find((s) => s.id === adminSelectedSessionId)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !adminSelectedSessionId || sending) return
    setSending(true)
    try {
      await adminSendMessage(adminSelectedSessionId, replyContent.trim())
      setReplyContent('')
    } finally {
      setSending(false)
    }
  }

  const handleClose = async (sessionId: string) => {
    if (!confirm('确认关闭此会话？')) return
    await closeSession(sessionId)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const SessionItem: React.FC<{ session: ChatSession }> = ({ session }) => {
    const isSelected = session.id === adminSelectedSessionId
    return (
      <button
        onClick={() => selectAdminSession(session.id)}
        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm text-gray-800 truncate flex-1">
            {session.visitorName}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {session.status === 'closed' && (
              <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                已关闭
              </span>
            )}
            {session.unreadByAdmin > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {session.unreadByAdmin > 9 ? '9+' : session.unreadByAdmin}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate">{session.lastMessage}</p>
        <p className="text-[10px] text-gray-400 mt-1">{formatTime(session.lastMessageAt)}</p>
      </button>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">在线客服</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已关闭'}
              {f === 'active' && adminSessions.filter((s) => s.status === 'active').length > 0 && (
                <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1 rounded">
                  {adminSessions.filter((s) => s.status === 'active').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100% - 3rem)' }}>
        {/* Session list */}
        <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FiMessageCircle size={32} className="mb-2" />
                <p className="text-sm">暂无会话</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))
            )}
          </div>
        </div>

        {/* Chat detail */}
        <div className="flex-1 flex flex-col">
          {!adminSelectedSessionId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">选择一个会话查看消息</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              {selectedSession && (
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-800">{selectedSession.visitorName}</h3>
                      {selectedSession.userId && (
                        <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">注册用户</span>
                      )}
                      {selectedSession.status === 'closed' && (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">已关闭</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><FiMail size={10} /> {selectedSession.visitorEmail}</span>
                      <span className="flex items-center gap-1"><FiUser size={10} /> {formatTime(selectedSession.createdAt)}</span>
                    </div>
                  </div>
                  {selectedSession.status === 'active' && (
                    <button
                      onClick={() => handleClose(selectedSession.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX size={14} />
                      关闭会话
                    </button>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {adminMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'admin'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      <p className={`text-xs font-medium mb-0.5 ${
                        msg.sender === 'admin' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {msg.senderName}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {selectedSession?.status === 'active' && (
                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="输入回复消息..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <FiSend size={14} />
                    发送
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
