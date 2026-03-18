import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const categories = await getCollection(env.ZOLTMOUNT_KV, 'categories')
  return json(categories)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const category = await request.json()
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  categories.push(category)
  await putCollection(env.ZOLTMOUNT_KV, 'categories', categories)
  return json(category, 201)
}
