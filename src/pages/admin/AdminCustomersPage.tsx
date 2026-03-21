import React, { useEffect, useState, useMemo } from 'react'
import { FiUsers, FiSearch, FiMail, FiPhone, FiMapPin, FiStar, FiDollarSign, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi'
import { api } from '../../api/client'
import type { ApiUser } from '../../api/client'

export const AdminCustomersPage: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getAdminUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    )
  }, [users, search])

  const totalPoints = users.reduce((s, u) => s + u.points, 0)
  const totalSpent = users.reduce((s, u) => s + u.totalSpent, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">注册用户</p>
              <p className="text-xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiStar className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">总积分</p>
              <p className="text-xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">客户总消费</p>
              <p className="text-xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索客户姓名或邮箱..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-4">{error}</div>
      )}

      {loading && users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <FiRefreshCw size={28} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm">加载中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <FiUsers size={28} className="mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-500">{search ? '未找到匹配客户' : '暂无注册客户'}</p>
          <p className="text-sm mt-1">前台用户注册后将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => {
            const isExpanded = expandedId === user.id
            return (
              <div key={user.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="font-medium text-gray-900">${user.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">消费金额</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="font-medium text-orange-600">{user.points}</p>
                      <p className="text-xs text-gray-400">积分</p>
                    </div>
                    {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">邮箱</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <FiMail size={14} className="text-gray-400" />
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">电话</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          <FiPhone size={14} className="text-gray-400" />
                          {user.phone || '未填写'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">注册时间</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.memberSince).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">消费/积分</p>
                        <p className="font-medium text-gray-900">
                          ${user.totalSpent.toFixed(2)} / {user.points} 积分
                        </p>
                      </div>
                    </div>

                    {/* Addresses */}
                    {user.addresses.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <FiMapPin size={12} /> 收货地址 ({user.addresses.length})
                        </p>
                        <div className="space-y-2">
                          {user.addresses.map((addr) => (
                            <div key={addr.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 flex items-center gap-2">
                              {addr.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">默认</span>
                              )}
                              <span>{addr.label && `[${addr.label}] `}{addr.address}, {addr.city}, {addr.state} {addr.zip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        共 {users.length} 位客户
        {filtered.length !== users.length && `，已筛选 ${filtered.length} 位`}
      </p>
    </div>
  )
}
