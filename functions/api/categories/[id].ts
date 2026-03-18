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
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  const idx = categories.findIndex((c: any) => c.id === id)
  if (idx === -1) return json({ error: 'Not found' }, 404)

  categories[idx] = { ...categories[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'categories', categories)
  return json(categories[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  const filtered = categories.filter((c: any) => c.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'categories', filtered)
  return json({ success: true })
}
