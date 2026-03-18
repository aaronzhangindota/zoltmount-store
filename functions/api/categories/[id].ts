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
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  const idx = categories.findIndex((c: any) => c.id === id)
  if (idx === -1) {
    const item = { ...data, id }
    categories.push(item)
    await putCollection(env.ZOLTMOUNT_KV, 'categories', categories)
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建分类「${item.name || id}」`, 'categories')
    return json(item, 201)
  }

  categories[idx] = { ...categories[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'categories', categories)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新分类「${categories[idx].name || id}」`, 'categories')
  return json(categories[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const categories = await getCollection<any>(env.ZOLTMOUNT_KV, 'categories')
  const category = categories.find((c: any) => c.id === id)
  const filtered = categories.filter((c: any) => c.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'categories', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除分类「${category?.name || id}」`, 'categories')
  return json({ success: true })
}
