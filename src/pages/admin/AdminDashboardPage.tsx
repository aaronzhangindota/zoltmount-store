import React from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiShoppingCart, FiTag, FiDollarSign, FiPlus, FiList, FiGrid, FiAlertTriangle, FiTrendingUp, FiEdit2 } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'

export const AdminDashboardPage: React.FC = () => {
  const products = useAdminStore((s) => s.products)
  const orders = useAdminStore((s) => s.orders)
  const categories = useAdminStore((s) => s.categories)

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

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
      icon: FiTag,
      label: '分类数量',
      value: categories.length,
      desc: '商品分类',
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/25',
      link: '/haijieaaronzhang/categories',
    },
    {
      icon: FiDollarSign,
      label: '总营收',
      value: `$${totalRevenue.toFixed(2)}`,
      desc: '累计收入',
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
      link: '/haijieaaronzhang/orders',
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          to="/haijieaaronzhang/categories"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <FiGrid className="text-purple-600" size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">管理分类</p>
            <p className="text-xs text-gray-400">编辑商品分类</p>
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
