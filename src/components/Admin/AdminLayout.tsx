import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingCart, FiTag, FiCreditCard, FiLogOut, FiMenu, FiChevronRight, FiUsers, FiFileText, FiLock, FiTruck, FiMessageSquare, FiUserCheck, FiHeadphones, FiKey, FiBell, FiX } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useChatStore } from '../../store/chatStore'
import { api } from '../../api/client'

const allNavItems = [
  { path: '/haijieaaronzhang', icon: FiGrid, label: '仪表盘', superOnly: true },
  { path: '/haijieaaronzhang/products', icon: FiPackage, label: '商品管理', superOnly: false },
  { path: '/haijieaaronzhang/categories', icon: FiTag, label: '分类管理', superOnly: false },
  { path: '/haijieaaronzhang/orders', icon: FiShoppingCart, label: '订单管理', superOnly: false },
  { path: '/haijieaaronzhang/customers', icon: FiUserCheck, label: '客户管理', superOnly: true },
  { path: '/haijieaaronzhang/messages', icon: FiMessageSquare, label: '消息管理', superOnly: false },
  { path: '/haijieaaronzhang/chat', icon: FiHeadphones, label: '在线客服', superOnly: false },
  { path: '/haijieaaronzhang/payment', icon: FiCreditCard, label: '支付设置', superOnly: true },
  { path: '/haijieaaronzhang/payment-gateways', icon: FiKey, label: '收款网关', superOnly: true },
  { path: '/haijieaaronzhang/shipping', icon: FiTruck, label: '物流运费', superOnly: true },
  { path: '/haijieaaronzhang/accounts', icon: FiUsers, label: '账号管理', superOnly: true },
  { path: '/haijieaaronzhang/logs', icon: FiFileText, label: '操作日志', superOnly: true },
]

const breadcrumbMap: Record<string, string> = {
  '/haijieaaronzhang': '仪表盘',
  '/haijieaaronzhang/products': '商品管理',
  '/haijieaaronzhang/products/new': '添加商品',
  '/haijieaaronzhang/categories': '分类管理',
  '/haijieaaronzhang/orders': '订单管理',
  '/haijieaaronzhang/customers': '客户管理',
  '/haijieaaronzhang/messages': '消息管理',
  '/haijieaaronzhang/chat': '在线客服',
  '/haijieaaronzhang/payment': '支付设置',
  '/haijieaaronzhang/payment-gateways': '收款网关',
  '/haijieaaronzhang/shipping': '物流运费',
  '/haijieaaronzhang/accounts': '账号管理',
  '/haijieaaronzhang/logs': '操作日志',
  '/haijieaaronzhang/change-password': '修改密码',
}

// Toast notification type
interface AdminToast {
  id: number
  type: 'order' | 'chat'
  message: string
  link: string
}

