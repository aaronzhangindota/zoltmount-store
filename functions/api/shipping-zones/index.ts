import { requireSuperAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/shipping-zones — public
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const zones = await getCollection(env.ZOLTMOUNT_KV, 'shipping-zones')
  return json(zones)
}

// POST /api/shipping-zones — super_admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const zone = await request.json() as any
  const zones = await getCollection<any>(env.ZOLTMOUNT_KV, 'shipping-zones')
  zones.push(zone)
  await putCollection(env.ZOLTMOUNT_KV, 'shipping-zones', zones)

  await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建物流分组「${zone.name || zone.id}」`, 'shipping-zones')
  return json(zone, 201)
}
