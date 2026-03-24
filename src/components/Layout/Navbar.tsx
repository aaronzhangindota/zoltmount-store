import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiGlobe, FiChevronDown, FiUser, FiPackage, FiStar, FiLogOut } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/cartStore'
import { useDataStore } from '../../store/dataStore'
import { useUserStore } from '../../store/userStore'

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'zh', label: '中', name: '中文' },
]

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const langRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const products = useDataStore((s) => s.products)
  const location = useLocation()
  const totalItems = useCartStore((s) => s.totalItems)
  const toggleCart = useCartStore((s) => s.toggleCart)
  const currentUser = useUserStore((s) => s.currentUser)
  const logout = useUserStore((s) => s.logout)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setSearchOpen(false); setSearchQuery('') }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
    { path: '/b2b', label: t('nav.bulkOrders') },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      {/* Top banner */}
      <div className="bg-brand-900 text-white text-center text-xs py-1.5 px-4">
        <span className="font-medium">{t('nav.bannerSubscribe', 'Subscribe & Get 10% Off Your First Order')}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-brand-900">Zolt</span>
              <span className="text-xl font-bold text-accent-500">Mount</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  location.pathname === link.path
                    ? 'text-brand-600'
                    : 'text-gray-600 hover:text-brand-600'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:text-brand-600 transition-colors text-sm rounded-lg hover:bg-gray-50"
              >
                <FiGlobe size={16} />
                <span className="hidden sm:inline font-medium">{currentLang.label}</span>
                <FiChevronDown size={14} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code)
                        setLangOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        lang.code === i18n.language ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-xs text-gray-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    <FiUser size={20} />
                    <FiChevronDown size={14} className="hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/account?tab=profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser size={15} /> {t('nav2.account')}
                      </Link>
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiPackage size={15} /> {t('nav2.orders')}
                      </Link>
                      <Link
                        to="/account?tab=points"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiStar size={15} /> {t('nav2.points', { points: currentUser.points })}
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout()
                            setUserMenuOpen(false)
                            navigate('/')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut size={15} /> {t('nav2.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-gray-600 hover:text-brand-600 transition-colors"
                >
                  <FiUser size={20} />
                </Link>
              )}
            </div>

            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
                        setSearchOpen(false); setSearchQuery('')
                      }
                      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
                    }}
                    placeholder={t('nav.searchPlaceholder', 'Search products...')}
                    className="w-40 sm:w-56 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-gray-50"
                    autoFocus
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="p-1.5 text-gray-400 hover:text-gray-600 ml-1">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50) }}
                  className="p-2 text-gray-600 hover:text-brand-600 transition-colors"
                  title={t('nav.searchPlaceholder', 'Search products...')}
                >
                  <FiSearch size={20} />
                </button>
              )}

              {/* Search results dropdown */}
              {searchOpen && searchQuery.trim().length >= 2 && (() => {
                const q = searchQuery.toLowerCase()
                const results = products.filter((p) =>
                  p.name.toLowerCase().includes(q) ||
                  p.category.toLowerCase().includes(q) ||
                  p.description.toLowerCase().includes(q) ||
                  Object.values(p.specs).some((v) => v.toLowerCase().includes(q))
                ).slice(0, 6)
                return results.length > 0 ? (
                  <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-sm">📺</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                        </div>
                        <span className="text-sm font-bold text-brand-700 shrink-0">${p.price.toFixed(2)}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                      className="block px-4 py-2 text-center text-sm text-brand-600 hover:bg-brand-50 border-t border-gray-100 mt-1 font-medium"
                    >
                      {t('nav.viewAll', 'View all results')}
                    </Link>
                  </div>
                ) : (
                  <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-6 z-50 text-center">
                    <p className="text-sm text-gray-400">{t('nav.noResults', 'No products found')}</p>
                  </div>
                )
              })()}
            </div>

            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors"
            >
              <FiShoppingCart size={20} />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                  {totalItems() > 99 ? '99+' : totalItems()}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {currentUser ? (
                <>
                  <Link to="/account" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FiUser size={16} /> {t('nav2.account')}
                  </Link>
                  <Link to="/account?tab=orders" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FiPackage size={16} /> {t('nav2.orders')}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/') }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut size={16} /> {t('nav2.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50">
                  <FiUser size={16} /> {t('nav2.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
