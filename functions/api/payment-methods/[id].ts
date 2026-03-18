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
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  const idx = methods.findIndex((m: any) => m.id === id)
  if (idx === -1) {
    const item = { ...data, id }
    methods.push(item)
    await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', methods)
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建支付方式「${item.name || id}」`, 'payment-methods')
    return json(item, 201)
  }

  methods[idx] = { ...methods[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', methods)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新支付方式「${methods[idx].name || id}」`, 'payment-methods')
  return json(methods[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  const method = methods.find((m: any) => m.id === id)
  const filtered = methods.filter((m: any) => m.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除支付方式「${method?.name || id}」`, 'payment-methods')
  return json({ success: true })
}
