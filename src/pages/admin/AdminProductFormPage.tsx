import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiX, FiPlus, FiTrash2, FiAlertCircle, FiCheck, FiImage } from 'react-icons/fi'
import { useAdminStore } from '../../store/adminStore'
import type { Product } from '../../data/products'

const categoryOptions = [
  { value: 'fixed', label: '固定支架', icon: '📐' },
  { value: 'tilt', label: '倾斜支架', icon: '📺' },
  { value: 'full-motion', label: '全动态支架', icon: '🔄' },
  { value: 'ceiling', label: '吊顶支架', icon: '🏗️' },
  { value: 'desk', label: '桌面支架', icon: '🖥️' },
  { value: 'stand', label: '电视架', icon: '🗄️' },
  { value: 'cart', label: '移动推车', icon: '🛒' },
  { value: 'accessory', label: '配件', icon: '🔧' },
]

const badgeOptions = [
  { value: '', label: '无' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'New', label: 'New' },
  { value: 'Sale', label: 'Sale' },
]

const tvSizes = ['14"', '17"', '19"', '22"', '24"', '26"', '27"', '32"', '37"', '40"', '42"', '43"', '49"', '50"', '55"', '60"', '65"', '70"', '75"', '80"', '82"', '85"', '86"', '90"', '100"']
const vesaOptions = ['75x75', '100x100', '200x100', '200x200', '300x300', '400x200', '400x400', '600x400']
const materialOptions = ['Heavy-duty Steel', 'Aluminum Alloy', 'Cold-rolled Steel', 'Carbon Steel']
const colorOptions = ['Black', 'White', 'Silver', 'Grey']
const warrantyOptions = ['1 Year', '3 Years', '5 Years', '10 Years', 'Lifetime']

