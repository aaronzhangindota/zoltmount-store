import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/payment-methods — public
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const methods = await getCollection(env.ZOLTMOUNT_KV, 'payment-methods')
  return json(methods)
}

// POST /api/payment-methods — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const method = await request.json()
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  methods.push(method)
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', methods)
  return json(method, 201)
}
