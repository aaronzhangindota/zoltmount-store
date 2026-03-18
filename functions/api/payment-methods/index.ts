import { requireSuperAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/payment-methods — public
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const methods = await getCollection(env.ZOLTMOUNT_KV, 'payment-methods')
  return json(methods)
}

// POST /api/payment-methods — super_admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireSuperAdmin(request, env)
  if ('denied' in result) return result.denied

  const method = await request.json() as any
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  methods.push(method)
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', methods)

  await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建支付方式「${method.name || method.id}」`, 'payment-methods')
  return json(method, 201)
}
