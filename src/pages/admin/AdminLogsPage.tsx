import React, { useEffect, useState } from 'react'
import { FiFileText, FiRefreshCw } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import type { AdminLog } from '../../api/client'

const resourceLabels: Record<string, string> = {
  products: '商品',
  categories: '分类',
  orders: '订单',
  'payment-methods': '支付',
  accounts: '账号',
  seed: '初始化',
}

const resourceColors: Record<string, string> = {
  products: 'bg-blue-100 text-blue-700',
  categories: 'bg-purple-100 text-purple-700',
  orders: 'bg-emerald-100 text-emerald-700',
  'payment-methods': 'bg-orange-100 text-orange-700',
  accounts: 'bg-pink-100 text-pink-700',
  seed: 'bg-yellow-100 text-yellow-700',
}

export const AdminLogsPage: React.FC = () => {
  const getLogs = useAdminStore((s) => s.getLogs)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await getLogs()
      setLogs(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.resource === filter)

  const resourceTypes = [...new Set(logs.map((l) => l.resource))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">操作日志</h1>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部 ({logs.length})
        </button>
        {resourceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === type ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {resourceLabels[type] || type} ({logs.filter((l) => l.resource === type).length})
          </button>
        ))}
      </div>

      {/* Logs list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FiFileText size={16} className="text-blue-500" />
          <h2 className="font-bold text-gray-900">日志记录</h2>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{filteredLogs.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FiFileText size={32} className="mx-auto mb-3" />
            <p>暂无操作日志</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-4 hover:bg-gray-50">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${resourceColors[log.resource] || 'bg-gray-100 text-gray-600'}`}>
                    {resourceLabels[log.resource] || log.resource}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.accountName} · {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
