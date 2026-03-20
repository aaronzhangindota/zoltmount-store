import { ensureInitialAdmin, getCollection, putCollection, authenticateAdmin, json, writeLog } from './_middleware'
import type { AdminAccount } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// POST /api/admin-auth — login (no auth required)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json() as { username: string; password: string }
  if (!body.username || !body.password) {
    return json({ error: 'username and password are required' }, 400)
  }

  const accounts = await ensureInitialAdmin(env.ZOLTMOUNT_KV, env)

  const account = accounts.find((a) => a.username === body.username && a.password === body.password)
  if (!account) {
    return json({ error: 'Invalid username or password' }, 401)
  }

  // Generate random token and save
  account.token = crypto.randomUUID()
  await putCollection(env.ZOLTMOUNT_KV, 'admin-accounts', accounts)

  // Log login event
  await writeLog(env.ZOLTMOUNT_KV, { id: account.id, name: account.name, role: account.role }, '登录系统', 'auth')

  return json({
    token: account.token,
    account: { id: account.id, name: account.name, role: account.role },
  })
}

// PUT /api/admin-auth — change own password (auth required)
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await authenticateAdmin(request, env)
  if (!auth) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const body = await request.json() as { oldPassword: string; newPassword: string }
  if (!body.oldPassword || !body.newPassword) {
    return json({ error: 'oldPassword and newPassword are required' }, 400)
  }

  const accounts = await getCollection<AdminAccount>(env.ZOLTMOUNT_KV, 'admin-accounts')
  const account = accounts.find((a) => a.id === auth.id)
  if (!account) {
    return json({ error: 'Account not found' }, 404)
  }

  if (account.password !== body.oldPassword) {
    return json({ error: 'Old password is incorrect' }, 400)
  }

  account.password = body.newPassword
  await putCollection(env.ZOLTMOUNT_KV, 'admin-accounts', accounts)
  await writeLog(env.ZOLTMOUNT_KV, auth, '修改了自己的密码', 'accounts')

  return json({ success: true })
}
