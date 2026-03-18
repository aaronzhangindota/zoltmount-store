import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// GET /api/products — public
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const products = await getCollection(env.ZOLTMOUNT_KV, 'products')
  return json(products)
}

// POST /api/products — admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const product = await request.json() as any
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  products.push(product)
  await putCollection(env.ZOLTMOUNT_KV, 'products', products)

  await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建商品「${product.name || product.id}」`, 'products')
  return json(product, 201)
}
