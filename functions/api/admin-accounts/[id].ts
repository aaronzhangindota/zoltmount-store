import { requireSuperAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'
import type { AdminAccount } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// PUT /api/admin-accounts/:id — super_admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const body = await request.json() as Partial<{ name: string; username: string; role: 'super_admin' | 'staff' }>
  const accounts = await getCollection<AdminAccount>(env.ZOLTMOUNT_KV, 'admin-accounts')
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx === -1) return json({ error: 'Account not found' }, 404)

  // If changing username, check uniqueness
  if (body.username && body.username !== accounts[idx].username) {
    if (accounts.some((a) => a.username === body.username)) {
      return json({ error: 'Username already exists' }, 409)
    }
  }

  if (body.name) accounts[idx].name = body.name
  if (body.username) accounts[idx].username = body.username
  if (body.role) accounts[idx].role = body.role

  await putCollection(env.ZOLTMOUNT_KV, 'admin-accounts', accounts)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新账号「${accounts[idx].name}」`, 'accounts')

  const { password, token, ...safe } = accounts[idx]
  return json(safe)
}

// DELETE /api/admin-accounts/:id — super_admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const accounts = await getCollection<AdminAccount>(env.ZOLTMOUNT_KV, 'admin-accounts')
  const account = accounts.find((a) => a.id === id)
  if (!account) return json({ error: 'Account not found' }, 404)

  // Prevent deleting self
  if (account.id === result.auth.id) {
    return json({ error: 'Cannot delete your own account' }, 400)
  }

  // Prevent deleting protected accounts
  if (account.isProtected) {
    return json({ error: 'Cannot delete the initial super admin' }, 400)
  }

  const filtered = accounts.filter((a) => a.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'admin-accounts', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除账号「${account.name}」`, 'accounts')

  return json({ success: true })
}
