interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export interface AdminAccount {
  id: string
  name: string
  username: string
  password: string
  role: 'super_admin' | 'staff'
  isProtected: boolean
  token: string
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

export interface AuthResult {
  id: string
  name: string
  role: 'super_admin' | 'staff'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-User-Token, X-Chat-Session',
}

export const onRequest: PagesFunction<Env>[] = [
  async (context) => {
    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const response = await context.next()

    // Add CORS headers to all responses
    const newResponse = new Response(response.body, response)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })
    return newResponse
  },
]

// Helper: ensure initial super admin exists in KV
// Also migrates old-format accounts (key field) to new format (username/password)
export async function ensureInitialAdmin(kv: KVNamespace, env: Env): Promise<AdminAccount[]> {
  const accounts = await getCollection<AdminAccount>(kv, 'admin-accounts')

  if (accounts.length === 0) {
    // No accounts at all — create initial super admin
    const superAdmin: AdminAccount = {
      id: 'admin-' + Date.now(),
      name: '超级管理员',
      username: 'zszmily',
      password: env.ADMIN_API_KEY,
      role: 'super_admin',
      isProtected: true,
      token: '',
      createdAt: new Date().toISOString(),
    }
    accounts.push(superAdmin)
    await putCollection(kv, 'admin-accounts', accounts)
    return accounts
  }

  // Migrate old-format accounts: if any account lacks "username", it's old format
  const needsMigration = accounts.some((a) => !a.username)
  if (needsMigration) {
    let hasProtected = false
    for (const acc of accounts) {
      if (!acc.username) {
        const oldKey = (acc as any).key as string | undefined
        // The account whose key matched ADMIN_API_KEY is the initial super admin
        if (oldKey === env.ADMIN_API_KEY) {
          acc.username = 'zszmily'
          acc.password = env.ADMIN_API_KEY
          acc.isProtected = true
          hasProtected = true
        } else {
          // Other old accounts: use their name as username, key as password
          acc.username = acc.name
          acc.password = oldKey || 'changeme'
          acc.isProtected = false
        }
        acc.token = acc.token || ''
        delete (acc as any).key
      }
    }
    // If no protected account was found, create the initial super admin
    if (!hasProtected) {
      accounts.unshift({
        id: 'admin-' + Date.now(),
        name: '超级管理员',
        username: 'zszmily',
        password: env.ADMIN_API_KEY,
        role: 'super_admin',
        isProtected: true,
        token: '',
        createdAt: new Date().toISOString(),
      })
    }
    await putCollection(kv, 'admin-accounts', accounts)
  }

  return accounts
}

// Helper: authenticate admin by X-Admin-Token header
export async function authenticateAdmin(request: Request, env: Env): Promise<AuthResult | null> {
  const token = request.headers.get('X-Admin-Token')
  if (!token) return null

  const accounts = await ensureInitialAdmin(env.ZOLTMOUNT_KV, env)

  const account = accounts.find((a) => a.token && a.token === token)
  if (account) {
    return { id: account.id, name: account.name, role: account.role }
  }

  return null
}

// Helper: require any admin (staff or super_admin)
export async function requireAdmin(request: Request, env: Env): Promise<{ auth: AuthResult } | { denied: Response }> {
  const auth = await authenticateAdmin(request, env)
  if (!auth) {
    return {
      denied: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }),
    }
  }
  return { auth }
}

// Helper: require super_admin role
export async function requireSuperAdmin(request: Request, env: Env): Promise<{ auth: AuthResult } | { denied: Response }> {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result
  if (result.auth.role !== 'super_admin') {
    return {
      denied: new Response(JSON.stringify({ error: 'Forbidden: super_admin required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }),
    }
  }
  return result
}

// Helper: write an operation log
export async function writeLog(
  kv: KVNamespace,
  auth: AuthResult,
  action: string,
  resource: string
): Promise<void> {
  const logs = await getCollection<AdminLog>(kv, 'admin-logs')
  const log: AdminLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    accountId: auth.id,
    accountName: auth.name,
    action,
    resource,
    timestamp: new Date().toISOString(),
  }
  logs.unshift(log) // newest first
  // Keep max 500 logs
  if (logs.length > 500) logs.length = 500
  await putCollection(kv, 'admin-logs', logs)
}

// Helper: get collection from KV
export async function getCollection<T>(kv: KVNamespace, key: string): Promise<T[]> {
  const raw = await kv.get(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

// Helper: put collection to KV
export async function putCollection<T>(kv: KVNamespace, key: string, data: T[]): Promise<void> {
  await kv.put(key, JSON.stringify(data))
}

// ─── User Authentication ───

export interface UserRecord {
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
  token: string
}

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

export interface UserAuthResult {
  id: string
  email: string
  firstName: string
  lastName: string
}

// Helper: authenticate user by X-User-Token header
export async function authenticateUser(request: Request, kv: KVNamespace): Promise<UserRecord | null> {
  const token = request.headers.get('X-User-Token')
  if (!token) return null

  const users = await getCollection<UserRecord>(kv, 'users')
  return users.find((u) => u.token === token) || null
}

// Helper: require authenticated user
export async function requireUser(request: Request, kv: KVNamespace): Promise<{ user: UserRecord; users: UserRecord[] } | { denied: Response }> {
  const token = request.headers.get('X-User-Token')
  if (!token) {
    return {
      denied: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }),
    }
  }

  const users = await getCollection<UserRecord>(kv, 'users')
  const user = users.find((u) => u.token === token)
  if (!user) {
    return {
      denied: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }),
    }
  }
  return { user, users }
}

// Helper: strip sensitive fields from user record
export function sanitizeUser(user: UserRecord): Omit<UserRecord, 'password' | 'token'> {
  const { password: _, token: __, ...safe } = user
  return safe
}

// Helper: JSON response
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
