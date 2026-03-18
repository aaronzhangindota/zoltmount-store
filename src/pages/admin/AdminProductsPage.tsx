import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'

const categoryLabels: Record<string, string> = {
  fixed: '固定支架',
  tilt: '倾斜支架',
  'full-motion': '全动态支架',
  ceiling: '吊顶支架',
  desk: '桌面支架',
  stand: '电视架',
  cart: '移动推车',
  accessory: '配件',
}

const ITEMS_PER_PAGE = 20

export const AdminProductsPage: React.FC = () => {
  const products = useDataStore((s) => s.products)
  const deleteProduct = useAdminStore((s) => s.deleteProduct)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = products

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }

    // Stock filter
    if (stockFilter === 'inStock') {
      result = result.filter((p) => p.inStock)
    } else if (stockFilter === 'outOfStock') {
      result = result.filter((p) => !p.inStock)
    }

    return result
  }, [products, search, categoryFilter, stockFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset page when filters change
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleCategory = (v: string) => { setCategoryFilter(v); setPage(1) }
  const handleStock = (v: 'all' | 'inStock' | 'outOfStock') => { setStockFilter(v); setPage(1) }

  const allPageSelected = paged.length > 0 && paged.every((p) => selected.has(p.id))
  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        paged.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBatchDelete = () => {
    if (selected.size === 0) return
    if (window.confirm(`确定要删除选中的 ${selected.size} 个商品吗？`)) {
      selected.forEach((id) => deleteProduct(id))
      setSelected(new Set())
    }
  }

  // Unique categories from products
  const categorySlugs = Array.from(new Set(products.map((p) => p.category)))

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          to="/haijieaaronzhang/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <FiPlus size={16} />
          添加商品
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索商品名称或ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-1">
          <FiFilter size={14} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">全部分类</option>
            {categorySlugs.map((slug) => (
              <option key={slug} value={slug}>
                {categoryLabels[slug] || slug}
              </option>
            ))}
          </select>
        </div>

        <select
          value={stockFilter}
          onChange={(e) => handleStock(e.target.value as 'all' | 'inStock' | 'outOfStock')}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">全部库存</option>
          <option value="inStock">有货</option>
          <option value="outOfStock">缺货</option>
        </select>

        {selected.size > 0 && (
          <button
            onClick={handleBatchDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-sm"
          >
            <FiTrash2 size={14} />
            删除选中 ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-5 py-3 font-medium">商品</th>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">分类</th>
              <th className="px-5 py-3 font-medium">价格</th>
              <th className="px-5 py-3 font-medium">标签</th>
              <th className="px-5 py-3 font-medium">库存</th>
              <th className="px-5 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${selected.has(p.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden group relative">
                      {p.images[0] ? (
                        <>
                          <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                          {/* Hover enlarged preview */}
                          <div className="absolute hidden group-hover:block left-full ml-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                            <img src={p.images[0]} alt="" className="w-40 h-40 object-contain" />
                          </div>
                        </>
                      ) : (
                        <span>📺</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.id}</td>
                <td className="px-5 py-3 text-gray-600">{categoryLabels[p.category] || p.category}</td>
                <td className="px-5 py-3">
                  <span className="font-semibold text-gray-900">${p.price.toFixed(2)}</span>
                  {p.originalPrice && (
                    <span className="text-gray-400 line-through ml-1 text-xs">${p.originalPrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {p.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {p.badge}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium ${p.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {p.inStock ? '有货' : '缺货'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/haijieaaronzhang/products/edit/${p.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <FiEdit2 size={15} />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(`确定要删除「${p.name}」吗？`)) {
                          deleteProduct(p.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div className="p-10 text-center text-gray-400">没有找到匹配的商品</div>
        )}
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-400">
          共 {products.length} 个商品
          {filtered.length !== products.length && `，已筛选 ${filtered.length} 个`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
