import React, { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiKey, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import type { AdminAccount } from '../../api/client'

export const AdminAccountsPage: React.FC = () => {
  const { getAccounts, createAccount, updateAccount, deleteAccount } = useAdminStore()
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', key: '', role: 'staff' as 'super_admin' | 'staff' })
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (err) {
      setError('加载账号列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAccounts() }, [])

  const resetForm = () => {
    setForm({ name: '', key: '', role: 'staff' })
    setEditingId(null)
    setShowForm(false)
    setShowKey(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        const update: Partial<{ name: string; key: string; role: 'super_admin' | 'staff' }> = { name: form.name, role: form.role }
        if (form.key) update.key = form.key
        await updateAccount(editingId, update)
      } else {
        if (!form.key) { setError('请输入密钥'); return }
        await createAccount(form)
      }
      resetForm()
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const handleEdit = (account: AdminAccount) => {
    setForm({ name: account.name, key: '', role: account.role })
    setEditingId(account.id)
    setShowForm(true)
  }

  const handleDelete = async (account: AdminAccount) => {
    if (!window.confirm(`确定删除账号「${account.name}」？`)) return
    try {
      await deleteAccount(account.id)
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const roleLabel = (role: string) => role === 'super_admin' ? '超级管理员' : '员工'
  const roleBadgeClass = (role: string) =>
    role === 'super_admin'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <FiPlus size={16} />
          添加账号
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editingId ? '编辑账号' : '添加账号'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="例如：客服小王"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密钥 {editingId && <span className="text-gray-400 font-normal">(留空不修改)</span>}
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="登录密钥"
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'super_admin' | 'staff' })}
                className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="staff">员工</option>
                <option value="super_admin">超级管理员</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {editingId ? '保存' : '创建'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FiUsers size={16} className="text-blue-500" />
          <h2 className="font-bold text-gray-900">管理员列表</h2>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{accounts.length}</span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FiUsers size={32} className="mx-auto mb-3" />
            <p>暂无管理员账号</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {accounts.map((account) => (
              <div key={account.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                    {account.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-400">
                      创建于 {new Date(account.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(account.role)}`}>
                    {roleLabel(account.role)}
                  </span>
                  {account.isProtected && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      初始账号
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  {!account.isProtected && (
                    <button
                      onClick={() => handleDelete(account)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