const steps = [
  { id: 0, label: '基本信息', desc: '名称、分类、描述' },
  { id: 1, label: '价格库存', desc: '售价、原价、库存' },
  { id: 2, label: '规格参数', desc: 'VESA、尺寸、承重' },
  { id: 3, label: '图片媒体', desc: '商品图片管理' },
]

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const products = useAdminStore((s) => s.products)
  const addProduct = useAdminStore((s) => s.addProduct)
  const updateProduct = useAdminStore((s) => s.updateProduct)
  const isEdit = !!id

  const existing = isEdit ? products.find((p) => p.id === id) : undefined

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  // Basic info
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<Product['category']>('fixed')
  const [badge, setBadge] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('')

  // Pricing
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [stockCount, setStockCount] = useState('100')
  const [rating, setRating] = useState('4.7')
  const [reviewCount, setReviewCount] = useState('0')

  // Specs
  const [tvSizeMin, setTvSizeMin] = useState('14"')
  const [tvSizeMax, setTvSizeMax] = useState('42"')
  const [selectedVesa, setSelectedVesa] = useState<string[]>([])
  const [maxWeight, setMaxWeight] = useState('')
  const [material, setMaterial] = useState('')
  const [color, setColor] = useState('Black')
  const [warranty, setWarranty] = useState('')
  const [customSpecs, setCustomSpecs] = useState<{ key: string; value: string }[]>([])

  // Images
  const [images, setImages] = useState<string[]>([''])
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setSlug(existing.slug)
      setCategory(existing.category)
      setBadge(existing.badge || '')
      setDescription(existing.description)
      setFeatures(existing.features.join('\n'))
      setPrice(existing.price.toString())
      setOriginalPrice(existing.originalPrice?.toString() || '')
      setStockCount(existing.inStock ? '100' : '0')
      setRating(existing.rating.toString())
      setReviewCount(existing.reviewCount.toString())
      setImages(existing.images.length > 0 ? existing.images : [''])

      // Parse specs into structured fields
      const specs = existing.specs || {}
      if (specs['TV Size']) {
        const match = specs['TV Size'].match(/(\d+)"?\s*[-–]\s*(\d+)"?/)
        if (match) {
          setTvSizeMin(`${match[1]}"`)
          setTvSizeMax(`${match[2]}"`)
        }
      }
      if (specs['VESA Pattern']) {
        const vesaStr = specs['VESA Pattern']
        const matched = vesaOptions.filter((v) => vesaStr.includes(v.replace('x', 'x')))
        // Also try "Up to XXXxXXX" pattern
        if (matched.length === 0) {
          const upToMatch = vesaStr.match(/(\d+)\s*x\s*(\d+)/)
          if (upToMatch) {
            const maxVesa = `${upToMatch[1]}x${upToMatch[2]}`
            const idx = vesaOptions.indexOf(maxVesa)
            if (idx >= 0) setSelectedVesa(vesaOptions.slice(0, idx + 1))
          }
        } else {
          setSelectedVesa(matched)
        }
      }
      if (specs['Max Weight'] || specs['Weight Capacity']) {
        const w = specs['Max Weight'] || specs['Weight Capacity'] || ''
        const wMatch = w.match(/(\d+)/)
        if (wMatch) setMaxWeight(wMatch[1])
      }
      if (specs['Material']) setMaterial(specs['Material'])
      if (specs['Color']) setColor(specs['Color'])
      if (specs['Warranty']) setWarranty(specs['Warranty'])

      // Remaining specs as custom
      const knownKeys = ['TV Size', 'VESA Pattern', 'Max Weight', 'Weight Capacity', 'Material', 'Color', 'Warranty']
      const custom = Object.entries(specs)
        .filter(([k]) => !knownKeys.includes(k))
        .map(([key, value]) => ({ key, value }))
      if (custom.length > 0) setCustomSpecs(custom)
    }
  }, [existing])

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && name && !slug) {
      // Don't auto-set if user has manually typed a slug
    }
  }, [name])

  const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const validate = (): string[] => {
    const errs: string[] = []
    if (!name.trim()) errs.push('商品名称不能为空')
    if (!price || parseFloat(price) <= 0) errs.push('售价必须大于 0')
    if (!description.trim()) errs.push('商品描述不能为空')
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      setStep(0) // Jump to first step with errors
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Build specs
    const specs: Record<string, string> = {}
    specs['TV Size'] = `${tvSizeMin}-${tvSizeMax}`
    if (selectedVesa.length > 0) specs['VESA Pattern'] = selectedVesa.join(', ')
    if (maxWeight) specs['Max Weight'] = `${maxWeight} lbs`
    if (material) specs['Material'] = material
    if (color) specs['Color'] = color
    if (warranty) specs['Warranty'] = warranty
    customSpecs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specs[s.key.trim()] = s.value.trim()
      }
    })

    const validImages = images.map((s) => s.trim()).filter(Boolean)

    const product: Product = {
      id: isEdit ? id! : `mp-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || autoSlug,
      category,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      rating: parseFloat(rating) || 4.5,
      reviewCount: parseInt(reviewCount) || 0,
      images: validImages,
      description: description.trim(),
      features: features.split('\n').map((s) => s.trim()).filter(Boolean),
      specs,
      badge: (badge || undefined) as Product['badge'],
      inStock: parseInt(stockCount) > 0,
    }

    if (isEdit) {
      updateProduct(id!, product)
    } else {
      addProduct(product)
    }

    navigate('/admin/products')
  }

  const toggleVesa = (v: string) => {
    setSelectedVesa((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  const discountPercent =
    originalPrice && price && parseFloat(originalPrice) > parseFloat(price)
      ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
      : 0

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <button
        onClick={() => navigate('/admin/products')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> 返回商品列表
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '编辑商品' : '添加商品'}
      </h1>

      {/* Error banner */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">请修正以下问题：</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Step indicator - left sidebar */}
        <div className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  step === s.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s.id
                        ? 'bg-white/20 text-white'
                        : step > s.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > s.id ? <FiCheck size={14} /> : s.id + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step === s.id ? 'text-white' : 'text-gray-900'}`}>
                      {s.label}
                    </p>
                    <p className={`text-xs ${step === s.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile step tabs */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex gap-1 overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                step === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex-1 min-w-0">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">基本信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors([]) }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.includes('商品名称不能为空') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="例如：HT-101 Slim Fixed Mount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="自动生成"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {(slug || autoSlug) && (
                  <p className="mt-1 text-xs text-gray-400">
                    预览: /products/<span className="text-blue-500">{slug || autoSlug}</span>
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product['category'])}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.icon} {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {badgeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors([]) }}
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none ${
                    errors.includes('商品描述不能为空') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="详细描述商品特性和卖点..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品特点（每行一个）
                </label>
                <div className="relative">
                  <textarea
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    rows={5}
                    placeholder={"1. Ultra-slim wall profile\n2. Heavy-duty steel construction\n3. Built-in bubble level\n4. All mounting hardware included"}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  已填写 {features.split('\n').filter((s) => s.trim()).length} 条特点
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Pricing & Stock */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">价格与库存</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    售价 ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setErrors([]) }}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      errors.some((e) => e.includes('售价')) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原价 ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="不填则无划线价"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  {discountPercent > 0 && (
                    <p className="mt-1 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        省 {discountPercent}%
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  库存数量
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value)}
                  className="w-full sm:w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {parseInt(stockCount) > 0 ? (
                    <span className="text-green-600">有货</span>
                  ) : (
                    <span className="text-red-500">缺货（库存为 0）</span>
                  )}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">评分信息</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">评分 (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">评论数</label>
                    <input
                      type="number"
                      min="0"
                      value={reviewCount}
                      onChange={(e) => setReviewCount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specs */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">规格参数</h2>

              {/* TV Size Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TV 尺寸范围</label>
                <div className="flex items-center gap-3">
                  <select
                    value={tvSizeMin}
                    onChange={(e) => setTvSizeMin(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {tvSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 font-medium">至</span>
                  <select
                    value={tvSizeMax}
                    onChange={(e) => setTvSizeMax(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {tvSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* VESA Compatibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VESA 兼容</label>
                <div className="flex flex-wrap gap-2">
                  {vesaOptions.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleVesa(v)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedVesa.includes(v)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {selectedVesa.includes(v) && <FiCheck size={12} className="inline mr-1" />}
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大承重 (lbs)</label>
                <input
                  type="number"
                  min="0"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  placeholder="例如：99"
                  className="w-full sm:w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Material / Color / Warranty */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">材质</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">请选择</option>
                    {materialOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {colorOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">质保</label>
                  <select
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">请选择</option>
                    {warrantyOptions.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom specs editor */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">自定义规格</h3>
                  <button
                    type="button"
                    onClick={() => setCustomSpecs([...customSpecs, { key: '', value: '' }])}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FiPlus size={12} /> 添加规格
                  </button>
                </div>
                {customSpecs.length === 0 && (
                  <p className="text-sm text-gray-400 py-3 text-center">暂无自定义规格，点击上方按钮添加</p>
                )}
                <div className="space-y-2">
                  {customSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => {
                          const next = [...customSpecs]
                          next[i] = { ...next[i], key: e.target.value }
                          setCustomSpecs(next)
                        }}
                        placeholder="规格名称"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const next = [...customSpecs]
                          next[i] = { ...next[i], value: e.target.value }
                          setCustomSpecs(next)
                        }}
                        placeholder="规格值"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomSpecs(customSpecs.filter((_, j) => j !== i))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">图片媒体</h2>
                <button
                  type="button"
                  onClick={() => setImages([...images, ''])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FiPlus size={12} /> 添加图片
                </button>
              </div>

              <div className="space-y-3">
                {images.map((url, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                      {url.trim() && !imgErrors.has(i) ? (
                        <img
                          src={url.trim()}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={() => setImgErrors((prev) => new Set([...prev, i]))}
                          onLoad={() => setImgErrors((prev) => { const next = new Set(prev); next.delete(i); return next })}
                        />
                      ) : url.trim() && imgErrors.has(i) ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FiX size={14} className="text-gray-400" />
                        </div>
                      ) : (
                        <FiImage size={16} className="text-gray-300" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const next = [...images]
                        next[i] = e.target.value
                        setImages(next)
                        setImgErrors((prev) => { const n = new Set(prev); n.delete(i); return n })
                      }}
                      placeholder="/images/products/example.jpg"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, j) => j !== i))
                          setImgErrors((prev) => { const n = new Set(prev); n.delete(i); return n })
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image preview grid */}
              {images.some((u) => u.trim()) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">预览</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {images
                      .map((u, i) => ({ url: u.trim(), idx: i }))
                      .filter((item) => item.url)
                      .map((item) => (
                        <div
                          key={item.idx}
                          className="aspect-square bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center"
                        >
                          {imgErrors.has(item.idx) ? (
                            <div className="text-center">
                              <FiX size={20} className="text-gray-300 mx-auto" />
                              <p className="text-[10px] text-gray-400 mt-1">加载失败</p>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt=""
                              className="w-full h-full object-contain p-2"
                              onError={() => setImgErrors((prev) => new Set([...prev, item.idx]))}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step navigation buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                step === 0 ? 'invisible' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              上一步
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                下一步
              </button>
            ) : (
              <div /> // Spacer - submit button is in the fixed bottom bar
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            步骤 {step + 1} / {steps.length}：{steps[step].label}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-blue-600/20"
            >
              <FiSave size={16} />
              {isEdit ? '保存修改' : '添加商品'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
