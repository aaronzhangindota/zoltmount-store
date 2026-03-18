import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

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
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const product = await request.json()
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  products.push(product)
  await putCollection(env.ZOLTMOUNT_KV, 'products', products)
  return json(product, 201)
}
