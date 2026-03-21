import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiKey, FiShield, FiAlertTriangle, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi'
import { api } from '../../api/client'

// ─── Provider Templates ───
interface CredentialField {
  key: string
  label: string
  placeholder: string
  required: boolean
  secret: boolean  // Whether to hide by default
}

interface ProviderTemplate {
  provider: string
  name: string
  icon: string
  color: string
  description: string
  fields: CredentialField[]
  docUrl: string
}

const providerTemplates: ProviderTemplate[] = [
  {
    provider: 'stripe',
    name: 'Stripe',
    icon: '💳',
    color: 'bg-indigo-500',
    description: '全球最流行的在线支付网关，支持信用卡、Apple Pay、Google Pay',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', placeholder: 'pk_live_...', required: true, secret: false },
      { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_live_...', required: true, secret: true },
      { key: 'webhookSecret', label: 'Webhook Secret', placeholder: 'whsec_...', required: false, secret: true },
    ],
    docUrl: 'https://dashboard.stripe.com/apikeys',
  },
  {
    provider: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    color: 'bg-blue-500',
    description: '全球知名的电子钱包，买家无需输入卡号即可支付',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'AX...', required: true, secret: false },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'EL...', required: true, secret: true },
    ],
    docUrl: 'https://developer.paypal.com/dashboard/applications',
  },
  {
    provider: 'airwallex',
    name: '空中云汇 Airwallex',
    icon: '🌏',
    color: 'bg-orange-500',
    description: '亚太领先的跨境支付平台，支持信用卡、支付宝、微信支付',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: '', required: true, secret: false },
      { key: 'apiKey', label: 'API Key', placeholder: '', required: true, secret: true },
      { key: 'webhookSecret', label: 'Webhook Secret Key', placeholder: '', required: false, secret: true },
    ],
    docUrl: 'https://www.airwallex.com/docs',
  },
  {
    provider: 'alipay_global',
    name: '支付宝 (Alipay Global)',
    icon: '💰',
    color: 'bg-sky-500',
    description: '支持海外用户使用支付宝进行跨境支付',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: '', required: true, secret: false },
      { key: 'privateKey', label: 'Private Key', placeholder: '', required: true, secret: true },
      { key: 'alipayPublicKey', label: 'Alipay Public Key', placeholder: '', required: false, secret: true },
    ],
    docUrl: 'https://global.alipay.com',
  },
  {
    provider: 'custom',
    name: '自定义网关',
    icon: '🔧',
    color: 'bg-gray-500',
    description: '手动配置其他支付网关的密钥',
    fields: [],
    docUrl: '',
  },
]

interface PaymentGateway {
  id: string
  provider: string
  displayName: string
  enabled: boolean
  testMode: boolean
  credentials: Record<string, string>
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface FormState {
  provider: string
  displayName: string
  enabled: boolean
  testMode: boolean
  credentials: Record<string, string>
  // For custom: dynamic fields
  customFields: { key: string; value: string }[]
}

const emptyForm: FormState = {
  provider: '',
  displayName: '',
  enabled: false,
  testMode: true,
  credentials: {},
  customFields: [{ key: '', value: '' }],
}

export const AdminPaymentGatewaysPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [step, setStep] = useState<'select' | 'config'>('select')
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const fetchGateways = async () => {
    try {
      const data = await api.getPaymentGateways()
      setGateways(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchGateways() }, [])

  const getTemplate = (provider: string) =>
    providerTemplates.find((t) => t.provider === provider)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setStep('select')
    setShowSecrets({})
    setModalOpen(true)
  }

  const selectProvider = (provider: string) => {
    const tpl = getTemplate(provider)
    const creds: Record<string, string> = {}
    if (tpl) {
      tpl.fields.forEach((f) => { creds[f.key] = '' })
    }
    setForm({
      ...emptyForm,
      provider,
      displayName: tpl?.name || '',
      credentials: creds,
    })
    setStep('config')
  }

