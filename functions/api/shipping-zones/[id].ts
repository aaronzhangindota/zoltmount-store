import { requireSuperAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const data = await request.json() as any
  const zones = await getCollection<any>(env.ZOLTMOUNT_KV, 'shipping-zones')
  const idx = zones.findIndex((z: any) => z.id === id)
  if (idx === -1) {
    const item = { ...data, id }
    zones.push(item)
    await putCollection(env.ZOLTMOUNT_KV, 'shipping-zones', zones)
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建物流分组「${item.name || id}」`, 'shipping-zones')
    return json(item, 201)
  }

  zones[idx] = { ...zones[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'shipping-zones', zones)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新物流分组「${zones[idx].name || id}」`, 'shipping-zones')
  return json(zones[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const zones = await getCollection<any>(env.ZOLTMOUNT_KV, 'shipping-zones')
  const zone = zones.find((z: any) => z.id === id)
  const filtered = zones.filter((z: any) => z.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'shipping-zones', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除物流分组「${zone?.name || id}」`, 'shipping-zones')
  return json({ success: true })
}
