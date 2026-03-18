import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTruck } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'
import type { ShippingZone } from '../../store/adminStore'

const commonCountries: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'RO', name: 'Romania' },
  { code: 'HU', name: 'Hungary' },
  { code: 'GR', name: 'Greece' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'BY', name: 'Belarus' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IN', name: 'India' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'UAE' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'ZA', name: 'South Africa' },
]

const emptyForm: Omit<ShippingZone, 'id'> = {
  name: '',
  countries: [],
  initialPrice: 0,
  incrementalPrice: 0,
  fuelSurchargeRate: 0,
  sortOrder: 0,
}

export const AdminShippingPage: React.FC = () => {
  const shippingZones = useDataStore((s) => s.shippingZones)
  const { addShippingZone, updateShippingZone, deleteShippingZone } = useAdminStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sortOrder: shippingZones.length })
    setModalOpen(true)
  }

  const openEdit = (zone: ShippingZone) => {
    setEditingId(zone.id)
    const { id: _, ...rest } = zone
    setForm(rest)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      if (editingId) {
        await updateShippingZone(editingId, form)
      } else {
        await addShippingZone({ ...form, id: `sz-${Date.now()}` })
      }
      setModalOpen(false)
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteShippingZone(id)
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
    setDeleteConfirmId(null)
  }

  const toggleCountry = (code: string) => {
    setForm((f) => ({
      ...f,
      countries: f.countries.includes(code)
        ? f.countries.filter((c) => c !== code)
        : [...f.countries, code],
    }))
  }

  const sorted = [...shippingZones].sort((a, b) => a.sortOrder - b.sortOrder)

  const getCountryName = (code: string) =>
    commonCountries.find((c) => c.code === code)?.name || code

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">物流运费</h1>
          <p className="text-sm text-gray-500 mt-1">按国家分组设置运费，支持首重/续重计价和燃油附加费</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FiPlus size={16} /> 添加分组
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTruck size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂未设置物流分组</h3>
          <p className="text-sm text-gray-500 mb-6">添加物流分组来按国家和地区设置不同的运费</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiPlus size={16} /> 添加分组
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <span className="text-xs text-gray-500">排序: {zone.sortOrder}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {zone.countries.slice(0, 8).map((code) => (
                  <span key={code} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    {code}
                  </span>
                ))}
                {zone.countries.length > 8 && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                    +{zone.countries.length - 8}
                  </span>
                )}
              </div>

              <div className="space-y-1 mb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>首重价格 (1kg)</span>
                  <span className="font-medium">${zone.initialPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>续重单价 (/kg)</span>
                  <span className="font-medium">${zone.incrementalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>燃油附加费率</span>
                  <span className="font-medium">{(zone.fuelSurchargeRate * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(zone)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <FiEdit2 size={14} /> 编辑
                </button>
                <button
                  onClick={() => setDeleteConfirmId(zone.id)}
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
              删除后该分组下的国家将不再有专属运费规则，确定删除吗？
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
                {editingId ? '编辑物流分组' : '添加物流分组'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分组名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="例如：核心市场"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择国家（已选 {form.countries.length} 个）
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {commonCountries.map((c) => (
                      <label
                        key={c.code}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.countries.includes(c.code)}
                          onChange={() => toggleCountry(c.code)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{c.code} - {c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">首重价格 ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.initialPrice || ''}
                    onChange={(e) => setForm({ ...form, initialPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="1kg 首重价格"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">续重单价 ($/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.incrementalPrice || ''}
                    onChange={(e) => setForm({ ...form, incrementalPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="每 kg 续重价格"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">燃油附加费率 (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={form.fuelSurchargeRate ? (form.fuelSurchargeRate * 100).toFixed(0) : ''}
                    onChange={(e) => setForm({ ...form, fuelSurchargeRate: (parseFloat(e.target.value) || 0) / 100 })}
                    placeholder="例如：15 即 15%"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.initialPrice > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">运费预览</p>
                  <p>1kg: ${(form.initialPrice * (1 + form.fuelSurchargeRate)).toFixed(2)}</p>
                  <p>3kg: ${((form.initialPrice + 2 * form.incrementalPrice) * (1 + form.fuelSurchargeRate)).toFixed(2)}</p>
                  <p>5kg: ${((form.initialPrice + 4 * form.incrementalPrice) * (1 + form.fuelSurchargeRate)).toFixed(2)}</p>
                </div>
              )}
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
