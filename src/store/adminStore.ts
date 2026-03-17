import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products as defaultProducts, categories as defaultCategories } from '../data/products'
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

export interface Order {
  id: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  status: '待处理' | '处理中' | '已发货' | '已完成' | '已取消'
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
  products: Product[]
  categories: Category[]
  orders: Order[]
  paymentMethods: PaymentMethod[]

  login: (password: string) => boolean
  logout: () => void

  addProduct: (product: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void

  addCategory: (category: Category) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void

  addOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: Order['status']) => void
  updateOrderTracking: (id: string, trackingNumber: string, carrier: string) => void

  addPaymentMethod: (method: PaymentMethod) => void
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      products: defaultProducts,
      categories: defaultCategories,
      orders: [],
      paymentMethods: defaultPaymentMethods,

      login: (password) => {
        if (password === 'admin123') {
          set({ isLoggedIn: true })
          return true
        }
        return false
      },
      logout: () => set({ isLoggedIn: false }),

      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders] })),
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      updateOrderTracking: (id, trackingNumber, carrier) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, trackingNumber, carrier } : o)),
        })),

      addPaymentMethod: (method) =>
        set((s) => ({ paymentMethods: [...s.paymentMethods, method] })),
      updatePaymentMethod: (id, data) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      deletePaymentMethod: (id) =>
        set((s) => ({ paymentMethods: s.paymentMethods.filter((m) => m.id !== id) })),
    }),
    { name: 'admin-store' }
  )
)
