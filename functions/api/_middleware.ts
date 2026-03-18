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
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
export async function ensureInitialAdmin(kv: KVNamespace, env: Env): Promise<AdminAccount[]> {
  const accounts = await getCollection<AdminAccount>(kv, 'admin-accounts')
  if (accounts.length === 0) {
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

// Helper: JSON response
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
