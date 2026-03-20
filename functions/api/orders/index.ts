import { requireAdmin, authenticateAdmin, authenticateUser, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/orders — admin gets all, user gets own orders
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  // Admin: return all orders
  const adminAuth = await authenticateAdmin(request, env)
  if (adminAuth) {
    const orders = await getCollection(env.ZOLTMOUNT_KV, 'orders')
    return json(orders)
  }

  // User: return only their orders
  const user = await authenticateUser(request, env.ZOLTMOUNT_KV)
  if (user) {
    const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
    const userOrders = orders.filter(
      (o: any) => o.userId === user.id || o.customer?.email?.toLowerCase() === user.email.toLowerCase()
    )
    return json(userOrders)
  }

  return json({ error: 'Unauthorized' }, 401)
}

// POST /api/orders — public (customer placing order)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const order = await request.json()
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  orders.unshift(order) // newest first
  await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)
  return json(order, 201)
}
