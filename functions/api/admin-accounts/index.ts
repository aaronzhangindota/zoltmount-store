import { requireSuperAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'
import type { AdminAccount } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/admin-accounts — super_admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const accounts = await getCollection<AdminAccount>(env.ZOLTMOUNT_KV, 'admin-accounts')
  // Don't expose keys in response
  const safe = accounts.map(({ key, ...rest }) => rest)
  return json(safe)
}

// POST /api/admin-accounts — super_admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const body = await request.json() as { name: string; key: string; role: 'super_admin' | 'staff' }
  if (!body.name || !body.key || !body.role) {
    return json({ error: 'name, key, and role are required' }, 400)
  }

  const accounts = await getCollection<AdminAccount>(env.ZOLTMOUNT_KV, 'admin-accounts')

  // Check key uniqueness
  if (accounts.some((a) => a.key === body.key)) {
    return json({ error: 'Key already exists' }, 409)
  }

  const account: AdminAccount = {
    id: 'admin-' + Date.now(),
    name: body.name,
    key: body.key,
    role: body.role,
    createdAt: new Date().toISOString(),
  }
  accounts.push(account)
  await putCollection(env.ZOLTMOUNT_KV, 'admin-accounts', accounts)

  await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建账号「${account.name}」(${account.role})`, 'accounts')

  const { key, ...safe } = account
  return json(safe, 201)
}
