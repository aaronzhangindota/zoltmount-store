import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiMapPin, FiTruck, FiTrash2, FiCheck, FiX, FiPackage, FiChevronDown, FiChevronUp, FiSave, FiDownload, FiFilter } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'
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

const statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '待发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusBarColors: Record<string, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
}

// Tab 样式：每个状态有独立的激活颜色
const tabActiveColors: Record<string, string> = {
  all: 'bg-gray-800 text-white',
  pending: 'bg-amber-500 text-white',
  processing: 'bg-blue-600 text-white',
  shipped: 'bg-purple-600 text-white',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-red-500 text-white',
}

const tabDotColors: Record<string, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-blue-400',
  shipped: 'bg-purple-400',
  completed: 'bg-green-400',
  cancelled: 'bg-red-400',
}

// 统计卡片样式
const statCardStyles: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  pending: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', text: 'text-amber-700' },
  processing: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', text: 'text-blue-700' },
  shipped: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', text: 'text-purple-700' },
  completed: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-400', text: 'text-red-600' },
}

const statCardIcons: Record<string, React.ElementType> = {
  pending: FiShoppingCart,
  processing: FiPackage,
  shipped: FiTruck,
  completed: FiCheck,
  cancelled: FiX,
}

type TabStatus = 'all' | Order['status']

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabStatus) || 'pending'
  const orders = useDataStore((s) => s.orders)
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus)
  const updateOrderTracking = useAdminStore((s) => s.updateOrderTracking)
  const deleteOrder = useAdminStore((s) => s.deleteOrder)
  const [activeTab, setActiveTab] = useState<TabStatus>(initialTab)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')

  // Local tracking edits (only save on button click)
  const [editingTracking, setEditingTracking] = useState<Record<string, { carrier: string; trackingNumber: string }>>({})

  const getTrackingEdit = (order: Order) =>
    editingTracking[order.id] ?? { carrier: order.carrier || '', trackingNumber: order.trackingNumber || '' }

  const setTrackingField = (orderId: string, field: 'carrier' | 'trackingNumber', value: string) => {
    setEditingTracking((prev) => ({
      ...prev,
      [orderId]: { ...getTrackingEditById(orderId), [field]: value },
    }))
  }

  const getTrackingEditById = (id: string) => {
    const order = orders.find((o) => o.id === id)
    return editingTracking[id] ?? { carrier: order?.carrier || '', trackingNumber: order?.trackingNumber || '' }
  }

  const handleSaveTracking = (orderId: string) => {
    const edit = getTrackingEditById(orderId)
    updateOrderTracking(orderId, edit.trackingNumber, edit.carrier)
    // Clear local edit
    setEditingTracking((prev) => {
      const next = { ...prev }
      delete next[orderId]
      return next
    })
  }

  const hasTrackingChanges = (order: Order) => {
    const edit = editingTracking[order.id]
    if (!edit) return false
    return edit.carrier !== (order.carrier || '') || edit.trackingNumber !== (order.trackingNumber || '')
  }

  // Workflow action: mark as next status
  const handleConfirmOrder = (id: string) => updateOrderStatus(id, 'processing')

  const handleShipOrder = (id: string) => {
    const edit = getTrackingEditById(id)
    if (edit.trackingNumber && edit.carrier) {
      updateOrderTracking(id, edit.trackingNumber, edit.carrier)
      setEditingTracking((prev) => { const next = { ...prev }; delete next[id]; return next })
    }
    updateOrderStatus(id, 'shipped')
  }

  const handleCompleteOrder = (id: string) => updateOrderStatus(id, 'completed')

  const handleCancelOrder = (id: string) => {
    if (window.confirm('确定要取消此订单吗？')) {
      updateOrderStatus(id, 'cancelled')
    }
  }

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('确定要删除此订单吗？删除后不可恢复。')) {
      try {
        await deleteOrder(id)
        if (expandedId === id) setExpandedId(null)
      } catch (err) {
        alert('删除失败：' + (err instanceof Error ? err.message : '权限不足或网络错误'))
      }
    }
  }

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

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      )
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      result = result.filter((o) => new Date(o.createdAt).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000 // include the whole day
      result = result.filter((o) => new Date(o.createdAt).getTime() < to)
    }
    if (amountMin) {
      const min = parseFloat(amountMin)
      if (!isNaN(min)) result = result.filter((o) => o.total >= min)
    }
    if (amountMax) {
      const max = parseFloat(amountMax)
      if (!isNaN(max)) result = result.filter((o) => o.total <= max)
    }

    return result
  }, [orders, activeTab, search, dateFrom, dateTo, amountMin, amountMax])

  const hasActiveFilters = dateFrom || dateTo || amountMin || amountMax

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setAmountMin('')
    setAmountMax('')
  }

  // CSV export
  const handleExportCSV = () => {
    const header = ['订单号', '客户姓名', '邮箱', '金额($)', '状态', '快递公司', '快递单号', '下单时间', '商品']
    const rows = filtered.map((o) => [
      o.id,
      `${o.customer.firstName} ${o.customer.lastName}`,
      o.customer.email,
      o.total.toFixed(2),
      statusLabels[o.status] || o.status,
      o.carrier || '',
      o.trackingNumber || '',
      new Date(o.createdAt).toLocaleString('zh-CN'),
      o.items.map((item) => `${item.name}x${item.quantity}`).join('; '),
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `订单导出_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabItems: { key: TabStatus; label: string; count?: number }[] = [
    { key: 'pending', label: '待处理', count: statusCounts['pending'] || 0 },
    { key: 'processing', label: '待发货', count: statusCounts['processing'] || 0 },
    { key: 'shipped', label: '已发货', count: statusCounts['shipped'] || 0 },
    { key: 'completed', label: '已完成', count: statusCounts['completed'] || 0 },
    { key: 'cancelled', label: '已取消', count: statusCounts['cancelled'] || 0 },
    { key: 'all', label: '全部', count: orders.length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiFilter size={14} />
            筛选
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiDownload size={14} />
            导出 CSV
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {statusOptions.map((status) => {
          const style = statCardStyles[status]
          const Icon = statCardIcons[status]
          const count = statusCounts[status] || 0
          const isActive = activeTab === status
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`relative p-4 rounded-xl border transition-all duration-200 text-left ${style.bg} ${style.border} ${
                isActive ? 'ring-2 ring-offset-1 ring-current shadow-sm scale-[1.02]' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={style.icon} />
                {count > 0 && status === 'pending' && (
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </div>
              <p className={`text-2xl font-bold ${style.text}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{statusLabels[status]}</p>
            </button>
          )
        })}
      </div>

      {/* Status tab bar */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? tabActiveColors[tab.key]
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.key !== 'all' && (
              <span className={`w-2 h-2 rounded-full ${
                activeTab === tab.key ? 'bg-white/50' : tabDotColors[tab.key] || 'bg-gray-300'
              }`} />
            )}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === tab.key
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

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">开始日期</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">结束日期</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">最小金额 ($)</label>
              <input
                type="number"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                placeholder="0"
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">最大金额 ($)</label>
              <input
                type="number"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                placeholder="∞"
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}

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
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id
            const trackingEdit = getTrackingEdit(order)

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Order header - clickable to expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${statusBarColors[order.status] || 'bg-gray-300'}`} />
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-gray-400">{order.customer.firstName} {order.customer.lastName}</span>
                    <span className="text-gray-400">{new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                    {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 py-4">
                      {/* Info grid */}
                      <div className="grid sm:grid-cols-3 gap-4 text-sm mb-5">
                        <div>
                          <p className="text-gray-500 mb-1">客户信息</p>
                          <p className="font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
                          <p className="text-gray-500">{order.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">订单金额</p>
                          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                          {order.discount && <p className="text-xs text-green-600">会员折扣: -${order.discount.toFixed(2)}</p>}
                          {order.pointsUsed && <p className="text-xs text-orange-600">积分抵扣: {order.pointsUsed} 积分</p>}
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">下单时间</p>
                          <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                        </div>
                      </div>

                      {/* Shipping address */}
                      {order.shippingAddress && (order.shippingAddress.address || order.shippingAddress.city) && (
                        <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FiMapPin size={12} /> 收货地址
                          </p>
                          <p className="text-sm text-gray-700">
                            {[order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="mb-5">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <FiPackage size={12} /> 商品明细
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-700">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                              <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tracking section */}
                      <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-1.5">
                          <FiTruck size={14} /> 物流信息
                        </p>
                        <div className="flex flex-wrap gap-2 items-end">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">快递公司</label>
                            <select
                              value={trackingEdit.carrier}
                              onChange={(e) => setTrackingField(order.id, 'carrier', e.target.value)}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                              {carrierOptions.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <label className="text-xs text-gray-500 block mb-1">快递单号</label>
                            <input
                              type="text"
                              value={trackingEdit.trackingNumber}
                              onChange={(e) => setTrackingField(order.id, 'trackingNumber', e.target.value)}
                              placeholder="输入快递单号..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveTracking(order.id)}
                            disabled={!hasTrackingChanges(order)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              hasTrackingChanges(order)
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <FiSave size={14} />
                            保存物流
                          </button>
                        </div>
                        {order.trackingNumber && (
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-xs text-blue-600">
                              已保存: {order.carrier} - {order.trackingNumber}
                            </p>
                            <a
                              href={`https://www.17track.net/zh/track#nums=${order.trackingNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              查看物流
                            </a>
                          </div>
                        )}
                      </div>

                      {/* === Action buttons === */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                        {/* Workflow buttons based on status */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <FiCheck size={14} />
                            确认订单
                          </button>
                        )}

                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleShipOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            <FiTruck size={14} />
                            标记发货
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <FiCheck size={14} />
                            确认收货
                          </button>
                        )}

                        {/* Cancel - available for pending/processing */}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <FiX size={14} />
                            取消订单
                          </button>
                        )}

                        {/* Status dropdown for manual override */}
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{statusLabels[s] || s}</option>
                          ))}
                        </select>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiTrash2 size={14} />
                          删除订单
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        共 {orders.length} 个订单
        {filtered.length !== orders.length && `，已筛选 ${filtered.length} 个`}
      </p>
    </div>
  )
}
