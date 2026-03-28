import React, { useEffect, useState, useMemo } from 'react'
import { FiMail, FiInbox, FiSearch, FiTrash2, FiRefreshCw, FiClock, FiUser, FiMessageSquare, FiChevronDown, FiChevronUp, FiUploadCloud, FiExternalLink } from 'react-icons/fi'
import { api } from '../../api/client'

interface ContactSubmission {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
}

type Tab = 'contacts' | 'newsletter'

export const AdminMessagesPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('contacts')
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ total: number; synced: number; failed: number } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.all([
        api.getContactSubmissions(),
        api.getNewsletterSubscribers(),
      ])
      setContacts(c)
      setSubscribers(s)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await api.markContactRead(id)
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)))
    } catch {
      // ignore
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('确定要删除此留言？')) return
    try {
      await api.deleteContactSubmission(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch {
      // ignore
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm('确定要删除此订阅者？')) return
    try {
      await api.deleteNewsletterSubscriber(id)
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } catch {
      // ignore
    }
  }

  const handleSyncToMailerLite = async () => {
    if (syncing) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await api.syncNewsletterToMailerLite()
      setSyncResult(result)
    } catch {
      setSyncResult({ total: 0, synced: 0, failed: -1 })
    } finally {
      setSyncing(false)
    }
  }

  const unreadCount = contacts.filter((c) => !c.read).length

  const filteredContacts = useMemo(() => {
    if (!search) return contacts
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
    )
  }, [contacts, search])

  const filteredSubscribers = useMemo(() => {
    if (!search) return subscribers
    const q = search.toLowerCase()
    return subscribers.filter((s) => s.email.toLowerCase().includes(q))
  }, [subscribers, search])

  const subjectLabels: Record<string, string> = {
    'General Inquiry': '一般咨询',
    'Installation Help': '安装帮助',
    'Product Compatibility': '产品兼容性',
    'Order Status': '订单状态',
    'Warranty Claim': '保修申请',
    'Wholesale / B2B': '批发/B2B',
    'Other': '其他',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">消息管理</h1>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setTab('contacts'); setSearch(''); setExpandedId(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'contacts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FiMessageSquare size={14} />
          联系留言
          {unreadCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              tab === 'contacts' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTab('newsletter'); setSearch(''); setExpandedId(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'newsletter' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FiMail size={14} />
          Newsletter 订阅
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            tab === 'newsletter' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'contacts' ? '搜索留言内容、姓名或邮箱...' : '搜索邮箱...'}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <FiRefreshCw size={28} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : tab === 'contacts' ? (
        /* ─── Contacts Tab ─── */
        filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
            <FiInbox size={28} className="mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-500">{search ? '未找到匹配留言' : '暂无联系留言'}</p>
            <p className="text-sm mt-1">前台用户提交联系表单后将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => {
              const isExpanded = expandedId === contact.id
              return (
                <div key={contact.id} className={`bg-white rounded-xl border overflow-hidden ${!contact.read ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : contact.id)
                      if (!contact.read) handleMarkRead(contact.id)
                    }}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 text-sm">
                      {!contact.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {subjectLabels[contact.subject] || contact.subject}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs truncate max-w-md">{contact.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(contact.createdAt).toLocaleString('zh-CN')}
                      </span>
                      {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 mb-1">发件人</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <FiUser size={14} className="text-gray-400" />
                            {contact.firstName} {contact.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">邮箱</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <FiMail size={14} className="text-gray-400" />
                            {contact.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">时间</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <FiClock size={14} className="text-gray-400" />
                            {new Date(contact.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {contact.message}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <FiMail size={14} />
                          回复邮件
                        </a>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiTrash2 size={14} />
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <p className="text-xs text-gray-400 mt-2">
              共 {contacts.length} 条留言，{unreadCount} 条未读
              {filteredContacts.length !== contacts.length && `，已筛选 ${filteredContacts.length} 条`}
            </p>
          </div>
        )
      ) : (
        /* ─── Newsletter Tab ─── */
        filteredSubscribers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
            <FiMail size={28} className="mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-500">{search ? '未找到匹配订阅者' : '暂无订阅者'}</p>
            <p className="text-sm mt-1">前台用户订阅 Newsletter 后将显示在这里</p>
          </div>
        ) : (
          <div>
            {/* Toolbar: sync + MailerLite link */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-blue-700 flex items-center gap-2">
                <FiMail size={14} />
                共 {subscribers.length} 位订阅者
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncToMailerLite}
                  disabled={syncing || subscribers.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiUploadCloud size={14} className={syncing ? 'animate-pulse' : ''} />
                  {syncing ? '同步中...' : '同步到 MailerLite'}
                </button>
                <a
                  href="https://dashboard.mailerlite.com/campaigns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <FiExternalLink size={14} />
                  去 MailerLite 发邮件
                </a>
              </div>
            </div>
            {syncResult && (
              <div className={`rounded-lg p-3 mb-4 text-sm ${syncResult.failed === -1 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {syncResult.failed === -1
                  ? '同步失败，请检查 MailerLite API Token 配置'
                  : `同步完成！共 ${syncResult.total} 位，成功 ${syncResult.synced} 位${syncResult.failed > 0 ? `，失败 ${syncResult.failed} 位` : ''}`
                }
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">邮箱</th>
                    <th className="px-5 py-3 font-medium">订阅时间</th>
                    <th className="px-5 py-3 font-medium w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub, i) => (
                    <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{sub.email}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(sub.subscribedAt).toLocaleString('zh-CN')}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {filteredSubscribers.length !== subscribers.length && `已筛选 ${filteredSubscribers.length} / ${subscribers.length} 位`}
            </p>
          </div>
        )
      )}
    </div>
  )
}

