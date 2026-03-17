import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  password: string
  firstName: string
  lastName: string
  phone: string
  addresses: Address[]
  points: number
  totalSpent: number
  memberSince: string
}

interface UserState {
  currentUser: User | null
  users: User[]

  register: (email: string, password: string, firstName: string, lastName: string) => { success: boolean; error?: string }
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => void
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string }

  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, data: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void

  addPoints: (points: number) => void
  usePoints: (points: number) => boolean

  getDefaultAddress: () => Address | undefined
  getMemberDiscount: () => number
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      register: (email, password, firstName, lastName) => {
        const { users } = get()
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'emailExists' }
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          password,
          firstName,
          lastName,
          phone: '',
          addresses: [],
          points: 0,
          totalSpent: 0,
          memberSince: new Date().toISOString(),
        }
        set((s) => ({
          users: [...s.users, newUser],
          currentUser: newUser,
        }))
        return { success: true }
      },

      login: (email, password) => {
        let { users } = get()
        // Fallback: if store hasn't hydrated yet, read directly from localStorage
        if (users.length === 0) {
          try {
            const raw = localStorage.getItem('user-store')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed?.state?.users?.length) {
                users = parsed.state.users
                // Also restore users into store
                set({ users })
              }
            }
          } catch { /* ignore */ }
        }
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!user) {
          return { success: false, error: 'invalidCredentials' }
        }
        set({ currentUser: user })
        return { success: true }
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (data) => {
        set((s) => {
          if (!s.currentUser) return s
          const updated = { ...s.currentUser, ...data }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      changePassword: (oldPassword, newPassword) => {
        const { currentUser } = get()
        if (!currentUser) return { success: false, error: 'notLoggedIn' }
        if (currentUser.password !== oldPassword) {
          return { success: false, error: 'wrongPassword' }
        }
        set((s) => {
          const updated = { ...s.currentUser!, password: newPassword }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
        return { success: true }
      },

      addAddress: (address) => {
        set((s) => {
          if (!s.currentUser) return s
          const newAddr: Address = { ...address, id: `addr-${Date.now()}` }
          // If this is the first address or marked as default, set it as default
          if (s.currentUser.addresses.length === 0 || newAddr.isDefault) {
            const addresses = s.currentUser.addresses.map((a) => ({ ...a, isDefault: false }))
            addresses.push({ ...newAddr, isDefault: true })
            const updated = { ...s.currentUser, addresses }
            return {
              currentUser: updated,
              users: s.users.map((u) => (u.id === updated.id ? updated : u)),
            }
          }
          const updated = {
            ...s.currentUser,
            addresses: [...s.currentUser.addresses, newAddr],
          }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      updateAddress: (id, data) => {
        set((s) => {
          if (!s.currentUser) return s
          const addresses = s.currentUser.addresses.map((a) =>
            a.id === id ? { ...a, ...data } : a
          )
          const updated = { ...s.currentUser, addresses }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      deleteAddress: (id) => {
        set((s) => {
          if (!s.currentUser) return s
          const addresses = s.currentUser.addresses.filter((a) => a.id !== id)
          const updated = { ...s.currentUser, addresses }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      setDefaultAddress: (id) => {
        set((s) => {
          if (!s.currentUser) return s
          const addresses = s.currentUser.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
          const updated = { ...s.currentUser, addresses }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      addPoints: (points) => {
        set((s) => {
          if (!s.currentUser) return s
          const updated = {
            ...s.currentUser,
            points: s.currentUser.points + points,
            totalSpent: s.currentUser.totalSpent + points, // $1 = 1 point
          }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
      },

      usePoints: (points) => {
        const { currentUser } = get()
        if (!currentUser || currentUser.points < points) return false
        set((s) => {
          const updated = { ...s.currentUser!, points: s.currentUser!.points - points }
          return {
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }
        })
        return true
      },

      getDefaultAddress: () => {
        const { currentUser } = get()
        return currentUser?.addresses.find((a) => a.isDefault)
      },

      getMemberDiscount: () => {
        const { currentUser } = get()
        return currentUser ? 0.95 : 1.0
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
      }),
    }
  )
)
