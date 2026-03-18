import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const data = await request.json()
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const idx = orders.findIndex((o: any) => o.id === id)
  if (idx === -1) return json({ error: 'Not found' }, 404)

  orders[idx] = { ...orders[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)
  return json(orders[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const filtered = orders.filter((o: any) => o.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'orders', filtered)
  return json({ success: true })
}
