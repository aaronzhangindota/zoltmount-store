import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'
import type { Category } from '../../data/products'

export const AdminCategoriesPage: React.FC = () => {
  const categories = useDataStore((s) => s.categories)
  const products = useDataStore((s) => s.products)
  const addCategory = useAdminStore((s) => s.addCategory)
  const updateCategory = useAdminStore((s) => s.updateCategory)
  const deleteCategory = useAdminStore((s) => s.deleteCategory)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' })

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: '', slug: '', description: '', icon: '📦' })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon })
    setModalOpen(true)
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.slug) return

    setSaving(true)
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: form.name,
          slug: form.slug,
          description: form.description,
          icon: form.icon,
        })
      } else {
        await addCategory({
          id: Date.now().toString(),
          name: form.name,
          slug: form.slug,
          description: form.description,
          icon: form.icon || '📦',
          count: 0,
        })
      }
      setModalOpen(false)
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setSaving(false)
    }
  }

  const getCatProductCount = (slug: string) =>
    products.filter((p) => p.category === slug).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <FiPlus size={16} />
          添加分类
        </button>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = getCatProductCount(cat.slug)
          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {cat.icon}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`确定要删除分类「${cat.name}」吗？`)) {
                        deleteCategory(cat.id)
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cat.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <FiPackage size={14} />
                  <span>{count} 个商品</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? '编辑分类' : '添加分类'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    图标
                  </label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="例如：Fixed Mounts"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="例如：fixed"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="简短描述此分类"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.slug}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {editingId ? '保存修改' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
