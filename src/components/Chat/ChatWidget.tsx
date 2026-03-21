import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'
import { useChatStore } from '../../store/chatStore'
import { useUserStore } from '../../store/userStore'

export const ChatWidget: React.FC = () => {
  const { t } = useTranslation()
  const currentUser = useUserStore((s) => s.currentUser)
  const {
    isOpen, setOpen,
    sessionId, messages, unreadByUser, sessionStatus, isSending,
    startSession, sendMessage, restoreSession, clearSession, pollUserMessages, markRead,
  } = useChatStore()

  const [inputValue, setInputValue] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore session on mount
  useEffect(() => {
    restoreSession()
  }, [])

  // Start/stop polling when widget opens/closes
  useEffect(() => {
    if (isOpen && sessionId) {
      markRead()
      pollRef.current = setInterval(pollUserMessages, 3000)
      return () => {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [isOpen, sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleOpen = () => {
    if (!sessionId && !currentUser) {
      setShowForm(true)
    }
    setOpen(true)
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    if (currentUser) {
      // Logged-in user: auto-fill info
      await startSession(
        `${currentUser.firstName} ${currentUser.lastName}`,
        currentUser.email,
        inputValue.trim(),
        currentUser.id
      )
    } else {
      if (!visitorName.trim() || !visitorEmail.trim()) return
      await startSession(visitorName.trim(), visitorEmail.trim(), inputValue.trim())
    }
    setInputValue('')
    setShowForm(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return
    const content = inputValue.trim()
    setInputValue('')
    await sendMessage(content)
  }

  const handleNewChat = () => {
    clearSession()
    if (!currentUser) {
      setShowForm(true)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Determine what to show inside the chat panel
  const hasSession = !!sessionId
  const needsInfoForm = !hasSession && !currentUser && showForm
  const needsFirstMessage = !hasSession && (currentUser || !showForm)

  return (
    <>
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <FiMessageCircle size={24} />
          {unreadByUser > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadByUser > 9 ? '9+' : unreadByUser}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 max-sm:w-[calc(100vw-2rem)] max-sm:h-[calc(100vh-6rem)] max-sm:bottom-3 max-sm:right-3">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-semibold text-sm">{t('chat.title')}</h3>
              <p className="text-xs text-blue-100">{t('chat.online')}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-blue-500 rounded transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          {needsInfoForm ? (
            // Guest info form
            <form onSubmit={handleStartChat} className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-1">{t('chat.guestInfo')}</p>
              <input
                type="text"
                placeholder={t('chat.namePlaceholder')}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder={t('chat.emailPlaceholder')}
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder={t('chat.messagePlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-h-[80px] resize-none"
                required
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSending ? t('chat.sending') : t('chat.startChat')}
              </button>
            </form>
          ) : !hasSession ? (
            // Logged-in user: just type first message
            <form onSubmit={handleStartChat} className="flex-1 p-4 flex flex-col gap-3">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiMessageCircle size={28} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">{t('chat.welcomeMessage')}</p>
                  {currentUser && (
                    <p className="text-xs text-gray-400 mt-1">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('chat.messagePlaceholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSending || !inputValue.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </form>
          ) : (
            // Chat messages view
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      {msg.sender === 'admin' && (
                        <p className="text-xs font-medium text-blue-600 mb-0.5">{msg.senderName}</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {sessionStatus === 'closed' && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-400">{t('chat.sessionClosed')}</p>
                    <button
                      onClick={handleNewChat}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      {t('chat.startNew')}
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              {sessionStatus !== 'closed' && (
                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    placeholder={t('chat.messagePlaceholder')}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputValue.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <FiSend size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
