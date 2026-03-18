import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/orders — admin only (returns account info in header for login)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const orders = await getCollection(env.ZOLTMOUNT_KV, 'orders')
  const response = json(orders)
  response.headers.set('X-Admin-Account', JSON.stringify({
    id: result.auth.id,
    name: result.auth.name,
    role: result.auth.role,
  }))
  return response
}

// POST /api/orders — public (customer placing order)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const order = await request.json()
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  orders.unshift(order) // newest first
  await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)
  return json(order, 201)
}
