import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiUser, FiMapPin, FiPackage, FiStar, FiPlus, FiEdit2, FiTrash2, FiCheck, FiChevronDown, FiChevronUp, FiTruck } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '../../store/userStore'
import { useDataStore } from '../../store/dataStore'
import type { Address } from '../../store/userStore'

const tabs = ['profile', 'addresses', 'orders', 'points'] as const
type Tab = (typeof tabs)[number]
const tabIcons = { profile: FiUser, addresses: FiMapPin, orders: FiPackage, points: FiStar }

export const AccountPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) || 'profile'
  const setTab = (tab: Tab) => setSearchParams({ tab })

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('account.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab]
            return (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {t(`account.${tab}`)}
              </button>
            )
          })}
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'points' && <PointsTab />}
      </div>
    </div>
  )
}

/* ─── Profile Tab ─── */
const ProfileTab: React.FC = () => {
  const { t } = useTranslation()
  const currentUser = useUserStore((s) => s.currentUser)
  const updateProfile = useUserStore((s) => s.updateProfile)
  const changePassword = useUserStore((s) => s.changePassword)

  const [firstName, setFirstName] = useState(currentUser?.firstName || '')
  const [lastName, setLastName] = useState(currentUser?.lastName || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [profileMsg, setProfileMsg] = useState('')

  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState(false)

  const handleProfileSave = async () => {
    try {
      await updateProfile({ firstName, lastName, phone })
      setProfileMsg(t('account.profileUpdated'))
    } catch {
      setProfileMsg('Failed to update profile')
    }
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const handlePasswordChange = async () => {
    setPwdError(false)
    if (newPwd !== confirmPwd) {
      setPwdMsg(t('auth.passwordMismatch'))
      setPwdError(true)
      return
    }
    try {
      const result = await changePassword(oldPwd, newPwd)
      if (result.success) {
        setPwdMsg(t('account.passwordChanged'))
        setOldPwd('')
        setNewPwd('')
        setConfirmPwd('')
      } else {
        setPwdMsg(t('account.wrongPassword'))
        setPwdError(true)
      }
    } catch {
      setPwdMsg(t('account.wrongPassword'))
      setPwdError(true)
    }
    setTimeout(() => setPwdMsg(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('account.editProfile')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('auth.firstName')}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('auth.lastName')}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('auth.email')}</label>
            <input
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('account.phone')}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        {profileMsg && (
          <p className="text-green-600 text-sm mt-3 bg-green-50 px-4 py-2 rounded-lg">{profileMsg}</p>
        )}
        <button
          onClick={handleProfileSave}
          className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {t('account.saveChanges')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('account.changePassword')}</h2>
        <div className="space-y-4 max-w-md">
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder={t('account.currentPassword')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder={t('account.newPassword')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder={t('account.confirmNewPassword')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        {pwdMsg && (
          <p className={`text-sm mt-3 px-4 py-2 rounded-lg ${pwdError ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {pwdMsg}
          </p>
        )}
        <button
          onClick={handlePasswordChange}
          className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {t('account.changePassword')}
        </button>
      </div>
    </div>
  )
}

/* ─── Addresses Tab ─── */
const AddressesTab: React.FC = () => {
  const { t } = useTranslation()
  const currentUser = useUserStore((s) => s.currentUser)
  const addAddress = useUserStore((s) => s.addAddress)
  const updateAddress = useUserStore((s) => s.updateAddress)
  const deleteAddress = useUserStore((s) => s.deleteAddress)
  const setDefaultAddress = useUserStore((s) => s.setDefaultAddress)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Address, 'id'>>({
    label: '', firstName: '', lastName: '', address: '', city: '',
    state: '', zip: '', country: 'United States', phone: '', isDefault: false,
  })

  const resetForm = () => {
    setForm({
      label: '', firstName: '', lastName: '', address: '', city: '',
      state: '', zip: '', country: 'United States', phone: '', isDefault: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (addr: Address) => {
    setForm({ ...addr })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (editingId) {
      await updateAddress(editingId, form)
    } else {
      await addAddress(form)
    }
    resetForm()
  }

  const addresses = currentUser?.addresses || []

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <FiPlus size={16} /> {t('account.addAddress')}
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? t('account.editAddress') : t('account.addAddress')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder={t('account.addressLabel')}
              className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder={t('auth.firstName')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder={t('auth.lastName')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={t('checkout.address')}
              className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder={t('checkout.city')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder={t('checkout.state')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              placeholder={t('checkout.zip')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t('checkout.phone')}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {t('account.saveChanges')}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="text-gray-400 text-sm">{t('account.noAddresses')}</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{addr.label || 'Address'}</span>
              {addr.isDefault && (
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {t('account.defaultLabel')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {addr.firstName} {addr.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {addr.address}, {addr.city}, {addr.state} {addr.zip}
            </p>
            {addr.phone && <p className="text-sm text-gray-400">{addr.phone}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!addr.isDefault && (
              <button
                onClick={() => void setDefaultAddress(addr.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <FiCheck size={12} /> {t('account.setDefault')}
              </button>
            )}
            <button
              onClick={() => handleEdit(addr)}
              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={() => void deleteAddress(addr.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Orders Tab ─── */
const OrdersTab: React.FC = () => {
  const { t } = useTranslation()
  const currentUser = useUserStore((s) => s.currentUser)
  const orders = useDataStore((s) => s.orders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const userOrders = orders.filter(
    (o) =>
      o.userId === currentUser?.id ||
      o.customer.email.toLowerCase() === currentUser?.email.toLowerCase()
  )

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (userOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-400 text-sm">{t('account.noOrders')}</p>
        <Link to="/products" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          {t('checkout.browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {userOrders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-gray-900">{order.id}</span>
              <span className="text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {t(`orderStatus.${order.status}`)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 text-sm">${order.total.toFixed(2)}</span>
              {expandedId === order.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
          </button>

          {expandedId === order.id && (
            <div className="px-5 pb-4 border-t border-gray-50">
              {/* Tracking info */}
              {order.trackingNumber && (
                <div className="mt-3 mb-3 p-3 bg-blue-50 rounded-lg flex flex-wrap items-center gap-3">
                  <FiTruck className="text-blue-600" size={16} />
                  <div className="text-sm">
                    <span className="text-gray-600">{order.carrier || t('account.orderStatus')}: </span>
                    <span className="font-medium text-gray-900">{order.trackingNumber}</span>
                  </div>
                  <a
                    href={`https://www.17track.net/en/track#nums=${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('account.trackPackage')}
                  </a>
                </div>
              )}

              <div className="space-y-2 mt-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {order.pointsEarned != null && order.pointsEarned > 0 && (
                <p className="text-xs text-green-600 mt-2">+{order.pointsEarned} points earned</p>
              )}
              {order.pointsUsed != null && order.pointsUsed > 0 && (
                <p className="text-xs text-orange-600 mt-1">-{order.pointsUsed} points used</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Points Tab ─── */
const PointsTab: React.FC = () => {
  const { t } = useTranslation()
  const currentUser = useUserStore((s) => s.currentUser)
  const points = currentUser?.points || 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('account.pointsBalance')}</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-brand-600">{points}</span>
          <span className="text-gray-500 text-sm">{t('account.pointsUnit')}</span>
        </div>
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">{t('account.pointsRule')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {currentUser?.memberSince && (
          <p className="text-xs text-gray-400">
            {t('account.memberSince', { date: new Date(currentUser.memberSince).toLocaleDateString() })}
          </p>
        )}
      </div>
    </div>
  )
}