  const openEdit = (gw: PaymentGateway) => {
    setEditingId(gw.id)
    const tpl = getTemplate(gw.provider)
    // Build custom fields for custom provider
    const customFields = gw.provider === 'custom'
      ? Object.entries(gw.credentials).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
    if (customFields.length === 0) customFields.push({ key: '', value: '' })

    setForm({
      provider: gw.provider,
      displayName: gw.displayName,
      enabled: gw.enabled,
      testMode: gw.testMode,
      credentials: { ...gw.credentials },
      customFields,
    })
    setStep('config')
    setShowSecrets({})
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.displayName.trim()) return
    setSaving(true)

    // Build credentials
    let credentials = { ...form.credentials }
    if (form.provider === 'custom') {
      credentials = {}
      form.customFields.forEach((f) => {
        if (f.key.trim()) credentials[f.key.trim()] = f.value
      })
    }

    try {
      if (editingId) {
        await api.updatePaymentGateway(editingId, {
          displayName: form.displayName,
          enabled: form.enabled,
          testMode: form.testMode,
          credentials,
        })
      } else {
        await api.createPaymentGateway({
          provider: form.provider,
          displayName: form.displayName,
          enabled: form.enabled,
          testMode: form.testMode,
          credentials,
        })
      }
      await fetchGateways()
      setModalOpen(false)
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deletePaymentGateway(id)
      await fetchGateways()
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
    setDeleteConfirmId(null)
  }

  const handleToggleEnabled = async (gw: PaymentGateway) => {
    try {
      await api.updatePaymentGateway(gw.id, { enabled: !gw.enabled })
      await fetchGateways()
    } catch { /* ignore */ }
  }

  const addCustomField = () => {
    setForm((f) => ({
      ...f,
      customFields: [...f.customFields, { key: '', value: '' }],
    }))
  }

