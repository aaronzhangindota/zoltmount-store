import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'
import { useDataStore } from './dataStore'
import type { Product, Category } from '../data/products'
import type { AdminAccountInfo, AdminAccount, AdminLog } from '../api/client'

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  initialPrice: number
  incrementalPrice: number
  fuelSurchargeRate: number
  sortOrder: number
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'credit_card' | 'paypal' | 'alipay' | 'wechat' | 'bank_transfer' | 'other'
  enabled: boolean
  icon: string
  supportedCards: string[]
  sortOrder: number
}

export interface Order {
  id: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  customer: { email: string; firstName: string; lastName: string }
  shippingAddress?: { address: string; city: string; state: string; zip: string }
  createdAt: string
  userId?: string
  pointsEarned?: number
  pointsUsed?: number
  discount?: number
  promoCode?: string
  promoDiscount?: number
  trackingNumber?: string
  carrier?: string
}

interface AdminState {
  isLoggedIn: boolean
  adminToken: string | null
  adminAccount: AdminAccountInfo | null

  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>

  addProduct: (product: Product) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  addCategory: (category: Category) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  addOrder: (order: Order) => Promise<void>
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>
  updateOrderTracking: (id: string, trackingNumber: string, carrier: string) => Promise<void>
  deleteOrder: (id: string) => Promise<void>

  addPaymentMethod: (method: PaymentMethod) => Promise<void>
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => Promise<void>
  deletePaymentMethod: (id: string) => Promise<void>

  addShippingZone: (zone: ShippingZone) => Promise<void>
  updateShippingZone: (id: string, data: Partial<ShippingZone>) => Promise<void>
  deleteShippingZone: (id: string) => Promise<void>

  seedData: () => Promise<void>

  // Account management (super_admin only)
  getAccounts: () => Promise<AdminAccount[]>
  createAccount: (data: { name: string; username: string; password: string; role: 'super_admin' | 'staff' }) => Promise<AdminAccount>
  updateAccount: (id: string, data: Partial<{ name: string; username: string; role: 'super_admin' | 'staff' }>) => Promise<AdminAccount>
  deleteAccount: (id: string) => Promise<void>

  // Logs (super_admin only)
  getLogs: () => Promise<AdminLog[]>
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      adminToken: null,
      adminAccount: null,

      login: async (username, password) => {
        try {
          const { token, account } = await api.login(username, password)
          api.setAdminToken(token)
          set({ isLoggedIn: true, adminToken: token, adminAccount: account })
          useDataStore.getState().fetchOrders()
          return true
        } catch {
          return false
        }
      },

      logout: () => {
        api.setAdminToken(null)
        set({ isLoggedIn: false, adminToken: null, adminAccount: null })
      },

      changePassword: async (oldPassword, newPassword) => {
        await api.changePassword(oldPassword, newPassword)
      },

      // Products
      addProduct: async (product) => {
        await api.createProduct(product)
        await useDataStore.getState().fetchProducts()
      },
      updateProduct: async (id, data) => {
        await api.updateProduct(id, data)
        await useDataStore.getState().fetchProducts()
      },
      deleteProduct: async (id) => {
        await api.deleteProduct(id)
        await useDataStore.getState().fetchProducts()
      },

      // Categories
      addCategory: async (category) => {
        await api.createCategory(category)
        await useDataStore.getState().fetchCategories()
      },
      updateCategory: async (id, data) => {
        await api.updateCategory(id, data)
        await useDataStore.getState().fetchCategories()
      },
      deleteCategory: async (id) => {
        await api.deleteCategory(id)
        await useDataStore.getState().fetchCategories()
      },

      // Orders
      addOrder: async (order) => {
        await api.createOrder(order)
      },
      updateOrderStatus: async (id, status) => {
        await api.updateOrder(id, { status })
        await useDataStore.getState().fetchOrders()
      },
      updateOrderTracking: async (id, trackingNumber, carrier) => {
        await api.updateOrder(id, { trackingNumber, carrier })
        await useDataStore.getState().fetchOrders()
      },
      deleteOrder: async (id) => {
        await api.deleteOrder(id)
        await useDataStore.getState().fetchOrders()
      },

      // Payment Methods
      addPaymentMethod: async (method) => {
        await api.createPaymentMethod(method)
        await useDataStore.getState().fetchPaymentMethods()
      },
      updatePaymentMethod: async (id, data) => {
        await api.updatePaymentMethod(id, data)
        await useDataStore.getState().fetchPaymentMethods()
      },
      deletePaymentMethod: async (id) => {
        await api.deletePaymentMethod(id)
        await useDataStore.getState().fetchPaymentMethods()
      },

      // Shipping Zones
      addShippingZone: async (zone) => {
        await api.createShippingZone(zone)
        await useDataStore.getState().fetchShippingZones()
      },
      updateShippingZone: async (id, data) => {
        await api.updateShippingZone(id, data)
        await useDataStore.getState().fetchShippingZones()
      },
      deleteShippingZone: async (id) => {
        await api.deleteShippingZone(id)
        await useDataStore.getState().fetchShippingZones()
      },

      // Seed
      seedData: async () => {
        const { products: defaultProducts, categories: defaultCategories } = await import('../data/products')
        const defaultPaymentMethods: PaymentMethod[] = [
          {
            id: 'pm-stripe',
            name: '信用卡 / 借记卡',
            type: 'credit_card',
            enabled: true,
            icon: '💳',
            supportedCards: ['Visa', 'MasterCard', 'Amex'],
            sortOrder: 0,
          },
          {
            id: 'pm-paypal',
            name: 'PayPal',
            type: 'paypal',
            enabled: true,
            icon: '🅿️',
            supportedCards: [],
            sortOrder: 1,
          },
        ]
        await api.seed({
          products: defaultProducts,
          categories: defaultCategories,
          paymentMethods: defaultPaymentMethods,
        })
        await useDataStore.getState().fetchAll()
      },

      // Account management
      getAccounts: async () => {
        return api.getAdminAccounts()
      },
      createAccount: async (data) => {
        return api.createAdminAccount(data)
      },
      updateAccount: async (id, data) => {
        return api.updateAdminAccount(id, data)
      },
      deleteAccount: async (id) => {
        await api.deleteAdminAccount(id)
      },

      // Logs
      getLogs: async () => {
        return api.getAdminLogs()
      },
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        adminToken: state.adminToken,
        adminAccount: state.adminAccount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.adminToken) {
          api.setAdminToken(state.adminToken)
          // After page refresh, re-fetch orders for admin dashboard
          useDataStore.getState().fetchOrders()
        }
      },
    }
  )
)
