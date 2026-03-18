import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCreditCard } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'
import type { PaymentMethod } from '../../store/adminStore'

const typeLabels: Record<PaymentMethod['type'], string> = {
  credit_card: '信用卡 / 借记卡',
  paypal: 'PayPal',
  alipay: '支付宝',
  wechat: '微信支付',
  bank_transfer: '银行转账',
  other: '其他',
}

const typeOptions: { value: PaymentMethod['type']; label: string }[] = [
  { value: 'credit_card', label: '信用卡 / 借记卡' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信支付' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'other', label: '其他' },
]

const cardOptions = ['Visa', 'MasterCard', 'Amex', 'Discover', 'JCB', 'UnionPay']

const emptyForm: Omit<PaymentMethod, 'id'> = {
  name: '',
  type: 'credit_card',
  enabled: true,
  icon: '💳',
  supportedCards: [],
  sortOrder: 0,
}

export const AdminPaymentPage: React.FC = () => {
  const paymentMethods = useDataStore((s) => s.paymentMethods)
  const { addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useAdminStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: paymentMethods.length })
    setModalOpen(true)
  }

  const openEdit = (method: PaymentMethod) => {
    setEditingId(method.id)
    const { id: _, ...rest } = method
    setForm(rest)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editingId) {
        await updatePaymentMethod(editingId, form)
      } else {
        await addPaymentMethod({ ...form, id: `pm-${Date.now()}` })
      }
      setModalOpen(false)
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePaymentMethod(id)
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
    setDeleteConfirmId(null)
  }

  const toggleEnabled = async (method: PaymentMethod) => {
    await updatePaymentMethod(method.id, { enabled: !method.enabled })
  }

  const toggleCard = (card: string) => {
    setForm((f) => ({
      ...f,
      supportedCards: f.supportedCards.includes(card)
        ? f.supportedCards.filter((c) => c !== card)
        : [...f.supportedCards, card],
    }))
  }

  const sorted = [...paymentMethods].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">支付设置</h1>
          <p className="text-sm text-gray-500 mt-1">设置商城接受的客户付款方式，启用后将在前台结账页展示</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FiPlus size={16} /> 添加支付方式
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCreditCard size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂未设置支付方式</h3>
          <p className="text-sm text-gray-500 mb-6">添加您希望接受的付款方式，客户将在结账时看到这些选项</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiPlus size={16} /> 添加支付方式
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                method.enabled ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <span className="text-xs text-gray-500">{typeLabels[method.type]}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleEnabled(method)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    method.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    method.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {method.enabled ? '接受中' : '已关闭'}
                </span>
                {method.type === 'credit_card' && method.supportedCards.length > 0 &&
                  method.supportedCards.map((card) => (
                    <span key={card} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                      {card}
                    </span>
                  ))
                }
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(method)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <FiEdit2 size={14} /> 编辑
                </button>
                <button
                  onClick={() => setDeleteConfirmId(method.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-6">
              删除后客户将无法使用该支付方式结账，确定删除吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? '编辑支付方式' : '添加支付方式'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支付方式名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="例如：信用卡 / 借记卡"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PaymentMethod['type'] })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标 (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Supported cards (only for credit_card) */}
              {form.type === 'credit_card' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">接受的卡种</label>
                  <div className="flex flex-wrap gap-2">
                    {cardOptions.map((card) => (
                      <button
                        key={card}
                        type="button"
                        onClick={() => toggleCard(card)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.supportedCards.includes(card)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {card}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enabled toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">接受此支付方式</p>
                  <p className="text-xs text-gray-400">关闭后客户在结账时将看不到此选项</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enabled: !form.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingId ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
