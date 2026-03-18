import type { Product, Category } from '../data/products'
import type { Order, PaymentMethod } from '../store/adminStore'

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

class ApiClient {
  private adminToken: string | null = null

  setAdminToken(token: string | null) {
    this.adminToken = token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (this.adminToken) {
      headers['X-Admin-Token'] = this.adminToken
    }

    const res = await fetch(`/api${path}`, { ...options, headers })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`API ${res.status}: ${body}`)
    }
    return res.json() as Promise<T>
  }

  // Auth
  async login(username: string, password: string): Promise<{ token: string; account: AdminAccountInfo }> {
    return this.request('/admin-auth', { method: 'POST', body: JSON.stringify({ username, password }) })
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.request('/admin-auth', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) })
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
}

export const api = new ApiClient()
