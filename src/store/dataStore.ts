import { create } from 'zustand'
import { api } from '../api/client'
import { products as defaultProducts, categories as defaultCategories } from '../data/products'
import type { Product, Category } from '../data/products'
import type { Order, PaymentMethod, ShippingZone } from './adminStore'

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

interface DataState {
  products: Product[]
  categories: Category[]
  orders: Order[]
  paymentMethods: PaymentMethod[]
  shippingZones: ShippingZone[]
  isLoading: boolean
  error: string | null

  fetchAll: () => Promise<void>
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchPaymentMethods: () => Promise<void>
  fetchShippingZones: () => Promise<void>
}

export const useDataStore = create<DataState>()((set) => ({
  products: defaultProducts,
  categories: defaultCategories,
  orders: [],
  paymentMethods: defaultPaymentMethods,
  shippingZones: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [products, categories, paymentMethods, shippingZones] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getPaymentMethods(),
        api.getShippingZones(),
      ])
      set({
        products: products.length > 0 ? products : defaultProducts,
        categories: categories.length > 0 ? categories : defaultCategories,
        paymentMethods: paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods,
        shippingZones,
        isLoading: false,
      })
    } catch (err) {
      console.warn('API unavailable, using default data:', err)
      set({
        products: defaultProducts,
        categories: defaultCategories,
        paymentMethods: defaultPaymentMethods,
        isLoading: false,
        error: null, // Don't show error to users — fallback is fine
      })
    }
  },

  fetchProducts: async () => {
    try {
      const products = await api.getProducts()
      set({ products: products.length > 0 ? products : defaultProducts })
    } catch {
      // keep current state
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await api.getCategories()
      set({ categories: categories.length > 0 ? categories : defaultCategories })
    } catch {
      // keep current state
    }
  },

  fetchOrders: async () => {
    try {
      const orders = await api.getOrders()
      set({ orders })
    } catch {
      // keep current state
    }
  },

  fetchPaymentMethods: async () => {
    try {
      const paymentMethods = await api.getPaymentMethods()
      set({ paymentMethods: paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods })
    } catch {
      // keep current state
    }
  },

  fetchShippingZones: async () => {
    try {
      const shippingZones = await api.getShippingZones()
      set({ shippingZones })
    } catch {
      // keep current state
    }
  },
}))
