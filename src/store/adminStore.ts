import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'
import { useDataStore } from './dataStore'
import type { Product, Category } from '../data/products'

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
  trackingNumber?: string
  carrier?: string
}

interface AdminState {
  isLoggedIn: boolean
  adminKey: string | null

  login: (key: string) => Promise<boolean>
  logout: () => void

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

  seedData: () => Promise<void>
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      adminKey: null,

      login: async (key) => {
        // Set the key and try to verify by fetching orders (admin-only endpoint)
        api.setAdminKey(key)
        try {
          await api.getOrders()
          set({ isLoggedIn: true, adminKey: key })
          // Fetch orders into dataStore now that we're authenticated
          useDataStore.getState().fetchOrders()
          return true
        } catch {
          api.setAdminKey(null)
          return false
        }
      },

      logout: () => {
        api.setAdminKey(null)
        set({ isLoggedIn: false, adminKey: null })
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
        // Don't fetch orders here — non-admin users can't read orders
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
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        adminKey: state.adminKey,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore API key after rehydration
        if (state?.adminKey) {
          api.setAdminKey(state.adminKey)
        }
      },
    }
  )
)
