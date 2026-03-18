import { requireSuperAdmin, getCollection, json } from '../_middleware'
import type { AdminLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/admin-logs — super_admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const logs = await getCollection<AdminLog>(env.ZOLTMOUNT_KV, 'admin-logs')
  return json(logs)
}
