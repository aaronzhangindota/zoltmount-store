import { requireAdmin, getCollection, json } from './_middleware'
import type { UserRecord } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/admin-users — admin only, returns all registered users (no password/token)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const users = await getCollection<UserRecord>(env.ZOLTMOUNT_KV, 'users')

  // Strip sensitive fields
  const safeUsers = users.map(({ password, token, ...safe }) => safe)
  return json(safeUsers)
}
