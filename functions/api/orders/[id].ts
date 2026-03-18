import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const data = await request.json() as any
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const idx = orders.findIndex((o: any) => o.id === id)
  if (idx === -1) {
    const item = { ...data, id }
    orders.push(item)
    await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)
    return json(item, 201)
  }

  const oldStatus = orders[idx].status
  orders[idx] = { ...orders[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)

  if (data.status && data.status !== oldStatus) {
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新订单 ${id} 状态为「${data.status}」`, 'orders')
  }
  if (data.trackingNumber) {
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新订单 ${id} 物流单号`, 'orders')
  }

  return json(orders[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const filtered = orders.filter((o: any) => o.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'orders', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除订单 ${id}`, 'orders')
  return json({ success: true })
}
