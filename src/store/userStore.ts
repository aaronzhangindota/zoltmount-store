import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'
import type { ApiUser } from '../api/client'

export interface Address {
  id: string
  label: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  addresses: Address[]
  wishlist: string[]
  points: number
  totalSpent: number
  memberSince: string
}

interface UserState {
  currentUser: User | null
  userToken: string | null

  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>

  addAddress: (address: Omit<Address, 'id'>) => Promise<void>
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>

  addPoints: (points: number, spent?: number) => Promise<void>
  usePoints: (points: number) => Promise<boolean>

  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean

  getDefaultAddress: () => Address | undefined
  getMemberDiscount: () => number

  refreshUser: () => Promise<void>
}

function apiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    phone: apiUser.phone,
    addresses: apiUser.addresses,
    wishlist: apiUser.wishlist || [],
    points: apiUser.points,
    totalSpent: apiUser.totalSpent,
    memberSince: apiUser.memberSince,
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userToken: null,

      register: async (email, password, firstName, lastName) => {
        try {
          const { token, user } = await api.userRegister(email, password, firstName, lastName)
          api.setUserToken(token)
          set({ currentUser: apiUserToUser(user), userToken: token })
          return { success: true }
        } catch (e: any) {
          const msg = e.message || ''
          if (msg.includes('emailExists') || msg.includes('409')) {
            return { success: false, error: 'emailExists' }
          }
          return { success: false, error: 'registrationFailed' }
        }
      },

      login: async (email, password) => {
        try {
          const { token, user } = await api.userLogin(email, password)
          api.setUserToken(token)
          set({ currentUser: apiUserToUser(user), userToken: token })
          return { success: true }
        } catch (e: any) {
          const msg = e.message || ''
          if (msg.includes('invalidCredentials') || msg.includes('401')) {
            return { success: false, error: 'invalidCredentials' }
          }
          return { success: false, error: 'loginFailed' }
        }
      },

      logout: () => {
        api.setUserToken(null)
        set({ currentUser: null, userToken: null })
      },

      updateProfile: async (data) => {
        const { user } = await api.updateUserProfile(data)
        set({ currentUser: apiUserToUser(user) })
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          await api.changeUserPassword(oldPassword, newPassword)
          return { success: true }
        } catch (e: any) {
          const msg = e.message || ''
          if (msg.includes('wrongPassword') || msg.includes('400')) {
            return { success: false, error: 'wrongPassword' }
          }
          return { success: false, error: 'passwordChangeFailed' }
        }
      },

      addAddress: async (address) => {
        await api.addUserAddress(address)
        // Refresh full user to get updated addresses
        await get().refreshUser()
      },

      updateAddress: async (id, data) => {
        const { user } = await api.updateUserAddress(id, data)
        set({ currentUser: apiUserToUser(user) })
      },

      deleteAddress: async (id) => {
        const { user } = await api.deleteUserAddress(id)
        set({ currentUser: apiUserToUser(user) })
      },

      setDefaultAddress: async (id) => {
        const { user } = await api.updateUserAddress(id, { isDefault: true })
        set({ currentUser: apiUserToUser(user) })
      },

      addPoints: async (points, spent) => {
        const { user } = await api.addUserPoints(points, spent)
        set({ currentUser: apiUserToUser(user) })
      },

      usePoints: async (points) => {
        try {
          const { user } = await api.useUserPoints(points)
          set({ currentUser: apiUserToUser(user) })
          return true
        } catch {
          return false
        }
      },

      toggleWishlist: async (productId) => {
        const { currentUser } = get()
        if (!currentUser) return
        const inList = currentUser.wishlist.includes(productId)
        try {
          const { user } = inList
            ? await api.removeFromWishlist(productId)
            : await api.addToWishlist(productId)
          set({ currentUser: apiUserToUser(user) })
        } catch { /* ignore */ }
      },

      isInWishlist: (productId) => {
        const { currentUser } = get()
        return currentUser?.wishlist.includes(productId) || false
      },

      getDefaultAddress: () => {
        const { currentUser } = get()
        return currentUser?.addresses.find((a) => a.isDefault)
      },

      getMemberDiscount: () => {
        return 1.0
      },

      refreshUser: async () => {
        try {
          const { user } = await api.getUserMe()
          set({ currentUser: apiUserToUser(user) })
        } catch {
          // Token invalid — log out
          api.setUserToken(null)
          set({ currentUser: null, userToken: null })
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        userToken: state.userToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.userToken) {
          api.setUserToken(state.userToken)
          // Refresh user data from server in background
          state.refreshUser()
        }
      },
    }
  )
)
