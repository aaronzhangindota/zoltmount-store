import type { Product, Category } from '../data/products'
import type { Order, PaymentMethod, ShippingZone } from '../store/adminStore'
import type { Address } from '../store/userStore'

export interface AdminAccountInfo {
  id: string
  name: string
  role: 'super_admin' | 'staff'
}

export interface AdminAccount extends AdminAccountInfo {
  username: string
  isProtected: boolean
  createdAt: string
}

export interface AdminLog {
  id: string
  accountId: string
  accountName: string
  action: string
  resource: string
  timestamp: string
}

// User types returned from API (no password/token)
export interface ApiUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  addresses: Address[]
  points: number
  totalSpent: number
  memberSince: string
}

class ApiClient {
  private adminToken: string | null = null
  private userToken: string | null = null

  setAdminToken(token: string | null) {
    this.adminToken = token
  }

  setUserToken(token: string | null) {
    this.userToken = token
  }

  getUserToken(): string | null {
    return this.userToken
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (this.adminToken) {
      headers['X-Admin-Token'] = this.adminToken
    }
    if (this.userToken) {
      headers['X-User-Token'] = this.userToken
    }

    const res = await fetch(`/api${path}`, { ...options, headers })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`API ${res.status}: ${body}`)
    }
    return res.json() as Promise<T>
  }

  // Admin Auth
  async login(username: string, password: string): Promise<{ token: string; account: AdminAccountInfo }> {
    return this.request('/admin-auth', { method: 'POST', body: JSON.stringify({ username, password }) })
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.request('/admin-auth', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) })
  }

  // ─── User Auth ───
  async userRegister(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string; user: ApiUser }> {
    return this.request('/user-auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', email, password, firstName, lastName }),
    })
  }

  async userLogin(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
    return this.request('/user-auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    })
  }

  async getUserMe(): Promise<{ user: ApiUser }> {
    return this.request('/user-auth')
  }

  async updateUserProfile(data: { firstName?: string; lastName?: string; phone?: string }): Promise<{ user: ApiUser }> {
    return this.request('/user-auth', {
      method: 'PUT',
      body: JSON.stringify({ action: 'updateProfile', ...data }),
    })
  }

  async changeUserPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.request('/user-auth', {
      method: 'PUT',
      body: JSON.stringify({ action: 'changePassword', oldPassword, newPassword }),
    })
  }

  async addUserPoints(points: number, spent?: number): Promise<{ user: ApiUser }> {
    return this.request('/user-auth', {
      method: 'PUT',
      body: JSON.stringify({ action: 'addPoints', points, spent }),
    })
  }

  async useUserPoints(points: number): Promise<{ user: ApiUser }> {
    return this.request('/user-auth', {
      method: 'PUT',
      body: JSON.stringify({ action: 'usePoints', points }),
    })
  }

  // ─── User Addresses ───
  async addUserAddress(address: Omit<Address, 'id'>): Promise<{ address: Address }> {
    return this.request('/user-addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    })
  }

  async updateUserAddress(id: string, data: Partial<Address>): Promise<{ user: ApiUser }> {
    return this.request(`/user-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUserAddress(id: string): Promise<{ user: ApiUser }> {
    return this.request(`/user-addresses/${id}`, { method: 'DELETE' })
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products')
  }
  async createProduct(product: Product): Promise<Product> {
    return this.request<Product>('/products', { method: 'POST', body: JSON.stringify(product) })
  }
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, { method: 'DELETE' })
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories')
  }
  async createCategory(category: Category): Promise<Category> {
    return this.request<Category>('/categories', { method: 'POST', body: JSON.stringify(category) })
  }
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteCategory(id: string): Promise<void> {
    await this.request(`/categories/${id}`, { method: 'DELETE' })
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders')
  }
  async createOrder(order: Order): Promise<Order> {
    return this.request<Order>('/orders', { method: 'POST', body: JSON.stringify(order) })
  }
  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteOrder(id: string): Promise<void> {
    await this.request(`/orders/${id}`, { method: 'DELETE' })
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.request<PaymentMethod[]>('/payment-methods')
  }
  async createPaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
    return this.request<PaymentMethod>('/payment-methods', { method: 'POST', body: JSON.stringify(method) })
  }
  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deletePaymentMethod(id: string): Promise<void> {
    await this.request(`/payment-methods/${id}`, { method: 'DELETE' })
  }

  // Shipping Zones
  async getShippingZones(): Promise<ShippingZone[]> {
    return this.request<ShippingZone[]>('/shipping-zones')
  }
  async createShippingZone(zone: ShippingZone): Promise<ShippingZone> {
    return this.request<ShippingZone>('/shipping-zones', { method: 'POST', body: JSON.stringify(zone) })
  }
  async updateShippingZone(id: string, data: Partial<ShippingZone>): Promise<ShippingZone> {
    return this.request<ShippingZone>(`/shipping-zones/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteShippingZone(id: string): Promise<void> {
    await this.request(`/shipping-zones/${id}`, { method: 'DELETE' })
  }

  // Seed
  async seed(data: { products: Product[]; categories: Category[]; paymentMethods: PaymentMethod[] }): Promise<void> {
    await this.request('/seed', { method: 'POST', body: JSON.stringify(data) })
  }

  // Admin Accounts
  async getAdminAccounts(): Promise<AdminAccount[]> {
    return this.request<AdminAccount[]>('/admin-accounts')
  }
  async createAdminAccount(data: { name: string; username: string; password: string; role: 'super_admin' | 'staff' }): Promise<AdminAccount> {
    return this.request<AdminAccount>('/admin-accounts', { method: 'POST', body: JSON.stringify(data) })
  }
  async updateAdminAccount(id: string, data: Partial<{ name: string; username: string; role: 'super_admin' | 'staff' }>): Promise<AdminAccount> {
    return this.request<AdminAccount>(`/admin-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }
  async deleteAdminAccount(id: string): Promise<void> {
    await this.request(`/admin-accounts/${id}`, { method: 'DELETE' })
  }

  // Admin Logs
  async getAdminLogs(): Promise<AdminLog[]> {
    return this.request<AdminLog[]>('/admin-logs')
  }

  // Contact Submissions
  async submitContactForm(data: { firstName: string; lastName: string; email: string; subject: string; message: string }): Promise<any> {
    return this.request('/contact-submissions', { method: 'POST', body: JSON.stringify(data) })
  }
  async getContactSubmissions(): Promise<any[]> {
    return this.request<any[]>('/contact-submissions')
  }
  async markContactRead(id: string): Promise<void> {
    await this.request('/contact-submissions', { method: 'PUT', body: JSON.stringify({ id }) })
  }
  async deleteContactSubmission(id: string): Promise<void> {
    await this.request(`/contact-submissions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  // Reviews
  async getReviews(productId: string): Promise<any[]> {
    return this.request<any[]>(`/reviews?productId=${encodeURIComponent(productId)}`)
  }
  async submitReview(data: { productId: string; userId?: string; name: string; rating: number; title: string; content: string; verified: boolean }): Promise<any> {
    return this.request('/reviews', { method: 'POST', body: JSON.stringify(data) })
  }

  // Promo Codes
  async validatePromoCode(code: string): Promise<{ valid: boolean; code?: string; discountPercent?: number; minOrderAmount?: number; error?: string }> {
    return this.request('/promo-codes', { method: 'POST', body: JSON.stringify({ code }) })
  }
  async incrementPromoUsage(code: string): Promise<void> {
    await this.request('/promo-codes', { method: 'PATCH', body: JSON.stringify({ code }) })
  }

  // Newsletter
  async subscribeNewsletter(email: string): Promise<any> {
    return this.request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
  }
  async getNewsletterSubscribers(): Promise<any[]> {
    return this.request<any[]>('/newsletter')
  }
  async deleteNewsletterSubscriber(id: string): Promise<void> {
    await this.request(`/newsletter?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  // Admin: list all registered users
  async getAdminUsers(): Promise<ApiUser[]> {
    return this.request<ApiUser[]>('/user-auth?admin=1')
  }

  // Payment Gateways
  async getPaymentGateways(): Promise<any[]> {
    return this.request<any[]>('/payment-gateways')
  }
  async createPaymentGateway(data: { provider: string; displayName: string; enabled: boolean; testMode: boolean; credentials: Record<string, string> }): Promise<any> {
    return this.request('/payment-gateways', { method: 'POST', body: JSON.stringify(data) })
  }
  async updatePaymentGateway(id: string, data: Partial<{ displayName: string; enabled: boolean; testMode: boolean; credentials: Record<string, string> }>): Promise<any> {
    return this.request('/payment-gateways', { method: 'PUT', body: JSON.stringify({ id, ...data }) })
  }
  async deletePaymentGateway(id: string): Promise<void> {
    await this.request(`/payment-gateways?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  // Stripe
  async getStripeConfig(): Promise<{ publishableKey: string }> {
    return this.request('/stripe?action=config')
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return this.request('/stripe', {
      method: 'POST',
      body: JSON.stringify({ action: 'create-payment-intent', amount, currency }),
    })
  }
}

export const api = new ApiClient()
