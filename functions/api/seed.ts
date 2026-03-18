import { requireSuperAdmin, putCollection, json, writeLog } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// POST /api/seed — super_admin only
// Body: { products, categories, paymentMethods }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const body = await request.json() as {
    products?: any[]
    categories?: any[]
    paymentMethods?: any[]
  }

  const writes: Promise<void>[] = []
  if (body.products) writes.push(putCollection(env.ZOLTMOUNT_KV, 'products', body.products))
  if (body.categories) writes.push(putCollection(env.ZOLTMOUNT_KV, 'categories', body.categories))
  if (body.paymentMethods) writes.push(putCollection(env.ZOLTMOUNT_KV, 'payment-methods', body.paymentMethods))

  // Initialize empty orders if not already set
  const existingOrders = await env.ZOLTMOUNT_KV.get('orders')
  if (!existingOrders) {
    writes.push(putCollection(env.ZOLTMOUNT_KV, 'orders', []))
  }

  await Promise.all(writes)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, '初始化数据（seed）', 'seed')
  return json({ success: true, message: 'KV seeded successfully' })
}
