import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingCart, FiTag, FiCreditCard, FiLogOut, FiMenu, FiX, FiChevronRight } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'

const navItems = [
  { path: '/haijieaaronzhang', icon: FiGrid, label: '仪表盘' },
  { path: '/haijieaaronzhang/products', icon: FiPackage, label: '商品管理' },
  { path: '/haijieaaronzhang/categories', icon: FiTag, label: '分类管理' },
  { path: '/haijieaaronzhang/orders', icon: FiShoppingCart, label: '订单管理' },
  { path: '/haijieaaronzhang/payment', icon: FiCreditCard, label: '支付设置' },
]

const breadcrumbMap: Record<string, string> = {
  '/haijieaaronzhang': '仪表盘',
  '/haijieaaronzhang/products': '商品管理',
  '/haijieaaronzhang/products/new': '添加商品',
  '/haijieaaronzhang/categories': '分类管理',
  '/haijieaaronzhang/orders': '订单管理',
  '/haijieaaronzhang/payment': '支付设置',
}

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const logout = useAdminStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path: string) =>
    path === '/haijieaaronzhang' ? location.pathname === '/haijieaaronzhang' : location.pathname.startsWith(path)

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs: { label: string; path?: string }[] = [{ label: '首页', path: '/haijieaaronzhang' }]

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
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-700">
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
            ZoltMount 后台管理系统
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