  const removeCustomField = (index: number) => {
    setForm((f) => ({
      ...f,
      customFields: f.customFields.filter((_, i) => i !== index),
    }))
  }

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    setForm((f) => ({
      ...f,
      customFields: f.customFields.map((cf, i) => i === index ? { ...cf, [field]: value } : cf),
    }))
  }

  const toggleSecret = (key: string) => {
    setShowSecrets((s) => ({ ...s, [key]: !s[key] }))
  }

  const sorted = [...gateways].sort((a, b) => a.sortOrder - b.sortOrder)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">收款网关</h1>
          <p className="text-sm text-gray-500 mt-1">配置支付服务商的 API 密钥，启用后即可接收真实付款</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FiPlus size={16} /> 添加网关
        </button>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <FiShield size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">API 密钥安全说明</p>
          <p className="text-xs text-amber-600 mt-1">
            Secret Key 等敏感信息加密存储，页面仅显示末尾 4 位。编辑时如需保留原密钥请勿修改对应字段。
            建议先使用测试模式 (Test Mode) 验证流程正确后再切换到正式模式。
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiKey size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">尚未配置收款网关</h3>
          <p className="text-sm text-gray-500 mb-6">
            添加 Stripe、PayPal 或空中云汇等支付网关的 API 密钥后，即可接收真实付款
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiPlus size={16} /> 添加网关
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((gw) => {
            const tpl = getTemplate(gw.provider)
            const hasAnyKey = Object.values(gw.credentials).some((v) => v && v !== '')
            return (
              <div
                key={gw.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  gw.enabled ? 'border-gray-200' : 'border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Provider icon */}
                  <div className={`w-11 h-11 ${tpl?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                    {tpl?.icon || '🔧'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate">{gw.displayName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        gw.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {gw.enabled ? '已启用' : '已停用'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        gw.testMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {gw.testMode ? '测试模式' : '正式模式'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {tpl?.description || gw.provider}
                    </p>
                    {/* Key status */}
                    <div className="flex items-center gap-3 mt-2">
                      {hasAnyKey ? (
                        <span className="flex items-center gap-1 text-[11px] text-green-600">
                          <FiCheck size={11} /> 密钥已配置
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-red-500">
                          <FiAlertTriangle size={11} /> 未配置密钥
                        </span>
                      )}
                      {Object.entries(gw.credentials).filter(([, v]) => v).map(([key, val]) => (
                        <span key={key} className="text-[11px] text-gray-400 font-mono">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleEnabled(gw)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gw.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gw.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <button
                      onClick={() => openEdit(gw)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(gw.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        收款网关密钥仅超级管理员可查看和编辑。切换到正式模式前，请确保已完成测试验证。
      </p>

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-6">
              删除后该网关的所有配置和密钥将被清除，确定删除吗？
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
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? '编辑收款网关' : step === 'select' ? '选择支付服务商' : '配置收款网关'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={18} />
              </button>
            </div>

            {/* Step 1: Select provider */}
            {step === 'select' && (
              <div className="space-y-3">
                {providerTemplates.map((tpl) => (
                  <button
                    key={tpl.provider}
                    onClick={() => selectProvider(tpl.provider)}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all text-left"
                  >
                    <div className={`w-11 h-11 ${tpl.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                      {tpl.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{tpl.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{tpl.description}</p>
                    </div>
                    <FiPlus size={18} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 'config' && (
              <div className="space-y-5">
                {/* Provider badge */}
                {(() => {
                  const tpl = getTemplate(form.provider)
                  return tpl ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-9 h-9 ${tpl.color} rounded-lg flex items-center justify-center text-sm`}>
                        {tpl.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                        {!editingId && (
                          <button
                            onClick={() => setStep('select')}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            更换服务商
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Display name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="例如：Stripe 信用卡收款"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* Credential fields (from template) */}
                {form.provider !== 'custom' && (() => {
                  const tpl = getTemplate(form.provider)
                  if (!tpl) return null
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <FiKey size={14} /> API 密钥
                        </label>
                        {tpl.docUrl && (
                          <a
                            href={tpl.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            获取密钥 →
                          </a>
                        )}
                      </div>
                      <div className="space-y-3">
                        {tpl.fields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs text-gray-500 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-0.5">*</span>}
                            </label>
                            <div className="relative">
                              <input
                                type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                                value={form.credentials[field.key] || ''}
                                onChange={(e) => setForm({
                                  ...form,
                                  credentials: { ...form.credentials, [field.key]: e.target.value },
                                })}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                              />
                              {field.secret && (
                                <button
                                  type="button"
                                  onClick={() => toggleSecret(field.key)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                >
                                  {showSecrets[field.key] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Custom fields */}
                {form.provider === 'custom' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <FiKey size={14} /> 自定义密钥
                      </label>
                      <button
                        type="button"
                        onClick={addCustomField}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FiPlus size={12} /> 添加字段
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.customFields.map((cf, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={cf.key}
                            onChange={(e) => updateCustomField(i, 'key', e.target.value)}
                            placeholder="字段名"
                            className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <input
                            type="text"
                            value={cf.value}
                            onChange={(e) => updateCustomField(i, 'value', e.target.value)}
                            placeholder="值"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          {form.customFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCustomField(i)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <FiX size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">测试模式</p>
                      <p className="text-xs text-gray-400">开启后使用沙盒/测试环境，不会产生真实扣款</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, testMode: !form.testMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.testMode ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.testMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">启用此网关</p>
                      <p className="text-xs text-gray-400">启用后前台结账将使用此网关处理付款</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, enabled: !form.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Warning for live mode */}
                {!form.testMode && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <FiAlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">
                      正式模式将产生真实交易扣款，请确认密钥正确且已在服务商后台完成相关配置。
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.displayName.trim()}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {saving ? '保存中...' : editingId ? '保存' : '添加'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
