import React, { useState, useMemo } from 'react'
import { FiShoppingCart, FiSearch, FiMapPin, FiTruck } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import type { Order } from '../../store/adminStore'

const carrierOptions = [
  { value: '', label: '选择快递' },
  { value: 'DHL', label: 'DHL' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'USPS', label: 'USPS' },
  { value: 'YunExpress', label: '云途' },
  { value: 'Yanwen', label: '燕文' },
  { value: '4PX', label: '递四方' },
  { value: 'ChinaPost', label: '中国邮政' },
  { value: 'EMS', label: 'EMS' },
  { value: 'Other', label: '其他' },
]

const statusOptions: Order['status'][] = ['待处理', '处理中', '已发货', '已完成', '已取消']

const statusColors: Record<string, string> = {
  '待处理': 'bg-yellow-100 text-yellow-700',
  '处理中': 'bg-blue-100 text-blue-700',
  '已发货': 'bg-purple-100 text-purple-700',
  '已完成': 'bg-green-100 text-green-700',
  '已取消': 'bg-red-100 text-red-700',
}

const statusBarColors: Record<string, string> = {
  '待处理': 'bg-yellow-400',
  '处理中': 'bg-blue-500',
  '已发货': 'bg-purple-500',
  '已完成': 'bg-green-500',
  '已取消': 'bg-red-400',
}

type TabStatus = '全部' | Order['status']

export const AdminOrdersPage: React.FC = () => {
  const orders = useAdminStore((s) => s.orders)
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus)
  const updateOrderTracking = useAdminStore((s) => s.updateOrderTracking)
  const [activeTab, setActiveTab] = useState<TabStatus>('全部')
  const [search, setSearch] = useState('')

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return counts
  }, [orders])

  // Filter orders
  const filtered = useMemo(() => {
    let result = orders

    // Tab filter
    if (activeTab !== '全部') {
      result = result.filter((o) => o.status === activeTab)
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q)
      )
    }

    return result
  }, [orders, activeTab, search])

  const tabs: { label: TabStatus; count?: number }[] = [
    { label: '全部', count: orders.length },
    ...statusOptions.map((s) => ({ label: s as TabStatus, count: statusCounts[s] || 0 })),
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>

      {/* Status tab bar */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.label
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === tab.label
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索订单号或客户姓名..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingCart size={28} />
          </div>
          <p className="text-lg font-medium text-gray-500">暂无订单</p>
          <p className="text-sm mt-1">
            {search ? '没有找到匹配的订单' : '当客户在前台下单后，订单将显示在这里'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex">
              {/* Left colored status bar */}
              <div className={`w-1.5 flex-shrink-0 ${statusBarColors[order.status] || 'bg-gray-300'}`} />

              <div className="flex-1 min-w-0">
                {/* Order header */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order body */}
                <div className="px-5 py-4">
                  <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 mb-1">客户信息</p>
                      <p className="font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-gray-500">{order.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">订单金额</p>
                      <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">下单时间</p>
                      <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* Shipping address */}
                  {order.shippingAddress && (order.shippingAddress.address || order.shippingAddress.city) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiMapPin size={12} /> 收货地址
                      </p>
                      <p className="text-sm text-gray-700">
                        {[
                          order.shippingAddress.address,
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Tracking */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <FiTruck size={12} /> 物流追踪
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={order.carrier || ''}
                        onChange={(e) => updateOrderTracking(order.id, order.trackingNumber || '', e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        {carrierOptions.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={order.trackingNumber || ''}
                        onChange={(e) => updateOrderTracking(order.id, e.target.value, order.carrier || '')}
                        placeholder="输入快递单号..."
                        className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {order.trackingNumber && (
                        <a
                          href={`https://www.17track.net/zh/track#nums=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          查看物流
                        </a>
                      )}
                    </div>
                    {order.trackingNumber && order.carrier && (
                      <p className="text-xs text-blue-600 mt-1.5">
                        {order.carrier}: {order.trackingNumber}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-2">商品明细</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        共 {orders.length} 个订单
        {filtered.length !== orders.length && `，已筛选 ${filtered.length} 个`}
      </p>
    </div>
  )
}
