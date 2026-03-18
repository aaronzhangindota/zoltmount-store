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
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  const idx = methods.findIndex((m: any) => m.id === id)
  if (idx === -1) return json({ error: 'Not found' }, 404)

  methods[idx] = { ...methods[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', methods)
  return json(methods[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const methods = await getCollection<any>(env.ZOLTMOUNT_KV, 'payment-methods')
  const filtered = methods.filter((m: any) => m.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'payment-methods', filtered)
  return json({ success: true })
}