// Play notification sound
function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.stop(ctx.currentTime + 0.4)
  } catch { /* ignore audio errors */ }
}

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAdminStore((s) => s.logout)
  const adminAccount = useAdminStore((s) => s.adminAccount)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const adminTotalUnread = useChatStore((s) => s.adminTotalUnread)
  const fetchAdminUnreadTotal = useChatStore((s) => s.fetchAdminUnreadTotal)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Notification state
  const [toasts, setToasts] = useState<AdminToast[]>([])
  const [pendingOrderCount, setPendingOrderCount] = useState(0)
  const prevOrderCountRef = useRef<number>(-1)
  const prevChatUnreadRef = useRef<number>(-1)
  const toastIdRef = useRef(0)

  const addToast = useCallback((type: 'order' | 'chat', message: string, link: string) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, type, message, link }])
    playNotificationSound()
    // Request browser notification
    if (Notification.permission === 'granted') {
      new Notification('ZoltMount 后台', { body: message, icon: '/favicon.ico' })
    }
    // Auto remove after 8 seconds
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 8000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Unified polling: orders + chat every 10 seconds
  useEffect(() => {
    const poll = async () => {
      // Fetch chat unread
      await fetchAdminUnreadTotal()
      const chatUnread = useChatStore.getState().adminTotalUnread

      // Fetch pending orders
      try {
        const orders = await api.getOrders()
        const pending = orders.filter((o) => o.status === 'pending').length
        setPendingOrderCount(pending)

        // Notify if new orders appeared (skip first load)
        if (prevOrderCountRef.current >= 0 && pending > prevOrderCountRef.current) {
          const newCount = pending - prevOrderCountRef.current
          addToast('order', `收到 ${newCount} 个新订单！`, '/haijieaaronzhang/orders?tab=pending')
        }
        prevOrderCountRef.current = pending
      } catch { /* ignore */ }

      // Notify if new chat messages (skip first load)
      if (prevChatUnreadRef.current >= 0 && chatUnread > prevChatUnreadRef.current) {
        addToast('chat', `收到新的客服消息（${chatUnread} 条未读）`, '/haijieaaronzhang/chat')
      }
      prevChatUnreadRef.current = chatUnread
    }

    poll()
    pollRef.current = setInterval(poll, 10000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const role = adminAccount?.role || 'staff'
  const navItems = allNavItems.filter((item) => !item.superOnly || role === 'super_admin')

  const isActive = (path: string) =>
    path === '/haijieaaronzhang' ? location.pathname === '/haijieaaronzhang' : location.pathname.startsWith(path)

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs: { label: string; path?: string }[] = [{ label: '首页', path: role === 'super_admin' ? '/haijieaaronzhang' : '/haijieaaronzhang/products' }]

    // Check for edit product route
    if (path.startsWith('/haijieaaronzhang/products/edit/')) {
      crumbs.push({ label: '商品管理', path: '/haijieaaronzhang/products' })
      crumbs.push({ label: '编辑商品' })
    } else if (path === '/haijieaaronzhang/products/new') {
      crumbs.push({ label: '商品管理', path: '/haijieaaronzhang/products' })
      crumbs.push({ label: '添加商品' })
    } else if (breadcrumbMap[path] && path !== '/haijieaaronzhang') {
      crumbs.push({ label: breadcrumbMap[path] })
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">Z</span>
        </div>
        <span className="text-white font-bold text-lg">ZoltMount</span>
        <span className="ml-1 text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">管理后台</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-300 hover:bg-gray-700/70 hover:text-white hover:translate-x-1'
            }`}
          >
            <item.icon size={18} />
            {item.label}
            {item.path === '/haijieaaronzhang/orders' && pendingOrderCount > 0 && (
              <span className="ml-auto w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingOrderCount > 9 ? '9+' : pendingOrderCount}
              </span>
            )}
            {item.path === '/haijieaaronzhang/chat' && adminTotalUnread > 0 && (
              <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {adminTotalUnread > 9 ? '9+' : adminTotalUnread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-700">
        {/* Current account info */}
        {adminAccount && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm text-white font-medium truncate">{adminAccount.name}</p>
            <p className="text-xs text-gray-400">
              {adminAccount.role === 'super_admin' ? '超级管理员' : '员工'}
            </p>
          </div>
        )}
        <Link
          to="/haijieaaronzhang/change-password"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700/70 hover:text-white transition-all duration-200 mb-1"
        >
          <FiLock size={18} />
          修改密码
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700/70 hover:text-white transition-all duration-200 mb-1"
        >
          🌐 访问前台商城
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
        >
          <FiLogOut size={18} />
          退出登录
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-gray-900 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 z-50 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu size={20} />
            </button>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <FiChevronRight size={14} className="text-gray-300 mx-1" />}
                  {crumb.path && i < breadcrumbs.length - 1 ? (
                    <Link to={crumb.path} className="text-gray-400 hover:text-blue-600 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
          <div className="text-xs text-gray-400">
            {adminAccount?.name || 'ZoltMount 后台管理系统'}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border cursor-pointer animate-[slideIn_0.3s_ease-out] ${
                toast.type === 'order'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => { removeToast(toast.id); navigate(toast.link) }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'order' ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {toast.type === 'order'
                  ? <FiShoppingCart size={16} className="text-white" />
                  : <FiHeadphones size={16} className="text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${
                  toast.type === 'order' ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {toast.type === 'order' ? '新订单通知' : '新消息通知'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">点击查看</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id) }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
