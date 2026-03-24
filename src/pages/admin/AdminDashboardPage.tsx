import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiTag, FiDollarSign, FiPlus, FiList, FiGrid, FiAlertTriangle, FiTrendingUp, FiEdit2, FiUsers, FiMessageSquare, FiRefreshCw, FiMail } from 'react-icons/fi'
import { useDataStore } from '../../store/dataStore'
import { api } from '../../api/client'

export const AdminDashboardPage: React.FC = () => {
  const products = useDataStore((s) => s.products)
  const orders = useDataStore((s) => s.orders)
  const categories = useDataStore((s) => s.categories)

  const [customerCount, setCustomerCount] = useState<number | null>(null)
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)

  useEffect(() => {
    // Fetch customer and message counts in background
    api.getAdminUsers().then((users) => setCustomerCount(users.length)).catch(() => setCustomerCount(0))
    api.getContactSubmissions().then((msgs) => {
      setUnreadMessages(msgs.filter((m: any) => !m.read).length)
    }).catch(() => setUnreadMessages(0))
    api.getNewsletterSubscribers().then((subs) => setSubscriberCount(subs.length)).catch(() => setSubscriberCount(0))
  }, [])

  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)

  const stats = [
    {
      icon: FiPackage,
      label: '商品总数',
      value: products.length,
      desc: '在售商品',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
      link: '/haijieaaronzhang/products',
    },
    {
      icon: FiShoppingCart,
      label: '订单总数',
      value: orders.length,
      desc: '累计订单',
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      link: '/haijieaaronzhang/orders',
    },
    {
      icon: FiDollarSign,
      label: '总营收',
      value: `$${totalRevenue.toFixed(2)}`,
      desc: '已完成订单收入',
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
      link: '/haijieaaronzhang/orders?tab=completed',
    },
    {
      icon: FiUsers,
      label: '注册客户',
      value: customerCount !== null ? customerCount : '...',
      desc: '注册用户',
      gradient: 'from-pink-500 to-pink-600',
      shadow: 'shadow-pink-500/25',
      link: '/haijieaaronzhang/customers',
    },
    {
      icon: FiTag,
      label: '分类数量',
      value: categories.length,
      desc: '商品分类',
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/25',
      link: '/haijieaaronzhang/categories',
    },
    {
      icon: FiMessageSquare,
      label: '未读消息',
      value: unreadMessages !== null ? unreadMessages : '...',
      desc: subscriberCount !== null ? `${subscriberCount} 位订阅者` : '加载中',
      gradient: 'from-cyan-500 to-cyan-600',
      shadow: 'shadow-cyan-500/25',
      link: '/haijieaaronzhang/messages',
    },
  ]

  // Out of stock products
  const outOfStock = products.filter((p) => !p.inStock)

  // Top selling products (by order frequency)
  const productSales: Record<string, { name: string; count: number; revenue: number }> = {}
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, count: 0, revenue: 0 }
      }
      productSales[item.productId].count += item.quantity
      productSales[item.productId].revenue += item.price * item.quantity
    })
  })
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 5)

  // Order status distribution
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const processingOrders = orders.filter((o) => o.status === 'processing').length
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>

      {/* Order status alerts */}
      {(pendingOrders > 0 || processingOrders > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingOrders > 0 && (
            <Link
              to="/haijieaaronzhang/orders?tab=pending"
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 hover:bg-yellow-100 transition-colors"
            >
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              {pendingOrders} 个订单待处理
            </Link>
          )}
          {processingOrders > 0 && (
            <Link
              to="/haijieaaronzhang/orders?tab=processing"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {processingOrders} 个订单处理中
            </Link>
          )}
          {unreadMessages !== null && unreadMessages > 0 && (
            <Link
              to="/haijieaaronzhang/messages"
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-sm text-cyan-700 hover:bg-cyan-100 transition-colors"
            >
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              {unreadMessages} 条未读消息
            </Link>
          )}
        </div>
      )}

      {/* Stats cards — 6 cards in 2 rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg ${stat.shadow}`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/haijieaaronzhang/products/new"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <FiPlus className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">添加商品</p>
            <p className="text-xs text-gray-400">上架新的电视支架</p>
          </div>
        </Link>
        <Link
          to="/haijieaaronzhang/orders"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <FiList className="text-emerald-600" size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">查看订单</p>
            <p className="text-xs text-gray-400">管理和处理订单</p>
          </div>
        </Link>
        <Link
          to="/haijieaaronzhang/messages"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-cyan-200 transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
            <FiMessageSquare className="text-cyan-600" size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">查看消息</p>
            <p className="text-xs text-gray-400">联系留言和订阅管理</p>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Inventory alerts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiAlertTriangle size={16} className="text-orange-500" />
            <h2 className="font-bold text-gray-900">库存预警</h2>
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {outOfStock.length}
            </span>
          </div>
          {outOfStock.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FiPackage size={28} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm">所有商品均有库存</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {outOfStock.slice(0, 5).map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiAlertTriangle size={14} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-red-500">缺货</p>
                    </div>
                  </div>
                  <Link
                    to={`/haijieaaronzhang/products/edit/${p.id}`}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiTrendingUp size={16} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">热销排行</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FiTrendingUp size={28} className="mx-auto mb-2" />
              <p className="text-sm">暂无销售数据</p>
              <p className="text-xs mt-1">前台下单后排行将显示在这里</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map(([id, data], i) => (
                <div key={id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{data.name}</p>
                    <p className="text-xs text-gray-400">销量 {data.count}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${data.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Recovery Stats — Abandoned Cart → ZOLT10 conversions */}
      {(() => {
        const promoOrders = orders.filter((o) => o.promoCode?.toUpperCase() === 'ZOLT10')
        const promoCompleted = promoOrders.filter((o) => o.status === 'completed')
        const promoRevenue = promoCompleted.reduce((sum, o) => sum + o.total, 0)
        const promoDiscount = promoOrders.reduce((sum, o) => sum + (o.promoDiscount || 0), 0)
        return (
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiMail size={16} className="text-rose-500" />
              <h2 className="font-bold text-gray-900">邮件回流转化（ZOLT10）</h2>
              <span className="ml-auto text-xs text-gray-400">Abandoned Cart 邮件追踪</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{promoOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">使用优惠码订单</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{promoCompleted.length}</p>
                <p className="text-xs text-gray-500 mt-1">已完成订单</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${promoRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">回流营收</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">${promoDiscount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">优惠码折扣</p>
              </div>
            </div>
            {promoOrders.length > 0 && (
              <div className="px-5 pb-4">
                <div className="text-xs text-gray-400 space-y-1">
                  {promoOrders.slice(0, 3).map((o) => (
                    <div key={o.id} className="flex justify-between">
                      <span>{o.customer.firstName} {o.customer.lastName} · {o.id}</span>
                      <span className="font-medium text-gray-600">${o.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {promoOrders.length > 3 && (
                    <Link to="/haijieaaronzhang/orders" className="text-blue-600 hover:underline">
                      查看全部 {promoOrders.length} 笔 →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">最近订单</h2>
          <Link to="/haijieaaronzhang/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看全部
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingCart size={28} />
            </div>
            <p className="font-medium text-gray-500">暂无订单</p>
            <p className="text-sm mt-1">前台下单后，订单将显示在这里</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">订单号</th>
                  <th className="px-5 py-3 font-medium">客户</th>
                  <th className="px-5 py-3 font-medium">金额</th>
                  <th className="px-5 py-3 font-medium">状态</th>
                  <th className="px-5 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{order.id}</td>
                    <td className="px-5 py-3 text-gray-600">{order.customer.firstName} {order.customer.lastName}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
    {statusLabels[status] || status}
  </span>
)
