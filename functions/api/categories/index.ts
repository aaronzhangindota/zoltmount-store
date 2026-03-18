import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const categories = await getCollection(env.ZOLTMOUNT_KV, 'categories')
  return json(categories)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const category = await request.json() as any
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  categories.push(category)
  await putCollection(env.ZOLTMOUNT_KV, 'categories', categories)

  await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建分类「${category.name || category.id}」`, 'categories')
  return json(category, 201)
}
